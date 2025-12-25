'use client';

import { Plus, Trash2, MoreHorizontal, Eye, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { TableSchema, getPrimaryField } from '@/lib/schema';
import { IRecord } from '@/lib/client';
import { getBadgeColor } from '@/lib/colors';
import { cn } from '@/lib/utils';
import { useI18n } from '../I18nProvider';

interface GalleryViewProps {
  schema: TableSchema;
  records: IRecord[];
  onCreateRecord: (fieldValues: Record<string, any>) => Promise<IRecord> | IRecord;
  onUpdateRecord: (recordId: string, fieldValues: Record<string, any>) => Promise<void> | void;
  onDeleteRecord: (recordId: string) => Promise<void> | void;
  onOpenModal: (mode: 'add' | 'edit' | 'view', record?: IRecord, initialValues?: Record<string, any>) => void;
}

export function GalleryView({ schema, records, onDeleteRecord, onOpenModal }: GalleryViewProps) {
  const { t } = useI18n();
  const primaryField = getPrimaryField(schema);
  const displayFields = schema.fields.filter(f => f.id !== primaryField?.id).slice(0, 3);

  return (
    <div className="h-full overflow-auto p-6 bg-muted/30">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {records.map((record) => {
          const title = primaryField ? record.fields[primaryField.id] : t('untitled');

          return (
            <Card
              key={record.id}
              className="group hover:shadow-md transition-all cursor-pointer overflow-hidden text-start"
              onClick={() => onOpenModal('view', record)}
            >
              {/* Cover */}
              <div className="aspect-[16/10] bg-muted flex items-center justify-center relative">
                <span className="text-4xl font-semibold text-muted-foreground/20 select-none">
                  {(String(title || t('untitled')).charAt(0)).toUpperCase()}
                </span>

                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="secondary" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
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
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => onDeleteRecord(record.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {t('delete')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Content */}
              <CardContent className="p-4">
                <h3 className="font-medium text-sm truncate mb-2">{title || t('untitled')}</h3>

                <div className="space-y-1.5">
                  {displayFields.map(field => {
                    const value = record.fields[field.id];
                    if (value === undefined || value === null || value === '' || value === false) return null;

                    let displayValue = value;

                    // Handle select fields with colors
                    if (field.type === 'select') {
                      const option = field.options?.find(o => o.name === value);
                      return (
                        <div key={field.id} className="flex items-baseline gap-2 text-xs">
                          <span className="text-muted-foreground flex-shrink-0">
                            {field.name}:
                          </span>
                          <div
                            className={cn(
                              "text-xs px-2 py-0.5 rounded-md inline-flex items-center gap-1",
                              getBadgeColor(option?.color)
                            )}
                          >
                            {value}
                          </div>
                        </div>
                      );
                    }

                    // Handle other field types
                    if (Array.isArray(value)) displayValue = value.join(', ');
                    else if (typeof value === 'boolean') displayValue = value ? t('yes') : t('no');
                    else if (field.type === 'date') displayValue = new Date(value).toLocaleDateString();

                    return (
                      <div key={field.id} className="flex items-baseline gap-2 text-xs">
                        <span className="text-muted-foreground flex-shrink-0">
                          {field.name}:
                        </span>
                        <span className="text-foreground truncate">
                          {String(displayValue)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {/* Add Card */}
        <div
          className="flex flex-col items-center justify-center cursor-pointer border-2 border-dashed border-muted-foreground/20 rounded-lg transition-all hover:border-primary hover:bg-muted/50 min-h-[200px]"
          onClick={() => onOpenModal('add')}
        >
          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mb-3">
            <Plus className="h-5 w-5 text-muted-foreground" />
          </div>
          <span className="text-sm font-medium text-muted-foreground">{t('addRecord')}</span>
        </div>
      </div>
    </div>
  );
}
