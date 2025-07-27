'use client';

import AuthProvider from "@/components/AuthProvider";
import CronInitializer from "@/components/CronInitializer";
import { Toaster } from "@/components/ui/sonner";
import { store } from "@/store/store";
import { Inter } from "next/font/google";
import type React from "react";
import { Provider } from "react-redux";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });



export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {



  return (
    <html lang="en">
      <body className={inter.className}>
        <Provider store={store}>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>

        </Provider>
      </body>
    </html>
  );
}