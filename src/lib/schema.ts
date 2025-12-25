// Schema-driven table configuration
// This is the only input needed - the app adapts to this schema

export { PRESET_COLORS } from './colors';

export interface FieldOption {
  id: string;
  name: string;
  color?: string;
}

export interface FieldSchema {
  id: string;
  name: string;
  type: 'text' | 'number' | 'select' | 'multiSelect' | 'date' | 'checkbox';
  isPrimary?: boolean;
  options?: FieldOption[]; // For select/multiSelect
}

export interface TableSchema {
  id: string;
  name: string;
  icon?: string;
  fields: FieldSchema[];
}

// Example schema - replace this with your own
export const tableSchema: TableSchema = {
  id: 'tasks',
  name: 'Tasks',
  icon: '📋',
  fields: [
    { id: 'title', name: 'Title', type: 'text', isPrimary: true },
    { id: 'description', name: 'Description', type: 'text' },
    {
      id: 'status',
      name: 'Status',
      type: 'select',
      options: [
        { id: 'todo', name: 'To Do', color: 'gray' },
        { id: 'in_progress', name: 'In Progress', color: 'blue' },
        { id: 'review', name: 'Review', color: 'yellow' },
        { id: 'done', name: 'Done', color: 'green' },
      ]
    },
    {
      id: 'priority',
      name: 'Priority',
      type: 'select',
      options: [
        { id: 'low', name: 'Low', color: 'gray' },
        { id: 'medium', name: 'Medium', color: 'yellow' },
        { id: 'high', name: 'High', color: 'red' },
      ]
    },
    { id: 'dueDate', name: 'Due Date', type: 'date' },
    { id: 'completed', name: 'Completed', type: 'checkbox' },
  ],
};

// Helper functions
export function getSelectField(schema: TableSchema): FieldSchema | undefined {
  return schema.fields.find(f => f.type === 'select');
}

export function getDateField(schema: TableSchema): FieldSchema | undefined {
  return schema.fields.find(f => f.type === 'date');
}

export function getPrimaryField(schema: TableSchema): FieldSchema | undefined {
  return schema.fields.find(f => f.isPrimary) || schema.fields[0];
}
