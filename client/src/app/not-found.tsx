'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FadeContent } from '@/components/animated/fade-content';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 sm:p-8 text-center">
      <FadeContent>
        <p className="text-[clamp(6rem,20vw,12rem)] font-light text-muted-foreground/30 leading-none tracking-tighter mb-0">
          404
        </p>
        <div className="max-w-[360px] mx-auto">
          <h1 className="text-2xl font-semibold text-foreground mb-2">
            Página no encontrada
          </h1>
          <p className="text-muted-foreground mb-8">
            La ruta que buscas no existe o fue movida a otro lugar.
          </p>
          <Link href="/">
            <Button>Volver al inicio</Button>
          </Link>
        </div>
      </FadeContent>
    </div>
  );
}
