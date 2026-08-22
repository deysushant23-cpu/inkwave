// This layout intentionally has NO auth guard so /admin/login is publicly accessible.
// The main /admin/layout.tsx handles auth for all other admin routes.
export default function AdminLoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
