'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useAuth } from '@/hooks/useAuth';
import { Shield, Coins, Camera, Shirt, Package, Ruler, MapPin, LogOut, Sparkles, Link as LinkIcon, Copy } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { user, profile, setProfile } = useAuthStore();
  const { signOut } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  
  const [activeTab, setActiveTab] = useState('orders');
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    height: '',
    weight: '',
    address: ''
  });

  useEffect(() => {
    if (profile) {
      const p = profile as any;
      setFormData({
        full_name: p.full_name || '',
        height: p.fit_preferences?.height || '',
        weight: p.fit_preferences?.weight || '',
        address: p.fit_preferences?.address || ''
      });
    }
  }, [profile]);

  if (!user || !profile) return <div className="p-8 text-center text-gray-400">Loading profile... Please login.</div>;

  const loyaltyTier = profile.loyalty_points < 100 ? 'Rook' : profile.loyalty_points < 500 ? 'Trendsetter' : 'Icon';

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    const p = profile as any;
    const updatedPreferences = {
      ...p.fit_preferences,
      height: formData.height,
      weight: formData.weight,
      address: formData.address,
    };

    const { error } = await supabase
      .from('profiles')
      // @ts-ignore
      .update({
        full_name: formData.full_name,
        fit_preferences: updatedPreferences
      })
      .eq('id', user.id);

    setIsSaving(false);
    
    if (error) {
      toast.error('Failed to update profile');
    } else {
      toast.success('Profile updated successfully!');
      setProfile({ ...profile, full_name: formData.full_name, fit_preferences: updatedPreferences });
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 pt-32 pb-12">
      {/* Profile Header */}
      <div className="glass-panel p-6 md:p-8 mb-8 flex flex-col md:flex-row items-center md:items-start gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative group cursor-pointer">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-2 border-glass-border bg-black/50">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.full_name || 'User'} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl text-gray-500 font-syne font-bold">
                {profile.full_name ? profile.full_name.charAt(0) : 'U'}
              </div>
            )}
          </div>
          <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="w-8 h-8 text-white" />
          </div>
        </div>

        <div className="flex-1 text-center md:text-left z-10">
          <h1 className="font-syne text-3xl md:text-4xl font-bold mb-2">{profile.full_name || 'Streetwear Enthusiast'}</h1>
          <p className="text-gray-400 mb-6">{user.email || user.phone}</p>
          
          <div className="flex flex-wrap justify-center md:justify-start gap-4">
            <div className="glass-panel !rounded-full px-4 py-2 flex items-center gap-2 border-accent/30 bg-accent/5">
              <Shield className="w-4 h-4 text-accent" />
              <span className="text-sm font-bold uppercase tracking-wider text-accent">{loyaltyTier} Tier</span>
            </div>
            <div className="glass-panel !rounded-full px-4 py-2 flex items-center gap-2">
              <Coins className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-bold">{profile.loyalty_points} <span className="text-gray-400 font-normal">Inkwave Coins</span></span>
            </div>
          </div>
        </div>

        <button onClick={() => { signOut(); router.push('/'); }} className="absolute top-4 right-4 md:relative md:top-0 md:right-0 text-gray-500 hover:text-red-400 transition-colors flex items-center gap-2 text-sm z-10">
          <LogOut className="w-4 h-4" />
          <span className="hidden md:inline">Sign Out</span>
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Nav */}
        <div className="w-full lg:w-64 flex flex-row lg:flex-col gap-2 overflow-x-auto pb-4 lg:pb-0 scrollbar-hide">

          <button 
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${activeTab === 'orders' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <Package className="w-4 h-4" /> Order History
          </button>
          <button 
            onClick={() => setActiveTab('fit')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${activeTab === 'fit' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <Ruler className="w-4 h-4" /> Fit Preferences
          </button>
          <button 
            onClick={() => setActiveTab('address')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${activeTab === 'address' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <MapPin className="w-4 h-4" /> Saved Addresses
          </button>
          <button 
            onClick={() => setActiveTab('refer')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${activeTab === 'refer' ? 'bg-accent/20 text-accent' : 'text-gray-400 hover:text-accent hover:bg-accent/10'}`}
          >
            <Sparkles className="w-4 h-4" /> Refer & Earn
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 glass-panel p-6 md:p-8">
          {activeTab === 'fit' && (
            <div>
              <h2 className="font-syne text-2xl font-bold mb-6 border-b border-glass-border pb-4">Fit Preferences & Body Specs</h2>
              <form onSubmit={handleSavePreferences} className="space-y-6 max-w-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Full Name</label>
                  <input 
                    type="text" 
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Height (cm)</label>
                    <input 
                      type="number" 
                      value={formData.height}
                      onChange={(e) => setFormData({...formData, height: e.target.value})}
                      className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-accent transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Weight (kg)</label>
                    <input 
                      type="number" 
                      value={formData.weight}
                      onChange={(e) => setFormData({...formData, weight: e.target.value})}
                      className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-accent transition-colors"
                    />
                  </div>
                </div>
                <div className="pt-4">
                  <button type="submit" disabled={isSaving} className="bg-white text-black font-semibold px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50">
                    {isSaving ? 'Saving...' : 'Save Preferences'}
                  </button>
                </div>
              </form>
            </div>
          )}


          {activeTab === 'orders' && (
            <div className="text-center py-20 text-gray-400">
              <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>You haven't placed any orders yet.</p>
            </div>
          )}

          {activeTab === 'address' && (
            <div>
              <h2 className="font-syne text-2xl font-bold mb-6 border-b border-glass-border pb-4">Saved Addresses</h2>
              <form onSubmit={handleSavePreferences} className="space-y-6 max-w-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Primary Shipping Address</label>
                  <textarea 
                    rows={4}
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-accent transition-colors resize-none"
                    placeholder="Enter your full shipping address..."
                  />
                </div>
                <div className="pt-4">
                  <button type="submit" disabled={isSaving} className="bg-white text-black font-semibold px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50">
                    {isSaving ? 'Saving...' : 'Save Address'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'refer' && (
            <div>
              <h2 className="font-syne text-2xl font-bold mb-6 border-b border-glass-border pb-4 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-accent" /> Refer & Earn
              </h2>
              
              <div className="bg-accent/10 border border-accent/20 rounded-xl p-6 md:p-8 text-center max-w-2xl mx-auto">
                <Coins className="w-16 h-16 text-accent mx-auto mb-4" />
                <h3 className="text-xl md:text-2xl font-bold mb-2">Give 10%, Get 500 Coins</h3>
                <p className="text-gray-400 mb-8 max-w-md mx-auto">
                  Share your unique referral link with friends. They get a 10% discount on their first order, and you earn 500 Inkwave Coins when their order is delivered!
                </p>
                
                <div className="bg-black/50 border border-white/10 rounded-lg p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex-1 font-mono text-sm md:text-base truncate w-full text-left md:text-center text-white/80">
                    https://inkwavefashion.com/?ref={user.id.substring(0, 8)}
                  </div>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(`https://inkwavefashion.com/?ref=${user.id.substring(0, 8)}`);
                      toast.success('Referral link copied to clipboard!');
                    }}
                    className="flex-shrink-0 bg-accent text-black font-bold px-6 py-3 rounded-lg hover:bg-white transition-colors w-full md:w-auto flex justify-center items-center gap-2"
                  >
                    <Copy className="w-4 h-4" /> Copy Link
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
