/**
 * ============================================================================
 * 0 DEGREE CAFFE — FULL-STACK NODE.JS / EXPRESS BACKEND API (server.js)
 * ============================================================================
 * Implements the 0 Degree Caffe v2.0 Event-Driven Architecture:
 *  - Role-Based Authentication & Session Tokens (Customer & Staff Admin)
 *  - 25-Item Menu Catalog, Tag/Keyword Search & Promotional Rules
 *  - 3-Tier Delivery Speed & Dynamic Fee Pricing Engine (Priority, Standard, Saver)
 *  - Order Lifecycle & Pre-Seal Cancellation / Automated Refund Saga
 *  - Recipe Bill-of-Materials (BOM) Raw Ingredient Auto-Deduction & Restocking
 *  - Customer Profile, Loyalty Points & Saved Addresses Management
 *
 * Run standalone with: `node server.js` (requires Node 18+ or Express installed)
 * ============================================================================
 */

const express = require('express');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// ============================================================================
// 1. IN-MEMORY TRANSACTIONAL STORE (SEEDED WITH 0 DEGREE CAFFE DATA)
// ============================================================================
const db = {
  branches: [
    { id: 'lapaz', name: 'La Paz Flagship', address: 'Luna St., La Paz District, Iloilo City', pickupMins: '10–12 mins', hours: '6:30 AM – 10:00 PM' },
    { id: 'center', name: 'City Center', address: 'Gen. Luna Ave., Ground Flr, Iloilo City', pickupMins: '12–15 mins', hours: '7:00 AM – 9:30 PM' },
    { id: 'waterfront', name: 'Waterfront Kiosk', address: 'Esplanade Boardwalk Pier 2, Iloilo City', pickupMins: '8–10 mins', hours: '6:00 AM – 11:00 PM' }
  ],

  deliveryTiers: [
    { id: 'priority', name: 'Priority Express', eta: '15–20 mins', fee: 75, badge: 'Fastest' },
    { id: 'standard', name: 'Standard Delivery', eta: '30–40 mins', fee: 45, badge: 'Popular' },
    { id: 'saver', name: 'Saver / Long Delivery', eta: '55–70 mins', fee: 20, badge: 'Save ₱55' }
  ],

  users: [
    {
      id: 'usr-kyle',
      role: 'user',
      name: 'Kyle Mendoza',
      email: 'kyle.mendoza@0degreecaffe.ph',
      phone: '0917 842 0194',
      points: 340,
      tier: 'Glacier Gold',
      defaultPayment: 'GCash / E-Wallet',
      drinkPreference: 'Oat Milk, 50% Half Sweet, 0° Extra Ice',
      savedAddresses: [
        {
          id: 'addr-1',
          label: 'Home / Condo',
          address: 'Unit 4B, Smallville Complex, Mandurriao, Iloilo City',
          isDefault: true
        },
        {
          id: 'addr-2',
          label: 'Office Studio',
          address: '6F Festive Walk Tower 2, Megaworld Blvd, Iloilo City',
          isDefault: false
        }
      ]
    },
    {
      id: 'usr-admin',
      role: 'admin',
      name: 'Store Manager (Admin)',
      email: 'admin@0degreecaffe.ph',
      phone: '033-320-0000',
      staffTitle: 'Branch Operations & Barista Lead'
    }
  ],

  ingredients: [
    { id: 'ing-arabica-beans', name: 'Benguet & Ethiopian Espresso Beans', category: 'Coffee Beans', unit: 'g', stock: 4800, minThreshold: 1200, restockStep: 1000, adjustStep: 100 },
    { id: 'ing-coldbrew-grounds', name: '0° Sub-Zero Coarse Cold Brew Roast', category: 'Coffee Beans', unit: 'g', stock: 3200, minThreshold: 1000, restockStep: 1000, adjustStep: 100 },
    { id: 'ing-whole-milk', name: 'Fresh Pasteurized Whole Milk', category: 'Dairy & Plant Milks', unit: 'ml', stock: 9500, minThreshold: 2500, restockStep: 2000, adjustStep: 250 },
    { id: 'ing-oat-milk', name: 'Barista Edition Oat Milk', category: 'Dairy & Plant Milks', unit: 'ml', stock: 6400, minThreshold: 2000, restockStep: 2000, adjustStep: 250 },
    { id: 'ing-soy-almond-milk', name: 'Organic Soy & Roasted Almond Milk', category: 'Dairy & Plant Milks', unit: 'ml', stock: 3600, minThreshold: 1500, restockStep: 1500, adjustStep: 250 },
    { id: 'ing-mascarpone-cream', name: 'Guimaras Sea-Salt Mascarpone Cream', category: 'Dairy & Plant Milks', unit: 'g', stock: 1100, minThreshold: 1200, restockStep: 1000, adjustStep: 100 },
    { id: 'ing-condensed-milk', name: 'Caramelized Condensed Milk', category: 'Syrups & Sauces', unit: 'ml', stock: 2800, minThreshold: 800, restockStep: 1000, adjustStep: 100 },
    { id: 'ing-vanilla-caramel-syrup', name: 'Madagascar Vanilla & Burnt Caramel Syrup', category: 'Syrups & Sauces', unit: 'ml', stock: 2400, minThreshold: 750, restockStep: 1000, adjustStep: 100 },
    { id: 'ing-belgian-cacao', name: '70% Dark Belgian Couverture Cacao', category: 'Syrups & Sauces', unit: 'g', stock: 1850, minThreshold: 600, restockStep: 500, adjustStep: 50 },
    { id: 'ing-uji-matcha', name: 'First-Harvest Kyoto Uji Matcha Powder', category: 'Tea & Botanicals', unit: 'g', stock: 420, minThreshold: 500, restockStep: 500, adjustStep: 25 },
    { id: 'ing-culinary-matcha', name: 'Nishio Ceremonial & Pastry Matcha Paste', category: 'Tea & Botanicals', unit: 'g', stock: 850, minThreshold: 350, restockStep: 500, adjustStep: 50 },
    { id: 'ing-coconut-water', name: 'Chilled Single-Origin Young Coconut Water', category: 'Tea & Botanicals', unit: 'ml', stock: 3400, minThreshold: 1200, restockStep: 1500, adjustStep: 250 },
    { id: 'ing-white-choc-sauce', name: 'Belgian White Couverture Chocolate Sauce', category: 'Syrups & Sauces', unit: 'ml', stock: 1650, minThreshold: 600, restockStep: 750, adjustStep: 100 },
    { id: 'ing-hojicha-earl-grey', name: 'Charcoal Hojicha & Ceylon Earl Grey Leaves', category: 'Tea & Botanicals', unit: 'g', stock: 1450, minThreshold: 400, restockStep: 500, adjustStep: 50 },
    { id: 'ing-yuzu-strawberry', name: 'Japanese Yuzu Peel & Wild Strawberry Puree', category: 'Tea & Botanicals', unit: 'ml', stock: 1900, minThreshold: 600, restockStep: 750, adjustStep: 100 },
    { id: 'ing-black-sesame', name: 'Stone-Ground Toasted Black Sesame Paste', category: 'Specialty Pastes', unit: 'g', stock: 950, minThreshold: 400, restockStep: 500, adjustStep: 50 },
    { id: 'ing-pastry-butter-flour', name: 'Cultured Normandy Butter & Laminated Dough', category: 'Bakery Ingredients', unit: 'g', stock: 4500, minThreshold: 1500, restockStep: 2000, adjustStep: 250 },
    { id: 'ing-cream-cheese', name: 'Artisanal Cream Cheese & Pastry Custard', category: 'Bakery Ingredients', unit: 'g', stock: 1300, minThreshold: 1500, restockStep: 1500, adjustStep: 200 },
    { id: 'ing-crystal-ice', name: '0° Sub-Zero Purified Crystal Ice', category: 'Packaging & Ice', unit: 'g', stock: 18000, minThreshold: 5000, restockStep: 5000, adjustStep: 1000 }
  ],

  orders: [
    {
      id: '0DC-804',
      branch: 'La Paz Flagship',
      orderType: 'Delivery',
      deliveryTierName: 'Saver / Long Delivery',
      deliveryTierEta: '55–70 mins',
      customerName: 'Kyle Mendoza',
      customerPhone: '0917 842 0194',
      slot: 'Saver / Long Delivery (55–70 mins)',
      deliveryAddress: 'Unit 4B, Smallville Complex, Mandurriao, Iloilo City',
      paymentMethod: 'GCash / E-Wallet',
      createdAt: 'Just now',
      status: 'Active',
      stageIndex: 1,
      etaSeconds: 3420,
      items: [
        {
          cartId: 'seed-active-1',
          item: { id: 'subzero-nitro', name: '0° Sub-Zero Nitro Blend', isDrink: true, navSection: 'COFFEE', stripCategory: 'Limited Cold Brew' },
          qty: 1,
          unitPrice: 155,
          config: { size: 'Regular', ice: '0° Extra Ice', sweetness: '50% Half Sweet', milk: 'Oat Milk', addons: [] }
        },
        {
          cartId: 'seed-active-2',
          item: { id: 'burnt-basque-cheesecake', name: '0° Chilled Basque Cheesecake', isDrink: false, navSection: 'PASTRIES' },
          qty: 1,
          unitPrice: 195,
          config: { size: 'Regular', pastryPrep: 'Chilled / Room Temp' }
        }
      ],
      subtotal: 350,
      discount: 0,
      deliveryFee: 20,
      vat: 42,
      tip: 18,
      total: 430,
      pointsEarned: 43
    }
  ],

  eventStream: []
};

// ============================================================================
// 2. EVENT BUS PUBLISHER & RECIPE BOM DEDUCTION ENGINE
// ============================================================================
function publishKafkaEvent(topic, payload) {
  const event = {
    eventId: crypto.randomUUID(),
    topic,
    timestamp: new Date().toISOString(),
    payload
  };
  db.eventStream.unshift(event);
  if (db.eventStream.length > 100) db.eventStream.pop();
  return event;
}

function deductRecipeIngredients(orderItems) {
  const deductions = {};
  const addDeduction = (id, amount) => {
    deductions[id] = (deductions[id] || 0) + amount;
  };

  orderItems.forEach((entry) => {
    const qty = entry.qty || 1;
    const item = entry.item || {};
    const cfg = entry.config || {};

    if (item.isDrink) {
      if (item.navSection === 'COFFEE') {
        if (item.stripCategory === 'Limited Cold Brew') {
          addDeduction('ing-coldbrew-grounds', 25 * qty);
        } else {
          addDeduction('ing-arabica-beans', 18 * qty);
        }
      } else if (item.navSection === 'TEA') {
        if ((item.id || '').includes('matcha')) {
          addDeduction('ing-uji-matcha', 4 * qty);
        } else {
          addDeduction('ing-hojicha-earl-grey', 6 * qty);
        }
        if ((item.id || '').includes('dirty-matcha')) addDeduction('ing-arabica-beans', 18 * qty);
        if ((item.id || '').includes('coconut')) addDeduction('ing-coconut-water', 200 * qty);
        if ((item.id || '').includes('white-choc')) addDeduction('ing-white-choc-sauce', 30 * qty);
      }

      if (cfg.milk === 'Whole Milk') addDeduction('ing-whole-milk', 180 * qty);
      if (cfg.milk === 'Oat Milk') addDeduction('ing-oat-milk', 180 * qty);
      if (cfg.milk === 'Soy Milk' || cfg.milk === 'Almond Milk') addDeduction('ing-soy-almond-milk', 180 * qty);

      if ((item.id || '').includes('sea-salt') || (item.id || '').includes('tiramisu') || (cfg.addons || []).includes('cold-foam')) {
        addDeduction('ing-mascarpone-cream', 45 * qty);
      }
      if ((item.id || '').includes('spanish')) addDeduction('ing-condensed-milk', 35 * qty);
      if ((item.id || '').includes('caramel') || (item.id || '').includes('earl-grey') || (cfg.addons || []).includes('caramel')) {
        addDeduction('ing-vanilla-caramel-syrup', 25 * qty);
      }
      if ((item.id || '').includes('mocha')) addDeduction('ing-belgian-cacao', 30 * qty);
      if ((item.id || '').includes('yuzu') || (item.id || '').includes('strawberry')) {
        addDeduction('ing-yuzu-strawberry', 45 * qty);
      }
      if ((item.id || '').includes('sesame')) addDeduction('ing-black-sesame', 30 * qty);
      if ((cfg.addons || []).includes('extra-shot')) addDeduction('ing-arabica-beans', 9 * qty);
      if (cfg.ice && cfg.ice !== 'No Ice / Hot') addDeduction('ing-crystal-ice', 150 * qty);
    } else {
      if ((item.id || '').includes('cheesecake')) {
        addDeduction('ing-cream-cheese', 140 * qty);
      } else {
        addDeduction('ing-pastry-butter-flour', 110 * qty);
      }
      if ((item.id || '').includes('matcha')) addDeduction('ing-culinary-matcha', 15 * qty);
      if ((item.id || '').includes('brownie')) addDeduction('ing-belgian-cacao', 40 * qty);
    }
  });

  db.ingredients = db.ingredients.map((ing) =>
    deductions[ing.id] ? { ...ing, stock: Math.max(0, ing.stock - deductions[ing.id]) } : ing
  );

  publishKafkaEvent('StockUpdated', { deductions });
  return db.ingredients;
}

// ============================================================================
// 3. REST API ENDPOINTS
// ============================================================================

// Health & System Architecture Metadata
app.get('/api/health', (req, res) => {
  res.json({
    service: '0-degree-caffe-api',
    status: 'healthy',
    architectureVersion: '2.0',
    activeOrders: db.orders.filter((o) => o.status === 'Active').length,
    lowStockIngredients: db.ingredients.filter((i) => i.stock <= i.minThreshold).length,
    recentEvents: db.eventStream.slice(0, 10)
  });
});

// Unified Login & Customer Registration (Auto-detects Admin vs. Customer role)
app.post('/api/auth/login', (req, res) => {
  const { email = '', password = '', mode = 'login', name = '' } = req.body;
  const normalized = email.trim().toLowerCase();

  if (!normalized || !password.trim()) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const isAdmin =
    mode === 'login' &&
    (normalized.startsWith('admin@') ||
      normalized.includes('staff@') ||
      password.trim().toUpperCase() === '0DEGREE-ADMIN');

  const token = `0dc_${crypto.randomBytes(16).toString('hex')}`;

  if (isAdmin) {
    const adminProfile = {
      isAuthenticated: true,
      role: 'admin',
      name: name.trim() || 'Store Manager (Admin)',
      email: email.trim(),
      staffTitle: 'Branch Operations & Barista Lead'
    };
    return res.json({ token, user: adminProfile });
  }

  let customer = db.users.find((u) => u.email.toLowerCase() === normalized && u.role === 'user');
  if (!customer) {
    const resolvedName =
      mode === 'register' && name.trim()
        ? name.trim()
        : email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

    customer = {
      id: `usr-${Date.now()}`,
      role: 'user',
      name: resolvedName,
      email: email.trim(),
      phone: '0917 000 0000',
      points: mode === 'register' ? 100 : 50,
      tier: 'Glacier Gold',
      defaultPayment: 'GCash / E-Wallet',
      drinkPreference: 'Oat Milk, 75% Less Sweet, 0° Extra Ice',
      savedAddresses: []
    };
    db.users.push(customer);
  }

  return res.json({
    token,
    user: {
      isAuthenticated: true,
      role: 'user',
      name: customer.name,
      email: customer.email,
      staffTitle: null
    },
    profile: customer
  });
});

// Branches & 3-Tier Delivery Pricing Metadata
app.get('/api/config', (req, res) => {
  res.json({
    branches: db.branches,
    deliveryTiers: db.deliveryTiers
  });
});

// Customer Profile & Saved Addresses
app.get('/api/profile/:email', (req, res) => {
  const user = db.users.find((u) => u.email.toLowerCase() === req.params.email.toLowerCase());
  if (!user) return res.status(404).json({ error: 'Customer profile not found.' });
  res.json(user);
});

app.put('/api/profile/:email', (req, res) => {
  const idx = db.users.findIndex((u) => u.email.toLowerCase() === req.params.email.toLowerCase());
  if (idx === -1) return res.status(404).json({ error: 'Customer profile not found.' });
  db.users[idx] = { ...db.users[idx], ...req.body };
  res.json(db.users[idx]);
});

// Orders: List, Create (with BOM Deduction), Advance Stage, and Cancel/Refund Saga
app.get('/api/orders', (req, res) => {
  res.json(db.orders);
});

app.post('/api/orders', (req, res) => {
  const payload = req.body;
  if (!payload || !Array.isArray(payload.items) || payload.items.length === 0) {
    return res.status(400).json({ error: 'Order must include at least one menu item.' });
  }

  const orderId = payload.id || `0DC-${Math.floor(810 + Math.random() * 189)}`;
  const newOrder = {
    ...payload,
    id: orderId,
    status: 'Active',
    stageIndex: 0,
    createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  db.orders.unshift(newOrder);
  const updatedIngredients = deductRecipeIngredients(newOrder.items);
  publishKafkaEvent('OrderPlaced', { orderId: newOrder.id, total: newOrder.total, branch: newOrder.branch });

  res.status(201).json({
    order: newOrder,
    ingredients: updatedIngredients
  });
});

app.patch('/api/orders/:id/advance', (req, res) => {
  const order = db.orders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found.' });
  if (order.status !== 'Active') {
    return res.status(400).json({ error: 'Only active orders can advance stage.' });
  }

  order.stageIndex = Math.min(3, order.stageIndex + 1);
  if (order.stageIndex === 3) {
    order.status = 'Completed';
    order.etaSeconds = 0;
  } else {
    order.etaSeconds = Math.max(60, Math.floor(order.etaSeconds / 2));
  }

  publishKafkaEvent('StageAdvanced', { orderId: order.id, stageIndex: order.stageIndex, status: order.status });
  res.json(order);
});

app.post('/api/orders/:id/cancel', (req, res) => {
  const order = db.orders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found.' });

  // Pre-Seal Cancellation Gate
  if (order.status !== 'Active' || order.stageIndex > 1) {
    return res.status(409).json({
      error: 'Order cannot be cancelled after it has been chilled and sealed.'
    });
  }

  const { reason = 'Customer requested cancellation' } = req.body || {};
  order.status = 'Cancelled';
  order.cancellationReason = reason;
  order.refundStatus = `Full refund of ₱${Number(order.total).toFixed(2)} credited to ${order.paymentMethod}`;
  order.cancelledAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  publishKafkaEvent('OrderCancelled', { orderId: order.id, reason, refundAmount: order.total });
  publishKafkaEvent('RefundIssued', { orderId: order.id, amount: order.total, method: order.paymentMethod });

  res.json(order);
});

// Admin Inventory: Raw Product Ingredients Stock & Restocking
app.get('/api/ingredients', (req, res) => {
  res.json(db.ingredients);
});

app.patch('/api/ingredients/:id/adjust', (req, res) => {
  const ingredient = db.ingredients.find((i) => i.id === req.params.id);
  if (!ingredient) return res.status(404).json({ error: 'Ingredient not found.' });

  const delta = Number(req.body?.delta || 0);
  ingredient.stock = Math.max(0, ingredient.stock + delta);
  publishKafkaEvent('StockUpdated', { ingredientId: ingredient.id, newStock: ingredient.stock });

  res.json(ingredient);
});

app.listen(PORT, () => {
  console.log(`0 Degree Caffe API Server listening on http://localhost:${PORT}`);
});
