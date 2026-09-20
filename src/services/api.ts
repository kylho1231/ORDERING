import { Category, Product, Order, BusinessSettings, SalesReport, SalesSummary } from '../types';

const BASE_URL = '/api';

export const api = {
  // Settings
  async getSettings(): Promise<BusinessSettings> {
    const res = await fetch(`${BASE_URL}/settings`);
    const json = await res.json();
    return json.data;
  },

  async updateSettings(settings: Partial<BusinessSettings>): Promise<BusinessSettings> {
    const res = await fetch(`${BASE_URL}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    return json.data;
  },

  // Categories
  async getCategories(): Promise<Category[]> {
    const res = await fetch(`${BASE_URL}/categories`);
    const json = await res.json();
    return json.data || [];
  },

  async addCategory(cat: Omit<Category, 'id'> | { name: string }): Promise<Category> {
    const res = await fetch(`${BASE_URL}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cat),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    return json.data;
  },

  async createCategory(name: string): Promise<Category> {
    return this.addCategory({ name });
  },

  async updateCategory(id: string, cat: Partial<Category>): Promise<Category> {
    const res = await fetch(`${BASE_URL}/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cat),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    return json.data;
  },

  async deleteCategory(id: string): Promise<boolean> {
    const res = await fetch(`${BASE_URL}/categories/${id}`, { method: 'DELETE' });
    const json = await res.json();
    return json.success;
  },

  // Menu / Products
  async getMenu(): Promise<Product[]> {
    const res = await fetch(`${BASE_URL}/menu`);
    const json = await res.json();
    return json.data || [];
  },

  async getProduct(id: string): Promise<Product> {
    const res = await fetch(`${BASE_URL}/menu/${id}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    return json.data;
  },

  async addProduct(product: Omit<Product, 'id'>): Promise<Product> {
    const res = await fetch(`${BASE_URL}/menu`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    return json.data;
  },

  async createProduct(product: Omit<Product, 'id'>): Promise<Product> {
    return this.addProduct(product);
  },

  async updateProduct(id: string, product: Partial<Product>): Promise<Product> {
    const res = await fetch(`${BASE_URL}/menu/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    return json.data;
  },

  async updatePrice(id: string, price: number): Promise<Product> {
    const res = await fetch(`${BASE_URL}/menu/${id}/price`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ price }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Failed to update price');
    return json.data;
  },

  async toggleAvailability(id: string, available: boolean): Promise<Product> {
    const res = await fetch(`${BASE_URL}/menu/${id}/availability`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ available }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    return json.data;
  },

  async deleteProduct(id: string): Promise<boolean> {
    const res = await fetch(`${BASE_URL}/menu/${id}`, { method: 'DELETE' });
    const json = await res.json();
    return json.success;
  },

  // Orders
  async getOrders(filters?: {
    period?: string;
    status?: string;
    source?: string;
    search?: string;
  }): Promise<Order[]> {
    const params = new URLSearchParams();
    if (filters?.period) params.append('period', filters.period);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.source) params.append('source', filters.source);
    if (filters?.search) params.append('search', filters.search);

    const res = await fetch(`${BASE_URL}/orders?${params.toString()}`);
    const json = await res.json();
    return json.data || [];
  },

  async getOrder(idOrNumber: string): Promise<Order> {
    const res = await fetch(`${BASE_URL}/orders/${idOrNumber}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    return json.data;
  },

  async createOrder(orderInput: {
    customer_name?: string;
    contact_number?: string;
    order_type: 'Dine-In' | 'Take-Out';
    table_number?: string;
    notes?: string;
    source: 'ONLINE' | 'WALK_IN';
    payment_method?: 'Cash' | 'Card' | 'Counter';
    payment_status?: 'Pending' | 'Paid';
    stripe_payment_intent_id?: string;
    items: Array<{
      product_id: string;
      quantity: number;
      notes?: string;
    }>;
  }): Promise<Order> {
    const res = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderInput),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Something went wrong while placing your order.');
    return json.data;
  },

  async updateOrderStatus(idOrNumber: string, status: Order['status']): Promise<Order> {
    const res = await fetch(`${BASE_URL}/orders/${idOrNumber}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    return json.data;
  },

  // Sales Reports
  async getSalesReport(period: string = 'today'): Promise<SalesSummary> {
    const res = await fetch(`${BASE_URL}/reports/sales?period=${period}`);
    const json = await res.json();
    return json.data;
  },

  // Stripe
  async createPaymentIntent(params: {
    amount: number;
    orderDetails?: { customer_name?: string; order_type?: string };
  }): Promise<{ clientSecret: string; id: string; isLiveStripe: boolean; message?: string }> {
    const res = await fetch(`${BASE_URL}/create-payment-intent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Payment initiation failed');
    return json;
  },

  // Admin & Manager Authentication
  async login(pin: string, preferredRole?: 'admin' | 'manager'): Promise<{ token: string; user: { role: 'admin' | 'manager'; name: string } }> {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin, role: preferredRole }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Invalid PIN');
    return json;
  },

  // AI Chat Studio & Food Concierge (Powered by Gemini)
  async askAI(
    message: string,
    history?: Array<{ role: 'user' | 'model'; text: string }>
  ): Promise<{ reply: string; source: string; note?: string }> {
    const res = await fetch(`${BASE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'AI request failed');
    return json;
  },
};
