import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SessProvider } from "./components/SessProvider";
import { ReduxProvider } from "@/redux/provider";
import { SocketProvider } from "./components/SocketProvider";
import Wrapper from "./components/Wrapper";
import DialogflowMessenger from "./components/DialogFlowMessenger";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Workspace",
  description: "Generated by create next app",
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
        <ReduxProvider>
          <SessProvider>
            <SocketProvider>
              <Wrapper>{children}</Wrapper>
            </SocketProvider>
            <DialogflowMessenger />
          </SessProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
