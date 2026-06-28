import type { Metadata } from "next";
import "./globals.css";
import { theme } from "@/config/theme";

export const metadata: Metadata = {
  title: "Банкетный зал при мечети АХТАМ | Казань",
  description:
    "Банкетный зал при мечети АХТАМ в Казани. Один зал до 50 гостей с вариативной рассадкой столов.",
  metadataBase: new URL("https://kenderi.ru")
};

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  const cssVariables = `
    :root {
      --color-bg-base: ${theme.colors.bgBase};
      --color-bg-surface: ${theme.colors.bgSurface};
      --color-brand: ${theme.colors.brand};
      --color-brand-soft: ${theme.colors.brandSoft};
      --color-brand-dark: ${theme.colors.brandDark};
      --color-accent: ${theme.colors.accent};
      --color-accent-soft: ${theme.colors.accentSoft};
      --color-ink: ${theme.colors.ink};
      --color-ink-soft: ${theme.colors.inkSoft};
      --color-ink-muted: ${theme.colors.inkMuted};
      --color-line: ${theme.colors.line};
      --color-danger: ${theme.colors.danger};
      --color-success: ${theme.colors.success};
    }
  `;

  return (
    <html lang="ru">
      <head>
        <style dangerouslySetInnerHTML={{ __html: cssVariables }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
