export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen pt-32 pb-20 px-margin-mobile md:px-16 max-w-[1200px] mx-auto">
      {children}
    </div>
  );
}
