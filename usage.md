# Usage

## Installation

```bash
npm install shadcn-data-views
# or
pnpm add shadcn-data-views
```


## Setup

The package now injects its own styles automatically. You do NOT need to import a CSS file.

## Basic Usage

To use the `DataViews` component, you need to provide:
1. A `TableSchema` defining the structure.
2. A `dbClient` implementing `IDataViewsClient` to handle data operations.

```tsx
import { DataViews, TableSchema, IDataViewsClient, IRecord } from 'shadcn-data-views';

// 1. Define Schema
const mySchema: TableSchema = {
  id: 'tasks',
  name: 'Tasks',
  icon: '📋',
  fields: [
    { id: 'title', name: 'Title', type: 'text', isPrimary: true },
    { id: 'status', name: 'Status', type: 'select', options: [{ id: 'todo', name: 'To Do' }, { id: 'done', name: 'Done' }] },
  ],
};

// 2. Implement Client
class MyDbClient implements IDataViewsClient {
  async getRecords(): Promise<IRecord[]> {
    // Fetch from your API
    return await fetch('/api/tasks').then(res => res.json());
  }

  async createRecord(record: Partial<IRecord>): Promise<IRecord> {
    // POST to your API
    return await fetch('/api/tasks', { method: 'POST', body: JSON.stringify(record) }).then(res => res.json());
  }

  async updateRecord(id: string, record: Partial<IRecord>): Promise<IRecord> {
    // PATCH to your API
    return await fetch(`/api/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(record) }).then(res => res.json());
  }

  async deleteRecord(id: string): Promise<void> {
    // DELETE to your API
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
  }
}

const dbClient = new MyDbClient();

// 3. Render Component
export default function App() {
  return (
    <div style={{ height: '100vh' }}>
      <DataViews 
        schema={mySchema} 
        dbClient={dbClient} 
      />
    </div>
  );
}
```

## Configuration

You can customize the initial view via the `config` prop:

```tsx
<DataViews 
  schema={mySchema} 
  dbClient={dbClient}
  config={{ defaultView: 'kanban' }}
/>
```
