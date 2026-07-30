'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { teachersServiceApi } from '@/lib/api';
import type { TeachersService } from '@/types';
import { Plus, GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<TeachersService[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const data = await teachersServiceApi.getAll();
        setTeachers(data as TeachersService[]);
      } catch (error) {
        console.error('Error fetching teachers:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeachers();
  }, []);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold">Profesores</h1>
          <p className="text-muted-foreground">Gestiona los profesores del servicio social</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Agregar Profesor
        </Button>
      </motion.div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Profesores</CardTitle>
          <CardDescription>{teachers.length} profesores registrados</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ) : teachers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <GraduationCap className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No hay profesores registrados</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>ID Profesor</TableHead>
                  <TableHead>Campo</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teachers.map((teacher) => (
                  <TableRow key={teacher.id}>
                    <TableCell className="font-medium">{teacher.name}</TableCell>
                    <TableCell>{teacher.number || 'N/A'}</TableCell>
                    <TableCell className="font-mono text-sm">{teacher.teacherId}</TableCell>
                    <TableCell>
                      {teacher.GoToCampement ? 'Sí' : 'No'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        Ver
                      </Button>
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
