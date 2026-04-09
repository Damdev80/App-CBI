import { Gender, PrismaClient } from '@prisma/client';
import * as path from 'node:path';
import * as XLSX from 'xlsx';

type SheetRow = (string | number | Date | null)[];
type PaymentOutcome = 'created' | 'updated' | 'reused' | 'unchanged';
type StudentOutcome = 'created' | 'updated';

type CliOptions = {
  filePath: string;
  defaultGender?: Gender;
  serviceExpected?: number;
  campServExpected?: number;
  campExplExpected?: number;
  pruneMissing: boolean;
};

type ResolvedSheet = {
  requestedName: string;
  foundName: string | null;
  rows: SheetRow[];
};

type SheetImportResult = {
  sheetName: string;
  studentsTouched: number;
  studentsCreated: number;
  studentsUpdated: number;
  paymentsCreated: number;
  paymentsUpdated: number;
  paymentsReused: number;
  paymentsUnchanged: number;
  paymentsPruned: number;
  rowsSkipped: number;
};

const prisma = new PrismaClient();
const COL = (letter: string) => XLSX.utils.decode_col(letter);

function getArg(name: string): string | undefined {
  const prefix = `--${name}=`;
  const arg = process.argv.find((v) => v.startsWith(prefix));
  return arg ? arg.slice(prefix.length) : undefined;
}

function parseBooleanArg(name: string, defaultValue = false): boolean {
  const value = getArg(name);
  if (value === undefined) return defaultValue;
  const normalized = normalizeKey(value);
  if (['1', 'true', 'yes', 'si', 'on'].includes(normalized)) return true;
  if (['0', 'false', 'no', 'off'].includes(normalized)) return false;
  return defaultValue;
}

function parseNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const normalized = value.replace(/\./g, '').replace(/,/g, '.').trim();
    const n = Number(normalized.replace(/[^\d.-]/g, ''));
    if (Number.isFinite(n)) return n;
  }
  return null;
}

function parseDate(value: unknown): Date | null {
  if (!value) return null;

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const d = new Date(value);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    const d = new Date(excelEpoch.getTime() + value * 24 * 60 * 60 * 1000);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  if (typeof value === 'string') {
    const text = cleanText(value);
    const latinMatch = text.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})$/);
    if (latinMatch) {
      const day = Number(latinMatch[1]);
      const month = Number(latinMatch[2]);
      let year = Number(latinMatch[3]);
      if (year < 100) year += 2000;
      const d = new Date(year, month - 1, day);
      if (!Number.isNaN(d.getTime())) {
        d.setHours(0, 0, 0, 0);
        return d;
      }
    }

    const d = new Date(text);
    if (!Number.isNaN(d.getTime())) {
      d.setHours(0, 0, 0, 0);
      return d;
    }
  }

  return null;
}

function cleanText(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value).replace(/\s+/g, ' ').trim();
}

function normalizeKey(value: string): string {
  return cleanText(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function shouldIgnoreName(name: string): boolean {
  const key = normalizeKey(name);
  if (!key) return true;
  if (key.includes('nombre completo')) return true;
  if (key.includes('observacion')) return true;
  if (key === 'total') return true;
  if (key.includes('finanzas')) return true;
  return false;
}

function asPhone(value: unknown): string | undefined {
  if (value === null || value === undefined || value === '') return undefined;
  const num = parseNumber(value);
  if (num === null) return cleanText(value) || undefined;
  return String(Math.trunc(num));
}

function findSheetName(workbook: XLSX.WorkBook, candidates: string[]): string | null {
  const names = workbook.SheetNames || [];

  for (const candidate of candidates) {
    if (names.includes(candidate)) return candidate;
  }

  const byNormalized = new Map<string, string>();
  for (const name of names) {
    byNormalized.set(normalizeKey(name), name);
  }

  for (const candidate of candidates) {
    const normalizedCandidate = normalizeKey(candidate);
    const exact = byNormalized.get(normalizedCandidate);
    if (exact) return exact;
  }

  for (const candidate of candidates) {
    const normalizedCandidate = normalizeKey(candidate);
    const fuzzy = names.find((name) => {
      const key = normalizeKey(name);
      return key.includes(normalizedCandidate) || normalizedCandidate.includes(key);
    });
    if (fuzzy) return fuzzy;
  }

  return null;
}

function resolveSheet(workbook: XLSX.WorkBook, candidates: string[], requestedName: string): ResolvedSheet {
  const foundName = findSheetName(workbook, candidates);
  if (!foundName) {
    return { requestedName, foundName: null, rows: [] };
  }

  const rows =
    (XLSX.utils.sheet_to_json(workbook.Sheets[foundName], {
      header: 1,
      raw: true,
      defval: null,
    }) as SheetRow[]) || [];

  return { requestedName, foundName, rows };
}

async function ensureGroup(name: string) {
  const groupId = `AUTOGROUP-${normalizeKey(name).slice(0, 24)}`;
  return prisma.studentGroup.upsert({
    where: { id: groupId },
    update: { name },
    create: { id: groupId, name },
  });
}

async function ensureTeacher(name: string) {
  const cleanName = cleanText(name);
  if (!cleanName || shouldIgnoreName(cleanName)) return null;

  const existing = await prisma.teachersService.findFirst({
    where: { name: { equals: cleanName, mode: 'insensitive' } },
  });
  if (existing) return existing;

  const teacherId = `PROF-IMPORT-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
  return prisma.teachersService.create({
    data: {
      name: cleanName,
      teacherId,
    },
  });
}

async function ensureStudent(params: {
  name: string;
  number?: string;
  groupId: string;
  defaultGender?: Gender;
  sourceSheet: string;
}): Promise<{ studentId: string; action: StudentOutcome } | null> {
  const cleanName = cleanText(params.name);
  if (!cleanName || shouldIgnoreName(cleanName)) return null;

  if (params.number) {
    const byNumber = await prisma.userServiceSocial.findUnique({ where: { number: params.number } });
    if (byNumber) {
      const updated = await prisma.userServiceSocial.update({
        where: { id: byNumber.id },
        data: {
          name: cleanName,
          groupId: params.groupId,
        },
      });
      return { studentId: updated.id, action: 'updated' };
    }
  }

  const byName = await prisma.userServiceSocial.findFirst({
    where: {
      name: { equals: cleanName, mode: 'insensitive' },
      groupId: params.groupId,
    },
  });

  if (byName) {
    const updated = await prisma.userServiceSocial.update({
      where: { id: byName.id },
      data: {
        name: cleanName,
        groupId: params.groupId,
        ...(params.number ? { number: params.number } : {}),
      },
    });
    return { studentId: updated.id, action: 'updated' };
  }

  if (!params.defaultGender) {
    throw new Error(
      `No se pudo crear estudiante "${cleanName}" (${params.sourceSheet}) porque Gender es requerido. Usa --default-gender=MASCULINO|FEMENINO.`,
    );
  }

  const created = await prisma.userServiceSocial.create({
    data: {
      name: cleanName,
      number: params.number,
      Gender: params.defaultGender,
      groupId: params.groupId,
    },
  });

  return { studentId: created.id, action: 'created' };
}

function extractPayments(
  row: SheetRow,
  pairs: Array<[string, string]>,
): Array<{ date: Date; amount: number; paymentIndex: number }> {
  const out: Array<{ date: Date; amount: number; paymentIndex: number }> = [];

  pairs.forEach(([dateCol, amountCol], idx) => {
    const rawDate = row[COL(dateCol)];
    const rawAmount = row[COL(amountCol)];
    const date = parseDate(rawDate);
    const amount = parseNumber(rawAmount);

    if (!date || amount === null || amount <= 0) return;

    out.push({ date, amount, paymentIndex: idx + 1 });
  });

  return out;
}

function buildImportMarker(sheetName: string, rowNumber: number, paymentIndex: number): string {
  return `IMPORT_EXCEL|sheet=${sheetName}|row=${rowNumber}|p=${paymentIndex}`;
}

async function upsertPaymentFromExcel(params: {
  studentId: string;
  paymentDate: Date;
  amount: number;
  sheetName: string;
  rowNumber: number;
  paymentIndex: number;
}): Promise<{ marker: string; outcome: PaymentOutcome }> {
  const marker = buildImportMarker(params.sheetName, params.rowNumber, params.paymentIndex);

  const byMarker = await prisma.moneyCollection.findFirst({
    where: { notes: marker },
  });

  if (byMarker) {
    const sameDate = byMarker.date.getTime() === params.paymentDate.getTime();
    const sameAmount = Math.abs(Number(byMarker.amount) - params.amount) < 0.0001;
    const sameStudent = byMarker.studentId === params.studentId;

    if (sameDate && sameAmount && sameStudent) {
      return { marker, outcome: 'unchanged' };
    }

    await prisma.moneyCollection.update({
      where: { id: byMarker.id },
      data: {
        studentId: params.studentId,
        date: params.paymentDate,
        amount: params.amount,
        notes: marker,
      },
    });

    return { marker, outcome: 'updated' };
  }

  const exactMatch = await prisma.moneyCollection.findFirst({
    where: {
      studentId: params.studentId,
      date: params.paymentDate,
      amount: params.amount,
    },
  });

  if (exactMatch) {
    if (exactMatch.notes !== marker) {
      await prisma.moneyCollection.update({
        where: { id: exactMatch.id },
        data: { notes: marker },
      });
    }
    return { marker, outcome: 'reused' };
  }

  await prisma.moneyCollection.create({
    data: {
      studentId: params.studentId,
      date: params.paymentDate,
      amount: params.amount,
      notes: marker,
    },
  });

  return { marker, outcome: 'created' };
}

async function importTeachersFromFinanceSheet(rows: SheetRow[]) {
  let createdOrFound = 0;

  for (let i = 2; i < rows.length; i++) {
    const name = cleanText(rows[i][COL('Q')]);
    if (!name || shouldIgnoreName(name) || normalizeKey(name).includes('exploradores')) continue;
    const teacher = await ensureTeacher(name);
    if (teacher) createdOrFound++;
  }

  return createdOrFound;
}

async function importStudentSheet(params: {
  rows: SheetRow[];
  sheetName: string;
  groupName: string;
  nameCol: string;
  phoneCol?: string;
  paymentPairs: Array<[string, string]>;
  totalCol?: string;
  saldoCol?: string;
  expectedFallback?: number;
  defaultGender?: Gender;
  pruneMissing: boolean;
}): Promise<SheetImportResult> {
  const group = await ensureGroup(params.groupName);
  const result: SheetImportResult = {
    sheetName: params.sheetName,
    studentsTouched: 0,
    studentsCreated: 0,
    studentsUpdated: 0,
    paymentsCreated: 0,
    paymentsUpdated: 0,
    paymentsReused: 0,
    paymentsUnchanged: 0,
    paymentsPruned: 0,
    rowsSkipped: 0,
  };

  const expectedByStudent = new Map<string, number>();
  const importedMarkers = new Set<string>();

  for (let rowNumber = 3; rowNumber <= params.rows.length; rowNumber++) {
    const row = params.rows[rowNumber - 1] ?? [];
    const name = cleanText(row[COL(params.nameCol)]);

    if (shouldIgnoreName(name)) continue;

    const payments = extractPayments(row, params.paymentPairs);
    const totalFromFile =
      params.totalCol !== undefined ? parseNumber(row[COL(params.totalCol)]) : null;
    const saldoFromFile =
      params.saldoCol !== undefined ? parseNumber(row[COL(params.saldoCol)]) : null;

    if (payments.length === 0 && totalFromFile === null && saldoFromFile === null) {
      result.rowsSkipped++;
      continue;
    }

    const student = await ensureStudent({
      name,
      number: params.phoneCol ? asPhone(row[COL(params.phoneCol)]) : undefined,
      groupId: group.id,
      defaultGender: params.defaultGender,
      sourceSheet: params.sheetName,
    });

    if (!student) {
      result.rowsSkipped++;
      continue;
    }

    result.studentsTouched++;
    if (student.action === 'created') result.studentsCreated++;
    if (student.action === 'updated') result.studentsUpdated++;

    for (const payment of payments) {
      const upsertResult = await upsertPaymentFromExcel({
        studentId: student.studentId,
        paymentDate: payment.date,
        amount: payment.amount,
        sheetName: params.sheetName,
        rowNumber,
        paymentIndex: payment.paymentIndex,
      });

      importedMarkers.add(upsertResult.marker);

      if (upsertResult.outcome === 'created') result.paymentsCreated++;
      if (upsertResult.outcome === 'updated') result.paymentsUpdated++;
      if (upsertResult.outcome === 'reused') result.paymentsReused++;
      if (upsertResult.outcome === 'unchanged') result.paymentsUnchanged++;
    }

    const targetBySaldo =
      totalFromFile !== null && saldoFromFile !== null ? totalFromFile + saldoFromFile : null;
    const expected = targetBySaldo ?? params.expectedFallback ?? null;

    if (expected !== null && expected > 0) {
      const current = expectedByStudent.get(student.studentId);
      expectedByStudent.set(student.studentId, current ? Math.max(current, expected) : expected);
    }
  }

  for (const [studentId, expectedAmount] of expectedByStudent) {
    const total = await prisma.moneyCollection.aggregate({
      where: { studentId },
      _sum: { amount: true },
    });

    const paid = Number(total._sum.amount ?? 0);
    await prisma.userServiceSocial.update({
      where: { id: studentId },
      data: { payGotoCampement: paid >= expectedAmount ? 'PAGO' : 'DEBE' },
    });
  }

  if (params.pruneMissing) {
    const prefix = `IMPORT_EXCEL|sheet=${params.sheetName}|`;
    const toKeep = Array.from(importedMarkers);

    const deleted =
      toKeep.length > 0
        ? await prisma.moneyCollection.deleteMany({
            where: {
              notes: {
                startsWith: prefix,
                notIn: toKeep,
              },
            },
          })
        : await prisma.moneyCollection.deleteMany({
            where: {
              notes: {
                startsWith: prefix,
              },
            },
          });

    result.paymentsPruned = deleted.count;
  }

  return result;
}

function printSheetSummary(label: string, result: SheetImportResult) {
  console.log(`\n[${label}] Hoja usada: ${result.sheetName}`);
  console.log(
    `  Estudiantes: tocados=${result.studentsTouched}, creados=${result.studentsCreated}, actualizados=${result.studentsUpdated}`,
  );
  console.log(
    `  Pagos: creados=${result.paymentsCreated}, actualizados=${result.paymentsUpdated}, reutilizados=${result.paymentsReused}, sin cambios=${result.paymentsUnchanged}, podados=${result.paymentsPruned}`,
  );
  console.log(`  Filas omitidas: ${result.rowsSkipped}`);
}

function requireSheet(sheet: ResolvedSheet, hint: string) {
  if (!sheet.foundName) {
    throw new Error(`No se encontró la hoja requerida: ${hint}`);
  }
}

async function main() {
  const filePath =
    getArg('file') || path.resolve(process.cwd(), '../FINANZAS EXPLORADORES DEL REY ACTUALIZADO.xlsx');
  const defaultGenderRaw = getArg('default-gender');

  const options: CliOptions = {
    filePath,
    defaultGender:
      defaultGenderRaw === 'MASCULINO' || defaultGenderRaw === 'FEMENINO'
        ? defaultGenderRaw
        : undefined,
    serviceExpected: parseNumber(getArg('service-expected')) ?? undefined,
    campServExpected: parseNumber(getArg('camp-serv-expected')) ?? undefined,
    campExplExpected: parseNumber(getArg('camp-expl-expected')) ?? undefined,
    pruneMissing: parseBooleanArg('prune-missing', false),
  };

  const workbook = XLSX.readFile(options.filePath, { cellDates: true, raw: true });

  const financeSheet = resolveSheet(
    workbook,
    ['FINANZAS EXPLORADORES DEL REYFC', 'FINANZAS EXPLORADORES DEL REY FC', 'FINANZAS EXPLORADORES DEL REY'],
    'FINANZAS EXPLORADORES DEL REYFC',
  );
  const serviceSheet = resolveSheet(
    workbook,
    ['SERVICIO SOCIAL ', 'SERVICIO SOCIAL'],
    'SERVICIO SOCIAL',
  );
  const campExplSheet = resolveSheet(
    workbook,
    ['CAMPAMENTO "RAICES" 2026 - EXPL', 'CAMPAMENTO RAICES 2026 - EXPL'],
    'CAMPAMENTO "RAICES" 2026 - EXPL',
  );
  const campServSheet = resolveSheet(
    workbook,
    ['CAMPAMENTO "RAICES" 2026 - SERV', 'CAMPAMENTO RAICES 2026 - SERV'],
    'CAMPAMENTO "RAICES" 2026 - SERV',
  );

  requireSheet(serviceSheet, serviceSheet.requestedName);
  requireSheet(campExplSheet, campExplSheet.requestedName);
  requireSheet(campServSheet, campServSheet.requestedName);

  let teachersCount = 0;
  if (financeSheet.foundName) {
    teachersCount = await importTeachersFromFinanceSheet(financeSheet.rows);
  } else {
    console.warn(`[WARN] No se encontró hoja de finanzas principal (${financeSheet.requestedName}).`);
  }

  const serviceResult = await importStudentSheet({
    rows: serviceSheet.rows,
    sheetName: serviceSheet.foundName!,
    groupName: 'SERVICIO SOCIAL',
    nameCol: 'A',
    phoneCol: 'D',
    paymentPairs: [
      ['G', 'J'],
      ['L', 'N'],
    ],
    totalCol: 'R',
    expectedFallback: options.serviceExpected,
    defaultGender: options.defaultGender,
    pruneMissing: options.pruneMissing,
  });

  const campExplResult = await importStudentSheet({
    rows: campExplSheet.rows,
    sheetName: campExplSheet.foundName!,
    groupName: 'CAMPAMENTO RAICES EXPLORADORES',
    nameCol: 'A',
    paymentPairs: [
      ['C', 'D'],
      ['E', 'F'],
      ['G', 'H'],
      ['I', 'J'],
    ],
    totalCol: 'K',
    saldoCol: 'Q',
    expectedFallback: options.campExplExpected,
    defaultGender: options.defaultGender,
    pruneMissing: options.pruneMissing,
  });

  const campServResult = await importStudentSheet({
    rows: campServSheet.rows,
    sheetName: campServSheet.foundName!,
    groupName: 'CAMPAMENTO RAICES SERVICIO SOCIAL',
    nameCol: 'A',
    phoneCol: 'C',
    paymentPairs: [
      ['H', 'I'],
      ['J', 'K'],
      ['L', 'M'],
      ['N', 'O'],
    ],
    totalCol: 'P',
    expectedFallback: options.campServExpected,
    defaultGender: options.defaultGender,
    pruneMissing: options.pruneMissing,
  });

  console.log('\n=== SINCRONIZACION FINANZAS COMPLETADA ===');
  console.log(`Archivo: ${options.filePath}`);
  console.log(`Prune missing: ${options.pruneMissing ? 'SI' : 'NO'}`);
  console.log(`Teachers procesados: ${teachersCount}`);

  printSheetSummary('SERVICIO SOCIAL', serviceResult);
  printSheetSummary('CAMPAMENTO EXPL', campExplResult);
  printSheetSummary('CAMPAMENTO SERV', campServResult);
}

main()
  .catch((error) => {
    console.error('\nERROR EN SINCRONIZACION:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
