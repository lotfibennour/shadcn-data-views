'use client';

import { useState, useMemo } from 'react';
import {
  Plus,
  MoreHorizontal,
  Trash2,
  Eye,
  Pencil,
  ChevronDown,
  Calendar,
  AlignLeft,
  CheckSquare,
  Hash,
  Tag,
  Tags,
  User as UserIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { TableSchema, getSelectField, getPrimaryField } from '@/lib/schema';
import { IRecord } from '@/lib/client';
import { cn } from '@/lib/utils';
import { getBadgeColor, getDotColor } from '@/lib/colors';
import { useI18n } from '../I18nProvider';

interface KanbanViewProps {
  schema: TableSchema;
  records: IRecord[];
  onCreateRecord: (fieldValues: Record<string, any>) => Promise<IRecord> | IRecord;
  onUpdateRecord: (recordId: string, fieldValues: Record<string, any>) => Promise<void> | void;
  onDeleteRecord: (recordId: string) => Promise<void> | void;
  onOpenModal: (mode: 'add' | 'edit' | 'view', record?: IRecord, initialValues?: Record<string, any>) => void;
}

const FIELD_ICON_MAP: Record<string, any> = {
  text: AlignLeft,
  number: Hash,
  select: Tag,
  multiSelect: Tags,
  date: Calendar,
  checkbox: CheckSquare,
  user: UserIcon,
};

export function KanbanView({ schema, records, onUpdateRecord, onDeleteRecord, onOpenModal }: KanbanViewProps) {
  const [draggedRecord, setDraggedRecord] = useState<string | null>(null);
  const { t } = useI18n();

  const selectField = getSelectField(schema);
  const primaryField = getPrimaryField(schema);

  const columns = useMemo(() => {
    if (!selectField) return [];

    const groups: Record<string, IRecord[]> = {
      'uncategorized': []
    };

    selectField.options?.forEach(opt => {
      groups[opt.name] = [];
    });

    records.forEach(record => {
      const value = record.fields[selectField.id];
      if (value && groups[value]) {
        groups[value].push(record);
      } else {
        groups['uncategorized'].push(record);
      }
    });

    return [
      ... (selectField.options?.map(opt => ({
        id: opt.name,
        name: opt.name,
        color: opt.color,
        records: groups[opt.name] || []
      })) || []),
      {
        id: 'uncategorized',
        name: t('uncategorized'),
        color: 'gray',
        records: groups['uncategorized']
      }
    ];
  }, [selectField, records, t]);

  // recordsByColumn is now redundant as records are grouped within columns
  // However, to maintain the existing rendering logic without further changes,
  // we can adapt recordsByColumn to use the new columns structure.
  const recordsByColumn = useMemo(() => {
    const grouped: Record<string, IRecord[]> = {};
    columns.forEach(col => {
      grouped[col.id] = col.records;
    });
    return grouped;
  }, [columns]);


  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (columnId: string) => {
    if (!draggedRecord || !selectField) return;
    const column = columns.find(c => c.id === columnId);
    const value = columnId === '__empty__' ? '' : column?.name || '';
    onUpdateRecord(draggedRecord, { [selectField.id]: value });
    setDraggedRecord(null);
  };

  if (!selectField) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        No select field found in schema. Add a select field to enable Kanban view.
      </div>
    );
  }

  return (
    <div className="w-full grow overflow-hidden bg-background">
      <div className="relative w-full h-full overflow-x-auto overflow-y-hidden p-2">
        <div className="flex h-full">
          {columns.map((column) => (
            <div key={column.id} className="h-full pr-4">
              <div className="w-[264px] h-full border bg-muted rounded-md shrink-0 flex flex-col overflow-hidden">
                {/* Column Header */}
                <div className="w-full">
                  <div className="flex h-12 w-full shrink-0 items-center justify-between border-b bg-card px-4">
                    <div className="flex items-center space-x-2 overflow-hidden text-muted-foreground">
                      <div className={cn("w-2 h-2 rounded-full shrink-0", getDotColor(column.color))} />
                      <span className="text-sm font-semibold truncate">
                        {column.name}
                      </span>
                      <span className="rounded-xl border px-2 text-xs">
                        {recordsByColumn[column.id]?.length || 0}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Cards Container */}
                <div
                  className="flex-1 w-full overflow-y-auto min-h-0"
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(column.id)}
                >
                  <div className="flex flex-col pt-3 pb-3">
                    {recordsByColumn[column.id]?.map((record) => (
                      <div key={record.id} className="w-full px-3 mb-2">
                        <div
                          draggable
                          onDragStart={() => setDraggedRecord(record.id)}
                          className={cn(
                            "relative flex w-full grow flex-col space-y-2 gap-1 overflow-hidden rounded-md border border-border bg-card hover:border-primary/15 p-3 cursor-pointer transition-all group",
                            draggedRecord === record.id && "opacity-50 ring-2 ring-primary"
                          )}
                        >
                          {/* Record Title with Menu */}
                          <div className="flex items-start justify-between gap-2">
                            <div
                              className="text-base font-semibold flex-1 min-w-0"
                              onClick={() => onOpenModal('view', record)}
                            >
                              {primaryField ? record.fields[primaryField.id] || t('untitled') : t('untitled')}
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                <DropdownMenuItem onClick={(e) => {
                                  e.stopPropagation();
                                  onOpenModal('view', record);
                                }}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  {t('view')}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => {
                                  e.stopPropagation();
                                  onOpenModal('edit', record);
                                }}>
                                  <Pencil className="h-4 w-4 mr-2" />
                                  {t('edit')}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteRecord(record.id);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  {t('delete')}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          {/* Record Fields */}
                          {schema.fields
                            .filter(f => !f.isPrimary && f.id !== selectField.id)
                            .map(field => {
                              const value = record.fields[field.id];
                              if (value === undefined || value === null || value === '' || value === false) return null;

                              const Icon = FIELD_ICON_MAP[field.type] || AlignLeft;

                              return (
                                <div key={field.id}>
                                  <div className="mb-1 flex items-center space-x-1 text-muted-foreground">
                                    <Icon className="w-4 h-4 text-sm" />
                                    <span className="text-xs">{field.name}</span>
                                  </div>
                                  <div className="w-full text-[13px] leading-5 breaking-all line-clamp-6">
                                    {field.type === 'select' ? (
                                      <div className="flex gap-1 flex-wrap">
                                        {(() => {
                                          const option = field.options?.find(o => o.name === value);
                                          return (
                                            <div
                                              className={cn(
                                                "text-xs px-2 h-5 rounded-md flex items-center gap-1 min-w-0 truncate",
                                                getBadgeColor(option?.color)
                                              )}
                                              title={String(value)}
                                            >
                                              <span className="min-w-0 truncate">{String(value)}</span>
                                            </div>
                                          );
                                        })()}
                                      </div>
                                    ) : field.type === 'checkbox' ? (
                                      <div className="flex gap-1 flex-wrap">
                                        <div className={cn(
                                          "flex items-center justify-center w-5 h-5 rounded-sm border border-primary shadow bg-primary text-primary-foreground"
                                        )}>
                                          <CheckSquare className="h-4 w-4" />
                                        </div>
                                      </div>
                                    ) : (
                                      <span title={String(value)} className="whitespace-pre-wrap break-all">
                                        {String(value)}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Add Card Button */}
                <div className="flex items-center justify-center rounded-b-md bg-slate-50 px-3 py-2 dark:bg-muted">
                  <Button
                    variant="outline"
                    className="w-full h-9 gap-2 bg-background dark:bg-white/5 dark:hover:bg-white/10 shadow-none hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    onClick={() => onOpenModal('add')}
                  >
                    <Plus className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
