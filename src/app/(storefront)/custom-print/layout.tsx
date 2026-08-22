import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Custom Print Studio | Inkwave',
  description: 'Design and print your own custom graphics on premium streetwear blanks.',
};

export default function CustomPrintLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
