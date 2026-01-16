import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
    title: "BULK Card Generator",
    description: "Generate your premium BULK-style card. Built for the BULK ecosystem.",
    keywords: ["BULK", "card generator", "Twitter", "X", "social card"],
    authors: [{ name: "BULK" }],
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
            <body className="antialiased">
                {children}
                <Analytics />
            </body>
        </html>
    );
}
