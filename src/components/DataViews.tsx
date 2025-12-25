'use client';

import { useState, useEffect } from 'react';
import { TableSchema, getSelectField, getDateField } from '@/lib/schema';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutGrid, Columns, Calendar as CalendarIcon, Image, FileText } from 'lucide-react';
import { GridView } from '@/components/views/GridView';
import { FormView } from '@/components/views/FormView';
import { KanbanView } from '@/components/views/KanbanView';
import { GalleryView } from '@/components/views/GalleryView';
import { CalendarView } from '@/components/views/CalendarView';
import { RecordModal } from '@/components/RecordModal';
import { ThemeToggle } from '@/components/ThemeToggle';
import { IDataViewsClient, IRecord } from '@/lib/client';
import { DataViewsConfig } from '@/lib/config';
import { I18nProvider, useI18n } from './I18nProvider';

export interface DataViewsProps {
    schema: TableSchema;
    dbClient: IDataViewsClient;
    config?: DataViewsConfig;
}

function DataViewsInner({ schema, dbClient, config }: DataViewsProps) {
    const { t } = useI18n();
    const [records, setRecords] = useState<IRecord[]>([]);
    const [activeView, setActiveView] = useState(config?.defaultView || 'grid');
    const [modalState, setModalState] = useState<{
        isOpen: boolean;
        mode: 'add' | 'edit' | 'view';
        record?: IRecord;
        initialValues?: Record<string, any>;
    }>({
        isOpen: false,
        mode: 'add',
    });

    const [mounted, setMounted] = useState(false);
    const hasSelectField = !!getSelectField(schema);
    const hasDateField = !!getDateField(schema);

    const fetchRecords = async () => {
        try {
            const data = await dbClient.getRecords();
            setRecords(data);
        } catch (error) {
            console.error("Failed to fetch records:", error);
        }
    };

    useEffect(() => {
        setMounted(true);
        fetchRecords();
    }, [dbClient]);

    const handleCreateRecord = async (fieldValues: Record<string, any>) => {
        try {
            const newRecord = await dbClient.createRecord({ fields: fieldValues });
            setRecords(prev => [newRecord, ...prev]);
            return newRecord;
        } catch (error) {
            console.error("Failed to create record:", error);
            throw error;
        }
    };

    const handleUpdateRecord = async (recordId: string, fieldValues: Record<string, any>) => {
        try {
            const updatedRecord = await dbClient.updateRecord(recordId, { fields: fieldValues });
            setRecords(prev => prev.map(r => r.id === recordId ? updatedRecord : r));
        } catch (error) {
            console.error("Failed to update record:", error);
            throw error;
        }
    };

    const handleDeleteRecord = async (recordId: string) => {
        try {
            await dbClient.deleteRecord(recordId);
            setRecords(prev => prev.filter(r => r.id !== recordId));
        } catch (error) {
            console.error("Failed to delete record:", error);
            throw error;
        }
    };

    const openModal = (mode: 'add' | 'edit' | 'view', record?: IRecord, initialValues?: Record<string, any>) => {
        setModalState({ isOpen: true, mode, record, initialValues });
    };

    const commonProps = {
        schema: schema,
        records,
        onCreateRecord: handleCreateRecord,
        onUpdateRecord: handleUpdateRecord,
        onDeleteRecord: handleDeleteRecord,
        onOpenModal: openModal,
    };

    return (
        <div className="h-full w-full flex flex-col bg-background">
            {/* Header */}
            <header className="border-b px-6 py-3 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <span className="text-2xl">{schema.icon}</span>
                    <h1 className="text-lg font-semibold">{schema.name}</h1>
                </div>
                <ThemeToggle />
            </header>

            {/* Views */}
            <Tabs value={activeView} onValueChange={(v) => setActiveView(v as any)} className="flex-1 flex flex-col overflow-hidden">
                <div className="border-b px-4 shrink-0">
                    <TabsList className="h-10">
                        <TabsTrigger value="grid" className="gap-2">
                            {mounted && <LayoutGrid className="h-4 w-4" />}
                            {t('gridView')}
                        </TabsTrigger>
                        <TabsTrigger value="form" className="gap-2">
                            {mounted && <FileText className="h-4 w-4" />}
                            {t('formView')}
                        </TabsTrigger>
                        {hasSelectField && (
                            <TabsTrigger value="kanban" className="gap-2">
                                {mounted && <Columns className="h-4 w-4" />}
                                {t('kanbanView')}
                            </TabsTrigger>
                        )}
                        <TabsTrigger value="gallery" className="gap-2">
                            {mounted && <Image className="h-4 w-4" />}
                            {t('galleryView')}
                        </TabsTrigger>
                        {hasDateField && (
                            <TabsTrigger value="calendar" className="gap-2">
                                {mounted && <CalendarIcon className="h-4 w-4" />}
                                {t('calendarView')}
                            </TabsTrigger>
                        )}
                    </TabsList>
                </div>

                <div className="flex-1 overflow-auto relative">
                    <TabsContent value="grid" className="h-full m-0">
                        <GridView {...commonProps} />
                    </TabsContent>
                    <TabsContent value="form" className="h-full m-0">
                        <FormView {...commonProps} />
                    </TabsContent>
                    {hasSelectField && (
                        <TabsContent value="kanban" className="h-full m-0">
                            <KanbanView {...commonProps} />
                        </TabsContent>
                    )}
                    <TabsContent value="gallery" className="h-full m-0">
                        <GalleryView {...commonProps} />
                    </TabsContent>
                    {hasDateField && (
                        <TabsContent value="calendar" className="h-full m-0">
                            <CalendarView {...commonProps} />
                        </TabsContent>
                    )}
                </div>
            </Tabs>

            <RecordModal
                isOpen={modalState.isOpen}
                onClose={() => setModalState((s) => ({ ...s, isOpen: false }))}
                mode={modalState.mode}
                schema={schema}
                record={modalState.record}
                initialValues={modalState.initialValues}
                onSubmit={(values) => {
                    if (modalState.mode === 'add') {
                        handleCreateRecord(values);
                    } else if (modalState.mode === 'edit' && modalState.record) {
                        handleUpdateRecord(modalState.record.id, values);
                    }
                }}
            />
        </div>
    );
}

export function DataViews(props: DataViewsProps) {
    return (
        <I18nProvider lang={props.config?.language}>
            <DataViewsInner {...props} />
        </I18nProvider>
    );
}
