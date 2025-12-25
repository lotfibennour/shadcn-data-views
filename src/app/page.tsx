'use client';

import { tableSchema } from '@/lib/schema';
import { DataViews } from '@/components/DataViews';
import { IDataViewsClient, IRecord } from '@/lib/client';

// Simple implementation of the client using LocalStorage
class LocalStorageClient implements IDataViewsClient {
  private key = 'shadcn-data-views-records';
  private records: IRecord[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(this.key);
      if (saved) {
        this.records = JSON.parse(saved);
      }
    }
  }

  private save() {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.key, JSON.stringify(this.records));
    }
  }

  async getRecords(): Promise<IRecord[]> {
    return new Promise((resolve) => {
      // Simulate API delay
      setTimeout(() => resolve([...this.records]), 100);
    });
  }

  async createRecord(record: Partial<IRecord>): Promise<IRecord> {
    return new Promise((resolve) => {
      const newRecord: IRecord = {
        id: `rec_${Date.now()}`,
        fields: record.fields || {},
        createdAt: new Date().toISOString(),
      };
      this.records = [newRecord, ...this.records];
      this.save();
      setTimeout(() => resolve(newRecord), 100);
    });
  }

  async updateRecord(id: string, record: Partial<IRecord>): Promise<IRecord> {
    return new Promise((resolve, reject) => {
      const index = this.records.findIndex(r => r.id === id);
      if (index === -1) {
        reject(new Error('Record not found'));
        return;
      }

      const updated = {
        ...this.records[index],
        fields: {
          ...this.records[index].fields,
          ...record.fields
        }
      };
      this.records[index] = updated;
      this.save();
      setTimeout(() => resolve(updated), 100);
    });
  }

  async deleteRecord(id: string): Promise<void> {
    return new Promise((resolve) => {
      this.records = this.records.filter(r => r.id !== id);
      this.save();
      setTimeout(() => resolve(), 100);
    });
  }
}

const dbClient = new LocalStorageClient();

export default function HomePage() {
  return (
    <div className="h-screen bg-background">
      <DataViews
        schema={tableSchema}
        dbClient={dbClient}
      />
    </div>
  );
}
