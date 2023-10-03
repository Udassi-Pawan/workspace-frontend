import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SessProvider } from "./components/SessProvider";
import { ReduxProvider } from "@/redux/provider";
import { SocketProvider } from "./components/SocketProvider";
import Wrapper from "./components/Wrapper";
import DialogflowMessenger from "./components/DialogFlowMessenger";
import Script from "next/script";
import { ThemeProvider } from "./components/ThemeProvider";
import SpinnerProvider from "./components/SpinnerProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Workspace",
  description: "Generated by create next app",
  twitter: {
    card: "summary_large_image",
    creator: "@imamdev_",
    images: "https://example.com/og.png",
  },
  applicationName: "Workspace",
  appleWebApp: {
    capable: true,
    title: "Workspace",
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: false,
  },
  themeColor: "#FFFFFF",
  viewport:
    "minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, viewport-fit=cover",
  manifest: "/manifest.json",
  icons: [
    { rel: "apple-touch-icon", url: "/icons/apple-touch-icon.png" },
    { rel: "shortcut icon", url: "/favicon.ico" },
  ],
  keywords: ["nextjs", "pwa", "next-pwa"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Script src="https://www.gstatic.com/dialogflow-console/fast/messenger/bootstrap.js?v=1"></Script>
        <Script
          type="module"
          src="https://unpkg.com/ionicons@5.5.2/dist/ionicons/ionicons.esm.js"
        ></Script>
        <Script
          noModule
          src="https://unpkg.com/ionicons@5.5.2/dist/ionicons/ionicons.js"
        ></Script>
        <Script src="https://unpkg.com/swiper@8/swiper-bundle.min.js"></Script>

        <ReduxProvider>
          <SessProvider>
            <SocketProvider>
              <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
              >
                <Wrapper>
                  <SpinnerProvider>{children}</SpinnerProvider>
                </Wrapper>
              </ThemeProvider>
            </SocketProvider>
            <DialogflowMessenger />
          </SessProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
