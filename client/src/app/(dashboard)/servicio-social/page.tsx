'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { usersServiceApi } from '@/lib/api';
import type { UserServiceSocial } from '@/types';
import { Plus, Users } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SocialServicePage() {
  const [students, setStudents] = useState<UserServiceSocial[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const data = await usersServiceApi.getAll();
        setStudents(data as UserServiceSocial[]);
      } catch (error) {
        console.error('Error fetching students:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, []);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold">Servicio Social</h1>
          <p className="text-muted-foreground">Gestiona los estudiantes de servicio social</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Agregar Estudiante
        </Button>
      </motion.div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Estudiantes</CardTitle>
          <CardDescription>{students.length} estudiantes registrados</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ) : students.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No hay estudiantes registrados</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Género</TableHead>
                  <TableHead>Documentos</TableHead>
                  <TableHead>Pago Campo</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>{student.number || 'N/A'}</TableCell>
                    <TableCell>{student.Gender}</TableCell>
                    <TableCell>{student.Documents || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          student.payGotoCampement === 'PAGO'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }
                      >
                        {student.payGotoCampement}
                      </Badge>
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
