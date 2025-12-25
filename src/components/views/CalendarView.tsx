'use client';

import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Eye, Pencil, Trash2, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { TableSchema, getDateField, getPrimaryField } from '@/lib/schema';
import { IRecord } from '@/lib/client';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { getBadgeColor } from '@/lib/colors';
import { useI18n } from '../I18nProvider';

// Preset colors for random assignment
const CALENDAR_COLORS = [
  'blue', 'green', 'purple', 'orange', 'pink', 'cyan',
  'indigo', 'teal', 'rose', 'amber', 'emerald', 'violet'
];

// Function to get consistent color for a record ID
function getRecordColor(recordId: string): string {
  const hash = recordId.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  const index = Math.abs(hash) % CALENDAR_COLORS.length;
  return CALENDAR_COLORS[index];
}

interface CalendarViewProps {
  schema: TableSchema;
  records: IRecord[];
  onCreateRecord: (fieldValues: Record<string, any>) => Promise<IRecord> | IRecord;
  onUpdateRecord: (recordId: string, fieldValues: Record<string, any>) => Promise<void> | void;
  onDeleteRecord: (recordId: string) => Promise<void> | void;
  onOpenModal: (mode: 'add' | 'edit' | 'view', record?: IRecord, initialValues?: Record<string, any>) => void;
}

export function CalendarView({ schema, records, onUpdateRecord, onDeleteRecord, onOpenModal }: CalendarViewProps) {
  const { t, lang } = useI18n();
  const [currentDate, setCurrentDate] = useState(new Date());

  const dateField = getDateField(schema);
  const primaryField = getPrimaryField(schema);

  const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

  const calendarDays = useMemo(() => {
    const days: Date[] = [];
    const firstDayOfWeek = monthStart.getDay();

    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(monthStart);
      date.setDate(date.getDate() - i - 1);
      days.push(date);
    }

    for (let i = 1; i <= monthEnd.getDate(); i++) {
      days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
    }

    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const date = new Date(monthEnd);
      date.setDate(date.getDate() + i);
      days.push(date);
    }

    return days;
  }, [currentDate, monthStart, monthEnd]);

  const recordsByDate = useMemo(() => {
    const map: Record<string, IRecord[]> = {};
    if (!dateField) return map;

    records.forEach(record => {
      const dateValue = record.fields[dateField.id];
      if (dateValue) {
        const date = new Date(dateValue);
        const key = date.toISOString().split('T')[0];
        if (!map[key]) map[key] = [];
        map[key].push(record);
      }
    });

    return map;
  }, [records, dateField]);

  const isToday = (date: Date) => date.toDateString() === new Date().toDateString();
  const isCurrentMonth = (date: Date) => date.getMonth() === currentDate.getMonth();

  const handleDayClick = (date: Date) => {
    if (!dateField) return;
    onOpenModal('add', undefined, { [dateField.id]: date.toISOString().split('T')[0] });
  };

  const handleDrop = (recordId: string, newDate: Date) => {
    if (!dateField) return;
    onUpdateRecord(recordId, { [dateField.id]: newDate.toISOString().split('T')[0] });
  };

  const weekDays = t('weekDays').split(',');
  const monthNames = t('monthNames').split(',');

  if (!dateField) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        {t('noDateField')}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-6 bg-muted/30">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(new Date())}
          >
            {t('today')}
          </Button>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 border rounded-lg overflow-hidden bg-background flex flex-col shadow-sm">
        {/* Week days header */}
        <div className="grid grid-cols-7 bg-muted/50 border-b">
          {weekDays.map(day => (
            <div key={day} className="px-2 py-2 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar cells */}
        <div className="grid grid-cols-7 flex-1">
          {calendarDays.map((date, index) => {
            const dateKey = date.toISOString().split('T')[0];
            const dayRecords = recordsByDate[dateKey] || [];

            return (
              <div
                key={index}
                className={cn(
                  'min-h-[100px] p-1.5 border-b border-r transition-all group relative flex flex-col',
                  !isCurrentMonth(date) && 'bg-muted/20 text-muted-foreground/40',
                  isCurrentMonth(date) && 'hover:bg-muted/5',
                  index % 7 === 6 && 'border-r-0'
                )}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  const recordId = e.dataTransfer.getData('recordId');
                  if (recordId) handleDrop(recordId, date);
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={cn(
                    'text-xs w-6 h-6 flex items-center justify-center rounded-full transition-colors',
                    isToday(date) ? 'bg-primary text-primary-foreground font-semibold shadow-sm' : 'text-muted-foreground group-hover:text-foreground'
                  )}>
                    {date.getDate()}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDayClick(date)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>

                <div className="flex-1 space-y-0.5 overflow-y-auto">
                  {dayRecords.map(record => (
                    <div
                      key={record.id}
                      draggable
                      onDragStart={(e) => {
                        e.stopPropagation();
                        e.dataTransfer.setData('recordId', record.id);
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenModal('view', record);
                      }}
                      className="group/item relative"
                    >
                      <div
                        className={cn(
                          "w-full justify-start truncate text-[11px] py-0.5 px-2 rounded-md cursor-grab active:cursor-grabbing transition-all hover:scale-[1.02] shadow-sm",
                          getBadgeColor(getRecordColor(record.id))
                        )}
                      >
                        {primaryField ? record.fields[primaryField.id] || t('untitled') : t('untitled')}
                      </div>
                      <div className="absolute right-0 top-0 h-full flex items-center opacity-0 group-hover/item:opacity-100 bg-background/90 px-0.5 rounded-r border-l">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <MoreHorizontal className="h-3 w-3 text-muted-foreground cursor-pointer hover:text-foreground" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onOpenModal('view', record)}>
                              <Eye className="h-4 w-4 mr-2" />
                              {t('view')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onOpenModal('edit', record)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              {t('edit')}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => onDeleteRecord(record.id)}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              {t('delete')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
