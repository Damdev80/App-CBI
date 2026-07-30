'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { api } from '@/lib/api';

export default function PreRegisterPage() {
  const [name, setName] = useState('');
  const [sexo, setSexo] = useState('');
  const [number, setNumber] = useState('');
  const [address, setAddress] = useState('');
  const [baptized, setBaptized] = useState(false);
  const [group, setGroup] = useState('');
  const [happybirth, setHappybirth] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await api.post('/pre-register', {
        name,
        sexo,
        number,
        address,
        baptized,
        group: group || undefined,
        happybirth,
      });
      toast.success('Pre-registro exitoso. Pronto nos pondremos en contacto contigo.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al pre-registrar');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Pre-Registro</CardTitle>
          <CardDescription>
            Completa el formulario para pre-registrarte
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre completo</Label>
              <Input
                id="name"
                type="text"
                placeholder="Tu nombre"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sexo">Sexo</Label>
              <Select value={sexo} onValueChange={(value) => setSexo(value ?? '')} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona tu sexo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Masculino">Masculino</SelectItem>
                  <SelectItem value="Femenino">Femenino</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="number">Teléfono</Label>
              <Input
                id="number"
                type="tel"
                placeholder="300 123 4567"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                required
                minLength={10}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Dirección</Label>
              <Input
                id="address"
                type="text"
                placeholder="Tu dirección"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                minLength={5}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="happybirth">Fecha de nacimiento</Label>
              <Input
                id="happybirth"
                type="date"
                value={happybirth}
                onChange={(e) => setHappybirth(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="group">Grupo (opcional)</Label>
              <Input
                id="group"
                type="text"
                placeholder="Nombre del grupo"
                value={group}
                onChange={(e) => setGroup(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="baptized"
                checked={baptized}
                onChange={(e) => setBaptized(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="baptized" className="text-sm">
                Estoy bautizado
              </Label>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Enviando...' : 'Enviar pre-registro'}
            </Button>
            <div className="text-sm text-muted-foreground text-center">
              ¿Ya tienes una cuenta?{' '}
              <Link href="/login" className="text-primary hover:underline">
                Inicia sesión
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
