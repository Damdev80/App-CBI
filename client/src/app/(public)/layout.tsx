import Link from 'next/link';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <header className="border-b bg-card">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold">
            CBI
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">
              Iniciar Sesión
            </Link>
            <Link href="/pre-register" className="text-sm text-muted-foreground hover:text-foreground">
              Pre-Registro
            </Link>
          </nav>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
