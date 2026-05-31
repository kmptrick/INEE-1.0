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
  patch: <T>(path: string, body: unknown) => request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};

// Auth
export const auth = {
  login: (email: string, password: string) =>
    api.post<{ access_token: string; user: User }>('/auth/login', { email, password }),
  me: () => api.get<User>('/auth/me'),
  changePassword: (oldPassword: string, newPassword: string) =>
    api.post<{ message: string }>('/auth/change-password', { oldPassword, newPassword }),
  forgotPassword: (email: string) =>
    api.post<{ message: string }>('/auth/forgot-password', { email }),
  resetPasswordWithToken: (token: string, newPassword: string) =>
    api.post<{ message: string }>('/auth/reset-password', { token, newPassword }),
};

// Users (admin)
export const users = {
  list: () => api.get<UserProfile[]>('/users'),
  create: (data: { email: string; firstName: string; lastName: string; username?: string; jobTitle?: string; birthDate?: string; role?: string }) =>
    api.post<UserProfile>('/users', data),
  update: (id: string, data: Partial<UserProfile>) => api.put<UserProfile>(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
  changePassword: (id: string, newPassword: string) =>
    api.patch<{ message: string }>(`/users/${id}/password`, { newPassword }),
  resetPassword: (id: string) => api.post<{ message: string }>(`/users/${id}/reset-password`, {}),
  deactivate: (id: string) => api.patch<UserProfile>(`/users/${id}/deactivate`, {}),
  activate: (id: string) => api.patch<UserProfile>(`/users/${id}/activate`, {}),
};

// CRM
export const companies = {
  list: (search?: string) => api.get<Company[]>(`/companies${search ? `?search=${search}` : ''}`),
  get: (id: string) => api.get<Company>(`/companies/${id}`),
  create: (data: Partial<Company>) => api.post<Company>('/companies', data),
  update: (id: string, data: Partial<Company>) => api.put<Company>(`/companies/${id}`, data),
  deactivate: (id: string) => api.patch<Company>(`/companies/${id}/deactivate`, {}),
  activate: (id: string) => api.patch<Company>(`/companies/${id}/activate`, {}),
  delete: (id: string) => api.delete(`/companies/${id}`),
};

export const contacts = {
  deactivate: (id: string) => api.patch<Contact>(`/contacts/${id}/deactivate`, {}),
  activate: (id: string) => api.patch<Contact>(`/contacts/${id}/activate`, {}),
  list: (search?: string, companyId?: string) => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (companyId) params.set('companyId', companyId);
    const qs = params.toString();
    return api.get<Contact[]>(`/contacts${qs ? `?${qs}` : ''}`);
  },
  get: (id: string) => api.get<Contact>(`/contacts/${id}`),
  create: (data: Partial<Contact>) => api.post<Contact>('/contacts', data),
  update: (id: string, data: Partial<Contact>) => api.put<Contact>(`/contacts/${id}`, data),
  delete: (id: string) => api.delete(`/contacts/${id}`),
};

export const invoicingSend = {
  quote: (id: string, recipients: string[]) => api.post<Quote>(`/invoicing/quotes/${id}/send`, { recipients }),
  invoice: (id: string, recipients: string[]) => api.post<Invoice>(`/invoicing/invoices/${id}/send`, { recipients }),
};

export const creditNotes = {
  list: (status?: string) => api.get<CreditNote[]>(`/credit-notes${status ? `?status=${status}` : ''}`),
  get: (id: string) => api.get<CreditNote>(`/credit-notes/${id}`),
  create: (data: Partial<CreditNote> & { invoiceId: string; lines: any[] }) => api.post<CreditNote>('/credit-notes', data),
  update: (id: string, data: any) => api.put<CreditNote>(`/credit-notes/${id}`, data),
  delete: (id: string) => api.delete(`/credit-notes/${id}`),
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
export interface UserProfile { id: string; email: string; firstName: string; lastName: string; username?: string; jobTitle?: string; birthDate?: string; role: string; isActive: boolean; createdAt: string; }
export interface Company {
  id: string;
  reference?: string;
  isActive?: boolean;
  createdAt?: string;
  clientType: 'SOCIETE' | 'PARTICULIER';
  name: string;
  denomination?: string;
  formeJuridique?: string;
  prenom?: string;
  nom?: string;
  email?: string;
  phone?: string;
  streetNumber?: string;
  address?: string;
  postalCode?: string;
  city?: string;
  country?: string;
  vatNumber?: string;
  notes?: string;
  _count?: { contacts: number; deals: number };
}
export interface Contact { id: string; reference?: string; isActive?: boolean; createdAt?: string; firstName: string; lastName: string; email?: string; phone?: string; jobTitle?: string; canReceiveInvoices?: boolean; company?: { id: string; name: string }; }
export interface Deal { id: string; reference?: string; createdAt?: string; title: string; value: number; currency: string; status: string; probability: number; company?: { id: string; name: string }; contact?: { id: string; firstName: string; lastName: string }; stage?: { id: string; name: string }; }
export interface Service { id: string; idPrestation: string; categorie: string; description: string; prixHT: number; vatRate?: number; unite?: string; remarques?: string; isActive: boolean; }
export interface Commission { id: string; reference: string; createdAt?: string; brokerName: string; dealValue: number; commissionRate: number; commissionAmount: number; currency: string; status: string; notes?: string; company?: { id: string; name: string }; }
export interface Quote { id: string; number: string; createdAt?: string; status: string; subtotal: number; vatRate: number; vatAmount: number; total: number; vatMention?: string; notes?: string; company?: { id: string; name: string }; lines?: QuoteLine[]; }
export interface Invoice { id: string; number: string; createdAt?: string; status: string; subtotal: number; vatRate: number; vatAmount: number; total: number; paidAmount: number; dueDate?: string; vatMention?: string; notes?: string; company?: { id: string; name: string }; lines?: InvoiceLine[]; }
export interface QuoteLine { id: string; serviceId?: string; description: string; quantity: number; unitPrice: number; unite?: string; discountRate?: number; lineVatRate?: number; periodStart?: string; periodEnd?: string; total: number; }
export interface InvoiceLine { id: string; serviceId?: string; description: string; quantity: number; unitPrice: number; unite?: string; discountRate?: number; lineVatRate?: number; periodStart?: string; periodEnd?: string; total: number; }
export interface Project {
  id: string; reference?: string; createdAt?: string; name: string; description?: string; status: string;
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
export interface CreditNote {
  id: string; number: string; createdAt?: string; status: string;
  subtotal: number; vatRate: number; vatAmount: number; total: number;
  vatMention?: string; notes?: string;
  invoice?: { id: string; number: string };
  company?: { id: string; name: string };
  lines?: CreditNoteLine[];
}
export interface CreditNoteLine { id: string; serviceId?: string; description: string; quantity: number; unitPrice: number; unite?: string; total: number; }

export interface LeaveType { id: string; name: string; color: string; maxDaysPerYear: number; isActive: boolean; }
export interface LeaveRequest {
  id: string; userId: string; leaveTypeId: string; startDate: string; endDate: string;
  daysCount: number; status: 'PENDING' | 'APPROVED' | 'REJECTED'; notes?: string;
  user?: { id: string; firstName: string; lastName: string };
  leaveType?: LeaveType;
}
export interface CalendarEvent {
  id: string; title: string; description?: string; startDate: string; endDate: string;
  allDay: boolean; location?: string; type: 'MEETING' | 'CALL' | 'TASK' | 'OTHER';
  userId: string; user?: { id: string; firstName: string; lastName: string };
}

export const subscriptions = {
  list: (status?: string) => api.get<Subscription[]>(`/subscriptions${status ? `?status=${status}` : ''}`),
  get: (id: string) => api.get<Subscription>(`/subscriptions/${id}`),
  create: (data: Partial<Subscription> & { lines: any[] }) => api.post<Subscription>('/subscriptions', data),
  update: (id: string, data: any) => api.put<Subscription>(`/subscriptions/${id}`, data),
  activate: (id: string) => api.patch<Subscription>(`/subscriptions/${id}/activate`, {}),
  deactivate: (id: string) => api.patch<Subscription>(`/subscriptions/${id}/deactivate`, {}),
  delete: (id: string) => api.delete(`/subscriptions/${id}`),
  generate: () => api.post<{ generated: number; invoices: any[] }>('/subscriptions/generate', {}),
};

export interface Subscription {
  id: string;
  number: string;
  status: string; // ACTIVE | INACTIVE
  frequency: string; // MONTHLY | QUARTERLY | SEMI_ANNUAL | ANNUAL
  startDate: string;
  nextBillingDate: string;
  createdAt?: string;
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  total: number;
  vatMention?: string;
  notes?: string;
  company?: { id: string; name: string };
  lines?: SubscriptionLine[];
}

export interface SubscriptionLine {
  id: string;
  serviceId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  unite?: string;
  discountRate?: number;
  lineVatRate?: number;
  total: number;
}

export const leaveTypes = {
  list: () => api.get<LeaveType[]>('/leave-types'),
  create: (data: Partial<LeaveType>) => api.post<LeaveType>('/leave-types', data),
  update: (id: string, data: Partial<LeaveType>) => api.patch<LeaveType>(`/leave-types/${id}`, data),
  delete: (id: string) => api.delete(`/leave-types/${id}`),
};

export const leaveRequests = {
  list: (params?: { userId?: string; status?: string }) => {
    const qs = new URLSearchParams(params as any).toString();
    return api.get<LeaveRequest[]>(`/leave-requests${qs ? `?${qs}` : ''}`);
  },
  my: () => api.get<LeaveRequest[]>('/leave-requests/my'),
  create: (data: { leaveTypeId: string; startDate: string; endDate: string; daysCount: number; notes?: string }) =>
    api.post<LeaveRequest>('/leave-requests', data),
  approve: (id: string) => api.patch<LeaveRequest>(`/leave-requests/${id}/approve`, {}),
  reject: (id: string) => api.patch<LeaveRequest>(`/leave-requests/${id}/reject`, {}),
  delete: (id: string) => api.delete(`/leave-requests/${id}`),
};

export const calendar = {
  list: (params?: { userId?: string; start?: string; end?: string }) => {
    const qs = new URLSearchParams(Object.entries(params ?? {}).filter(([, v]) => v) as any).toString();
    return api.get<CalendarEvent[]>(`/calendar${qs ? `?${qs}` : ''}`);
  },
  create: (data: Partial<CalendarEvent>) => api.post<CalendarEvent>('/calendar', data),
  update: (id: string, data: Partial<CalendarEvent>) => api.put<CalendarEvent>(`/calendar/${id}`, data),
  delete: (id: string) => api.delete(`/calendar/${id}`),
};
