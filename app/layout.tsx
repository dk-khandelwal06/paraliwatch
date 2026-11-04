import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#080f0b",
};

export const metadata: Metadata = {
  title: "ParaliWatch | Punjab Satellite Fire Tracker & Environmental ML Forecast",
  description:
    "A self-updating environmental intelligence platform tracking Punjab's paddy-residue burning season using NASA VIIRS 375m satellite observations, Open-Meteo meteorological covariates, and regularized Ridge Regression forecasting.",
  keywords: [
    "ParaliWatch",
    "Punjab",
    "Stubble Burning",
    "NASA FIRMS",
    "VIIRS",
    "Crop Residue",
    "Air Quality",
    "Machine Learning",
    "Ridge Regression",
    "Open-Meteo",
  ],
  authors: [{ name: "ParaliWatch Environmental Intelligence Team" }],
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className="min-h-screen antialiased flex flex-col">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
