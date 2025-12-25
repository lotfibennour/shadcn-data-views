'use client';

import { useState, useMemo } from 'react';
import { Plus, Trash2, Eye, Pencil, ArrowUpDown, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { TableSchema, FieldSchema } from '@/lib/schema';
import { IRecord } from '@/lib/client';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { getBadgeColor } from '@/lib/colors';
import { useI18n } from '../I18nProvider';

interface GridViewProps {
  schema: TableSchema;
  records: IRecord[];
  onCreateRecord: (fieldValues: Record<string, any>) => Promise<IRecord> | IRecord;
  onUpdateRecord: (recordId: string, fieldValues: Record<string, any>) => Promise<void> | void;
  onDeleteRecord: (recordId: string) => Promise<void> | void;
  onOpenModal: (mode: 'add' | 'edit' | 'view', record?: IRecord, initialValues?: Record<string, any>) => void;
}

export function GridView({ schema, records, onUpdateRecord, onDeleteRecord, onOpenModal }: GridViewProps) {
  const { t } = useI18n();
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filterField, setFilterField] = useState<string>('');
  const [filterValue, setFilterValue] = useState<string>('');
  const [filterOperator, setFilterOperator] = useState<string>('contains');

  // Get the selected filter field schema
  const selectedFilterField = useMemo(() => {
    return schema.fields.find(f => f.id === filterField);
  }, [filterField, schema.fields]);

  // Filter and sort records
  const processedRecords = useMemo(() => {
    let filtered = [...records];

    // Apply filter
    if (filterField && filterValue) {
      filtered = filtered.filter(record => {
        const value = record.fields[filterField];
        const field = schema.fields.find(f => f.id === filterField);

        if (!field) return false;

        // Handle different field types
        switch (field.type) {
          case 'text':
            if (value == null) return false;
            return String(value).toLowerCase().includes(filterValue.toLowerCase());

          case 'number':
            if (value == null) return false;
            const numValue = Number(value);
            const filterNum = Number(filterValue);
            switch (filterOperator) {
              case 'equals': return numValue === filterNum;
              case 'greater': return numValue > filterNum;
              case 'less': return numValue < filterNum;
              case 'greaterEqual': return numValue >= filterNum;
              case 'lessEqual': return numValue <= filterNum;
              default: return false;
            }

          case 'select':
          case 'multiSelect':
            if (value == null) return false;
            if (Array.isArray(value)) {
              return value.includes(filterValue);
            }
            return value === filterValue;

          case 'checkbox':
            return filterValue === 'true' ? !!value : !value;

          case 'date':
            if (value == null) return false;
            const recordDate = new Date(value);
            const filterDate = new Date(filterValue);
            switch (filterOperator) {
              case 'before': return recordDate < filterDate;
              case 'after': return recordDate > filterDate;
              case 'equals': return recordDate.toDateString() === filterDate.toDateString();
              default: return false;
            }

          default:
            if (value == null) return false;
            return String(value).toLowerCase().includes(filterValue.toLowerCase());
        }
      });
    }

    // Apply sort
    if (sortField) {
      filtered.sort((a, b) => {
        const aVal = a.fields[sortField];
        const bVal = b.fields[sortField];

        if (aVal == null && bVal == null) return 0;
        if (aVal == null) return 1;
        if (bVal == null) return -1;

        let comparison = 0;
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          comparison = aVal - bVal;
        } else {
          comparison = String(aVal).localeCompare(String(bVal));
        }

        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    return filtered;
  }, [records, sortField, sortDirection, filterField, filterValue, filterOperator, schema.fields]);

  const renderCellValue = (record: IRecord, field: FieldSchema) => {
    const value = record.fields[field.id];

    switch (field.type) {
      case 'checkbox':
        return (
          <Checkbox
            checked={!!value}
            onCheckedChange={(checked) => onUpdateRecord(record.id, { [field.id]: checked })}
            onClick={(e) => e.stopPropagation()}
          />
        );
      case 'select':
        const option = field.options?.find(o => o.name === value);
        return value ? (
          <Badge variant="secondary" className={cn('font-normal', getBadgeColor(option?.color))}>
            {value}
          </Badge>
        ) : null;
      case 'multiSelect':
        const values = Array.isArray(value) ? value : [];
        return (
          <div className="flex flex-wrap gap-1">
            {values.map((v: string) => {
              const opt = field.options?.find(o => o.name === v);
              return (
                <Badge key={v} variant="secondary" className={cn('font-normal', getBadgeColor(opt?.color))}>
                  {v}
                </Badge>
              );
            })}
          </div>
        );
      case 'date':
        return value ? new Date(value).toLocaleDateString() : null;
      case 'number':
        return value != null ? Number(value).toLocaleString() : null;
      default:
        return value;
    }
  };

  return (
    <div className="w-full grow overflow-hidden sm:pl-2 relative group flex flex-col h-full">
      {/* Outer container style from user */}
      <div className="relative w-full h-full flex flex-col">
        {/* Filter and Sort Toolbar */}
        <div className="flex items-center gap-3 p-3 border-b bg-muted/30">
          {/* Add Record Button */}
          <Button onClick={() => onOpenModal('add')} className="h-9">
            <Plus className="h-4 w-4 mr-2" />
            {t('addRecord')}
          </Button>

          {/* Divider */}
          <div className="h-6 w-px bg-border" />

          {/* Sort Controls */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
            <Select value={sortField || 'none'} onValueChange={(v) => setSortField(v === 'none' ? '' : v)}>
              <SelectTrigger className="w-[180px] h-9">
                <SelectValue placeholder={t('sortBy')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t('noSorting')}</SelectItem>
                {schema.fields.map(field => (
                  <SelectItem key={field.id} value={field.id}>
                    {field.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {sortField && (
              <Button
                variant="outline"
                size="sm"
                className="h-9"
                onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
              >
                {sortDirection === 'asc' ? t('ascending') : t('descending')}
              </Button>
            )}
          </div>

          {/* Filter Controls */}
          <div className="flex items-center gap-2 flex-1">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filterField || 'none'} onValueChange={(v) => {
              const newField = v === 'none' ? '' : v;
              setFilterField(newField);
              setFilterValue('');
              // Set default operator based on field type
              if (newField) {
                const field = schema.fields.find(f => f.id === newField);
                if (field?.type === 'number') setFilterOperator('equals');
                else if (field?.type === 'date') setFilterOperator('equals');
                else setFilterOperator('contains');
              }
            }}>
              <SelectTrigger className="w-[180px] h-9">
                <SelectValue placeholder={t('filterBy')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t('noFilter')}</SelectItem>
                {schema.fields.map(field => (
                  <SelectItem key={field.id} value={field.id}>
                    {field.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {filterField && selectedFilterField && (
              <>
                {/* Number field filters */}
                {selectedFilterField.type === 'number' && (
                  <>
                    <Select value={filterOperator} onValueChange={setFilterOperator}>
                      <SelectTrigger className="w-[120px] h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="equals">{t('equals')}</SelectItem>
                        <SelectItem value="greater">{t('greater')}</SelectItem>
                        <SelectItem value="less">{t('less')}</SelectItem>
                        <SelectItem value="greaterEqual">{t('greaterEqual')}</SelectItem>
                        <SelectItem value="lessEqual">{t('lessEqual')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      placeholder={t('filterValue')}
                      value={filterValue}
                      onChange={(e) => setFilterValue(e.target.value)}
                      className="w-[150px] h-9"
                    />
                  </>
                )}

                {/* Date field filters */}
                {selectedFilterField.type === 'date' && (
                  <>
                    <Select value={filterOperator} onValueChange={setFilterOperator}>
                      <SelectTrigger className="w-[120px] h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="equals">{t('on')}</SelectItem>
                        <SelectItem value="before">{t('before')}</SelectItem>
                        <SelectItem value="after">{t('after')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      type="date"
                      value={filterValue}
                      onChange={(e) => setFilterValue(e.target.value)}
                      className="w-[180px] h-9"
                    />
                  </>
                )}

                {/* Select/MultiSelect field filters */}
                {(selectedFilterField.type === 'select' || selectedFilterField.type === 'multiSelect') && (
                  <Select value={filterValue} onValueChange={setFilterValue}>
                    <SelectTrigger className="w-[200px] h-9">
                      <SelectValue placeholder={t('selectValue')} />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedFilterField.options?.map(option => (
                        <SelectItem key={option.id} value={option.name}>
                          {option.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {/* Checkbox field filters */}
                {selectedFilterField.type === 'checkbox' && (
                  <Select value={filterValue} onValueChange={setFilterValue}>
                    <SelectTrigger className="w-[150px] h-9">
                      <SelectValue placeholder={t('selectValue')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">{t('yes')}</SelectItem>
                      <SelectItem value="false">{t('no')}</SelectItem>
                    </SelectContent>
                  </Select>
                )}

                {/* Text field filters */}
                {selectedFilterField.type === 'text' && (
                  <Input
                    placeholder={t('filterValue')}
                    value={filterValue}
                    onChange={(e) => setFilterValue(e.target.value)}
                    className="w-[200px] h-9"
                  />
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 p-0"
                  onClick={() => {
                    setFilterField('');
                    setFilterValue('');
                    setFilterOperator('contains');
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>

          {/* Results count */}
          <div className="text-sm text-muted-foreground">
            {processedRecords.length} of {records.length} records
          </div>
        </div>

        <div className="w-full flex-1" style={{ pointerEvents: 'auto' }}>
          <div data-t-grid-container="true" tabIndex={0} className="relative outline-none w-full h-full">
            {/* Scrollable area for the table */}
            <div className="w-full h-full overflow-auto pb-10">
              <Table>
                <TableHeader className="bg-muted/50 sticky top-0 z-10">
                  <TableRow>
                    <TableHead className="w-12 text-muted-foreground">#</TableHead>
                    {schema.fields.map((field) => (
                      <TableHead key={field.id} className="min-w-[150px]">
                        <span className="font-medium">{field.name}</span>
                        {field.isPrimary && (
                          <Badge variant="outline" className="ml-2 text-xs">Primary</Badge>
                        )}
                      </TableHead>
                    ))}
                    <TableHead className="w-[100px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {processedRecords.map((record, index) => (
                    <TableRow
                      key={record.id}
                      className="group cursor-pointer hover:bg-muted/50"
                      onClick={() => onOpenModal('view', record)}
                    >
                      <TableCell className="text-muted-foreground tabular-nums">{index + 1}</TableCell>
                      {schema.fields.map((field) => (
                        <TableCell key={field.id}>
                          <div className="min-h-[24px] flex items-center">{renderCellValue(record, field)}</div>
                        </TableCell>
                      ))}
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => onOpenModal('view', record)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => onOpenModal('edit', record)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => onDeleteRecord(record.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={schema.fields.length + 2} className="p-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onOpenModal('add')}
                        className="w-full justify-start px-4 h-10 text-muted-foreground hover:text-foreground rounded-none"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add new record
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>

      {/* Styled Footer */}
      <div className="flex items-center h-6 pl-2 ml-1 text-xs bg-violet-200 dark:bg-zinc-600 rounded absolute bottom-3 left-0 shadow-sm z-20">
        {records.length} records
        <button className="inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 gap-2 hover:text-accent-foreground rounded-md text-xs ml-[2px] h-full rounded-l-none p-[2px] hover:bg-violet-300 dark:hover:bg-zinc-500">
          <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 24 24" className="w-3 h-3">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m15 18-6-6 6-6"></path>
          </svg>
        </button>
      </div>
    </div>
  );
}
