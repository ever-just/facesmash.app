import { RootProvider } from 'fumadocs-ui/provider/next';
import { Banner } from 'fumadocs-ui/components/banner';
import './global.css';
import { Inter } from 'next/font/google';
import type { Metadata } from 'next';

const inter = Inter({
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'FaceSmash Docs',
    template: '%s | FaceSmash Docs',
  },
  description: 'Developer documentation for FaceSmash — passwordless facial recognition authentication SDK and API.',
  metadataBase: new URL('https://docs.facesmash.app'),
};

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <Banner id="sdk-v0.1.0" variant="rainbow">
          <span className="font-medium">
            🎉 <code className="mx-1 text-sm font-mono">@facesmash/sdk v0.1.0</code> is now available on npm — {' '}
            <a href="/docs/sdk" className="underline underline-offset-4 hover:opacity-80">Read the docs →</a>
          </span>
        </Banner>
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
