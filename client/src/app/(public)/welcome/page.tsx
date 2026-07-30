'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BlurText } from '@/components/animated/blur-text';
import { GradientText } from '@/components/animated/gradient-text';
import { ScrollReveal } from '@/components/animated/scroll-reveal';
import { FadeContent } from '@/components/animated/fade-content';
import { AuroraBackground } from '@/components/animated/aurora-background';
import { FloatingLines } from '@/components/animated/floating-lines';
import { Users, Calendar, BookOpen, Heart, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  {
    icon: Users,
    title: 'Gestión de Miembros',
    description: 'Administra los miembros de la iglesia, grupos y ministerios de forma sencilla.',
  },
  {
    icon: Calendar,
    title: 'Eventos',
    description: 'Organiza y gestiona eventos, inscripciones y pagos.',
  },
  {
    icon: BookOpen,
    title: 'Estudio Bíblico',
    description: 'Accede a herramientas de estudio bíblico y música.',
  },
  {
    icon: Heart,
    title: 'Comunidad',
    description: 'Fortalece la comunidad con foros y comunicación.',
  },
];

export default function WelcomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center min-h-[90vh] px-4 overflow-hidden">
        <AuroraBackground />
        <FloatingLines className="text-primary/30" count={6} />

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <FadeContent delay={0.2}>
            <div className="inline-flex items-center gap-2 rounded-full border bg-background/50 backdrop-blur-sm px-4 py-2 mb-8">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Sistema de Gestión Eclesial</span>
            </div>
          </FadeContent>

          <BlurText
            text="Iglesia CBI"
            className="text-5xl md:text-7xl font-bold tracking-tight mb-6 justify-center"
            delay={0.4}
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <p className="text-xl md:text-2xl text-muted-foreground mb-4">
              Sistema de gestión para nuestra comunidad de fe en{' '}
              <GradientText gradient="from-primary to-blue-600">Sincelejo</GradientText>
            </p>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="text-muted-foreground mb-10 max-w-2xl mx-auto"
          >
            Administra miembros, eventos, asistencia, finanzas y más.
            Todo lo que necesitas para fortalecer tu comunidad.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/login">
              <Button size="lg" className="text-lg px-8 group">
                Iniciar Sesión
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/pre-register">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Pre-Registro
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Decorative gradient orbs */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-t from-primary/10 to-transparent rounded-full blur-3xl" />
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 bg-background relative">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Todo lo que{' '}
                <GradientText gradient="from-blue-600 to-primary">necesitas</GradientText>
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Herramientas diseñadas para fortalecer nuestra comunidad y simplificar la administración
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <ScrollReveal key={feature.title} delay={index * 0.1}>
                <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
                  <CardHeader>
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2 group-hover:bg-primary/20 transition-colors">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-muted/50 relative overflow-hidden">
        <FloatingLines className="text-primary/20" count={4} />
        <ScrollReveal>
          <div className="max-w-3xl mx-auto text-center relative z-10">
            <h2 className="text-3xl font-bold mb-4">
              ¿Listo para comenzar?
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Únete a nuestra comunidad y empieza a gestionar tu iglesia de manera eficiente
            </p>
            <Link href="/pre-register">
              <Button size="lg" className="text-lg px-8">
                Comenzar Ahora
              </Button>
            </Link>
          </div>
        </ScrollReveal>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t bg-background">
        <div className="max-w-6xl mx-auto text-center text-muted-foreground">
          <p>&copy; 2026 Iglesia CBI Sincelejo. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
