'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { profileApi } from '@/lib/api';
import type { User } from '@/types';
import { User as UserIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await profileApi.get();
        setUser(data as User);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    try {
      await profileApi.update({
        name: user.name,
        address: user.address,
        age: user.age,
        hobbies: user.hobbies,
        dreams: user.dreams,
        job: user.job,
      });
      toast.success('Perfil actualizado exitosamente');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al actualizar perfil');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="h-64 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <UserIcon className="h-8 w-8" />
          Mi Perfil
        </h1>
        <p className="text-muted-foreground">Gestiona tu información personal</p>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Información Personal</CardTitle>
            <CardDescription>Datos básicos de tu cuenta</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span className="font-medium">{user?.email || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Teléfono:</span>
                <span className="font-medium">{user?.number || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Rol:</span>
                <span className="font-medium">{user?.role || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estado:</span>
                <span className="font-medium">
                  {user?.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bautizado:</span>
                <span className="font-medium">
                  {user?.baptized ? 'Sí' : 'No'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Editar Perfil</CardTitle>
            <CardDescription>Actualiza tu información</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  value={user?.name || ''}
                  onChange={(e) => setUser({ ...user!, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Dirección</Label>
                <Input
                  id="address"
                  value={user?.address || ''}
                  onChange={(e) => setUser({ ...user!, address: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Edad</Label>
                <Input
                  id="age"
                  type="number"
                  value={user?.age || ''}
                  onChange={(e) => setUser({ ...user!, age: parseInt(e.target.value) || null })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="job">Ocupación</Label>
                <Input
                  id="job"
                  value={user?.job || ''}
                  onChange={(e) => setUser({ ...user!, job: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hobbies">Pasatiempos</Label>
                <Input
                  id="hobbies"
                  value={user?.hobbies || ''}
                  onChange={(e) => setUser({ ...user!, hobbies: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dreams">Sueños</Label>
                <Input
                  id="dreams"
                  value={user?.dreams || ''}
                  onChange={(e) => setUser({ ...user!, dreams: e.target.value })}
                />
              </div>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
