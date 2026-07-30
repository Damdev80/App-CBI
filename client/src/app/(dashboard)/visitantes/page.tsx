'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { visitorsApi } from '@/lib/api';
import { Plus, Footprints } from 'lucide-react';
import { motion } from 'framer-motion';

interface Visitor {
  id: string;
  name: string;
  phone: string;
  dateBorn: string;
  createdAt: string;
}

export default function VisitorsPage() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVisitors = async () => {
      try {
        const data = await visitorsApi.getAll();
        setVisitors(data as Visitor[]);
      } catch (error) {
        console.error('Error fetching visitors:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVisitors();
  }, []);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold">Visitantes</h1>
          <p className="text-muted-foreground">Registro de visitantes</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Registrar Visitante
        </Button>
      </motion.div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Visitantes</CardTitle>
          <CardDescription>{visitors.length} visitantes registrados</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ) : visitors.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Footprints className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No hay visitantes registrados</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Fecha de Nacimiento</TableHead>
                  <TableHead>Fecha de Registro</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visitors.map((visitor) => (
                  <TableRow key={visitor.id}>
                    <TableCell className="font-medium">{visitor.name}</TableCell>
                    <TableCell>{visitor.phone}</TableCell>
                    <TableCell>
                      {new Date(visitor.dateBorn).toLocaleDateString('es-CO')}
                    </TableCell>
                    <TableCell>
                      {new Date(visitor.createdAt).toLocaleDateString('es-CO')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
