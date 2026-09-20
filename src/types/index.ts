export type OrderType = 'Dine-In' | 'Take-Out';

export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Preparing'
  | 'Ready'
  | 'Completed'
  | 'Cancelled';

export type OrderSource = 'ONLINE' | 'WALK_IN';

export interface Category {
  id: string;
  name: string;
  description?: string;
  order: number;
  icon?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string; // Category ID or Name
  price: number;
  image: string;
  available: boolean;
  preparationTime?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  specialInstructions?: string;
}

export interface OrderItem {
  id?: string;
  order_id?: string;
  product_id: string;
  product_name_snapshot: string;
  quantity: number;
  unit_price_snapshot: number;
  subtotal: number;
  notes?: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  contact_number: string;
  order_type: OrderType;
  table_number?: string;
  status: OrderStatus;
  subtotal: number;
  total: number;
  notes?: string;
  source: OrderSource;
  payment_method?: 'Cash' | 'Card' | 'Counter';
  payment_status?: 'Pending' | 'Paid';
  stripe_payment_intent_id?: string;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface BusinessSettings {
  name: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  hours: string;
  logo_url: string;
  receipt_footer: string;
  currency_symbol: string;
  currency_code: string;
}

export interface SalesReport {
  period: 'today' | 'yesterday' | 'week' | 'month' | 'all';
  totalSales: number;
  orderCount: number;
  itemsSold: number;
  dineInSales: number;
  takeOutSales: number;
  walkInOrders: number;
  onlineOrders: number;
  recentOrders: Order[];
}

export interface SalesSummary {
  period: string;
  totalSales: number;
  totalOrders: number;
  orderCount?: number;
  totalItemsSold: number;
  itemsSold?: number;
  dineInSales: number;
  takeOutSales: number;
  dineInCount: number;
  takeOutCount: number;
  walkInCount: number;
  onlineCount: number;
  completedOrders?: number;
  pendingOrders?: number;
  popularItems?: Array<{ name: string; quantity: number; revenue: number }>;
}

