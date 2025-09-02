import "./globals.css";
import type { Metadata } from "next";
import { IChildren } from "@/types";

export const metadata: Metadata = {
  title: "Cisco.AI",
};

const RootLayout: React.FC<IChildren> = ({ children }) => {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
};

export default RootLayout;
