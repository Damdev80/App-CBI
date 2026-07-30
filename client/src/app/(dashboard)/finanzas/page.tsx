'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { moneyCollectionApi } from '@/lib/api';
import { DollarSign, AlertCircle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface DebtStatus {
  studentId: string;
  name: string;
  number: string | null;
  group: string | null;
  expectedAmount: number;
  totalPaid: number;
  debt: number;
  status: string;
}

export default function FinancesPage() {
  const [debtStatus, setDebtStatus] = useState<DebtStatus[]>([]);
  const [totalCollected, setTotalCollected] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [expectedAmount] = useState(50000);

  useEffect(() => {
    const fetchFinances = async () => {
      try {
        const [debtData, totalData] = await Promise.all([
          moneyCollectionApi.getDebtStatus(expectedAmount),
          moneyCollectionApi.getTotal(),
        ]);
        setDebtStatus(debtData as DebtStatus[]);
        setTotalCollected(totalData as number);
      } catch (error) {
        console.error('Error fetching finances:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFinances();
  }, [expectedAmount]);

  const totalDebt = debtStatus.reduce((sum, s) => sum + s.debt, 0);
  const debtors = debtStatus.filter((s) => s.debt > 0);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold">Finanzas</h1>
        <p className="text-muted-foreground">Ministerio Exploradores del Rey</p>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Recaudado</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalCollected.toLocaleString('es-CO')}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deuda</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              ${totalDebt.toLocaleString('es-CO')}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deudores</CardTitle>
            <CheckCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{debtors.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Estado de Deudas</CardTitle>
          <CardDescription>Esperado: ${expectedAmount.toLocaleString('es-CO')} por estudiante</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ) : debtStatus.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No hay datos financieros</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Grupo</TableHead>
                  <TableHead>Esperado</TableHead>
                  <TableHead>Pagado</TableHead>
                  <TableHead>Deuda</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {debtStatus.map((student) => (
                  <TableRow key={student.studentId}>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>{student.group || 'N/A'}</TableCell>
                    <TableCell>${student.expectedAmount.toLocaleString('es-CO')}</TableCell>
                    <TableCell>${student.totalPaid.toLocaleString('es-CO')}</TableCell>
                    <TableCell className="text-red-500">
                      ${student.debt.toLocaleString('es-CO')}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          student.status === 'PAGO'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }
                      >
                        {student.status}
                      </Badge>
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
