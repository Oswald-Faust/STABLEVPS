import "./globals.css";

// Root layout - ne contient que le strict minimum
// Le layout principal est dans [locale]/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
