'use client';

import { useState, useRef } from 'react';
import { UploadCloud, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface MediaUploaderProps {
  onUploadSuccess: (url: string) => void;
  label?: string;
}

export default function MediaUploader({ onUploadSuccess, label = "Upload Image/Video" }: MediaUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    try {
      // 1. Get the signature parameters
      const timestamp = Math.round(new Date().getTime() / 1000).toString();
      const folder = 'inkwave';
      
      const paramsToSign = {
        timestamp,
        folder,
      };

      const signRes = await fetch('/api/cloudinary/sign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paramsToSign }),
      });

      if (!signRes.ok) {
        let errData: any = {};
        try { errData = await signRes.json(); } catch(_) {}
        throw new Error(errData.error || 'Failed to authenticate upload signature with the server.');
      }

      const { signature } = await signRes.json();

      // 2. Upload directly to Cloudinary using FormData
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || '');
      formData.append('timestamp', timestamp);
      formData.append('signature', signature);
      formData.append('folder', folder);

      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'mlcybvye';
      const isVideo = file.type.startsWith('video/') || 
                      ['mp4', 'webm', 'mov', 'mkv', 'avi', '3gp', 'wmv', 'flv', 'ogg', 'm4v']
                      .includes(file.name.split('.').pop()?.toLowerCase() || '');
      
      const resourceType = isVideo ? 'video' : 'auto';
      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

      const res = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });

      let data: any = {};
      try {
        data = await res.json();
      } catch (parseErr) {
        data = { error: `Server error (${res.status} ${res.statusText})` };
      }

      if (!res.ok) {
        throw new Error(data.error?.message || `Upload failed with status ${res.status}`);
      }

      if (!data.secure_url) {
        throw new Error('Upload succeeded but no secure URL was returned from Cloudinary.');
      }

      onUploadSuccess(data.secure_url);
      toast.success('Upload complete!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload file');
      console.error('[MediaUploader Error]', error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*,video/*"
      />
      <button
        type="button"
        disabled={isUploading}
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center justify-center gap-2 px-4 py-3 bg-[var(--bg-alt)] hover:bg-[var(--line)] border border-dashed border-[var(--text-dim)] hover:border-[var(--accent)] rounded-xl transition-all w-full text-[var(--text)] text-sm font-semibold font-sans group disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isUploading ? (
          <Loader2 className="w-5 h-5 text-[var(--accent)] animate-spin" />
        ) : (
          <UploadCloud className="w-5 h-5 text-[var(--text-dim)] group-hover:text-[var(--accent)] transition-colors" />
        )}
        {isUploading ? 'Uploading...' : label}
      </button>
    </div>
  );
}
