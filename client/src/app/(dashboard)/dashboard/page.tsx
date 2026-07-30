'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { dashboardApi } from '@/lib/api';
import { Users, Calendar, UserCheck, AlertCircle } from 'lucide-react';
import { ScrollReveal } from '@/components/animated/scroll-reveal';
import { FadeContent } from '@/components/animated/fade-content';
import { AnimatedCounter } from '@/components/animated/animated-counter';
import { GradientText } from '@/components/animated/gradient-text';
import { Role } from '@/types';

interface DashboardStats {
  totalUsers?: number;
  baptized?: number;
  womenRegistered?: number;
  unpaid?: number;
}

export default function DashboardPage() {
  const { user, hasRole } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (hasRole(Role.ADMIN, Role.SEMI_ADMIN)) {
          const [totalUsers, baptized, womenRegistered, unpaid] = await Promise.all([
            dashboardApi.getNumberUser(),
            dashboardApi.getBautized(),
            dashboardApi.getWomenRegistered(),
            dashboardApi.getCountUnpaid(),
          ]);
          setStats({
            totalUsers,
            baptized,
            womenRegistered,
            unpaid,
          });
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [hasRole]);

  const statCards = [
    {
      title: 'Miembros Totales',
      value: stats.totalUsers ?? 0,
      icon: Users,
      description: 'Miembros registrados',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Bautizados',
      value: stats.baptized ?? 0,
      icon: UserCheck,
      description: 'Miembros bautizados',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Mujeres Registradas',
      value: stats.womenRegistered ?? 0,
      icon: Users,
      description: 'Mujeres en la iglesia',
      color: 'text-pink-500',
      bgColor: 'bg-pink-500/10',
    },
    {
      title: 'Pendientes de Pago',
      value: stats.unpaid ?? 0,
      icon: AlertCircle,
      description: 'Inscripciones sin pagar',
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
  ];

  return (
    <div className="space-y-8">
      <FadeContent>
        <div>
          <h1 className="text-3xl font-bold">
            Hola, <GradientText gradient="from-primary to-blue-600">{user?.name || 'Usuario'}</GradientText>
          </h1>
          <p className="text-muted-foreground">
            Bienvenido al panel de administración
          </p>
        </div>
      </FadeContent>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 w-24 bg-muted rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-muted rounded mb-2" />
                <div className="h-3 w-32 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat, index) => (
            <ScrollReveal key={stat.title} delay={index * 0.1}>
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <div className={`h-8 w-8 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    <AnimatedCounter target={stat.value} />
                  </div>
                  <CardDescription className="text-xs text-muted-foreground">
                    {stat.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </ScrollReveal>
          ))}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <ScrollReveal delay={0.2}>
          <Card>
            <CardHeader>
              <CardTitle>Accesos Rápidos</CardTitle>
              <CardDescription>
                Accede rápidamente a las funciones más utilizadas
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <a
                href="/dashboard/eventos"
                className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted transition-all duration-200 hover:scale-[1.02]"
              >
                <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="font-medium">Crear Evento</p>
                  <p className="text-sm text-muted-foreground">
                    Organiza un nuevo evento
                  </p>
                </div>
              </a>
              <a
                href="/dashboard/asistencia"
                className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted transition-all duration-200 hover:scale-[1.02]"
              >
                <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <UserCheck className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="font-medium">Tomar Asistencia</p>
                  <p className="text-sm text-muted-foreground">
                    Registra la asistencia de hoy
                  </p>
                </div>
              </a>
              <a
                href="/dashboard/visitantes"
                className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted transition-all duration-200 hover:scale-[1.02]"
              >
                <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="font-medium">Registrar Visitante</p>
                  <p className="text-sm text-muted-foreground">
                    Registra un nuevo visitante
                  </p>
                </div>
              </a>
            </CardContent>
          </Card>
        </ScrollReveal>

        <ScrollReveal delay={0.3}>
          <Card>
            <CardHeader>
              <CardTitle>Información</CardTitle>
              <CardDescription>
                Datos de tu cuenta y rol
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-muted-foreground">Nombre:</span>
                <span className="font-medium">{user?.name || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-muted-foreground">Email:</span>
                <span className="font-medium">{user?.email || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-muted-foreground">Rol:</span>
                <span className="font-medium">{user?.role || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-muted-foreground">Estado:</span>
                <span className="font-medium">
                  {user?.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>
      </div>
    </div>
  );
}
