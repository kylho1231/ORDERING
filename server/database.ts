import fs from 'fs';
import path from 'path';
import { Category, Product, Order, BusinessSettings, OrderItem } from '../src/types';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'eatery-data.json');

interface DatabaseSchema {
  settings: BusinessSettings;
  categories: Category[];
  products: Product[];
  orders: Order[];
  orderCounter: number;
}

const DEFAULT_SETTINGS: BusinessSettings = {
  name: 'LOVELY EATERY',
  tagline: 'Delicious food, made for you.',
  address: 'Business Park, Barangay 5, San Jose de Buenavista, Antique, Philippines',
  phone: '+63 917 890 2345',
  email: 'lovelyeatery.antique@gmail.com',
  hours: 'Monday – Sunday: 8:00 AM – 8:30 PM',
  logo_url: '/icon.svg',
  receipt_footer: 'Salamat gid sa pagkaon sa Lovely Eatery! Please come again.',
  currency_symbol: '₱',
  currency_code: 'PHP',
};

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-rice', name: 'Rice Meals', description: 'Freshly cooked rice plates with classic Filipino viands', order: 1, icon: 'Utensils' },
  { id: 'cat-main', name: 'Main Dishes', description: 'Flavorful viands and Antique specialties perfect for sharing', order: 2, icon: 'Flame' },
  { id: 'cat-snacks', name: 'Snacks', description: 'Crispy snacks, merienda favorites, and light bites', order: 3, icon: 'Cookie' },
  { id: 'cat-drinks', name: 'Drinks', description: 'Chilled juices, house-brewed iced tea, and cold beverages', order: 4, icon: 'CupSoda' },
  { id: 'cat-desserts', name: 'Desserts', description: 'Authentic local sweets and homemade delicacies', order: 5, icon: 'Cake' },
];

const DEFAULT_PRODUCTS: Product[] = [
  // Rice Meals
  {
    id: 'prod-adobo-rice',
    name: 'Chicken Adobo Rice Meal',
    description: 'Tender chicken braised in garlic, cane vinegar, dark soy sauce, and aromatic bay leaves, served over fragrant steaming jasmine rice.',
    category: 'Rice Meals',
    price: 120,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    available: true,
    preparationTime: '10-15 mins',
  },
  {
    id: 'prod-tapsilog',
    name: 'Beef Tapa Silog (Tapsilog)',
    description: 'Thinly sliced cured sweet-savory beef sirloin paired with golden garlic sinangag rice and a sunny-side-up farm egg.',
    category: 'Rice Meals',
    price: 130,
    image: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=800&q=80',
    available: true,
    preparationTime: '10-12 mins',
  },
  {
    id: 'prod-lechon-kawali',
    name: 'Lechon Kawali with Rice',
    description: 'Pork belly boiled till tender then deep-fried to super crispy perfection. Served with Mang Tomas style liver sauce and rice.',
    category: 'Rice Meals',
    price: 150,
    image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=800&q=80',
    available: true,
    preparationTime: '12-15 mins',
  },
  {
    id: 'prod-sisig-rice',
    name: 'Sizzling Pork Sisig with Rice & Egg',
    description: 'Finely minced seasoned pork jowl and liver with onions, native chili, calamansi citrus zest, and topped with fresh egg.',
    category: 'Rice Meals',
    price: 135,
    image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80',
    available: true,
    preparationTime: '10-15 mins',
  },
  {
    id: 'prod-bangus-silog',
    name: 'Daing na Bangus Silog',
    description: 'Pan-fried marinated milkfish belly with garlic vinegar, served alongside garlic fried rice and sunny egg.',
    category: 'Rice Meals',
    price: 125,
    image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80',
    available: true,
    preparationTime: '12-15 mins',
  },

  // Main Dishes
  {
    id: 'prod-kbl-antique',
    name: 'Antique KBL (Kadyos, Baboy, Langka)',
    description: 'Authentic Antique heirloom stew with tender pork chunks, black pigeon peas (kadyos), and young jackfruit soured naturally with batwan fruit.',
    category: 'Main Dishes',
    price: 170,
    image: 'https://images.unsplash.com/photo-1547496502-affa22d38842?auto=format&fit=crop&w=800&q=80',
    available: true,
    preparationTime: '15-20 mins',
  },
  {
    id: 'prod-sinigang-pork',
    name: 'Pork Sinigang sa Sampalok',
    description: 'Hearty sour tamarind soup bursting with tender pork ribs, water spinach (kangkong), radish, string beans, and green finger chili.',
    category: 'Main Dishes',
    price: 160,
    image: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=800&q=80',
    available: true,
    preparationTime: '15 mins',
  },
  {
    id: 'prod-crispy-pata',
    name: 'Crispy Pata Special (Sharing)',
    description: 'Whole pork trotter deep-fried to a crackling golden crunch on the outside while staying succulent inside. Served with spiced soy vinegar dip.',
    category: 'Main Dishes',
    price: 420,
    image: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?auto=format&fit=crop&w=800&q=80',
    available: true,
    preparationTime: '20-25 mins',
  },
  {
    id: 'prod-beef-karekare',
    name: 'Creamy Beef Kare-Kare',
    description: 'Slow-simmered beef shank and tripe in rich peanut sauce with bok choy, eggplant, string beans, and savory sautéed bagoong alamang.',
    category: 'Main Dishes',
    price: 210,
    image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80',
    available: true,
    preparationTime: '15-20 mins',
  },
  {
    id: 'prod-pancit-guisado',
    name: 'Pancit Canton & Bihon Guisado',
    description: 'Savory stir-fried noodles loaded with shredded native chicken, pork strips, carrots, cabbage, and calamansi wedges.',
    category: 'Main Dishes',
    price: 110,
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80',
    available: true,
    preparationTime: '10-15 mins',
  },

  // Snacks
  {
    id: 'prod-lumpiang-shanghai',
    name: 'Crispy Lumpiang Shanghai (6 pcs)',
    description: 'Golden fried minced pork and vegetable egg rolls served with sweet-sour chili dipping sauce.',
    category: 'Snacks',
    price: 85,
    image: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=800&q=80',
    available: true,
    preparationTime: '8-10 mins',
  },
  {
    id: 'prod-tokwat-baboy',
    name: "Classic Tokwa't Baboy",
    description: 'Crispy deep-fried tofu cubes and tender pork slices tossed in tangy soy sauce, cane vinegar, chopped red onions, and bird’s eye chili.',
    category: 'Snacks',
    price: 95,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
    available: true,
    preparationTime: '10 mins',
  },
  {
    id: 'prod-halo-halo',
    name: 'Special Halo-Halo Antiqueña',
    description: 'Crushed shaved ice layered with sweet red beans, nata de coco, kaong, jackfruit, topped with ube halaya, rich leche flan, and creamy milk.',
    category: 'Snacks',
    price: 85,
    image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=800&q=80',
    available: true,
    preparationTime: '5-8 mins',
  },

  // Drinks
  {
    id: 'prod-iced-tea',
    name: 'House Signature Iced Tea (16oz)',
    description: 'Freshly brewed black tea infused with natural lemon juice, calamansi, and pure cane sugar syrup over crushed ice.',
    category: 'Drinks',
    price: 30,
    image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=800&q=80',
    available: true,
    preparationTime: '2-3 mins',
  },
  {
    id: 'prod-calamansi-juice',
    name: 'Fresh Native Calamansi Juice',
    description: 'Real freshly squeezed Antique calamansi fruit with organic wild honey served iced. High in vitamin C and very refreshing.',
    category: 'Drinks',
    price: 40,
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80',
    available: true,
    preparationTime: '3-5 mins',
  },
  {
    id: 'prod-sagot-gulaman',
    name: "Chilled Sago't Gulaman",
    description: 'Traditional brown sugar beverage infused with fragrant banana essence, chewy tapioca sago pearls, and grass jelly cubes.',
    category: 'Drinks',
    price: 35,
    image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&q=80',
    available: true,
    preparationTime: '2-3 mins',
  },
  {
    id: 'prod-mineral-water',
    name: 'Bottled Mineral Water (500ml)',
    description: 'Pure chilled bottled spring mineral water.',
    category: 'Drinks',
    price: 20,
    image: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=800&q=80',
    available: true,
    preparationTime: '1 min',
  },

  // Desserts
  {
    id: 'prod-leche-flan',
    name: 'Creamy Leche Flan Slice',
    description: 'Velvety smooth steamed caramel egg custard made with farm egg yolks and condensed milk, drenched in amber caramel syrup.',
    category: 'Desserts',
    price: 60,
    image: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=800&q=80',
    available: true,
    preparationTime: '2 mins',
  },
  {
    id: 'prod-ube-turon',
    name: 'Ube & Langka Turon (3 pcs)',
    description: 'Crisp spring roll wrap filled with sweet saba banana, jackfruit slices, and creamy ube jam, rolled in brown sugar glaze.',
    category: 'Desserts',
    price: 50,
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
    available: true,
    preparationTime: '5-8 mins',
  },
];

const DEFAULT_ORDERS: Order[] = [
  {
    id: 'ord-demo-001',
    order_number: 'LE-20260920-001',
    customer_name: 'Maria Santos',
    contact_number: '09171234567',
    order_type: 'Dine-In',
    table_number: '4',
    status: 'Preparing',
    subtotal: 280,
    total: 280,
    notes: 'Extra calamansi please for the sisig',
    source: 'ONLINE',
    payment_method: 'Cash',
    payment_status: 'Pending',
    items: [
      {
        product_id: 'prod-sisig-rice',
        product_name_snapshot: 'Sizzling Pork Sisig with Rice & Egg',
        quantity: 1,
        unit_price_snapshot: 135,
        subtotal: 135,
        notes: 'Less spicy',
      },
      {
        product_id: 'prod-adobo-rice',
        product_name_snapshot: 'Chicken Adobo Rice Meal',
        quantity: 1,
        unit_price_snapshot: 120,
        subtotal: 120,
      },
      {
        product_id: 'prod-iced-tea',
        product_name_snapshot: 'House Signature Iced Tea (16oz)',
        quantity: 1,
        unit_price_snapshot: 30,
        subtotal: 30,
      },
    ],
    created_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  },
  {
    id: 'ord-demo-002',
    order_number: 'WI-20260920-002',
    customer_name: 'Walk-in Customer',
    contact_number: '',
    order_type: 'Take-Out',
    status: 'Ready',
    subtotal: 235,
    total: 235,
    notes: 'Take-out bag',
    source: 'WALK_IN',
    payment_method: 'Cash',
    payment_status: 'Paid',
    items: [
      {
        product_id: 'prod-lechon-kawali',
        product_name_snapshot: 'Lechon Kawali with Rice',
        quantity: 1,
        unit_price_snapshot: 150,
        subtotal: 150,
      },
      {
        product_id: 'prod-lumpiang-shanghai',
        product_name_snapshot: 'Crispy Lumpiang Shanghai (6 pcs)',
        quantity: 1,
        unit_price_snapshot: 85,
        subtotal: 85,
      },
    ],
    created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: 'ord-demo-003',
    order_number: 'LE-20260920-003',
    customer_name: 'Juan Dela Cruz',
    contact_number: '09289876543',
    order_type: 'Dine-In',
    table_number: '2',
    status: 'Pending',
    subtotal: 160,
    total: 160,
    notes: '',
    source: 'ONLINE',
    payment_method: 'Card',
    payment_status: 'Paid',
    items: [
      {
        product_id: 'prod-tapsilog',
        product_name_snapshot: 'Beef Tapa Silog (Tapsilog)',
        quantity: 1,
        unit_price_snapshot: 130,
        subtotal: 130,
      },
      {
        product_id: 'prod-iced-tea',
        product_name_snapshot: 'House Signature Iced Tea (16oz)',
        quantity: 1,
        unit_price_snapshot: 30,
        subtotal: 30,
      },
    ],
    created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  }
];

class Database {
  private data: DatabaseSchema;
  private subscribers: Array<(event: { type: string; payload: unknown }) => void> = [];

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.error('Failed to load database file, initializing defaults:', err);
    }

    const initial: DatabaseSchema = {
      settings: DEFAULT_SETTINGS,
      categories: DEFAULT_CATEGORIES,
      products: DEFAULT_PRODUCTS,
      orders: DEFAULT_ORDERS,
      orderCounter: 4,
    };
    this.saveData(initial);
    return initial;
  }

  private saveData(data: DatabaseSchema) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write database file:', err);
    }
  }

  public subscribe(cb: (event: { type: string; payload: unknown }) => void) {
    this.subscribers.push(cb);
    return () => {
      this.subscribers = this.subscribers.filter(s => s !== cb);
    };
  }

  private notify(type: string, payload: unknown) {
    for (const sub of this.subscribers) {
      try {
        sub({ type, payload });
      } catch (err) {
        console.error('Error notifying subscriber:', err);
      }
    }
  }

  // --- Settings ---
  public getSettings(): BusinessSettings {
    return this.data.settings;
  }

  public updateSettings(partial: Partial<BusinessSettings>): BusinessSettings {
    this.data.settings = { ...this.data.settings, ...partial };
    this.saveData(this.data);
    this.notify('SETTINGS_UPDATED', this.data.settings);
    return this.data.settings;
  }

  // --- Categories ---
  public getCategories(): Category[] {
    return [...this.data.categories].sort((a, b) => a.order - b.order);
  }

  public addCategory(cat: Omit<Category, 'id'>): Category {
    const id = 'cat-' + Date.now().toString(36);
    const newCat: Category = { ...cat, id };
    this.data.categories.push(newCat);
    this.saveData(this.data);
    this.notify('CATEGORIES_UPDATED', this.data.categories);
    return newCat;
  }

  public updateCategory(id: string, partial: Partial<Category>): Category {
    const idx = this.data.categories.findIndex(c => c.id === id);
    if (idx === -1) throw new Error('Category not found');
    this.data.categories[idx] = { ...this.data.categories[idx], ...partial };
    this.saveData(this.data);
    this.notify('CATEGORIES_UPDATED', this.data.categories);
    return this.data.categories[idx];
  }

  public deleteCategory(id: string): boolean {
    const cat = this.data.categories.find(c => c.id === id);
    if (!cat) return false;
    this.data.categories = this.data.categories.filter(c => c.id !== id);
    this.saveData(this.data);
    this.notify('CATEGORIES_UPDATED', this.data.categories);
    return true;
  }

  // --- Products ---
  public getProducts(): Product[] {
    return this.data.products;
  }

  public getProduct(id: string): Product | undefined {
    return this.data.products.find(p => p.id === id);
  }

  public addProduct(p: Omit<Product, 'id'>): Product {
    const id = 'prod-' + Date.now().toString(36);
    const newProduct: Product = {
      ...p,
      id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.data.products.push(newProduct);
    this.saveData(this.data);
    this.notify('PRODUCTS_UPDATED', this.data.products);
    return newProduct;
  }

  public updateProduct(id: string, partial: Partial<Product>): Product {
    const idx = this.data.products.findIndex(p => p.id === id);
    if (idx === -1) throw new Error('Product not found');
    this.data.products[idx] = {
      ...this.data.products[idx],
      ...partial,
      updated_at: new Date().toISOString(),
    };
    this.saveData(this.data);
    this.notify('PRODUCTS_UPDATED', this.data.products);
    return this.data.products[idx];
  }

  public toggleProductAvailability(id: string, available: boolean): Product {
    return this.updateProduct(id, { available });
  }

  public deleteProduct(id: string): boolean {
    const exists = this.data.products.some(p => p.id === id);
    if (!exists) return false;
    this.data.products = this.data.products.filter(p => p.id !== id);
    this.saveData(this.data);
    this.notify('PRODUCTS_UPDATED', this.data.products);
    return true;
  }

  // --- Orders ---
  public getOrders(filters?: {
    period?: 'today' | 'yesterday' | 'week' | 'month' | 'all';
    status?: string;
    source?: string;
    search?: string;
  }): Order[] {
    let result = [...this.data.orders];

    if (filters?.source) {
      result = result.filter(o => o.source === filters.source);
    }
    if (filters?.status) {
      result = result.filter(o => o.status === filters.status);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        o =>
          o.order_number.toLowerCase().includes(q) ||
          o.customer_name.toLowerCase().includes(q) ||
          (o.table_number && o.table_number.toLowerCase().includes(q))
      );
    }

    if (filters?.period && filters.period !== 'all') {
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      result = result.filter(o => {
        const orderDate = new Date(o.created_at);
        if (filters.period === 'today') {
          return orderDate >= startOfToday;
        }
        if (filters.period === 'yesterday') {
          const startOfYesterday = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000);
          return orderDate >= startOfYesterday && orderDate < startOfToday;
        }
        if (filters.period === 'week') {
          const sevenDaysAgo = new Date(startOfToday.getTime() - 7 * 24 * 60 * 60 * 1000);
          return orderDate >= sevenDaysAgo;
        }
        if (filters.period === 'month') {
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          return orderDate >= startOfMonth;
        }
        return true;
      });
    }

    // Sort newest first
    return result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public getOrder(idOrNumber: string): Order | undefined {
    return this.data.orders.find(o => o.id === idOrNumber || o.order_number === idOrNumber);
  }

  public createOrder(input: {
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
  }): Order {
    if (!input.items || input.items.length === 0) {
      throw new Error('No items in your cart.');
    }

    // Validation
    const customer_name = (input.customer_name || '').trim() || (input.source === 'WALK_IN' ? 'Walk-in Customer' : '');
    if (!customer_name) {
      throw new Error('Please enter your name.');
    }

    if (input.order_type === 'Dine-In' && (!input.table_number || !input.table_number.trim())) {
      throw new Error('Please enter a table number for dine-in.');
    }

    // Generate Unique Order Number: LE-YYYYMMDD-XXX or WI-YYYYMMDD-XXX
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const prefix = input.source === 'WALK_IN' ? 'WI' : 'LE';
    const num = String(this.data.orderCounter++).padStart(3, '0');
    const order_number = `${prefix}-${yyyy}${mm}${dd}-${num}`;

    // Validate products and compute snapshot
    let subtotal = 0;
    const validatedItems: OrderItem[] = [];

    for (const item of input.items) {
      if (item.quantity <= 0) {
        throw new Error('Quantity must be greater than zero.');
      }
      const product = this.getProduct(item.product_id);
      if (!product) {
        throw new Error(`Product not found: ${item.product_id}`);
      }
      if (!product.available) {
        throw new Error(`"${product.name}" is currently sold out.`);
      }

      const itemSubtotal = product.price * item.quantity;
      subtotal += itemSubtotal;

      validatedItems.push({
        id: 'item-' + Math.random().toString(36).substring(2, 9),
        product_id: product.id,
        product_name_snapshot: product.name,
        quantity: item.quantity,
        unit_price_snapshot: product.price,
        subtotal: itemSubtotal,
        notes: item.notes || '',
      });
    }

    const order: Order = {
      id: 'ord-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6),
      order_number,
      customer_name,
      contact_number: (input.contact_number || '').trim(),
      order_type: input.order_type,
      table_number: input.order_type === 'Dine-In' ? input.table_number?.trim() : undefined,
      status: input.source === 'WALK_IN' ? 'Confirmed' : 'Pending',
      subtotal,
      total: subtotal,
      notes: (input.notes || '').trim(),
      source: input.source,
      payment_method: input.payment_method || (input.source === 'WALK_IN' ? 'Cash' : 'Counter'),
      payment_status: input.payment_status || (input.source === 'WALK_IN' ? 'Paid' : 'Pending'),
      stripe_payment_intent_id: input.stripe_payment_intent_id,
      items: validatedItems,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.data.orders.unshift(order);
    this.saveData(this.data);

    // Real-time broadcast
    this.notify('ORDER_CREATED', order);
    return order;
  }

  public updateOrderStatus(idOrNumber: string, status: Order['status']): Order {
    const order = this.getOrder(idOrNumber);
    if (!order) throw new Error('Order not found');
    order.status = status;
    order.updated_at = new Date().toISOString();
    if (status === 'Completed') {
      order.payment_status = 'Paid';
    }
    this.saveData(this.data);
    this.notify('ORDER_STATUS_UPDATED', order);
    return order;
  }

  // --- Reports ---
  public getSalesReport(period: 'today' | 'yesterday' | 'week' | 'month' | 'all' = 'today'): {
    period: string;
    totalSales: number;
    orderCount: number;
    itemsSold: number;
    dineInSales: number;
    takeOutSales: number;
    walkInOrders: number;
    onlineOrders: number;
    completedOrders: number;
    pendingOrders: number;
  } {
    const orders = this.getOrders({ period });
    
    // Only non-cancelled orders contribute to sales
    const validOrders = orders.filter(o => o.status !== 'Cancelled');

    let totalSales = 0;
    let dineInSales = 0;
    let takeOutSales = 0;
    let itemsSold = 0;
    let walkInOrders = 0;
    let onlineOrders = 0;
    let completedOrders = 0;
    let pendingOrders = 0;

    for (const o of orders) {
      if (o.status === 'Pending') pendingOrders++;
      if (o.status === 'Completed') completedOrders++;
    }

    for (const o of validOrders) {
      totalSales += o.total;
      if (o.order_type === 'Dine-In') {
        dineInSales += o.total;
      } else {
        takeOutSales += o.total;
      }
      if (o.source === 'WALK_IN') {
        walkInOrders++;
      } else {
        onlineOrders++;
      }
      for (const it of o.items) {
        itemsSold += it.quantity;
      }
    }

    return {
      period,
      totalSales,
      orderCount: validOrders.length,
      itemsSold,
      dineInSales,
      takeOutSales,
      walkInOrders,
      onlineOrders,
      completedOrders,
      pendingOrders,
    };
  }
}

export const db = new Database();
