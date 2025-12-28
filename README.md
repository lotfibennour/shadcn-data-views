# shadcn-data-views

A powerful, schema-driven data view component for React, built with modern aesthetics and flexibility in mind. Instantly spin up Grid, Kanban, Gallery, Calendar, and Form views for your data.

## Description

`shadcn-data-views` allows developers to render complex data interfaces by simply defining a JSON schema and providing a data client. It abstracts away the complexity of building multiple view types (tables, boards, galleries) while providing a premium, polished UI out of the box.

## Advantages

- **Schema-Driven**: Define your data structure once in JSON (fields, types, options) and the UI adapts automatically.
- **Multi-View Support**: Comes with 5 built-in views:
  - **Grid**: classic spreadsheet-like table.
  - **Kanban**: drag-and-drop board for status management.
  - **Gallery**: card-based visual layout.
  - **Calendar**: date-based schedule view.
  - **Form**: auto-generated input forms.
- **Backend Agnostic**: You provide the `dbClient` implementation. It works with any data source: REST APIs, Supabase, Firebase, or even LocalStorage.
- **Beautiful Design**: Built with modern design principles (shadcn-like), featuring smooth transitions and a clean aesthetic.
- **Global Ready (i18n)**: Built-in support for 10 languages with automatic RTL support (e.g., Arabic).
- **Type-Safe**: Written in TypeScript with comprehensive type definitions.

## Use Cases

- **Admin Dashboards**: Quickly build CRUD interfaces for internal tools.
- **Project Management Tools**: Implement task tracking with Kanban and List views in minutes.
- **SaaS Applications**: Add "Airtable-like" or "Notion-like" database features to your customer-facing app.
- **Rapid Prototyping**: Visualize data structures immediately without writing custom UI code for each entity.

## Screenshots
### Grid View

<img width="1915" height="497" alt="image" src="https://github.com/user-attachments/assets/85208fdb-2aee-4032-adf7-af826bc87faa" />

### Form View

<img width="1918" height="725" alt="image" src="https://github.com/user-attachments/assets/e1396cd0-7041-4c8b-bf09-a884e7c27bbc" />

### Kanban View

<img width="1919" height="583" alt="image" src="https://github.com/user-attachments/assets/8228770a-6c8d-4d44-9c3c-802a4c2a10c4" />


### Galery View

<img width="1895" height="546" alt="image" src="https://github.com/user-attachments/assets/302046b0-164c-41d0-8130-1cca2196e3ef" />


### Calendar View

<img width="1917" height="643" alt="image" src="https://github.com/user-attachments/assets/cec39206-18a2-4956-aa74-97cf40630546" />


## Usage

### Installation

```bash
npm install shadcn-data-views
# or
pnpm add shadcn-data-views
```

### Setup

The package now injects its own styles automatically. You do NOT need to import a CSS file.

**Important**: This package uses `next-themes` for dark mode support. You **must** wrap your application (or the component) in a `ThemeProvider` to enable theme switching.

```tsx
// Example in a Next.js app (providers.tsx)
import { ThemeProvider } from 'next-themes';

export function Providers({ children }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </ThemeProvider>
  );
}
```

### Basic Example

To use the `DataViews` component, you likely need just three steps:
1. Define the **Schema** (`TableSchema`).
2. Implement the **Client** (`IDataViewsClient`).
3. Render the **Component**.

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
    { id: 'dueDate', name: 'Due Date', type: 'date' },
  ],
};

// 2. Implement Client (Connecting to your API)
class MyDbClient implements IDataViewsClient {
  async getRecords(): Promise<IRecord[]> {
    return await fetch('/api/tasks').then(res => res.json());
  }

  async createRecord(record: Partial<IRecord>): Promise<IRecord> {
    return await fetch('/api/tasks', { method: 'POST', body: JSON.stringify(record) }).then(res => res.json());
  }

  async updateRecord(id: string, record: Partial<IRecord>): Promise<IRecord> {
    return await fetch(`/api/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(record) }).then(res => res.json());
  }

  async deleteRecord(id: string): Promise<void> {
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
  }
}

const dbClient = new MyDbClient();

// 3. Render Component
export default function App() {
  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <DataViews 
        schema={mySchema} 
        dbClient={dbClient} 
        config={{ 
          defaultView: 'grid',
          language: 'es' // Optional: set language (defaults to 'en')
        }}
      />
    </div>
  );
}
```

### Color Palette

The package includes 50 predefined colors for select field options. You can import and use them when defining your schema:

```tsx
import { PRESET_COLORS } from 'shadcn-data-views';

const mySchema: TableSchema = {
  id: 'tasks',
  name: 'Tasks',
  fields: [
    {
      id: 'status',
      name: 'Status',
      type: 'select',
      options: [
        { id: 'todo', name: 'To Do', color: 'gray' },
        { id: 'in_progress', name: 'In Progress', color: 'blue' },
        { id: 'done', name: 'Done', color: 'green' },
      ]
    }
  ]
};
```

Available colors include: `red`, `blue`, `green`, `yellow`, `orange`, `purple`, `pink`, `brown`, `gray`, `cyan`, `magenta`, `lime`, `indigo`, `teal`, `violet`, `rose`, `fuchsia`, `sky`, `emerald`, `amber`, and many more. See `PRESET_COLORS` export for the full list.

### Internationalization (i18n)

The package supports 10 languages with automatic RTL (Right-to-Left) support:

**Supported Languages:**

| Code | Language | Native | Direction |
|------|----------|--------|-----------|
| `en` | English | English | LTR |
| `es` | Spanish | Español | LTR |
| `zh` | Chinese | 中文 | LTR |
| `ar` | Arabic | العربية | **RTL** |
| `hi` | Hindi | हिन्दी | LTR |
| `fr` | French | Français | LTR |
| `pt` | Portuguese | Português | LTR |
| `ru` | Russian | Русский | LTR |
| `de` | German | Deutsch | LTR |
| `ja` | Japanese | 日本語 | LTR |

**Usage:**

```tsx
import { DataViews } from 'shadcn-data-views';

<DataViews
  schema={mySchema}
  dbClient={myClient}
  config={{ language: 'ar' }} // Arabic with RTL support
/>
```

The component automatically:
- Translates all UI text
- Applies RTL layout for Arabic
- Maintains proper text direction for all elements

You can also import translation utilities:

```tsx
import { getTranslation, getDirection, LANGUAGES } from 'shadcn-data-views';

const text = getTranslation('es', 'addRecord'); // "Agregar Registro"
const dir = getDirection('ar'); // "rtl"
```

### Configuration

You can customize the component via the `config` prop:

```tsx
<DataViews 
  schema={mySchema} 
  dbClient={dbClient}
  config={{ 
    defaultView: 'kanban' 
  }}
/>
```

---

## License

MIT
