import Layout from '@/components/Layout';
import './globals.css';

export const metadata = {
  title: 'ProCheff - AI Powered Recipe Assistant',
  description: 'Discover, create, and manage your favorite recipes with AI assistance',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body>
        <Layout>
          {children}
        </Layout>
      </body>
    </html>
  );
}