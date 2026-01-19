import type { Metadata } from "next";
import { IBM_Plex_Sans, Barlow } from "next/font/google"; // Barlow is an excellent free substitute for DIN
import "./globals.css";

const ibm = IBM_Plex_Sans({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
    variable: "--font-ibm",
    display: 'swap',
});

const din = Barlow({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700", "900"],
    variable: "--font-din",
    display: 'swap',
});

export const metadata: Metadata = {
    title: "Bulk Card",
    description: "Generate your premium BULK-style card. Built for the BULK ecosystem.",
    keywords: ["BULK", "card generator", "Twitter", "X", "social card"],
    authors: [{ name: "BULK" }],
    icons: {
        icon: '/icon.png',
        shortcut: '/icon.png',
        apple: '/icon.png',
    },
    openGraph: {
        title: "BULK Card Generator",
        description: "Generate your premium BULK-style card",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "BULK Card Generator",
        description: "Generate your premium BULK-style card",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${ibm.variable} ${din.variable} font-din antialiased`}>
                {children}
            </body>
        </html>
    );
}
