'use client';

import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  formatPreciosCron,
  HOUR_OPTIONS,
  parsePreciosCron,
  WEEKDAY_OPTIONS,
  type CronWeekday,
  type PreciosCronSchedule,
} from '@/lib/settings/precios-cron';
import { cn } from '@/lib/utils';

type PreciosCronFieldProps = {
  value: string;
  onChange: (cronExpression: string) => void;
};

export function PreciosCronField({ value, onChange }: PreciosCronFieldProps) {
  const schedule = parsePreciosCron(value);

  const update = (next: PreciosCronSchedule) => {
    onChange(formatPreciosCron(next));
  };

  const toggleDay = (day: CronWeekday) => {
    const selected = new Set(schedule.days);
    if (selected.has(day)) {
      if (selected.size === 1) return;
      selected.delete(day);
    } else {
      selected.add(day);
    }
    update({
      hour: schedule.hour,
      days: [...selected].sort((a, b) => a - b),
    });
  };

  return (
    <div className="grid gap-3">
      <div className="grid gap-2">
        <Label>Días de actualización</Label>
        <div className="flex flex-wrap gap-2">
          {WEEKDAY_OPTIONS.map((day) => {
            const active = schedule.days.includes(day.value);
            return (
              <Button
                key={day.value}
                type="button"
                size="sm"
                variant={active ? 'default' : 'outline'}
                className={cn('min-w-12', active && 'pointer-events-auto')}
                aria-pressed={active}
                onClick={() => toggleDay(day.value)}
              >
                {day.label}
              </Button>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground">
          Elegí en qué días debería correr la actualización automática de precios.
        </p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="s-cron-hour">Hora (Argentina)</Label>
        <Select
          value={String(schedule.hour)}
          onValueChange={(hour) =>
            update({ ...schedule, hour: Number(hour) })
          }
        >
          <SelectTrigger id="s-cron-hour" className="w-full">
            <SelectValue placeholder="Elegí una hora" />
          </SelectTrigger>
          <SelectContent>
            {HOUR_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <p className="text-xs text-muted-foreground">
        Referencia de cuándo debería correr la actualización automática.
      </p>
    </div>
  );
}
