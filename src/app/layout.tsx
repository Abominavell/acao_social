import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IADVh - Voluntariado Social",
  description: "Sistema de Monitoramento de Voluntariado e Compromisso Social do Instituto de Apoio ao Desenvolvimento da Vida Humana",
  metadataBase: new URL("http://localhost:3000"),
  openGraph: {
    title: "IADVh - Voluntariado Social",
    description: "Inscreva-se em ações sociais, confirme sua presença e acompanhe o ranking do seu setor em tempo real.",
    images: [
      {
        url: "/og-image.png",
        width: 1024,
        height: 1024,
        alt: "IADVh - Voluntariado Social",
      },
    ],
    type: "website",
    locale: "pt_BR",
  },
  twitter: {
    card: "summary_large_image",
    title: "IADVh - Voluntariado Social",
    description: "Inscreva-se em ações sociais, confirme sua presença e acompanhe o ranking do seu setor em tempo real.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className="dark">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('monitoramento_theme');if(t==='light'){document.documentElement.classList.remove('dark');}else{document.documentElement.classList.add('dark');}}catch(e){document.documentElement.classList.add('dark');}})();`,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        {children}
      </body>
    </html>
  );
}
