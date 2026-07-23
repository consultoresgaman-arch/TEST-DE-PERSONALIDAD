export const metadata = {
  title: "Evaluación Ejecutiva y de Liderazgo",
  description: "Evaluación de Inteligencia Emocional y Liderazgo",
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