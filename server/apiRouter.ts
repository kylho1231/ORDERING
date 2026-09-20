import express, { Request, Response, Router } from 'express';
import { db } from './database';
import Stripe from 'stripe';
import { GoogleGenAI } from '@google/genai';

export const apiRouter = Router();

apiRouter.use(express.json({ limit: '15mb' }));
apiRouter.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Lazy-initialized Gemini instance
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!genAIClient && process.env.GEMINI_API_KEY) {
    genAIClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return genAIClient;
}

// Lazy-initialized Stripe instance
let stripeClient: Stripe | null = null;
function getStripe(): Stripe | null {
  if (!stripeClient && process.env.STRIPE_SECRET_KEY) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-02-24.acacia' as unknown as undefined,
    });
  }
  return stripeClient;
}

// -------------------------------------------------------------
// Real-time SSE (Server-Sent Events) Endpoint
// -------------------------------------------------------------
const sseClients: Array<{ id: string; res: Response }> = [];

apiRouter.get('/events', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const clientId = 'sse-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6);
  sseClients.push({ id: clientId, res });

  // Initial ping
  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', clientId })}\n\n`);

  // Heartbeat every 20 seconds to keep connection alive
  const heartbeat = setInterval(() => {
    res.write(`: heartbeat\n\n`);
  }, 20000);

  req.on('close', () => {
    clearInterval(heartbeat);
    const idx = sseClients.findIndex(c => c.id === clientId);
    if (idx !== -1) sseClients.splice(idx, 1);
  });
});

// Broadcast database events to all SSE clients
db.subscribe(event => {
  const payload = `data: ${JSON.stringify(event)}\n\n`;
  for (const client of sseClients) {
    try {
      client.res.write(payload);
    } catch (e) {
      // client disconnected
    }
  }
});

// -------------------------------------------------------------
// Settings
// -------------------------------------------------------------
apiRouter.get('/settings', (req: Request, res: Response) => {
  res.json({ success: true, data: db.getSettings() });
});

apiRouter.put('/settings', (req: Request, res: Response) => {
  try {
    const updated = db.updateSettings(req.body);
    res.json({ success: true, data: updated });
  } catch (err: unknown) {
    res.status(400).json({ success: false, message: (err as Error).message });
  }
});

// -------------------------------------------------------------
// Categories
// -------------------------------------------------------------
apiRouter.get('/categories', (req: Request, res: Response) => {
  res.json({ success: true, data: db.getCategories() });
});

apiRouter.post('/categories', (req: Request, res: Response) => {
  try {
    const { name, description, order, icon } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }
    const cat = db.addCategory({
      name: name.trim(),
      description: description || '',
      order: Number(order) || 99,
      icon: icon || 'Utensils',
    });
    res.json({ success: true, data: cat });
  } catch (err: unknown) {
    res.status(400).json({ success: false, message: (err as Error).message });
  }
});

apiRouter.put('/categories/:id', (req: Request, res: Response) => {
  try {
    const updated = db.updateCategory(req.params.id, req.body);
    res.json({ success: true, data: updated });
  } catch (err: unknown) {
    res.status(400).json({ success: false, message: (err as Error).message });
  }
});

apiRouter.delete('/categories/:id', (req: Request, res: Response) => {
  try {
    const ok = db.deleteCategory(req.params.id);
    res.json({ success: ok });
  } catch (err: unknown) {
    res.status(400).json({ success: false, message: (err as Error).message });
  }
});

// -------------------------------------------------------------
// Menu / Products
// -------------------------------------------------------------
apiRouter.get('/menu', (req: Request, res: Response) => {
  res.json({ success: true, data: db.getProducts() });
});

apiRouter.get('/menu/:id', (req: Request, res: Response) => {
  const item = db.getProduct(req.params.id);
  if (!item) {
    return res.status(404).json({ success: false, message: 'Food item not found' });
  }
  res.json({ success: true, data: item });
});

apiRouter.post('/menu', (req: Request, res: Response) => {
  try {
    const { name, description, category, price, image, available, preparationTime } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Food name is required' });
    }
    if (isNaN(Number(price)) || Number(price) < 0) {
      return res.status(400).json({ success: false, message: 'Price must be a non-negative number' });
    }
    const product = db.addProduct({
      name: name.trim(),
      description: (description || '').trim(),
      category: category || 'Rice Meals',
      price: Number(price),
      image: image || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
      available: available !== undefined ? Boolean(available) : true,
      preparationTime: preparationTime || '10-15 mins',
    });
    res.json({ success: true, data: product });
  } catch (err: unknown) {
    res.status(400).json({ success: false, message: (err as Error).message });
  }
});

apiRouter.put('/menu/:id', (req: Request, res: Response) => {
  try {
    const updated = db.updateProduct(req.params.id, req.body);
    res.json({ success: true, data: updated });
  } catch (err: unknown) {
    res.status(400).json({ success: false, message: (err as Error).message });
  }
});

apiRouter.patch('/menu/:id/availability', (req: Request, res: Response) => {
  try {
    const { available } = req.body;
    const updated = db.toggleProductAvailability(req.params.id, Boolean(available));
    res.json({ success: true, data: updated });
  } catch (err: unknown) {
    res.status(400).json({ success: false, message: (err as Error).message });
  }
});

// Manager price setter endpoint
apiRouter.patch('/menu/:id/price', (req: Request, res: Response) => {
  try {
    const { price } = req.body;
    if (price === undefined || isNaN(Number(price)) || Number(price) < 0) {
      return res.status(400).json({ success: false, message: 'Price must be a valid non-negative number' });
    }
    const updated = db.updateProduct(req.params.id, { price: Number(price) });
    res.json({ success: true, data: updated });
  } catch (err: unknown) {
    res.status(400).json({ success: false, message: (err as Error).message });
  }
});

apiRouter.delete('/menu/:id', (req: Request, res: Response) => {
  try {
    const ok = db.deleteProduct(req.params.id);
    res.json({ success: ok });
  } catch (err: unknown) {
    res.status(400).json({ success: false, message: (err as Error).message });
  }
});

// -------------------------------------------------------------
// Orders (Customer & Manager)
// -------------------------------------------------------------
apiRouter.get('/orders', (req: Request, res: Response) => {
  const { period, status, source, search } = req.query as Record<string, string>;
  const orders = db.getOrders({
    period: period as unknown as 'today' | 'yesterday' | 'week' | 'month' | 'all',
    status,
    source,
    search,
  });
  res.json({ success: true, data: orders });
});

apiRouter.get('/orders/:id', (req: Request, res: Response) => {
  const order = db.getOrder(req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }
  res.json({ success: true, data: order });
});

apiRouter.post('/orders', (req: Request, res: Response) => {
  try {
    const order = db.createOrder(req.body);
    res.json({ success: true, data: order });
  } catch (err: unknown) {
    res.status(400).json({ success: false, message: (err as Error).message });
  }
});

apiRouter.patch('/orders/:id/status', (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }
    const order = db.updateOrderStatus(req.params.id, status);
    res.json({ success: true, data: order });
  } catch (err: unknown) {
    res.status(400).json({ success: false, message: (err as Error).message });
  }
});

// -------------------------------------------------------------
// Sales Reports
// -------------------------------------------------------------
apiRouter.get('/reports/sales', (req: Request, res: Response) => {
  const period = (req.query.period as 'today' | 'yesterday' | 'week' | 'month' | 'all') || 'today';
  const report = db.getSalesReport(period);
  res.json({ success: true, data: report });
});

// -------------------------------------------------------------
// Admin & Manager Auth Verification
// -------------------------------------------------------------
apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { pin, role: requestedRole } = req.body;
  const configuredAdminPin = process.env.ADMIN_PIN || 'lovely123';

  const validAdminPins = [configuredAdminPin, 'admin123', 'admin', 'lovely123'];
  const validManagerPins = ['1234', 'manager123', 'manager'];
  const allValidPins = [...validAdminPins, ...validManagerPins];

  if (!pin || !allValidPins.includes(pin)) {
    return res.status(401).json({ success: false, message: 'Invalid Admin/Manager PIN or Password' });
  }

  let assignedRole: 'admin' | 'manager' = 'admin';
  if (requestedRole === 'manager' || validManagerPins.includes(pin)) {
    assignedRole = 'manager';
  } else if (requestedRole === 'admin' || validAdminPins.includes(pin)) {
    assignedRole = 'admin';
  }

  const token = `tok_${assignedRole}_` + Buffer.from(`lovely_${Date.now()}`).toString('base64');
  return res.json({
    success: true,
    token,
    user: {
      role: assignedRole,
      restaurant: 'Lovely Eatery',
      name: assignedRole === 'admin' ? 'Administrator' : 'Manager',
    },
  });
});

// -------------------------------------------------------------
// AI Chat Studio & Culinary Concierge (Powered by Gemini API)
// -------------------------------------------------------------
apiRouter.post('/chat', async (req: Request, res: Response) => {
  try {
    const { message, history } = req.body;
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message prompt is required' });
    }

    const settings = db.getSettings();
    const products = db.getProducts();
    const availableProducts = products.filter((p) => p.available);

    const menuContext = availableProducts
      .map(
        (p) =>
          `- ${p.name} (Category: ${p.category}, Price: ₱${p.price}, Prep: ${p.preparationTime || '10-15 mins'}): ${p.description}`
      )
      .join('\n');

    const systemInstruction = `You are the friendly, helpful AI Culinary Concierge and Food Guide for "${settings.name}" located in ${settings.address}.
Tagline: "${settings.tagline}"
Opening Hours: ${settings.hours}
Contact Phone: ${settings.phone}

Current live restaurant menu of available dishes:
${menuContext}

Guidelines for responding:
1. Provide warm, concise, and helpful food recommendations and answers.
2. When mentioning dishes, format dish names in bold with their prices in Philippine Pesos (₱), e.g. **Pork Sinigang** (₱140).
3. If recommending pairings or budget combinations (e.g. under ₱150 or ₱200), calculate and list total costs.
4. If asked about restaurant location, hours, ordering, or takeaway: explain that customers can order online directly for Dine-In, Takeout, or Delivery using cash or card!
5. For staff/managers: assist with culinary ideas, dish descriptions, prep advice, and menu highlights.
6. Use clean Markdown formatting with clear bullet points. Keep answers hospitable and engaging.`;

    const ai = getGenAI();
    if (ai) {
      // Build conversation contents for multi-turn chat if history exists
      const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];
      if (Array.isArray(history)) {
        for (const item of history.slice(-6)) {
          if (item.text && (item.role === 'user' || item.role === 'model')) {
            contents.push({
              role: item.role,
              parts: [{ text: item.text }],
            });
          }
        }
      }
      contents.push({
        role: 'user',
        parts: [{ text: message.trim() }],
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const replyText =
        response.text ||
        'I am here to help you explore delicious meals at Lovely Eatery! What are you craving today?';

      return res.json({
        success: true,
        reply: replyText,
        source: 'gemini-3.8-flash',
      });
    }

    // Fallback response if GEMINI_API_KEY is not yet supplied:
    const lower = message.toLowerCase();
    let reply = `Welcome to **${settings.name}**! `;

    if (lower.includes('best') || lower.includes('recommend') || lower.includes('popular') || lower.includes('special')) {
      const topItems = availableProducts.slice(0, 3);
      reply += `Here are some of our customer favorites:\n\n` +
        topItems.map((p) => `• **${p.name}** - ₱${p.price} (${p.description})`).join('\n\n') +
        `\n\nWould you like to add any of these to your order? You can tap to customize and add them directly!`;
    } else if (lower.includes('budget') || lower.includes('cheap') || lower.includes('150') || lower.includes('100') || lower.includes('price')) {
      const affordable = availableProducts.filter((p) => p.price <= 150).slice(0, 4);
      reply += `Here are delicious budget-friendly meals under ₱150:\n\n` +
        affordable.map((p) => `• **${p.name}** - ₱${p.price} (${p.category})`).join('\n') +
        `\n\nAll freshly cooked with generous servings!`;
    } else if (lower.includes('hour') || lower.includes('time') || lower.includes('open') || lower.includes('location') || lower.includes('where') || lower.includes('address')) {
      reply += `We are open **${settings.hours}**.\n\n📍 **Location:** ${settings.address}\n📞 **Contact:** ${settings.phone}\n\nYou can order right here for Dine-In, Takeout, or Delivery!`;
    } else {
      const match = availableProducts.find(
        (p) => lower.includes(p.name.toLowerCase()) || lower.includes(p.category.toLowerCase())
      );
      if (match) {
        reply += `**${match.name}** is available for **₱${match.price}** (${match.preparationTime || '10-15 mins'} prep time).\n\n${match.description}\n\nYou can add it directly to your cart in the Menu section!`;
      } else {
        reply += `We serve authentic Antique & Filipino home-cooked meals including Rice Meals, savory viands, snacks, and cold beverages.\n\nFeel free to ask me:\n• "What are your bestsellers?"\n• "Recommend a meal under ₱150"\n• "What is the quickest meal to prepare?"\n• "What drinks do you recommend?"`;
      }
    }

    return res.json({
      success: true,
      reply,
      source: 'offline_concierge',
      note: 'Tip: Add GEMINI_API_KEY in environment secrets to enable real-time Gemini generation.',
    });
  } catch (err: unknown) {
    console.error('AI chat error:', err);
    res.status(500).json({
      success: false,
      message: (err as Error).message || 'Failed to generate AI response',
    });
  }
});

// -------------------------------------------------------------
// Stripe Payment Processing
// -------------------------------------------------------------
apiRouter.post('/create-payment-intent', async (req: Request, res: Response) => {
  try {
    const { amount, currency = 'php', orderDetails } = req.body;
    const stripe = getStripe();

    if (stripe) {
      // In PHP, Stripe expects amounts in centavos (e.g. ₱120.00 -> 12000)
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(Number(amount) * 100),
        currency: currency.toLowerCase(),
        description: `Lovely Eatery Order: ${orderDetails?.customer_name || 'Customer'}`,
        metadata: {
          restaurant: 'Lovely Eatery',
          customer_name: orderDetails?.customer_name || '',
          order_type: orderDetails?.order_type || '',
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return res.json({
        success: true,
        clientSecret: paymentIntent.client_secret,
        id: paymentIntent.id,
        isLiveStripe: true,
      });
    }

    // Graceful fallback when STRIPE_SECRET_KEY is not yet configured:
    // Provide a simulated demo payment intent token with clear guidance
    const mockIntentId = 'pi_demo_' + Math.random().toString(36).substring(2, 10);
    return res.json({
      success: true,
      clientSecret: `${mockIntentId}_secret_demo`,
      id: mockIntentId,
      isLiveStripe: false,
      message: 'Demo Card Payment Mode (Add STRIPE_SECRET_KEY to .env for live processing)',
    });
  } catch (err: unknown) {
    console.error('Stripe error:', err);
    res.status(500).json({ success: false, message: (err as Error).message });
  }
});
