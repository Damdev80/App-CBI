import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import * as path from 'node:path';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

type MoneyCollectionWithStudent = Prisma.MoneyCollectionGetPayload<{
  include: {
    student: {
      include: {
        group: true;
        School: true;
      };
    };
  };
}>;

type InvoiceFileMeta = {
  fileName: string;
  fullPath: string;
  invoiceNumber: string;
};

@Injectable()
export class MoneyCollectionInvoiceService {
  private readonly outputDir = path.resolve(process.cwd(), 'generated', 'invoices');
  private readonly assetsDir = path.resolve(process.cwd(), 'assets', 'invoices');
  private readonly renderMode = (process.env.INVOICE_RENDER_MODE || 'vector').toLowerCase();
  private readonly rendererVersion = 'v2';
  private readonly city = process.env.INVOICE_CITY || 'Sincelejo';
  private readonly templatePath =
    process.env.INVOICE_TEMPLATE_PATH || path.resolve(this.assetsDir, 'factura-exploradores.png');
  private readonly signaturePath =
    process.env.ACCOUNTANT_SIGNATURE_PATH || path.resolve(this.assetsDir, 'firma-contadora.png');

  getInvoicePublicUrl(collectionId: string): string {
    return `/money-collections/${collectionId}/invoice`;
  }

  async ensureInvoice(params: {
    collection: MoneyCollectionWithStudent;
    issuerName?: string;
  }): Promise<InvoiceFileMeta> {
    const meta = this.buildMeta(params.collection.id, params.collection.date);
    if (existsSync(meta.fullPath)) {
      return meta;
    }
    return this.generateAndSaveInvoice(params);
  }

  async generateAndSaveInvoice(params: {
    collection: MoneyCollectionWithStudent;
    issuerName?: string;
  }): Promise<InvoiceFileMeta> {
    const meta = this.buildMeta(params.collection.id, params.collection.date);
    await mkdir(this.outputDir, { recursive: true });

    const pdfBytes = await this.buildInvoicePdf({
      collection: params.collection,
      invoiceNumber: meta.invoiceNumber,
      issuerName: params.issuerName,
    });

    await writeFile(meta.fullPath, pdfBytes);
    return meta;
  }

  private buildMeta(collectionId: string, paymentDate: Date): InvoiceFileMeta {
    const invoiceNumber = this.getInvoiceNumber(collectionId, paymentDate);
    const fileName = `factura-${this.rendererVersion}-${invoiceNumber}.pdf`;
    return {
      fileName,
      fullPath: path.join(this.outputDir, fileName),
      invoiceNumber,
    };
  }

  private getInvoiceNumber(collectionId: string, paymentDate: Date): string {
    const date = this.formatDateCompact(paymentDate);
    const shortId = collectionId.slice(0, 8).toUpperCase();
    return `EXR-${date}-${shortId}`;
  }

  private formatDateCompact(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  }

  private formatDateHuman(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value || 0);
  }

  private topToY(pageHeight: number, top: number, fontSize: number): number {
    return pageHeight - top - fontSize;
  }

  private trimAndTruncate(text: string, maxChars: number): string {
    const value = String(text || '').trim();
    if (value.length <= maxChars) return value;
    return `${value.slice(0, Math.max(0, maxChars - 3)).trim()}...`;
  }

  private async buildInvoicePdf(
    params: {
      collection: MoneyCollectionWithStudent;
      invoiceNumber: string;
      issuerName?: string;
    },
  ): Promise<Uint8Array> {
    if (this.renderMode === 'template') {
      return this.buildTemplateInvoicePdf(params.collection, params.invoiceNumber, params.issuerName);
    }

    return this.buildVectorInvoicePdf(params.collection, params.invoiceNumber, params.issuerName);
  }

  private async buildTemplateInvoicePdf(
    collection: MoneyCollectionWithStudent,
    invoiceNumber: string,
    issuerName?: string,
  ): Promise<Uint8Array> {
    if (!existsSync(this.templatePath)) {
      throw new InternalServerErrorException(
        `No existe la plantilla de factura en: ${this.templatePath}`,
      );
    }

    const templateBytes = await readFile(this.templatePath);
    const pdfDoc = await PDFDocument.create();

    const isPdfTemplate = this.templatePath.toLowerCase().endsWith('.pdf');
    let page;
    let width = 0;
    let height = 0;

    if (isPdfTemplate) {
      const templateDoc = await PDFDocument.load(templateBytes);
      const [copiedPage] = await pdfDoc.copyPages(templateDoc, [0]);
      page = pdfDoc.addPage(copiedPage);
      width = page.getWidth();
      height = page.getHeight();
    } else {
      let templateImage;
      try {
        templateImage = await pdfDoc.embedPng(templateBytes);
      } catch {
        templateImage = await pdfDoc.embedJpg(templateBytes);
      }

      const size = templateImage.scale(1);
      width = size.width;
      height = size.height;
      page = pdfDoc.addPage([width, height]);
      page.drawImage(templateImage, { x: 0, y: 0, width, height });
    }

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const ink = rgb(0.08, 0.16, 0.42);

    const draw = (
      text: string,
      x: number,
      top: number,
      size = 9,
      bold = false,
      color = ink,
    ) => {
      const content = String(text || '').trim();
      if (!content) return;
      page.drawText(content, {
        x,
        y: this.topToY(height, top, size),
        size,
        color,
        font: bold ? fontBold : font,
      });
    };

    const amount = Number(collection.amount || 0);
    const amountText = this.formatCurrency(amount);
    const payerName = collection.student?.name || 'Alumno';
    const phone = collection.student?.number || 'N/A';
    const group = collection.student?.group?.name || 'Exploradores del Rey';
    const note = this.trimAndTruncate(collection.notes || `Pago de cuota ${group}`, 78);
    const accountant =
      issuerName?.trim() ||
      collection.student?.School?.name?.trim() ||
      process.env.ACCOUNTANT_NAME ||
      'Contadora CBI';

    draw(invoiceNumber, 250, 36, 8, true);
    draw(this.formatDateHuman(collection.date), 164, 110, 8, true);
    draw('Sincelejo', 30, 132, 8);
    draw(accountant, 247, 132, 8, true);

    draw(payerName, 30, 89, 8, true);
    draw(phone, 286, 111, 8);

    draw('1', 20, 167, 8, true);
    draw(note, 74, 167, 8);
    draw(amountText, 262, 167, 8, true);
    draw(amountText, 317, 167, 8, true);

    draw(amountText, 317, 563, 10, true);
    draw(amountText, 317, 597, 12, true);

    if (existsSync(this.signaturePath)) {
      const signBytes = await readFile(this.signaturePath);
      let signImage;
      try {
        signImage = await pdfDoc.embedPng(signBytes);
      } catch {
        signImage = await pdfDoc.embedJpg(signBytes);
      }
      page.drawImage(signImage, {
        x: 236,
        y: 40,
        width: 120,
        height: 36,
      });
    }

    page.drawLine({
      start: { x: 228, y: 38 },
      end: { x: 366, y: 38 },
      thickness: 1,
      color: ink,
    });
    draw(accountant, 245, 557, 7, true);
    draw('Firma contadora', 258, 582, 7);

    return pdfDoc.save();
  }

  private async buildVectorInvoicePdf(
    collection: MoneyCollectionWithStudent,
    invoiceNumber: string,
    issuerName?: string,
  ): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.create();
    const pageWidth = 595.28;
    const pageHeight = 841.89;
    const page = pdfDoc.addPage([pageWidth, pageHeight]);

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const ink = rgb(0.12, 0.16, 0.25);
    const muted = rgb(0.38, 0.43, 0.51);
    const primary = rgb(0.06, 0.22, 0.51);
    const soft = rgb(0.95, 0.97, 1);
    const line = rgb(0.85, 0.88, 0.94);

    const drawTop = (
      text: string,
      x: number,
      top: number,
      size = 10,
      bold = false,
      color = ink,
    ) => {
      const content = String(text || '').trim();
      if (!content) return;
      page.drawText(content, {
        x,
        y: this.topToY(pageHeight, top, size),
        size,
        color,
        font: bold ? fontBold : font,
      });
    };

    const amount = Number(collection.amount || 0);
    const amountText = this.formatCurrency(amount);
    const payerName = collection.student?.name || 'Alumno';
    const phone = collection.student?.number || 'N/A';
    const group = collection.student?.group?.name || 'Exploradores del Rey';
    const note = this.trimAndTruncate(collection.notes || `Pago de cuota ${group}`, 72);
    const accountant =
      issuerName?.trim() ||
      collection.student?.School?.name?.trim() ||
      process.env.ACCOUNTANT_NAME ||
      'Contadora CBI';

    page.drawRectangle({
      x: 0,
      y: pageHeight - 96,
      width: pageWidth,
      height: 96,
      color: primary,
    });

    drawTop('EXPLORADORES DEL REY', 36, 28, 20, true, rgb(1, 1, 1));
    drawTop('Comprobante de pago', 37, 56, 10, false, rgb(0.88, 0.93, 1));
    drawTop(`Factura: ${invoiceNumber}`, pageWidth - 230, 30, 12, true, rgb(1, 1, 1));
    drawTop(
      `Fecha: ${this.formatDateHuman(collection.date)}`,
      pageWidth - 230,
      54,
      10,
      false,
      rgb(0.88, 0.93, 1),
    );

    const cardX = 35;
    const cardTop = 118;
    const cardW = pageWidth - 70;
    const cardH = 128;
    page.drawRectangle({
      x: cardX,
      y: pageHeight - cardTop - cardH,
      width: cardW,
      height: cardH,
      borderColor: line,
      borderWidth: 1,
      color: rgb(1, 1, 1),
    });

    drawTop('Recibimos de', cardX + 14, cardTop + 18, 9, false, muted);
    drawTop(this.trimAndTruncate(payerName, 36), cardX + 14, cardTop + 36, 12, true);
    drawTop('Telefono', cardX + 14, cardTop + 60, 9, false, muted);
    drawTop(phone, cardX + 14, cardTop + 76, 10);
    drawTop('Grupo', cardX + 14, cardTop + 98, 9, false, muted);
    drawTop(this.trimAndTruncate(group, 38), cardX + 14, cardTop + 114, 10, true);

    drawTop('Ciudad', cardX + 320, cardTop + 18, 9, false, muted);
    drawTop(this.city, cardX + 320, cardTop + 36, 10, true);
    drawTop('Contadora', cardX + 320, cardTop + 60, 9, false, muted);
    drawTop(this.trimAndTruncate(accountant, 30), cardX + 320, cardTop + 76, 10, true);

    const tableX = 35;
    const tableTop = 278;
    const tableW = pageWidth - 70;
    const headerH = 24;
    const rowH = 46;
    const itemW = 42;
    const conceptW = tableW - 220;
    const amountW = 89;

    const tableBottomY = pageHeight - tableTop - (headerH + rowH);
    page.drawRectangle({
      x: tableX,
      y: tableBottomY,
      width: tableW,
      height: headerH + rowH,
      borderColor: line,
      borderWidth: 1,
      color: rgb(1, 1, 1),
    });

    page.drawRectangle({
      x: tableX,
      y: tableBottomY + rowH,
      width: tableW,
      height: headerH,
      color: soft,
    });

    const x1 = tableX + itemW;
    const x2 = x1 + conceptW;
    const x3 = x2 + amountW;

    page.drawLine({ start: { x: x1, y: tableBottomY }, end: { x: x1, y: tableBottomY + headerH + rowH }, thickness: 1, color: line });
    page.drawLine({ start: { x: x2, y: tableBottomY }, end: { x: x2, y: tableBottomY + headerH + rowH }, thickness: 1, color: line });
    page.drawLine({ start: { x: x3, y: tableBottomY }, end: { x: x3, y: tableBottomY + headerH + rowH }, thickness: 1, color: line });
    page.drawLine({ start: { x: tableX, y: tableBottomY + rowH }, end: { x: tableX + tableW, y: tableBottomY + rowH }, thickness: 1, color: line });

    drawTop('#', tableX + 15, tableTop + 7, 9, true, muted);
    drawTop('Concepto', x1 + 8, tableTop + 7, 9, true, muted);
    drawTop('Valor', x2 + 8, tableTop + 7, 9, true, muted);
    drawTop('Total', x3 + 8, tableTop + 7, 9, true, muted);

    drawTop('1', tableX + 15, tableTop + headerH + 16, 10, true);
    drawTop(note, x1 + 8, tableTop + headerH + 16, 10);
    drawTop(`$ ${amountText}`, x2 + 8, tableTop + headerH + 16, 10, true);
    drawTop(`$ ${amountText}`, x3 + 8, tableTop + headerH + 16, 10, true);

    const totalsTop = 376;
    const totalsX = pageWidth - 220;
    const totalsW = 185;
    const totalsH = 76;
    page.drawRectangle({
      x: totalsX,
      y: pageHeight - totalsTop - totalsH,
      width: totalsW,
      height: totalsH,
      borderColor: line,
      borderWidth: 1,
      color: soft,
    });

    drawTop('Total recibido', totalsX + 12, totalsTop + 16, 10, false, muted);
    drawTop(`$ ${amountText} COP`, totalsX + 12, totalsTop + 40, 17, true, primary);
    drawTop(`Valor reportado: ${amountText} pesos`, tableX, totalsTop + 24, 10, true, ink);
    drawTop('Comprobante valido para control interno de recaudo.', tableX, totalsTop + 44, 9, false, muted);

    const signatureLineY = pageHeight - 720;
    page.drawLine({
      start: { x: pageWidth - 230, y: signatureLineY },
      end: { x: pageWidth - 60, y: signatureLineY },
      thickness: 1,
      color: ink,
    });

    if (existsSync(this.signaturePath)) {
      const signBytes = await readFile(this.signaturePath);
      let signImage;
      try {
        signImage = await pdfDoc.embedPng(signBytes);
      } catch {
        signImage = await pdfDoc.embedJpg(signBytes);
      }
      page.drawImage(signImage, {
        x: pageWidth - 215,
        y: signatureLineY + 8,
        width: 130,
        height: 34,
      });
    }

    drawTop(this.trimAndTruncate(accountant, 34), pageWidth - 224, 725, 9, true);
    drawTop('Contadora', pageWidth - 224, 742, 8, false, muted);
    drawTop(`${this.city}, ${this.formatDateHuman(collection.date)}`, 35, 726, 9, false, muted);
    drawTop('Documento generado automaticamente por App CBI.', 35, 744, 8, false, muted);

    return pdfDoc.save();
  }
}
