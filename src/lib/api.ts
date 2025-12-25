const API_BASE = '/api';

// Tables
export async function fetchTables() {
  const res = await fetch(`${API_BASE}/tables`);
  const data = await res.json();
  return data.tables || [];
}

export async function fetchTable(tableId: string) {
  const res = await fetch(`${API_BASE}/tables/${tableId}`);
  const data = await res.json();
  return data.table;
}

export async function createTable(name: string, icon?: string) {
  const res = await fetch(`${API_BASE}/tables`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, icon }),
  });
  const data = await res.json();
  return data.table;
}

export async function updateTable(tableId: string, updates: { name?: string; icon?: string }) {
  const res = await fetch(`${API_BASE}/tables/${tableId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  const data = await res.json();
  return data.table;
}

export async function deleteTable(tableId: string) {
  await fetch(`${API_BASE}/tables/${tableId}`, { method: 'DELETE' });
}

// Fields
export async function fetchFields(tableId: string) {
  const res = await fetch(`${API_BASE}/tables/${tableId}/fields`);
  const data = await res.json();
  return data.fields || [];
}

export async function createField(tableId: string, name: string, type: string, options?: any) {
  const res = await fetch(`${API_BASE}/tables/${tableId}/fields`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, type, options }),
  });
  const data = await res.json();
  return data.field;
}

export async function updateField(tableId: string, fieldId: string, updates: { name?: string; options?: any }) {
  const res = await fetch(`${API_BASE}/tables/${tableId}/fields/${fieldId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  const data = await res.json();
  return data.field;
}

export async function deleteField(tableId: string, fieldId: string) {
  await fetch(`${API_BASE}/tables/${tableId}/fields/${fieldId}`, { method: 'DELETE' });
}

// Views
export async function fetchViews(tableId: string) {
  const res = await fetch(`${API_BASE}/tables/${tableId}/views`);
  const data = await res.json();
  return data.views || [];
}

export async function createView(tableId: string, name: string, type: string, options?: any) {
  const res = await fetch(`${API_BASE}/tables/${tableId}/views`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, type, options }),
  });
  const data = await res.json();
  return data.view;
}

export async function updateView(tableId: string, viewId: string, updates: any) {
  const res = await fetch(`${API_BASE}/tables/${tableId}/views/${viewId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  const data = await res.json();
  return data.view;
}

export async function deleteView(tableId: string, viewId: string) {
  await fetch(`${API_BASE}/tables/${tableId}/views/${viewId}`, { method: 'DELETE' });
}

// Records
export async function fetchRecords(tableId: string, options?: { filter?: any; sort?: any[]; limit?: number; offset?: number }) {
  const params = new URLSearchParams();
  if (options?.filter) params.set('filter', JSON.stringify(options.filter));
  if (options?.sort) params.set('sort', JSON.stringify(options.sort));
  if (options?.limit) params.set('limit', options.limit.toString());
  if (options?.offset) params.set('offset', options.offset.toString());
  
  const res = await fetch(`${API_BASE}/tables/${tableId}/records?${params}`);
  const data = await res.json();
  return data.records || [];
}

export async function createRecord(tableId: string, fields: Record<string, any>) {
  const res = await fetch(`${API_BASE}/tables/${tableId}/records`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields }),
  });
  const data = await res.json();
  return data.record;
}

export async function updateRecord(tableId: string, recordId: string, fields: Record<string, any>) {
  const res = await fetch(`${API_BASE}/tables/${tableId}/records/${recordId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields }),
  });
  const data = await res.json();
  return data.record;
}

export async function deleteRecord(tableId: string, recordId: string) {
  await fetch(`${API_BASE}/tables/${tableId}/records/${recordId}`, { method: 'DELETE' });
}
