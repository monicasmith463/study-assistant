import { Outfit } from 'next/font/google';
import './globals.css';

import Providers from "@/components/provider/Providers";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

const outfit = Outfit({
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.className} dark:bg-gray-900`}>
      <Providers>{children}</Providers>
      </body>
    </html>
  );
}
