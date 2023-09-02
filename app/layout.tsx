import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SessProvider } from "./components/SessProvider";
import { ReduxProvider } from "@/redux/provider";
import { SocketProvider } from "./components/SocketProvider";
import Wrapper from "./components/Wrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Create Next App",
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
        <ReduxProvider>
          <SessProvider>
            <SocketProvider>
              <Wrapper>{children}</Wrapper>
            </SocketProvider>
          </SessProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
