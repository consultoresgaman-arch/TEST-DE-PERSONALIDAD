export const metadata = {
  title: "Evaluación Ejecutiva y de Liderazgo | Gaman Global Consultores",
  description: "Evaluación de Inteligencia Emocional y Liderazgo",
  icons: { icon: "/LOGO.png" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}