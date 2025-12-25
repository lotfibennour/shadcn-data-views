'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useMemo } from 'react';
import { RecordForm } from './RecordForm';
import { TableSchema } from '@/lib/schema';
import { IRecord } from '@/lib/client';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useI18n } from './I18nProvider';

interface RecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'add' | 'edit' | 'view';
  schema: TableSchema;
  record?: IRecord;
  initialValues?: Record<string, any>;
  onSubmit: (values: Record<string, any>) => void;
}

export function RecordModal({
  isOpen,
  onClose,
  mode,
  schema,
  record,
  initialValues,
  onSubmit,
}: RecordModalProps) {
  const { t } = useI18n();
  const titles = {
    add: t('createNewRecord'),
    edit: t('editRecord'),
    view: t('recordDetails'),
  };

  const descriptions = {
    add: t('enterDetails'),
    edit: t('modifyValues'),
    view: t('viewData'),
  };

  const handleSubmit = (values: Record<string, any>) => {
    onSubmit(values);
    onClose();
  };

  // Combine record fields or initial values
  const formValues = mode === 'add' ? initialValues : record?.fields;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] max-h-[85vh] flex flex-col">
        <DialogHeader className="space-y-1.5">
          <DialogTitle>{titles[mode]}</DialogTitle>
          <DialogDescription>{descriptions[mode]}</DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 -mx-6 px-6 mt-4">
          <RecordForm
            schema={schema}
            mode={mode}
            initialValues={formValues || {}}
            onSubmit={handleSubmit}
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
