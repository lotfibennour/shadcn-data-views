'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2 } from 'lucide-react';
import { RecordForm } from '../RecordForm';
import { TableSchema } from '@/lib/schema';
import { IRecord } from '@/lib/client';

interface FormViewProps {
  schema: TableSchema;
  records: IRecord[];
  onCreateRecord: (fieldValues: Record<string, any>) => Promise<IRecord> | IRecord;
  onUpdateRecord: (recordId: string, fieldValues: Record<string, any>) => Promise<void> | void;
  onDeleteRecord: (recordId: string) => Promise<void> | void;
  onOpenModal: (mode: 'add' | 'edit' | 'view', record?: IRecord, initialValues?: Record<string, any>) => void;
}

export function FormView({ schema, onCreateRecord }: FormViewProps) {
  const [success, setSuccess] = useState(false);

  const handleSubmit = (formData: Record<string, any>) => {
    onCreateRecord(formData);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="h-full overflow-auto p-8 bg-muted/30">
      <div className="max-w-xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Add New Record</CardTitle>
            <CardDescription>Fill out the form below to add a new entry to the database.</CardDescription>
          </CardHeader>
          <CardContent>
            {success && (
              <Alert className="mb-6 border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>Record created successfully!</AlertDescription>
              </Alert>
            )}

            <RecordForm
              schema={schema}
              mode="add"
              onSubmit={handleSubmit}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
