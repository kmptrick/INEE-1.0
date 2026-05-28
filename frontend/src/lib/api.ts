const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('inee_token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) => request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) => request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};

// Auth
export const auth = {
  login: (email: string, password: string) =>
    api.post<{ access_token: string; user: User }>('/auth/login', { email, password }),
  me: () => api.get<User>('/auth/me'),
};

// CRM
export const companies = {
  list: (search?: string) => api.get<Company[]>(`/companies${search ? `?search=${search}` : ''}`),
  get: (id: string) => api.get<Company>(`/companies/${id}`),
  create: (data: Partial<Company>) => api.post<Company>('/companies', data),
  update: (id: string, data: Partial<Company>) => api.put<Company>(`/companies/${id}`, data),
  delete: (id: string) => api.delete(`/companies/${id}`),
};

export const contacts = {
  list: (search?: string) => api.get<Contact[]>(`/contacts${search ? `?search=${search}` : ''}`),
  get: (id: string) => api.get<Contact>(`/contacts/${id}`),
  create: (data: Partial<Contact>) => api.post<Contact>('/contacts', data),
  update: (id: string, data: Partial<Contact>) => api.put<Contact>(`/contacts/${id}`, data),
  delete: (id: string) => api.delete(`/contacts/${id}`),
};

export const deals = {
  list: (status?: string) => api.get<Deal[]>(`/deals${status ? `?status=${status}` : ''}`),
  get: (id: string) => api.get<Deal>(`/deals/${id}`),
  create: (data: Partial<Deal>) => api.post<Deal>('/deals', data),
  update: (id: string, data: Partial<Deal>) => api.put<Deal>(`/deals/${id}`, data),
  delete: (id: string) => api.delete(`/deals/${id}`),
  stats: () => api.get<PipelineStats[]>('/deals/stats/pipeline'),
};

export const commissions = {
  list: (status?: string) => api.get<Commission[]>(`/commissions${status ? `?status=${status}` : ''}`),
  get: (id: string) => api.get<Commission>(`/commissions/${id}`),
  create: (data: Partial<Commission>) => api.post<Commission>('/commissions', data),
  update: (id: string, data: Partial<Commission>) => api.put<Commission>(`/commissions/${id}`, data),
  delete: (id: string) => api.delete(`/commissions/${id}`),
  stats: () => api.get<CommissionStats>('/commissions/stats'),
};

export const projects = {
  list: (status?: string) => api.get<Project[]>(`/projects${status ? `?status=${status}` : ''}`),
  get: (id: string) => api.get<Project>(`/projects/${id}`),
  create: (data: Partial<Project>) => api.post<Project>('/projects', data),
  update: (id: string, data: Partial<Project>) => api.put<Project>(`/projects/${id}`, data),
  delete: (id: string) => api.delete(`/projects/${id}`),
  tasks: {
    create: (projectId: string, data: Partial<Task>) => api.post<Task>(`/projects/${projectId}/tasks`, data),
    update: (projectId: string, taskId: string, data: Partial<Task>) => api.put<Task>(`/projects/${projectId}/tasks/${taskId}`, data),
    delete: (projectId: string, taskId: string) => api.delete(`/projects/${projectId}/tasks/${taskId}`),
  },
};

export const services = {
  list: (search?: string, categorie?: string) => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (categorie) params.set('categorie', categorie);
    const qs = params.toString();
    return api.get<Service[]>(`/services${qs ? `?${qs}` : ''}`);
  },
  get: (id: string) => api.get<Service>(`/services/${id}`),
  byId: (idPrestation: string) => api.get<Service>(`/services/by-id/${idPrestation}`),
  categories: () => api.get<string[]>('/services/categories'),
  create: (data: Partial<Service>) => api.post<Service>('/services', data),
  update: (id: string, data: Partial<Service>) => api.put<Service>(`/services/${id}`, data),
  delete: (id: string) => api.delete(`/services/${id}`),
};

export const invoicing = {
  quotes: {
    list: (status?: string) => api.get<Quote[]>(`/invoicing/quotes${status ? `?status=${status}` : ''}`),
    get: (id: string) => api.get<Quote>(`/invoicing/quotes/${id}`),
    create: (data: Partial<Quote>) => api.post<Quote>('/invoicing/quotes', data),
    update: (id: string, data: Partial<Quote>) => api.put<Quote>(`/invoicing/quotes/${id}`, data),
    delete: (id: string) => api.delete(`/invoicing/quotes/${id}`),
  },
  invoices: {
    list: (status?: string) => api.get<Invoice[]>(`/invoicing/invoices${status ? `?status=${status}` : ''}`),
    get: (id: string) => api.get<Invoice>(`/invoicing/invoices/${id}`),
    create: (data: Partial<Invoice>) => api.post<Invoice>('/invoicing/invoices', data),
    fromQuote: (quoteId: string, dueDate?: string) =>
      api.post<Invoice>('/invoicing/invoices/from-quote', { quoteId, dueDate }),
    update: (id: string, data: Partial<Invoice>) => api.put<Invoice>(`/invoicing/invoices/${id}`, data),
    delete: (id: string) => api.delete(`/invoicing/invoices/${id}`),
  },
  stats: () => api.get<InvoicingStats>('/invoicing/stats'),
};

// Types
export interface User { id: string; email: string; firstName: string; lastName: string; role: string; }
export interface Company {
  id: string;
  clientType: 'SOCIETE' | 'PARTICULIER';
  name: string;
  denomination?: string;
  formeJuridique?: string;
  prenom?: string;
  nom?: string;
  email?: string;
  phone?: string;
  city?: string;
  country?: string;
  vatNumber?: string;
  notes?: string;
  _count?: { contacts: number; deals: number };
}
export interface Contact { id: string; firstName: string; lastName: string; email?: string; phone?: string; jobTitle?: string; company?: { id: string; name: string }; }
export interface Deal { id: string; title: string; value: number; currency: string; status: string; probability: number; company?: { id: string; name: string }; contact?: { id: string; firstName: string; lastName: string }; stage?: { id: string; name: string }; }
export interface Service { id: string; idPrestation: string; categorie: string; description: string; prixHT: number; vatRate?: number; unite?: string; remarques?: string; isActive: boolean; }
export interface Commission { id: string; reference: string; brokerName: string; dealValue: number; commissionRate: number; commissionAmount: number; currency: string; status: string; notes?: string; company?: { id: string; name: string }; }
export interface Quote { id: string; number: string; status: string; subtotal: number; vatRate: number; vatAmount: number; total: number; vatMention?: string; notes?: string; company?: { id: string; name: string }; lines?: QuoteLine[]; }
export interface Invoice { id: string; number: string; status: string; subtotal: number; vatRate: number; vatAmount: number; total: number; paidAmount: number; dueDate?: string; vatMention?: string; notes?: string; company?: { id: string; name: string }; lines?: InvoiceLine[]; }
export interface QuoteLine { id: string; serviceId?: string; description: string; quantity: number; unitPrice: number; unite?: string; total: number; }
export interface InvoiceLine { id: string; serviceId?: string; description: string; quantity: number; unitPrice: number; unite?: string; total: number; }
export interface Project {
  id: string; name: string; description?: string; status: string;
  startDate?: string; endDate?: string; budget?: number;
  company?: { id: string; name: string };
  tasks?: Task[];
  _count?: { tasks: number };
}
export interface Task {
  id: string; title: string; description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate?: string; projectId?: string;
  assignedTo?: { id: string; firstName: string; lastName: string };
}
export interface PipelineStats { status: string; _sum: { value: number }; _count: number; }
export interface CommissionStats { totalDeals: number; totalCommissions: number; totalCount: number; pendingAmount: number; paidAmount: number; }
export interface InvoicingStats { invoiceStats: any[]; quoteStats: any[]; overdueInvoices: any[]; }
