import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Studylink — Le tutorat de votre campus",
  description: "Trouvez et réservez un tuteur étudiant vérifié sur votre campus.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased">{children}</body>
    </html>
  );
}
