'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { eventsApi } from '@/lib/api';
import type { Event } from '@/types';
import { Plus, X, Calendar, Search } from 'lucide-react';
import { ScrollReveal } from '@/components/animated/scroll-reveal';
import { FadeContent } from '@/components/animated/fade-content';

type EventType = 'EVENTO' | 'ACTIVIDAD' | 'REUNION';
type EventTypeFilter = EventType | 'ALL';

const eventTypeOptions: Array<{ value: EventType; label: string }> = [
  { value: 'EVENTO', label: 'Evento' },
  { value: 'ACTIVIDAD', label: 'Actividad' },
  { value: 'REUNION', label: 'Reunión' },
];

function formatCop(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.max(0, Math.round(Number(amount) || 0)));
}

function isPast(dateStr: string): boolean {
  return new Date(dateStr) < new Date();
}

function daysLabel(dateStr: string): string {
  const diff = Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
  if (diff < 0) return 'Realizado';
  if (diff === 0) return 'Hoy';
  if (diff === 1) return 'Mañana';
  return `En ${diff}d`;
}

function getTypeBadgeClass(type: EventType): string {
  if (type === 'ACTIVIDAD') return 'bg-purple-100 text-purple-800';
  if (type === 'REUNION') return 'bg-green-100 text-green-800';
  return 'bg-blue-100 text-blue-800';
}

function getEventTypeLabel(type: EventType): string {
  if (type === 'ACTIVIDAD') return 'Actividad';
  if (type === 'REUNION') return 'Reunión';
  return 'Evento';
}

function getEventCostLabel(event: Event & { hasPrice?: boolean; priceTier?: number }): string {
  if (!event.hasPrice) return 'Gratis';
  return `$ ${formatCop(event.priceTier ?? 0)} COP`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function getDayMonth(dateStr: string): { day: string; month: string } {
  const d = new Date(dateStr);
  return {
    day: d.toLocaleDateString('es-CO', { day: '2-digit' }),
    month: d.toLocaleDateString('es-CO', { month: 'short' }),
  };
}

const MIN_PRICE = 1;
const MAX_PRICE = 1_000_000;

function normalizePrice(value: unknown): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return MIN_PRICE;
  return Math.min(MAX_PRICE, Math.max(MIN_PRICE, Math.round(parsed)));
}

export default function EventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<(Event & { hasPrice?: boolean; priceTier?: number })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<EventTypeFilter>('ALL');
  const [onlyWithPrice, setOnlyWithPrice] = useState(false);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formEventType, setFormEventType] = useState<EventType>('EVENTO');
  const [formHasPrice, setFormHasPrice] = useState(false);
  const [formPriceTier, setFormPriceTier] = useState(0);
  const [formEventDate, setFormEventDate] = useState('');

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setIsLoading(true);
    try {
      const data = await eventsApi.getAll();
      const normalized = ((data as unknown[]) || []).map((event: Record<string, unknown>) => ({
        ...event,
        eventType: (event.eventType as string) || 'EVENTO',
        hasPrice: Boolean(event.hasPrice),
        priceTier: Number.isFinite(Number(event.priceTier)) ? Number(event.priceTier) : 0,
      })) as (Event & { hasPrice?: boolean; priceTier?: number })[];
      setEvents(
        normalized.sort(
          (a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime()
        )
      );
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const eventCountByType = useMemo(() => {
    return {
      EVENTO: events.filter((e) => e.eventType === 'EVENTO').length,
      ACTIVIDAD: events.filter((e) => e.eventType === 'ACTIVIDAD').length,
      REUNION: events.filter((e) => e.eventType === 'REUNION').length,
    };
  }, [events]);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      if (selectedTypeFilter !== 'ALL' && event.eventType !== selectedTypeFilter) return false;
      if (onlyWithPrice && !event.hasPrice) return false;
      return true;
    });
  }, [events, selectedTypeFilter, onlyWithPrice]);

  const priceSummary = useMemo(() => {
    const paid = events.filter((e) => e.hasPrice).length;
    return { paid, free: events.length - paid };
  }, [events]);

  const openModal = () => {
    setFormTitle('');
    setFormDescription('');
    setFormEventType('EVENTO');
    setFormHasPrice(false);
    setFormPriceTier(0);
    setFormEventDate('');
    setErrorMsg('');
    setSuccessMsg('');
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  const handlePriceSlider = (value: number) => {
    setFormPriceTier(normalizePrice(value));
  };

  const handlePriceInputBlur = () => {
    if (formHasPrice) {
      setFormPriceTier(normalizePrice(formPriceTier));
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setErrorMsg('El título es requerido');
      return;
    }
    if (!formEventDate) {
      setErrorMsg('La fecha es requerida');
      return;
    }

    setSaving(true);
    setErrorMsg('');

    try {
      await eventsApi.create({
        title: formTitle.trim(),
        description: formDescription?.trim() || undefined,
        eventType: formEventType,
        hasPrice: formHasPrice,
        priceTier: formHasPrice ? normalizePrice(formPriceTier) : 0,
        eventDate: formEventDate,
      });
      setSuccessMsg('Evento creado correctamente.');
      await loadEvents();
      setTimeout(() => closeModal(), 1200);
    } catch (err) {
      setErrorMsg((err as Error)?.message || 'Error al crear el evento.');
    } finally {
      setSaving(false);
    }
  };

  const goToRegistrations = (eventId: string) => {
    router.push(`/dashboard/event-registrations-list?eventId=${eventId}`);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <FadeContent>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 pb-5 border-b">
          <div>
            <p className="text-xs tracking-widest uppercase text-muted-foreground font-medium mb-1">
              Gestión especializada
            </p>
            <h1 className="text-3xl font-semibold tracking-tight">Eventos</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Administra eventos, actividades y reuniones con precio libre entre 1 y 1.000.000 COP.
            </p>
          </div>

          <div className="border rounded-lg p-3 min-w-[230px]">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Resumen de costos</p>
            <p className="text-sm">
              Con costo: <strong>{priceSummary.paid}</strong>
            </p>
            <p className="text-sm">
              Gratis: <strong>{priceSummary.free}</strong>
            </p>
          </div>

          <Button onClick={openModal} className="shrink-0">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo ítem
          </Button>
        </div>
      </FadeContent>

      {/* Filters */}
      <ScrollReveal delay={0.1}>
        <div className="border rounded-lg p-3 mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {[
                { filter: 'ALL' as const, label: 'Todos', count: events.length },
                { filter: 'EVENTO' as const, label: 'Eventos', count: eventCountByType.EVENTO },
                { filter: 'ACTIVIDAD' as const, label: 'Actividades', count: eventCountByType.ACTIVIDAD },
                { filter: 'REUNION' as const, label: 'Reuniones', count: eventCountByType.REUNION },
              ].map((item) => (
                <button
                  key={item.filter}
                  onClick={() => setSelectedTypeFilter(item.filter)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    selectedTypeFilter === item.filter
                      ? 'bg-primary text-primary-foreground'
                      : 'border hover:bg-muted'
                  }`}
                >
                  {item.label} ({item.count})
                </button>
              ))}
            </div>

            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border"
                checked={onlyWithPrice}
                onChange={(e) => setOnlyWithPrice(e.target.checked)}
              />
              Solo con costo
            </label>
          </div>
        </div>
      </ScrollReveal>

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && events.length === 0 && (
        <ScrollReveal delay={0.2}>
          <div className="text-center py-16 border rounded-lg">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-35" />
            <p className="text-lg font-medium text-muted-foreground mb-1">Sin eventos registrados</p>
            <p className="text-sm text-muted-foreground mb-4">Crea el primer evento de la comunidad.</p>
            <Button onClick={openModal}>Crear primer evento</Button>
          </div>
        </ScrollReveal>
      )}

      {/* No results for filter */}
      {!isLoading && events.length > 0 && filteredEvents.length === 0 && (
        <ScrollReveal delay={0.2}>
          <div className="text-center py-12 border border-dashed rounded-lg">
            <p className="text-lg font-medium text-muted-foreground mb-1">No hay resultados para este filtro</p>
            <p className="text-sm text-muted-foreground">Prueba otro tipo o desactiva &quot;Solo con costo&quot;.</p>
          </div>
        </ScrollReveal>
      )}

      {/* Table */}
      {!isLoading && filteredEvents.length > 0 && (
        <ScrollReveal delay={0.2}>
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <Table className="min-w-[700px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px] text-center">Fecha</TableHead>
                    <TableHead>Evento</TableHead>
                    <TableHead className="w-[120px] text-center">Tipo</TableHead>
                    <TableHead className="w-[180px]">Costo</TableHead>
                    <TableHead className="w-[100px] text-center">Estado</TableHead>
                    <TableHead className="w-[110px] text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEvents.map((event) => {
                    const { day, month } = getDayMonth(event.eventDate);
                    return (
                      <TableRow key={event.id}>
                        {/* Date block */}
                        <TableCell className="text-center">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex flex-col items-center justify-center mx-auto">
                            <span className="text-sm font-bold text-primary leading-none">{day}</span>
                            <span className="text-[10px] text-primary uppercase tracking-wide">{month}</span>
                          </div>
                        </TableCell>

                        {/* Title + description */}
                        <TableCell>
                          <p className="font-medium truncate">{event.title}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(event.eventDate)}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {event.description || 'Sin descripción'}
                          </p>
                        </TableCell>

                        {/* Type badge */}
                        <TableCell className="text-center">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getTypeBadgeClass(event.eventType as EventType)}`}>
                            {getEventTypeLabel(event.eventType as EventType)}
                          </span>
                        </TableCell>

                        {/* Cost */}
                        <TableCell>
                          <p className="text-sm">{getEventCostLabel(event)}</p>
                        </TableCell>

                        {/* Status */}
                        <TableCell className="text-center">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              isPast(event.eventDate)
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {daysLabel(event.eventDate)}
                          </span>
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => goToRegistrations(event.id)}
                          >
                            Participantes
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </Card>
          <p className="text-xs text-muted-foreground mt-3 text-right">
            Mostrando {filteredEvents.length} de {events.length}
          </p>
        </ScrollReveal>
      )}

      {/* ═══════════════════════════════════════
           MODAL — Crear evento
           ═══════════════════════════════════════ */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={closeModal}
          />

          <div className="relative w-full max-w-xl bg-background rounded-xl border shadow-2xl my-auto">
            {/* Modal header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-semibold">Nuevo evento</h2>
              <button onClick={closeModal} className="p-1 rounded-md hover:bg-muted">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal body */}
            <div className="p-5">
              {errorMsg && (
                <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-lg p-3 mb-4 text-sm">
                  {errorMsg}
                </div>
              )}
              {successMsg && (
                <div className="bg-green-50 text-green-800 border border-green-200 rounded-lg p-3 mb-4 text-sm">
                  {successMsg}
                </div>
              )}

              <form onSubmit={onSubmit} className="flex flex-col gap-4">
                {/* Title */}
                <div>
                  <Label htmlFor="m-title">
                    Título <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="m-title"
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="ej. Retiro de Jóvenes 2025"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="m-desc">
                    Descripción <span className="text-muted-foreground font-normal">(opcional)</span>
                  </Label>
                  <textarea
                    id="m-desc"
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Detalles del evento, lugar…"
                  />
                </div>

                {/* Type */}
                <div>
                  <Label htmlFor="m-type">
                    Tipo <span className="text-destructive">*</span>
                  </Label>
                  <select
                    id="m-type"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={formEventType}
                    onChange={(e) => setFormEventType(e.target.value as EventType)}
                  >
                    {eventTypeOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price */}
                <div className="border rounded-lg p-3 bg-muted/30">
                  <label className="flex items-center gap-2 text-sm mb-3">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border"
                      checked={formHasPrice}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setFormHasPrice(checked);
                        if (!checked) setFormPriceTier(0);
                        else setFormPriceTier(normalizePrice(formPriceTier || 1));
                      }}
                    />
                    Este ítem tiene costo
                  </label>

                  {formHasPrice ? (
                    <>
                      <Label htmlFor="m-price-slider">Precio libre (COP)</Label>
                      <input
                        id="m-price-slider"
                        type="range"
                        min={MIN_PRICE}
                        max={MAX_PRICE}
                        step={1000}
                        value={formPriceTier}
                        onChange={(e) => handlePriceSlider(Number(e.target.value))}
                        className="w-full accent-primary"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>Mínimo: $ 1</span>
                        <span>Máximo: $ 1.000.000</span>
                      </div>

                      <div className="mt-3">
                        <Label htmlFor="m-price-input">Valor exacto</Label>
                        <Input
                          id="m-price-input"
                          type="number"
                          min={MIN_PRICE}
                          max={MAX_PRICE}
                          step={1}
                          value={formPriceTier}
                          onChange={(e) => setFormPriceTier(Number(e.target.value))}
                          onBlur={handlePriceInputBlur}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Seleccionado: <strong>$ {formatCop(formPriceTier)} COP</strong>
                        </p>
                      </div>
                    </>
                  ) : (
                    <p className="text-xs text-muted-foreground">Se publicará como ítem gratuito.</p>
                  )}
                </div>

                {/* Date */}
                <div>
                  <Label htmlFor="m-date">
                    Fecha y hora <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="m-date"
                    type="datetime-local"
                    value={formEventDate}
                    onChange={(e) => setFormEventDate(e.target.value)}
                    required
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 justify-end mt-2">
                  <Button type="button" variant="outline" onClick={closeModal}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving && <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent mr-2" />}
                    Crear ítem
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
