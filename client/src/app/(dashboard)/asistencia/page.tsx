'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { attendanceApi, teachersServiceApi } from '@/lib/api';
import type { TeachersService } from '@/types';
import { UserCheck, UserX } from 'lucide-react';
import { motion } from 'framer-motion';

interface AttendanceRecord {
  id: string;
  name: string;
  number: string;
  Gender: string;
  group: string;
  present: boolean;
  recordId: string | null;
}

export default function AttendancePage() {
  const [teachers, setTeachers] = useState<TeachersService[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<string>('');
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [summary, setSummary] = useState({ total: 0, present: 0, absent: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const data = await teachersServiceApi.getAll();
        setTeachers(data as TeachersService[]);
        if ((data as TeachersService[]).length > 0) {
          setSelectedTeacher((data as TeachersService[])[0].id);
        }
      } catch (error) {
        console.error('Error fetching teachers:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeachers();
  }, []);

  useEffect(() => {
    const fetchAttendance = async () => {
      if (!selectedTeacher || !selectedDate) return;

      try {
        const [attendanceData, summaryData] = await Promise.all([
          attendanceApi.getByDate(selectedDate, selectedTeacher),
          attendanceApi.getSummary(selectedDate, selectedTeacher),
        ]);
        setAttendance(attendanceData as AttendanceRecord[]);
        setSummary(summaryData as { total: number; present: number; absent: number });
      } catch (error) {
        console.error('Error fetching attendance:', error);
      }
    };

    fetchAttendance();
  }, [selectedTeacher, selectedDate]);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold">Asistencia</h1>
        <p className="text-muted-foreground">Control de asistencia de estudiantes</p>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Estudiantes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-green-500" />
              Presentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{summary.present}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <UserX className="h-4 w-4 text-red-500" />
              Ausentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{summary.absent}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Asistencia del Día</CardTitle>
              <CardDescription>Selecciona profesor y fecha</CardDescription>
            </div>
            <div className="flex gap-2">
              <select
                className="rounded-md border bg-background px-3 py-2 text-sm"
                value={selectedTeacher}
                onChange={(e) => setSelectedTeacher(e.target.value)}
              >
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.name}
                  </option>
                ))}
              </select>
              <input
                type="date"
                className="rounded-md border bg-background px-3 py-2 text-sm"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {attendance.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <UserCheck className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No hay registros de asistencia para esta fecha</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Género</TableHead>
                  <TableHead>Grupo</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendance.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.name}</TableCell>
                    <TableCell>{record.number}</TableCell>
                    <TableCell>{record.Gender}</TableCell>
                    <TableCell>{record.group}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          record.present
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }
                      >
                        {record.present ? 'Presente' : 'Ausente'}
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
