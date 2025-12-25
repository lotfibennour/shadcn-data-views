'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { TableSchema, FieldSchema } from '@/lib/schema';
import { cn } from '@/lib/utils';
import { getBadgeColor, getDotColor } from '@/lib/colors';
import { useI18n } from './I18nProvider';

interface RecordFormProps {
  schema: TableSchema;
  initialValues?: Record<string, any>;
  onSubmit?: (values: Record<string, any>) => void;
  mode: 'add' | 'edit' | 'view';
}

const DEFAULT_INITIAL_VALUES = {};

export function RecordForm({ schema, initialValues = DEFAULT_INITIAL_VALUES, onSubmit, mode }: RecordFormProps) {
  const { t } = useI18n();
  const [formData, setFormData] = useState<Record<string, any>>(initialValues);

  useEffect(() => {
    setFormData(initialValues);
  }, [initialValues]);

  const handleChange = (fieldId: string, value: any) => {
    if (mode === 'view') return;
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit && mode !== 'view') onSubmit(formData);
  };

  const isReadOnly = mode === 'view';

  const renderField = (field: FieldSchema) => {
    const value = formData[field.id] ?? '';

    if (field.id === 'description' || field.type === 'text' && field.name.toLowerCase().includes('description')) {
      return (
        <Textarea
          value={value}
          disabled={isReadOnly}
          onChange={(e) => handleChange(field.id, e.target.value)}
          placeholder={isReadOnly ? '' : `${t('enterDetails')}...`}
          className="min-h-[100px] resize-none"
        />
      );
    }

    switch (field.type) {
      case 'text':
        return (
          <Input
            value={value}
            disabled={isReadOnly}
            onChange={(e) => handleChange(field.id, e.target.value)}
            placeholder={isReadOnly ? '' : `${t('add')} ${field.name}...`}
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            value={value}
            disabled={isReadOnly}
            onChange={(e) => handleChange(field.id, e.target.value)}
            placeholder={isReadOnly ? '' : `${t('add')} ${field.name}...`}
          />
        );

      case 'date':
        return (
          <Input
            type="date"
            value={value}
            disabled={isReadOnly}
            onChange={(e) => handleChange(field.id, e.target.value)}
          />
        );

      case 'checkbox':
        return (
          <div className="flex items-center gap-2">
            <Checkbox
              id={field.id}
              checked={!!value}
              disabled={isReadOnly}
              onCheckedChange={(checked) => handleChange(field.id, checked)}
            />
            <Label htmlFor={field.id} className="cursor-pointer text-sm">
              {value ? t('yes') : t('no')}
            </Label>
          </div>
        );

      case 'select':
        if (isReadOnly) {
          if (!value) return <span className="text-muted-foreground text-sm">{t('none')}</span>;
          const option = field.options?.find(o => o.name === value);
          return (
            <div className={cn("inline-flex items-center gap-2 px-2 py-1 rounded-md text-sm mt-2", getBadgeColor(option?.color))}>
              <div className={cn("w-2 h-2 rounded-full", getDotColor(option?.color))} />
              {value}
            </div>
          );
        }
        return (
          <Select value={value} onValueChange={(v) => handleChange(field.id, v)}>
            <SelectTrigger>
              <SelectValue placeholder={t('selectValue')} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((opt) => (
                <SelectItem key={opt.id} value={opt.name}>
                  <div className="flex items-center gap-2">
                    <div className={cn('w-2 h-2 rounded-full', getDotColor(opt.color))} />
                    {opt.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'multiSelect':
        const selectedValues = Array.isArray(value) ? value : [];
        if (isReadOnly) {
          return (
            <div className="flex flex-wrap gap-1">
              {selectedValues.map((v: string) => (
                <Badge key={v} variant="secondary">
                  {v}
                </Badge>
              ))}
              {selectedValues.length === 0 && <span className="text-muted-foreground text-sm">{t('none')}</span>}
            </div>
          );
        }
        return (
          <div className="flex flex-wrap gap-2">
            {field.options?.map((opt) => (
              <Badge
                key={opt.id}
                variant={selectedValues.includes(opt.name) ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => {
                  const newValues = selectedValues.includes(opt.name)
                    ? selectedValues.filter((v: string) => v !== opt.name)
                    : [...selectedValues, opt.name];
                  handleChange(field.id, newValues);
                }}
              >
                {opt.name}
              </Badge>
            ))}
          </div>
        );

      default:
        return (
          <Input
            value={value}
            disabled={isReadOnly}
            onChange={(e) => handleChange(field.id, e.target.value)}
            placeholder={isReadOnly ? '' : `${t('add')} ${field.name}...`}
          />
        );
    }
  };

  return (
    <form id="record-form" onSubmit={handleSubmit} className="space-y-5">
      {schema.fields.map((field) => (
        <div key={field.id} className="space-y-3">
          <Label className="text-sm font-medium mb-2 block">
            {field.name}
            {field.isPrimary && (
              <Badge variant="outline" className="ml-2 text-xs">{t('primary')}</Badge>
            )}
          </Label>
          {renderField(field)}
        </div>
      ))}

      {mode !== 'view' && (
        <div className="flex justify-end pt-4 border-t">
          <Button type="submit">
            {mode === 'add' ? t('createRecord') : t('save')}
          </Button>
        </div>
      )}
    </form>
  );
}
