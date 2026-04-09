import { Gender, PrismaClient } from '@prisma/client';
import * as path from 'node:path';
import * as XLSX from 'xlsx';

type SheetRow = (string | number | Date | null)[];

const prisma = new PrismaClient();

type CliOptions = {
  filePath: string;
  defaultGender?: Gender;
  serviceExpected?: number;
  campServExpected?: number;
  campExplExpected?: number;
};

const COL = (letter: string) => XLSX.utils.decode_col(letter);

function getArg(name: string): string | undefined {
  const prefix = `--${name}=`;
  const arg = process.argv.find((v) => v.startsWith(prefix));
  return arg ? arg.slice(prefix.length) : undefined;
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
    const d = new Date(value);
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

async function ensureGroup(name: string) {
  return prisma.studentGroup.upsert({
    where: { id: `AUTOGROUP-${normalizeKey(name).slice(0, 24)}` },
    update: { name },
    create: {
      id: `AUTOGROUP-${normalizeKey(name).slice(0, 24)}`,
      name,
    },
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
}) {
  const cleanName = cleanText(params.name);
  if (!cleanName || shouldIgnoreName(cleanName)) return null;

  if (params.number) {
    const byNumber = await prisma.userServiceSocial.findUnique({
      where: { number: params.number },
    });
    if (byNumber) {
      return prisma.userServiceSocial.update({
        where: { id: byNumber.id },
        data: {
          name: cleanName,
          groupId: byNumber.groupId ?? params.groupId,
        },
      });
    }
  }

  const byName = await prisma.userServiceSocial.findFirst({
    where: {
      name: { equals: cleanName, mode: 'insensitive' },
      groupId: params.groupId,
    },
  });
  if (byName) {
    return prisma.userServiceSocial.update({
      where: { id: byName.id },
      data: { number: byName.number ?? params.number },
    });
  }

  if (!params.defaultGender) {
    throw new Error(
      `No se pudo crear estudiante "${cleanName}" (${params.sourceSheet}) porque Gender es requerido. Usa --default-gender=MASCULINO|FEMENINO.`,
    );
  }

  return prisma.userServiceSocial.create({
    data: {
      name: cleanName,
      number: params.number,
      Gender: params.defaultGender,
      groupId: params.groupId,
    },
  });
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

async function createPaymentIfMissing(params: {
  studentId: string;
  paymentDate: Date;
  amount: number;
  sheetName: string;
  rowNumber: number;
  paymentIndex: number;
}) {
  const notes = `IMPORT_EXCEL|sheet=${params.sheetName}|row=${params.rowNumber}|p=${params.paymentIndex}`;
  const exists = await prisma.moneyCollection.findFirst({
    where: {
      studentId: params.studentId,
      date: params.paymentDate,
      amount: params.amount,
      notes,
    },
  });
  if (exists) return false;

  await prisma.moneyCollection.create({
    data: {
      studentId: params.studentId,
      date: params.paymentDate,
      amount: params.amount,
      notes,
    },
  });
  return true;
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
}) {
  const group = await ensureGroup(params.groupName);
  let studentsTouched = 0;
  let paymentsCreated = 0;
  let rowsSkipped = 0;
  const expectedByStudent = new Map<string, number>();

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
      rowsSkipped++;
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
      rowsSkipped++;
      continue;
    }

    studentsTouched++;

    for (const payment of payments) {
      const created = await createPaymentIfMissing({
        studentId: student.id,
        paymentDate: payment.date,
        amount: payment.amount,
        sheetName: params.sheetName,
        rowNumber,
        paymentIndex: payment.paymentIndex,
      });
      if (created) paymentsCreated++;
    }

    const targetBySaldo =
      totalFromFile !== null && saldoFromFile !== null ? totalFromFile + saldoFromFile : null;
    const expected = targetBySaldo ?? params.expectedFallback ?? null;
    if (expected !== null && expected > 0) {
      const current = expectedByStudent.get(student.id);
      expectedByStudent.set(student.id, current ? Math.max(current, expected) : expected);
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

  return { studentsTouched, paymentsCreated, rowsSkipped };
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
  };

  const workbook = XLSX.readFile(options.filePath, { cellDates: true, raw: true });
  const getRows = (name: string) =>
    (XLSX.utils.sheet_to_json(workbook.Sheets[name], {
      header: 1,
      raw: true,
      defval: null,
    }) as SheetRow[]) || [];

  const financeRows = getRows('FINANZAS EXPLORADORES DEL REYFC');
  const serviceRows = getRows('SERVICIO SOCIAL ');
  const campExplRows = getRows('CAMPAMENTO "RAICES" 2026 - EXPL');
  const campServRows = getRows('CAMPAMENTO "RAICES" 2026 - SERV');

  const teachersCount = await importTeachersFromFinanceSheet(financeRows);
  const serviceResult = await importStudentSheet({
    rows: serviceRows,
    sheetName: 'SERVICIO SOCIAL ',
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
  });

  const campExplResult = await importStudentSheet({
    rows: campExplRows,
    sheetName: 'CAMPAMENTO "RAICES" 2026 - EXPL',
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
  });

  const campServResult = await importStudentSheet({
    rows: campServRows,
    sheetName: 'CAMPAMENTO "RAICES" 2026 - SERV',
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
  });

  console.log('\n=== IMPORT FINANZAS COMPLETADO ===');
  console.log(`Archivo: ${options.filePath}`);
  console.log(`Teachers procesados: ${teachersCount}`);
  console.log('SERVICIO SOCIAL:', serviceResult);
  console.log('CAMPAMENTO EXPL:', campExplResult);
  console.log('CAMPAMENTO SERV:', campServResult);
}

main()
  .catch((error) => {
    console.error('\nERROR EN IMPORTACIÓN:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
