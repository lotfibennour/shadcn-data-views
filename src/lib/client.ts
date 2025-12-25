
export interface IRecord {
    id: string;
    fields: Record<string, any>;
    createdAt: string;
}

export interface IDataViewsClient {
    getRecords(): Promise<IRecord[]>;
    createRecord(record: Partial<IRecord>): Promise<IRecord>;
    updateRecord(id: string, record: Partial<IRecord>): Promise<IRecord>;
    deleteRecord(id: string): Promise<void>;
}
