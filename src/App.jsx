import React, { useState, useEffect, useMemo, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  collection
} from 'firebase/firestore';

// ============================================================================
// SELF-CONTAINED INLINE SVG ICONS (PREVENTS REACT RUNTIME $$TYPEOF COLLISIONS)
// ============================================================================
const SvgIcon = ({ children, className = 'w-4 h-4' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {children}
  </svg>
);

const Snowflake = ({ className }) => (
  <SvgIcon className={className}>
    <line x1="2" y1="12" x2="22" y2="12" />
    <line x1="12" y1="2" x2="12" y2="22" />
    <path d="m20 16-4-4 4-4" />
    <path d="m4 8 4 4-4 4" />
    <path d="m16 4-4 4-4-4" />
    <path d="m8 20 4-4 4 4" />
  </SvgIcon>
);

const Coffee = ({ className }) => (
  <SvgIcon className={className}>
    <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
    <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
    <line x1="6" y1="2" x2="6" y2="4" />
    <line x1="10" y1="2" x2="10" y2="4" />
    <line x1="14" y1="2" x2="14" y2="4" />
  </SvgIcon>
);

const ShoppingBag = ({ className }) => (
  <SvgIcon className={className}>
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
    <path d="M3 6h18" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </SvgIcon>
);

const Search = ({ className }) => (
  <SvgIcon className={className}>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </SvgIcon>
);

const Plus = ({ className }) => (
  <SvgIcon className={className}>
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </SvgIcon>
);

const Minus = ({ className }) => (
  <SvgIcon className={className}>
    <path d="M5 12h14" />
  </SvgIcon>
);

const X = ({ className }) => (
  <SvgIcon className={className}>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </SvgIcon>
);

const Check = ({ className }) => (
  <SvgIcon className={className}>
    <path d="M20 6 9 17l-5-5" />
  </SvgIcon>
);

const CheckCircle2 = ({ className }) => (
  <SvgIcon className={className}>
    <circle cx="12" cy="12" r="10" />
    <path d="m9 12 2 2 4-4" />
  </SvgIcon>
);

const ChevronRight = ({ className }) => (
  <SvgIcon className={className}>
    <path d="m9 18 6-6-6-6" />
  </SvgIcon>
);

const ChevronLeft = ({ className }) => (
  <SvgIcon className={className}>
    <path d="m15 18-6-6 6-6" />
  </SvgIcon>
);

const Award = ({ className }) => (
  <SvgIcon className={className}>
    <circle cx="12" cy="8" r="6" />
    <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
  </SvgIcon>
);

const History = ({ className }) => (
  <SvgIcon className={className}>
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
    <path d="M12 7v5l4 2" />
  </SvgIcon>
);

const RotateCcw = ({ className }) => (
  <SvgIcon className={className}>
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
  </SvgIcon>
);

const Heart = ({ className }) => (
  <SvgIcon className={className}>
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </SvgIcon>
);

const User = ({ className }) => (
  <SvgIcon className={className}>
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </SvgIcon>
);

const Ban = ({ className }) => (
  <SvgIcon className={className}>
    <circle cx="12" cy="12" r="10" />
    <path d="m4.9 4.9 14.2 14.2" />
  </SvgIcon>
);

const Trash2 = ({ className }) => (
  <SvgIcon className={className}>
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </SvgIcon>
);

const Phone = ({ className }) => (
  <SvgIcon className={className}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </SvgIcon>
);

const Compass = ({ className }) => (
  <SvgIcon className={className}>
    <circle cx="12" cy="12" r="10" />
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
  </SvgIcon>
);

const Flame = ({ className }) => (
  <SvgIcon className={className}>
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  </SvgIcon>
);

const LogIn = ({ className }) => (
  <SvgIcon className={className}>
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
    <polyline points="10 17 15 12 10 7" />
    <line x1="15" y1="12" x2="3" y2="12" />
  </SvgIcon>
);

const LogOut = ({ className }) => (
  <SvgIcon className={className}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </SvgIcon>
);

const KeyRound = ({ className }) => (
  <SvgIcon className={className}>
    <path d="M2 18v3c0 .6.4 1 1 1h4v-3h3v-3h2l1.4-1.4a6.5 6.5 0 1 0-4-4Z" />
    <circle cx="16.5" cy="7.5" r=".5" fill="currentColor" />
  </SvgIcon>
);

const LayoutDashboard = ({ className }) => (
  <SvgIcon className={className}>
    <rect width="7" height="9" x="3" y="3" rx="1" />
    <rect width="7" height="5" x="14" y="3" rx="1" />
    <rect width="7" height="9" x="14" y="12" rx="1" />
    <rect width="7" height="5" x="3" y="16" rx="1" />
  </SvgIcon>
);

const SlidersHorizontal = ({ className }) => (
  <SvgIcon className={className}>
    <line x1="21" y1="4" x2="14" y2="4" />
    <line x1="10" y1="4" x2="3" y2="4" />
    <line x1="21" y1="12" x2="12" y2="12" />
    <line x1="8" y1="12" x2="3" y2="12" />
    <line x1="21" y1="20" x2="16" y2="20" />
    <line x1="12" y1="20" x2="3" y2="20" />
    <line x1="14" y1="2" x2="14" y2="6" />
    <line x1="8" y1="10" x2="8" y2="14" />
    <line x1="16" y1="18" x2="16" y2="22" />
  </SvgIcon>
);

// ============================================================================
// FIREBASE INITIALIZATION (OUTSIDE COMPONENT)
// ============================================================================
const firebaseConfig =
  typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : null;
const firebaseApp = firebaseConfig ? initializeApp(firebaseConfig) : null;
const auth = firebaseApp ? getAuth(firebaseApp) : null;
const db = firebaseApp ? getFirestore(firebaseApp) : null;
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// ============================================================================
// 25 FEATURED PRODUCTS (5 COMPLETE ROWS OF 5 — COFFEE, MATCHA, TEA & PASTRIES)
// ============================================================================
const INITIAL_MENU_ITEMS = [
  {
    id: 'subzero-nitro',
    name: '0° Sub-Zero Nitro Blend',
    navSection: 'COFFEE',
    stripCategory: 'Limited Cold Brew',
    shortDesc: 'A velvety cold-steeped blend with cocoa overtones and a crisp 0° finish.',
    description:
      'Steeped for 18 hours using single-origin Benguet & Ethiopian beans, flash-chilled to 0.2°C and poured on tap for a creamy cascade with zero bitterness.',
    basePrice: 155,
    stockCount: 24,
    prepMins: 3,
    calories: 15,
    tags: ['Bestseller', 'Cold Brew'],
    isDrink: true,
    hasIce: true,
    hasMilk: true,
    defaultMilk: 'No Milk (Black)',
    promoOatFree: true,
    image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=600&q=80',
    accentGradient: 'from-stone-900 via-neutral-800 to-amber-950'
  },
  {
    id: 'glacier-oat-shaken',
    name: 'Glacier Shaken Oat Roast',
    navSection: 'COFFEE',
    stripCategory: 'Favourite Coffee',
    shortDesc: 'A double ristretto hard-shaken over crystal ice with chilled barista oat milk.',
    description:
      'Two shots of our dark-caramel espresso shaken vigorously with Madagascar vanilla bean syrup and chilled barista oat milk until frothy and sub-zero crisp.',
    basePrice: 175,
    stockCount: 18,
    prepMins: 4,
    calories: 140,
    tags: ['Signature', 'Dairy-Free'],
    isDrink: true,
    hasIce: true,
    hasMilk: true,
    defaultMilk: 'Oat Milk',
    promoOatFree: true,
    image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=600&q=80',
    accentGradient: 'from-amber-900 via-stone-800 to-neutral-900'
  },
  {
    id: 'sea-salt-frost-brew',
    name: 'Sea-Salt Cream Frost Brew',
    navSection: 'COFFEE',
    stripCategory: 'Limited Cold Brew',
    shortDesc: 'A rich dark-bodied cold brew crowned with salted mascarpone 0° foam.',
    description:
      'Slow-steeped chocolate-toned cold brew topped with our house-whipped Guimaras sea-salt cream cloud that slowly melts into every sip.',
    basePrice: 180,
    stockCount: 14,
    prepMins: 4,
    calories: 210,
    tags: ['Bestseller', 'Cold Brew'],
    isDrink: true,
    hasIce: true,
    hasMilk: true,
    defaultMilk: 'No Milk (Black)',
    promoOatFree: true,
    image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=600&q=80',
    accentGradient: 'from-neutral-900 via-stone-800 to-amber-950'
  },
  {
    id: 'spanish-velvet-latte',
    name: 'Iced Spanish Velvet Latte',
    navSection: 'COFFEE',
    stripCategory: 'Favourite Coffee',
    shortDesc: 'A smooth double-shot espresso with caramelized condensed milk and clean finish.',
    description:
      'A house favorite balancing bold, nutty double-pull espresso with lightly caramelized condensed milk and fresh chilled dairy or plant milk.',
    basePrice: 165,
    stockCount: 22,
    prepMins: 4,
    calories: 230,
    tags: ['Bestseller', 'Espresso'],
    isDrink: true,
    hasIce: true,
    hasMilk: true,
    defaultMilk: 'Whole Milk',
    promoOatFree: false,
    image: 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?auto=format&fit=crop&w=600&q=80',
    accentGradient: 'from-amber-800 via-amber-950 to-stone-900'
  },
  {
    id: 'benguet-origin-americano',
    name: 'Benguet Highland Americano',
    navSection: 'COFFEE',
    stripCategory: 'Coffee by Origin',
    shortDesc: 'A light-bodied single-origin roast with tangy citrus overtones and clean finish.',
    description:
      'Clean, aromatic, and crisp. Pulled from high-altitude Benguet Arabica beans and served piping hot or flash-chilled over zero-degree crystal ice.',
    basePrice: 135,
    stockCount: 30,
    prepMins: 3,
    calories: 10,
    tags: ['Single Origin', 'Dairy-Free'],
    isDrink: true,
    hasIce: true,
    hasMilk: true,
    defaultMilk: 'No Milk (Black)',
    promoOatFree: false,
    image: 'https://images.unsplash.com/photo-1551030173-122aabc4489c?auto=format&fit=crop&w=600&q=80',
    accentGradient: 'from-stone-800 via-neutral-900 to-amber-950'
  },
  {
    id: 'salted-caramel-macchiato',
    name: 'Salted Caramel Macchiato',
    navSection: 'COFFEE',
    stripCategory: 'Favourite Coffee',
    shortDesc: 'Velvety vanilla-kissed milk marked with rich espresso and house burnt caramel.',
    description:
      'Chilled or steamed micro-foam milk layered with Madagascar vanilla, marked with two bold shots of 0° house espresso, and cross-hatched with Guimaras salted caramel.',
    basePrice: 180,
    stockCount: 16,
    prepMins: 4,
    calories: 245,
    tags: ['Bestseller', 'Espresso'],
    isDrink: true,
    hasIce: true,
    hasMilk: true,
    defaultMilk: 'Whole Milk',
    promoOatFree: false,
    image: 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?auto=format&fit=crop&w=600&q=80',
    accentGradient: 'from-amber-900 via-stone-800 to-neutral-900'
  },
  {
    id: 'subzero-mocha-frappe',
    name: 'Sub-Zero Mocha Frappe',
    navSection: 'COFFEE',
    stripCategory: 'Limited Cold Brew',
    shortDesc: 'Ice-blended dark Belgian cacao and double espresso topped with 0° cream.',
    description:
      'A frost-blended fusion of 70% dark Belgian couverture chocolate, double-pull espresso, and sub-zero ice crystals crowned with lightly whipped cream.',
    basePrice: 195,
    stockCount: 12,
    prepMins: 5,
    calories: 320,
    tags: ['Signature', 'Cold Brew'],
    isDrink: true,
    hasIce: true,
    hasMilk: true,
    defaultMilk: 'Whole Milk',
    promoOatFree: false,
    image: 'https://images.unsplash.com/photo-1579888944880-d98341245702?auto=format&fit=crop&w=600&q=80',
    accentGradient: 'from-stone-900 via-amber-950 to-neutral-900'
  },
  {
    id: 'yuzu-sparkling-espresso',
    name: 'Yuzu Sparkling Espresso',
    navSection: 'COFFEE',
    stripCategory: 'Coffee by Origin',
    shortDesc: 'Bright Japanese yuzu citrus tonic crowned with a double shot of fruity espresso.',
    description:
      'Effervescent artisanal tonic infused with fragrant Japanese yuzu peel over crystal ice, topped slowly with single-origin Ethiopian espresso for a crisp citrus lift.',
    basePrice: 175,
    stockCount: 9,
    prepMins: 3,
    calories: 85,
    tags: ['Single Origin', 'Dairy-Free'],
    isDrink: true,
    hasIce: true,
    hasMilk: false,
    defaultMilk: 'No Milk (Black)',
    promoOatFree: false,
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80',
    accentGradient: 'from-amber-700 via-stone-800 to-neutral-900'
  },
  {
    id: 'tiramisu-cold-foam-latte',
    name: 'Tiramisu Cold Foam Latte',
    navSection: 'COFFEE',
    stripCategory: 'Limited Cold Brew',
    shortDesc: 'Savoiardi-infused espresso latte finished with mascarpone cocoa dust.',
    description:
      'Chilled espresso latte delicately infused with roasted hazelnut and espresso-biscuit notes, capped with thick mascarpone cold foam and Dutch-processed cocoa.',
    basePrice: 190,
    stockCount: 15,
    prepMins: 4,
    calories: 270,
    tags: ['Signature', 'Espresso'],
    isDrink: true,
    hasIce: true,
    hasMilk: true,
    defaultMilk: 'Whole Milk',
    promoOatFree: false,
    image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=600&q=80',
    accentGradient: 'from-stone-800 via-amber-950 to-neutral-900'
  },
  {
    id: 'cryo-dirty-cortado',
    name: 'Cryo-Chilled Dirty Cortado',
    navSection: 'COFFEE',
    stripCategory: 'Coffee by Origin',
    shortDesc: 'A syrupy ristretto layered gently over 1°C micro-chilled velvet milk.',
    description:
      'Hot syrupy espresso layered gently atop 1°C micro-chilled milk—creating a dramatic hot-meets-sub-zero temperature contrast.',
    basePrice: 150,
    stockCount: 20,
    prepMins: 3,
    calories: 110,
    tags: ['Single Origin', 'Espresso'],
    isDrink: true,
    hasIce: false,
    hasMilk: true,
    defaultMilk: 'Whole Milk',
    promoOatFree: false,
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
    accentGradient: 'from-stone-800 via-amber-900 to-neutral-900'
  },
  {
    id: 'ethiopian-yirgacheffe-pour',
    name: 'Yirgacheffe 0° Flash Pour-Over',
    navSection: 'COFFEE',
    stripCategory: 'Coffee by Origin',
    shortDesc: 'Floral bergamot and jasmine single-origin pour-over chilled instantly over ice.',
    description:
      'Hand-poured washed Ethiopian Yirgacheffe brewed directly onto sub-zero Japanese crystal ice to lock in delicate jasmine, white peach, and bergamot aromatics.',
    basePrice: 170,
    stockCount: 11,
    prepMins: 5,
    calories: 5,
    tags: ['Single Origin', 'Dairy-Free'],
    isDrink: true,
    hasIce: true,
    hasMilk: false,
    defaultMilk: 'No Milk (Black)',
    promoOatFree: false,
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=600&q=80',
    accentGradient: 'from-stone-900 via-amber-900 to-neutral-950'
  },
  {
    id: 'black-sesame-espresso-cloud',
    name: 'Black Sesame Espresso Cloud',
    navSection: 'COFFEE',
    stripCategory: 'Favourite Coffee',
    shortDesc: 'Nutty roasted black sesame cream layered over chilled oat milk and espresso.',
    description:
      'Stone-ground toasted black sesame whipped into velvety micro-foam and floated over chilled barista oat milk and a double shot of dark-roast espresso.',
    basePrice: 185,
    stockCount: 13,
    prepMins: 4,
    calories: 220,
    tags: ['Signature', 'Dairy-Free'],
    isDrink: true,
    hasIce: true,
    hasMilk: true,
    defaultMilk: 'Oat Milk',
    promoOatFree: true,
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80',
    accentGradient: 'from-neutral-900 via-stone-800 to-neutral-950'
  },
  {
    id: 'uji-cloud-matcha',
    name: 'Uji Ceremonial Cloud Matcha',
    navSection: 'TEA',
    stripCategory: 'Tea & Matcha',
    shortDesc: 'A first-harvest Kyoto matcha hand-whisked over chilled oat or whole milk.',
    description:
      'Stone-ground ceremonial Uji matcha hand-whisked with spring water and poured over chilled milk with a touch of pure cane nectar.',
    basePrice: 185,
    stockCount: 19,
    prepMins: 5,
    calories: 160,
    tags: ['Bestseller', 'Tea & Matcha'],
    isDrink: true,
    hasIce: true,
    hasMilk: true,
    defaultMilk: 'Oat Milk',
    promoOatFree: false,
    image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=600&q=80',
    accentGradient: 'from-emerald-900 via-teal-950 to-stone-900'
  },
  {
    id: 'roasted-hojicha-latte',
    name: 'Hojicha Roasted Tea Latte',
    navSection: 'TEA',
    stripCategory: 'Tea & Matcha',
    shortDesc: 'A charcoal-roasted Japanese green tea with toasty caramel and cocoa notes.',
    description:
      'Charcoal-roasted Japanese green tea whisked silky smooth with your choice of milk—nutty, comforting, and naturally low in caffeine.',
    basePrice: 170,
    stockCount: 17,
    prepMins: 4,
    calories: 150,
    tags: ['Tea & Matcha', 'Dairy-Free'],
    isDrink: true,
    hasIce: true,
    hasMilk: true,
    defaultMilk: 'Soy Milk',
    promoOatFree: false,
    image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=600&q=80',
    accentGradient: 'from-amber-900 via-stone-800 to-neutral-900'
  },
  {
    id: 'strawberry-matcha-frost',
    name: 'Strawberry Uji Matcha Frost',
    navSection: 'TEA',
    stripCategory: 'Tea & Matcha',
    shortDesc: 'Crushed wild strawberry compote layered with chilled milk and ceremonial matcha.',
    description:
      'House-macerated strawberry puree at the base, creamy chilled milk in the center, and vibrant hand-whisked Kyoto matcha poured over sub-zero ice.',
    basePrice: 195,
    stockCount: 8,
    prepMins: 5,
    calories: 215,
    tags: ['Signature', 'Tea & Matcha'],
    isDrink: true,
    hasIce: true,
    hasMilk: true,
    defaultMilk: 'Whole Milk',
    promoOatFree: false,
    image: 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?auto=format&fit=crop&w=600&q=80',
    accentGradient: 'from-emerald-900 via-rose-950 to-stone-900'
  },
  {
    id: 'earl-grey-bergamot-foam',
    name: 'Earl Grey Vanilla Cloud Tea',
    navSection: 'TEA',
    stripCategory: 'Tea & Matcha',
    shortDesc: 'Cold-steeped Ceylon bergamot black tea topped with velvety vanilla bean foam.',
    description:
      'Fragrant loose-leaf Earl Grey cold-brewed for 12 hours and crowned with lightly salted Madagascar vanilla cold foam for a silky, aromatic finish.',
    basePrice: 160,
    stockCount: 21,
    prepMins: 3,
    calories: 130,
    tags: ['Tea & Matcha'],
    isDrink: true,
    hasIce: true,
    hasMilk: true,
    defaultMilk: 'No Milk (Black)',
    promoOatFree: false,
    image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=600&q=80',
    accentGradient: 'from-amber-800 via-stone-900 to-neutral-950'
  },
  {
    id: 'brown-butter-croissant',
    name: 'Brown-Butter Kouign-Amann',
    navSection: 'PASTRIES',
    stripCategory: 'Pastries & Club',
    shortDesc: 'A caramelized flaky laminated pastry baked fresh every morning.',
    description:
      '27 delicate layers of cultured Normandy-style butter dough baked to a shattering golden-amber caramel crust with a tender honeycomb crumb.',
    basePrice: 145,
    stockCount: 7,
    prepMins: 2,
    calories: 340,
    tags: ['Bestseller', 'Pastry'],
    isDrink: false,
    hasIce: false,
    hasMilk: false,
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80',
    accentGradient: 'from-amber-700 via-orange-900 to-stone-900'
  },
  {
    id: 'burnt-basque-cheesecake',
    name: '0° Chilled Basque Cheesecake',
    navSection: 'PASTRIES',
    stripCategory: 'Pastries & Club',
    shortDesc: 'A creamy caramelized-top cheesecake served chilled at 2°C.',
    description:
      'Rich cream cheese and Madagascar vanilla custard baked at high heat for a smoky caramelized exterior and molten-smooth chilled center.',
    basePrice: 195,
    stockCount: 6,
    prepMins: 2,
    calories: 410,
    tags: ['Signature', 'Pastry'],
    isDrink: false,
    hasIce: false,
    hasMilk: false,
    image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=600&q=80',
    accentGradient: 'from-stone-800 via-amber-900 to-neutral-900'
  },
  {
    id: 'cinnamon-sugar-brioche',
    name: 'Cinnamon Sugar Brioche Knot',
    navSection: 'PASTRIES',
    stripCategory: 'Pastries & Club',
    shortDesc: 'Hand-twisted golden butter brioche rolled in Ceylon cinnamon and muscovado.',
    description:
      'Soft, pillowy cultured-butter brioche hand-braided and baked golden, brushed with brown butter and tossed in aromatic Ceylon cinnamon and raw muscovado sugar.',
    basePrice: 135,
    stockCount: 10,
    prepMins: 2,
    calories: 310,
    tags: ['Pastry'],
    isDrink: false,
    hasIce: false,
    hasMilk: false,
    image: 'https://images.unsplash.com/photo-1509365465985-25d11c17e812?auto=format&fit=crop&w=600&q=80',
    accentGradient: 'from-amber-800 via-stone-800 to-neutral-900'
  },
  {
    id: 'dark-choc-espresso-brownie',
    name: 'Dark Chocolate Espresso Brownie',
    navSection: 'PASTRIES',
    stripCategory: 'Pastries & Club',
    shortDesc: 'Fudgy 72% dark chocolate brownie infused with house espresso and sea salt.',
    description:
      'Dense, crackly-top Belgian 72% dark chocolate brownie enriched with a shot of 0° espresso roast and finished with flaky Maldon sea salt.',
    basePrice: 150,
    stockCount: 15,
    prepMins: 2,
    calories: 365,
    tags: ['Bestseller', 'Pastry'],
    isDrink: false,
    hasIce: false,
    hasMilk: false,
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80',
    accentGradient: 'from-stone-900 via-neutral-900 to-amber-950'
  },
  {
    id: 'dirty-matcha-espresso-fusion',
    name: '0° Dirty Uji Matcha Espresso',
    navSection: 'TEA',
    stripCategory: 'Tea & Matcha',
    shortDesc: 'Vibrant Kyoto Uji matcha layered over chilled oat milk and a double espresso pull.',
    description:
      'First-harvest ceremonial Uji matcha whisked silky smooth and floated over chilled barista oat milk and a syrupy double shot of 0° house espresso.',
    basePrice: 195,
    stockCount: 16,
    prepMins: 4,
    calories: 190,
    tags: ['Signature', 'Tea & Matcha', 'Espresso'],
    isDrink: true,
    hasIce: true,
    hasMilk: true,
    defaultMilk: 'Oat Milk',
    promoOatFree: true,
    image: 'https://images.unsplash.com/photo-1582793988951-9aed5509eb97?auto=format&fit=crop&w=600&q=80',
    accentGradient: 'from-emerald-950 via-stone-900 to-amber-950'
  },
  {
    id: 'salted-cream-matcha-cloud',
    name: 'Salted Cream Matcha Cloud',
    navSection: 'TEA',
    stripCategory: 'Tea & Matcha',
    shortDesc: 'Ceremonial Kyoto matcha crowned with whipped Guimaras sea-salt mascarpone foam.',
    description:
      'Hand-whisked ceremonial Uji matcha poured over sub-zero crystal ice and fresh milk, finished with a thick layer of Guimaras sea-salt mascarpone cream.',
    basePrice: 190,
    stockCount: 14,
    prepMins: 4,
    calories: 235,
    tags: ['Bestseller', 'Tea & Matcha'],
    isDrink: true,
    hasIce: true,
    hasMilk: true,
    defaultMilk: 'Whole Milk',
    promoOatFree: false,
    image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=600&q=80',
    accentGradient: 'from-emerald-900 via-teal-950 to-neutral-900'
  },
  {
    id: 'coconut-water-matcha-cloud',
    name: '0° Coconut Water Matcha Cloud',
    navSection: 'TEA',
    stripCategory: 'Tea & Matcha',
    shortDesc: 'Chilled young coconut water topped with velvety whipped ceremonial Uji matcha.',
    description:
      'Refreshing single-origin young coconut water served over sub-zero crystal ice and crowned with micro-foamed ceremonial Uji matcha cloud.',
    basePrice: 185,
    stockCount: 15,
    prepMins: 3,
    calories: 115,
    tags: ['Signature', 'Tea & Matcha', 'Dairy-Free'],
    isDrink: true,
    hasIce: true,
    hasMilk: false,
    defaultMilk: 'No Milk (Black)',
    promoOatFree: false,
    image: 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?auto=format&fit=crop&w=600&q=80',
    accentGradient: 'from-emerald-800 via-teal-900 to-stone-900'
  },
  {
    id: 'uji-matcha-white-choc-latte',
    name: 'Uji Matcha White Chocolate Velvet',
    navSection: 'TEA',
    stripCategory: 'Tea & Matcha',
    shortDesc: 'Creamy Belgian white chocolate melted into ceremonial Uji matcha and chilled milk.',
    description:
      'Silky Belgian white couverture chocolate blended with stone-ground Kyoto Uji matcha and cold micro-foamed milk for a dessert-like sub-zero treat.',
    basePrice: 195,
    stockCount: 12,
    prepMins: 4,
    calories: 265,
    tags: ['Bestseller', 'Tea & Matcha'],
    isDrink: true,
    hasIce: true,
    hasMilk: true,
    defaultMilk: 'Whole Milk',
    promoOatFree: false,
    image: 'https://images.unsplash.com/photo-1563822249366-3efb23b8e0c9?auto=format&fit=crop&w=600&q=80',
    accentGradient: 'from-emerald-900 via-stone-800 to-amber-950'
  },
  {
    id: 'uji-matcha-basque-cheesecake',
    name: 'Uji Matcha Burnt Basque Cheesecake',
    navSection: 'PASTRIES',
    stripCategory: 'Pastries & Club',
    shortDesc: 'Caramelized burnt-top cheesecake infused with stone-ground Kyoto Uji matcha.',
    description:
      'Velvety cream cheese custard infused with ceremonial-grade Kyoto Uji matcha, baked at high heat for a caramelized crust and chilled to 2°C.',
    basePrice: 205,
    stockCount: 9,
    prepMins: 2,
    calories: 420,
    tags: ['Signature', 'Tea & Matcha', 'Pastry'],
    isDrink: false,
    hasIce: false,
    hasMilk: false,
    image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=600&q=80',
    accentGradient: 'from-emerald-950 via-stone-800 to-neutral-900'
  }
];

const QUICK_SEARCH_TAGS = [
  'All',
  'Bestseller',
  'Signature',
  'Cold Brew',
  'Espresso',
  'Single Origin',
  'Tea & Matcha',
  'Pastry',
  'Dairy-Free'
];

const HERO_STRIP_CATEGORIES = [
  { id: 'Favourite Coffee', label: 'Favourite Coffee', icon: Coffee },
  { id: 'Limited Cold Brew', label: 'Limited Cold Brew', icon: Snowflake },
  { id: 'Coffee by Origin', label: 'Coffee by Origin', icon: Compass },
  { id: 'Tea & Matcha', label: 'Tea & Matcha', icon: Flame },
  { id: 'Pastries & Club', label: 'Pastries & Club', icon: Award }
];

const BRANCHES = [
  { id: 'lapaz', name: 'La Paz Flagship', address: 'Luna St., La Paz District, Iloilo City', pickupMins: '10–12 mins', hours: '6:30 AM – 10:00 PM' },
  { id: 'center', name: 'City Center', address: 'Gen. Luna Ave., Ground Flr, Iloilo City', pickupMins: '12–15 mins', hours: '7:00 AM – 9:30 PM' },
  { id: 'waterfront', name: 'Waterfront Kiosk', address: 'Esplanade Boardwalk Pier 2, Iloilo City', pickupMins: '8–10 mins', hours: '6:00 AM – 11:00 PM' }
];

const DELIVERY_TIERS = [
  {
    id: 'priority',
    name: 'Priority Express',
    eta: '15–20 mins',
    fee: 75,
    badge: 'Fastest',
    desc: 'Direct point-to-point sub-zero insulated dispatch'
  },
  {
    id: 'standard',
    name: 'Standard Delivery',
    eta: '30–40 mins',
    fee: 45,
    badge: 'Popular',
    desc: 'Balanced courier dispatch with thermal chill pack'
  },
  {
    id: 'saver',
    name: 'Saver / Long Delivery',
    eta: '55–70 mins',
    fee: 20,
    badge: 'Save ₱55',
    desc: 'Eco-batched neighborhood route for non-urgent orders'
  }
];

const CANCELLATION_REASONS = [
  'Changed my mind',
  'Ordered wrong drink / customization',
  'Incorrect delivery address or branch',
  'Estimated wait time too long',
  'Placed duplicate order'
];

const HERO_SLIDES = [
  {
    id: 'favourite-coffee',
    title: 'Your Favourite Coffee',
    subtitle:
      '0 Degree Caffe is the realization of precision sub-zero cold extraction and small-batch craft roasting in Iloilo City.',
    ctaLabel: 'Order Now',
    targetCategory: 'Favourite Coffee',
    image:
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1600&q=85'
  },
  {
    id: 'subzero-cold-brew',
    title: 'Sub-Zero Cold Brews',
    subtitle:
      'Steeped for 18 hours and flash-chilled to 0.0°C for a velvety, zero-bitterness finish over crystal ice.',
    ctaLabel: 'Explore Cold Brew',
    targetCategory: 'Limited Cold Brew',
    image:
      'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=1600&q=85'
  },
  {
    id: 'ceremonial-tea-pastries',
    title: 'Kyoto Matcha & Pastries',
    subtitle:
      'First-harvest Uji ceremonial matcha hand-whisked to order alongside warm laminated brown-butter pastries.',
    ctaLabel: 'View Tea & Pastries',
    targetCategory: 'Tea & Matcha',
    image:
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1600&q=85'
  }
];

const SIZE_OPTIONS = [
  { id: 'Regular', label: 'Regular (12oz)', delta: 0 },
  { id: 'Large', label: 'Large (16oz)', delta: 25 }
];

const ICE_OPTIONS = [
  { id: '0° Extra Ice', label: '0° Extra Ice' },
  { id: 'Regular Ice (100%)', label: 'Regular Ice (100%)' },
  { id: 'Light Ice (50%)', label: 'Light Ice (50%)' },
  { id: 'No Ice / Hot', label: 'No Ice / Hot' }
];

const SWEETNESS_OPTIONS = [
  '100% Classic',
  '75% Less Sweet',
  '50% Half Sweet',
  '25% Hint of Sweet',
  '0% Unsweetened'
];

const MILK_OPTIONS = [
  { id: 'No Milk (Black)', label: 'No Milk / As Standard', delta: 0 },
  { id: 'Whole Milk', label: 'Fresh Whole Milk', delta: 0 },
  { id: 'Oat Milk', label: 'Barista Oat Milk', delta: 30 },
  { id: 'Soy Milk', label: 'Organic Soy Milk', delta: 25 },
  { id: 'Almond Milk', label: 'Roasted Almond Milk', delta: 30 }
];

const ADDON_OPTIONS = [
  { id: 'extra-shot', label: 'Extra Espresso Shot', price: 35 },
  { id: 'cold-foam', label: '0° Sea-Salt Cold Foam', price: 30 },
  { id: 'caramel', label: 'Caramel Drizzle', price: 20 },
  { id: 'pearls', label: 'Brown Sugar Pearls', price: 25 }
];

const PASTRY_PREP_OPTIONS = [
  { id: 'Warmed (Oven Crisp)', label: 'Warmed (Oven Crisp)' },
  { id: 'Chilled / Room Temp', label: 'Chilled / Room Temp' }
];

// ============================================================================
// 19 RAW PRODUCT INGREDIENTS (BOM INVENTORY FOR ADMIN PORTAL)
// ============================================================================
const INITIAL_INGREDIENTS = [
  {
    id: 'ing-arabica-beans',
    name: 'Benguet & Ethiopian Espresso Beans',
    category: 'Coffee Beans',
    unit: 'g',
    stock: 4800,
    minThreshold: 1200,
    restockStep: 1000,
    adjustStep: 100,
    image: 'https://images.unsplash.com/photo-1559525839-b184a4d698c7?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'ing-coldbrew-grounds',
    name: '0° Sub-Zero Coarse Cold Brew Roast',
    category: 'Coffee Beans',
    unit: 'g',
    stock: 3200,
    minThreshold: 1000,
    restockStep: 1000,
    adjustStep: 100,
    image: 'https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'ing-whole-milk',
    name: 'Fresh Pasteurized Whole Milk',
    category: 'Dairy & Plant Milks',
    unit: 'ml',
    stock: 9500,
    minThreshold: 2500,
    restockStep: 2000,
    adjustStep: 250,
    image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'ing-oat-milk',
    name: 'Barista Edition Oat Milk',
    category: 'Dairy & Plant Milks',
    unit: 'ml',
    stock: 6400,
    minThreshold: 2000,
    restockStep: 2000,
    adjustStep: 250,
    image: 'https://images.unsplash.com/photo-1600788907416-456578634209?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'ing-soy-almond-milk',
    name: 'Organic Soy & Roasted Almond Milk',
    category: 'Dairy & Plant Milks',
    unit: 'ml',
    stock: 3600,
    minThreshold: 1500,
    restockStep: 1500,
    adjustStep: 250,
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'ing-mascarpone-cream',
    name: 'Guimaras Sea-Salt Mascarpone Cream',
    category: 'Dairy & Plant Milks',
    unit: 'g',
    stock: 1100,
    minThreshold: 1200,
    restockStep: 1000,
    adjustStep: 100,
    image: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'ing-condensed-milk',
    name: 'Caramelized Condensed Milk',
    category: 'Syrups & Sauces',
    unit: 'ml',
    stock: 2800,
    minThreshold: 800,
    restockStep: 1000,
    adjustStep: 100,
    image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'ing-vanilla-caramel-syrup',
    name: 'Madagascar Vanilla & Burnt Caramel Syrup',
    category: 'Syrups & Sauces',
    unit: 'ml',
    stock: 2400,
    minThreshold: 750,
    restockStep: 1000,
    adjustStep: 100,
    image: 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'ing-belgian-cacao',
    name: '70% Dark Belgian Couverture Cacao',
    category: 'Syrups & Sauces',
    unit: 'g',
    stock: 1850,
    minThreshold: 600,
    restockStep: 500,
    adjustStep: 50,
    image: 'https://images.unsplash.com/photo-1511381939415-e44015466834?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'ing-uji-matcha',
    name: 'First-Harvest Kyoto Uji Matcha Powder',
    category: 'Tea & Botanicals',
    unit: 'g',
    stock: 420,
    minThreshold: 500,
    restockStep: 500,
    adjustStep: 25,
    image: 'https://images.unsplash.com/photo-1582793988951-9aed5509eb97?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'ing-culinary-matcha',
    name: 'Nishio Ceremonial & Pastry Matcha Paste',
    category: 'Tea & Botanicals',
    unit: 'g',
    stock: 850,
    minThreshold: 350,
    restockStep: 500,
    adjustStep: 50,
    image: 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'ing-coconut-water',
    name: 'Chilled Single-Origin Young Coconut Water',
    category: 'Tea & Botanicals',
    unit: 'ml',
    stock: 3400,
    minThreshold: 1200,
    restockStep: 1500,
    adjustStep: 250,
    image: 'https://images.unsplash.com/photo-1525385133512-2f3bdd039054?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'ing-white-choc-sauce',
    name: 'Belgian White Couverture Chocolate Sauce',
    category: 'Syrups & Sauces',
    unit: 'ml',
    stock: 1650,
    minThreshold: 600,
    restockStep: 750,
    adjustStep: 100,
    image: 'https://images.unsplash.com/photo-1548907040-4baa42d10919?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'ing-hojicha-earl-grey',
    name: 'Charcoal Hojicha & Ceylon Earl Grey Leaves',
    category: 'Tea & Botanicals',
    unit: 'g',
    stock: 1450,
    minThreshold: 400,
    restockStep: 500,
    adjustStep: 50,
    image: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'ing-yuzu-strawberry',
    name: 'Japanese Yuzu Peel & Wild Strawberry Puree',
    category: 'Tea & Botanicals',
    unit: 'ml',
    stock: 1900,
    minThreshold: 600,
    restockStep: 750,
    adjustStep: 100,
    image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'ing-black-sesame',
    name: 'Stone-Ground Toasted Black Sesame Paste',
    category: 'Specialty Pastes',
    unit: 'g',
    stock: 950,
    minThreshold: 400,
    restockStep: 500,
    adjustStep: 50,
    image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'ing-pastry-butter-flour',
    name: 'Cultured Normandy Butter & Laminated Dough',
    category: 'Bakery Ingredients',
    unit: 'g',
    stock: 4500,
    minThreshold: 1500,
    restockStep: 2000,
    adjustStep: 250,
    image: 'https://images.unsplash.com/photo-1589985270958-bf087b2d8ed7?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'ing-cream-cheese',
    name: 'Artisanal Cream Cheese & Pastry Custard',
    category: 'Bakery Ingredients',
    unit: 'g',
    stock: 1300,
    minThreshold: 1500,
    restockStep: 1500,
    adjustStep: 200,
    image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'ing-crystal-ice',
    name: '0° Sub-Zero Purified Crystal Ice',
    category: 'Packaging & Ice',
    unit: 'g',
    stock: 18000,
    minThreshold: 5000,
    restockStep: 5000,
    adjustStep: 1000,
    image: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=400&q=80'
  }
];

// ============================================================================
// REUSABLE MENU PHOTO WITH CLEAN FALLBACK
// ============================================================================
function MenuPhoto({ src, alt, gradient, className = '' }) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div
        className={`bg-gradient-to-br ${gradient || 'from-stone-800 to-amber-950'} flex items-center justify-center text-white/80 ${className}`}
      >
        <Coffee className="w-7 h-7" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`object-cover ${className}`}
    />
  );
}

// ============================================================================
// CLASSIC BOXED LOGO BADGE
// ============================================================================
function BrandLogoBadge({ compact = false }) {
  return (
    <div className="inline-flex items-center border-2 border-white bg-black/75 px-2.5 py-1.5 select-none">
      <div className="flex items-center gap-1.5">
        <span className="text-lg sm:text-xl font-black tracking-tighter text-white leading-none font-serif">
          0°
        </span>
        <div className="w-6 h-6 rounded-full border border-white/80 flex items-center justify-center bg-white text-black">
          <Coffee className="w-3.5 h-3.5 stroke-[2.5]" />
        </div>
        <div className="flex flex-col leading-none">
          <span className="text-xs sm:text-sm font-black tracking-widest text-white uppercase">
            DEGREE
          </span>
          {!compact && (
            <span className="text-[8px] font-bold tracking-[0.28em] text-[#E5A93C] uppercase mt-0.5">
              CAFFE
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN APPLICATION COMPONENT
// ============================================================================
export default function App() {
  const productsSectionRef = useRef(null);
  const bottomSearchRef = useRef(null);
  const storySectionRef = useRef(null);
  const footerSectionRef = useRef(null);

  // Hero Carousel State
  const [heroSlideIdx, setHeroSlideIdx] = useState(0);

  // Navigation & Filtering State
  const [activeNav, setActiveNav] = useState('HOME');
  const [activeStripCategory, setActiveStripCategory] = useState('All');
  const [activeSearchTag, setActiveSearchTag] = useState('All');
  const [showWishlistOnly, setShowWishlistOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Editorial Brand Story & Promo Banner Expand States
  const [storyExpanded, setStoryExpanded] = useState(false);
  const [cupPromoExpanded, setCupPromoExpanded] = useState(false);

  // Newsletter State
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  // User Profile & Saved Addresses State
  const [userProfile, setUserProfile] = useState({
    name: 'Kyle Mendoza',
    email: 'kyle.mendoza@0degreecaffe.ph',
    phone: '0917 842 0194',
    isMember: true,
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
  });
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileDraft, setProfileDraft] = useState(userProfile);
  const [newAddressLabel, setNewAddressLabel] = useState('');
  const [newAddressText, setNewAddressText] = useState('');

  // Branch, Order Mode & 3-Tier Delivery Speed State
  const [selectedBranch, setSelectedBranch] = useState(BRANCHES[0]);
  const [orderType, setOrderType] = useState('Pickup');
  const [deliveryTierId, setDeliveryTierId] = useState('standard');

  const activeDeliveryTier = useMemo(
    () => DELIVERY_TIERS.find((t) => t.id === deliveryTierId) || DELIVERY_TIERS[1],
    [deliveryTierId]
  );

  // Wishlist State
  const [favorites, setFavorites] = useState(['subzero-nitro', 'uji-cloud-matcha']);

  // Customization Modal State
  const [customizingItem, setCustomizingItem] = useState(null);
  const [editingCartItemId, setEditingCartItemId] = useState(null);
  const [config, setConfig] = useState({
    size: 'Regular',
    ice: '0° Extra Ice',
    sweetness: '75% Less Sweet',
    milk: 'Whole Milk',
    addons: [],
    pastryPrep: 'Warmed (Oven Crisp)',
    notes: '',
    qty: 1
  });

  // Dynamic Menu & Raw Ingredients Inventory State
  const [menuItems] = useState(INITIAL_MENU_ITEMS);
  const [ingredients, setIngredients] = useState(INITIAL_INGREDIENTS);
  const [ingredientCategoryFilter, setIngredientCategoryFilter] = useState('All');

  // Authentication & Role-Based Access State ('guest' | 'user' | 'admin')
  const [authUser, setAuthUser] = useState({
    isAuthenticated: true,
    role: 'user',
    name: 'Kyle Mendoza',
    email: 'kyle.mendoza@0degreecaffe.ph',
    staffTitle: null
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authEmailInput, setAuthEmailInput] = useState('kyle.mendoza@0degreecaffe.ph');
  const [authPasswordInput, setAuthPasswordInput] = useState('coffee2026');
  const [authNameInput, setAuthNameInput] = useState('');
  const [authError, setAuthError] = useState('');

  // Admin Operations Console Tab State
  const [adminTab, setAdminTab] = useState('orders');

  // Cart & Checkout Drawer State
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState('cart');
  const [cart, setCart] = useState([
    {
      cartId: 'seed-1',
      item: INITIAL_MENU_ITEMS[1],
      qty: 1,
      unitPrice: 175,
      config: {
        size: 'Regular',
        ice: '0° Extra Ice',
        sweetness: '75% Less Sweet',
        milk: 'Oat Milk',
        addons: [],
        pastryPrep: '',
        notes: ''
      }
    }
  ]);

  // Promo & Tip State
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState('');
  const [tipPercent, setTipPercent] = useState(5);
  const [customTipAmount, setCustomTipAmount] = useState('');

  // Checkout Form State
  const defaultSavedAddress = useMemo(
    () =>
      userProfile.savedAddresses.find((a) => a.isDefault)?.address ||
      userProfile.savedAddresses[0]?.address ||
      '',
    [userProfile.savedAddresses]
  );

  const [customerName, setCustomerName] = useState(userProfile.name);
  const [customerPhone, setCustomerPhone] = useState(userProfile.phone);
  const [pickupSlot, setPickupSlot] = useState(`ASAP (${BRANCHES[0].pickupMins})`);
  const [deliveryAddress, setDeliveryAddress] = useState(defaultSavedAddress);
  const [paymentMethod, setPaymentMethod] = useState(userProfile.defaultPayment);
  const [formError, setFormError] = useState('');

  // Live Order Tracker, Cancellation & Order History State
  const [orders, setOrders] = useState([
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
          item: INITIAL_MENU_ITEMS[0],
          qty: 1,
          unitPrice: 155,
          config: {
            size: 'Regular',
            ice: '0° Extra Ice',
            sweetness: '50% Half Sweet',
            milk: 'Oat Milk',
            addons: [],
            notes: ''
          }
        },
        {
          cartId: 'seed-active-2',
          item: INITIAL_MENU_ITEMS[17],
          qty: 1,
          unitPrice: 195,
          config: {
            size: 'Regular',
            ice: '',
            sweetness: '',
            milk: '',
            addons: [],
            pastryPrep: 'Chilled / Room Temp',
            notes: ''
          }
        }
      ],
      subtotal: 350,
      discount: 0,
      deliveryFee: 20,
      vat: 42,
      tip: 18,
      total: 430,
      pointsEarned: 43
    },
    {
      id: '0DC-791',
      branch: 'La Paz Flagship',
      orderType: 'Pickup',
      customerName: 'Kyle Mendoza',
      customerPhone: '0917 842 0194',
      slot: 'Completed Yesterday',
      paymentMethod: 'GCash / E-Wallet',
      createdAt: 'Yesterday, 3:15 PM',
      status: 'Completed',
      stageIndex: 3,
      etaSeconds: 0,
      items: [
        {
          cartId: 'hist-1',
          item: INITIAL_MENU_ITEMS[12],
          qty: 1,
          unitPrice: 185,
          config: {
            size: 'Regular',
            ice: '0° Extra Ice',
            sweetness: '75% Less Sweet',
            milk: 'Oat Milk',
            addons: [],
            notes: ''
          }
        },
        {
          cartId: 'hist-2',
          item: INITIAL_MENU_ITEMS[16],
          qty: 1,
          unitPrice: 145,
          config: {
            size: 'Regular',
            ice: '',
            sweetness: '',
            milk: '',
            addons: [],
            pastryPrep: 'Warmed (Oven Crisp)',
            notes: ''
          }
        }
      ],
      subtotal: 330,
      discount: 0,
      deliveryFee: 0,
      vat: 40,
      tip: 17,
      total: 387,
      pointsEarned: 39
    }
  ]);

  const [trackedOrderId, setTrackedOrderId] = useState(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Cancellation Confirmation Modal State
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState(CANCELLATION_REASONS[0]);
  const [cancelNote, setCancelNote] = useState('');

  // Toast Notification & Firebase Status
  const [toast, setToast] = useState(null);
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [backendConnected, setBackendConnected] = useState(false);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3400);
  };

  // ============================================================================
  // FIREBASE AUTHENTICATION & REAL-TIME FIRESTORE SYNC
  // ============================================================================
  useEffect(() => {
    if (!auth) return;
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error('Firebase auth error:', err);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setFirebaseUser(u);
      setBackendConnected(Boolean(u));
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!firebaseUser || !db) return;

    const ordersColRef = collection(db, 'artifacts', appId, 'public', 'data', 'orders');
    const unsubOrders = onSnapshot(
      ordersColRef,
      (snapshot) => {
        if (snapshot.empty) {
          orders.forEach((seedOrd) => {
            setDoc(
              doc(db, 'artifacts', appId, 'public', 'data', 'orders', seedOrd.id),
              { ...seedOrd, sortTimestamp: Date.now() }
            ).catch((e) => console.error('Seed order error:', e));
          });
          return;
        }
        const remoteOrders = snapshot.docs
          .map((d) => d.data())
          .sort((a, b) => (b.sortTimestamp || 0) - (a.sortTimestamp || 0));
        setOrders(remoteOrders);
      },
      (err) => console.error('Orders snapshot error:', err)
    );

    const ingredientsColRef = collection(
      db,
      'artifacts',
      appId,
      'public',
      'data',
      'ingredients'
    );
    const unsubIngredients = onSnapshot(
      ingredientsColRef,
      (snapshot) => {
        if (snapshot.empty) {
          INITIAL_INGREDIENTS.forEach((seedIng) => {
            setDoc(
              doc(db, 'artifacts', appId, 'public', 'data', 'ingredients', seedIng.id),
              { id: seedIng.id, stock: seedIng.stock }
            ).catch((e) => console.error('Seed ingredient error:', e));
          });
          return;
        }
        const stockMap = {};
        snapshot.docs.forEach((d) => {
          const data = d.data();
          stockMap[d.id] = data.stock;
        });
        setIngredients((prev) =>
          prev.map((localIng) =>
            typeof stockMap[localIng.id] === 'number'
              ? { ...localIng, stock: stockMap[localIng.id] }
              : localIng
          )
        );
      },
      (err) => console.error('Ingredients snapshot error:', err)
    );

    const profileDocRef = doc(
      db,
      'artifacts',
      appId,
      'users',
      firebaseUser.uid,
      'profile',
      'main'
    );
    const unsubProfile = onSnapshot(
      profileDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const remoteProfile = docSnap.data();
          setUserProfile((prev) => ({ ...prev, ...remoteProfile }));
          if (remoteProfile.name) setCustomerName(remoteProfile.name);
          if (remoteProfile.phone) setCustomerPhone(remoteProfile.phone);
          if (remoteProfile.defaultPayment) setPaymentMethod(remoteProfile.defaultPayment);
        }
      },
      (err) => console.error('Profile snapshot error:', err)
    );

    return () => {
      unsubOrders();
      unsubIngredients();
      unsubProfile();
    };
  }, [firebaseUser]);

  // ============================================================================
  // CORE PRICING, FILTERING, ORDER PROGRESSION & CANCELLATION HELPERS
  // ============================================================================
  const computeItemUnitPrice = (item, itemConfig) => {
    if (!item) return 0;
    let total = item.basePrice;
    if (item.isDrink) {
      const sizeObj = SIZE_OPTIONS.find((s) => s.id === itemConfig.size);
      if (sizeObj) total += sizeObj.delta;

      if (item.hasMilk && itemConfig.milk) {
        const milkObj = MILK_OPTIONS.find((m) => m.id === itemConfig.milk);
        const isFreeOat = item.promoOatFree && itemConfig.milk === 'Oat Milk';
        if (milkObj && !isFreeOat) {
          total += milkObj.delta;
        }
      }

      if (Array.isArray(itemConfig.addons)) {
        itemConfig.addons.forEach((addonId) => {
          const found = ADDON_OPTIONS.find((a) => a.id === addonId);
          if (found) total += found.price;
        });
      }
    }
    return total;
  };

  const cartSummary = useMemo(() => {
    const subtotal = cart.reduce((sum, entry) => sum + entry.unitPrice * entry.qty, 0);
    const discount = appliedPromo === 'ZERO10' ? Math.round(subtotal * 0.1 * 100) / 100 : 0;
    const discountedSubtotal = Math.max(0, subtotal - discount);
    const deliveryFee =
      orderType === 'Delivery' && cart.length > 0 ? activeDeliveryTier.fee : 0;
    const vat = Math.round(discountedSubtotal * 0.12 * 100) / 100;
    const tip =
      tipPercent === 'custom'
        ? Math.max(0, Number(customTipAmount) || 0)
        : Math.round(discountedSubtotal * (Number(tipPercent) / 100) * 100) / 100;
    const total = Math.round((discountedSubtotal + deliveryFee + vat + tip) * 100) / 100;
    const pointsEarned = Math.floor(total / 10);

    return {
      subtotal,
      discount,
      deliveryFee,
      vat,
      tip,
      total,
      pointsEarned
    };
  }, [cart, appliedPromo, orderType, activeDeliveryTier, tipPercent, customTipAmount]);

  const filteredMenu = useMemo(() => {
    return menuItems.filter((item) => {
      if (showWishlistOnly && !favorites.includes(item.id)) return false;

      if (['COFFEE', 'TEA', 'PASTRIES'].includes(activeNav) && item.navSection !== activeNav) {
        return false;
      }

      if (activeStripCategory !== 'All' && item.stripCategory !== activeStripCategory) {
        return false;
      }

      if (activeSearchTag !== 'All' && !(item.tags || []).includes(activeSearchTag)) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const haystack = [
          item.name,
          item.shortDesc,
          item.description,
          item.stripCategory,
          ...(item.tags || [])
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    });
  }, [
    menuItems,
    showWishlistOnly,
    favorites,
    activeNav,
    activeStripCategory,
    activeSearchTag,
    searchQuery
  ]);

  const activeTrackedOrder = useMemo(
    () => orders.find((o) => o.id === trackedOrderId) || null,
    [orders, trackedOrderId]
  );

  const canCancelOrder = (order) =>
    order && order.status === 'Active' && order.stageIndex <= 1;

  const openCancelDialog = (order) => {
    setCancellingOrder(order);
    setCancelReason(CANCELLATION_REASONS[0]);
    setCancelNote('');
  };

  const confirmCancelOrder = async () => {
    if (!cancellingOrder) return;
    const reasonText = cancelNote.trim()
      ? `${cancelReason} — ${cancelNote.trim()}`
      : cancelReason;

    const cancelledPayload = {
      status: 'Cancelled',
      cancellationReason: reasonText,
      refundStatus: `Full refund of ₱${cancellingOrder.total.toFixed(2)} credited to ${cancellingOrder.paymentMethod}`,
      cancelledAt: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    if (firebaseUser && db) {
      try {
        await updateDoc(
          doc(db, 'artifacts', appId, 'public', 'data', 'orders', cancellingOrder.id),
          cancelledPayload
        );
      } catch (err) {
        console.error('Firestore cancel order error:', err);
      }
    }

    setOrders((prev) =>
      prev.map((o) =>
        o.id === cancellingOrder.id ? { ...o, ...cancelledPayload } : o
      )
    );

    if (userProfile.isMember && cancellingOrder.pointsEarned) {
      const updatedPoints = Math.max(0, userProfile.points - cancellingOrder.pointsEarned);
      setUserProfile((prev) => ({ ...prev, points: updatedPoints }));
      if (firebaseUser && db) {
        setDoc(
          doc(db, 'artifacts', appId, 'users', firebaseUser.uid, 'profile', 'main'),
          { ...userProfile, points: updatedPoints },
          { merge: true }
        ).catch((err) => console.error('Firestore points rollback error:', err));
      }
    }

    showToast(
      `Order #${cancellingOrder.id} cancelled. Full refund of ₱${cancellingOrder.total.toFixed(2)} issued.`
    );
    setCancellingOrder(null);
  };

  const advanceOrderStage = async (orderId) => {
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder || targetOrder.status !== 'Active') return;

    const nextStage = Math.min(3, targetOrder.stageIndex + 1);
    const updates = {
      stageIndex: nextStage,
      status: nextStage === 3 ? 'Completed' : 'Active',
      etaSeconds: nextStage === 3 ? 0 : Math.max(60, Math.floor(targetOrder.etaSeconds / 2))
    };

    if (firebaseUser && db) {
      try {
        await updateDoc(
          doc(db, 'artifacts', appId, 'public', 'data', 'orders', orderId),
          updates
        );
      } catch (err) {
        console.error('Firestore advance stage error:', err);
      }
    }

    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, ...updates } : o))
    );
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setOrders((prev) =>
        prev.map((o) =>
          o.status === 'Active' && o.etaSeconds > 0
            ? { ...o, etaSeconds: o.etaSeconds - 1 }
            : o
        )
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // ============================================================================
  // AUTHENTICATION HANDLERS (UNIFIED LOGIN FOR BOTH USERS & ADMINS)
  // ============================================================================
  const openAuthDialog = (preferredMode = 'login') => {
    setAuthMode(preferredMode);
    setAuthError('');
    setAuthEmailInput(userProfile.email || 'kyle.mendoza@0degreecaffe.ph');
    setAuthPasswordInput('coffee2026');
    setIsAuthModalOpen(true);
  };

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    setAuthError('');

    const normalizedEmail = authEmailInput.trim().toLowerCase();
    if (!normalizedEmail || !authPasswordInput.trim()) {
      setAuthError('Please enter your email address and password.');
      return;
    }

    const isAdminAccount =
      authMode === 'login' &&
      (normalizedEmail.startsWith('admin@') ||
        normalizedEmail.includes('staff@') ||
        authPasswordInput.trim().toUpperCase() === '0DEGREE-ADMIN');

    if (isAdminAccount) {
      const adminName =
        authNameInput.trim() ||
        (normalizedEmail.startsWith('admin')
          ? 'Store Manager (Admin)'
          : normalizedEmail
              .split('@')[0]
              .replace(/[._-]/g, ' ')
              .replace(/\b\w/g, (l) => l.toUpperCase()));

      setAuthUser({
        isAuthenticated: true,
        role: 'admin',
        name: adminName,
        email: authEmailInput.trim(),
        staffTitle: 'Branch Operations & Barista Lead'
      });
      setIsAuthModalOpen(false);
      setIsCartOpen(false);
      setIsProfileOpen(false);
      setIsHistoryOpen(false);
      showToast(`Signed in to Admin Portal (${adminName})`);
      return;
    }

    const resolvedName =
      authMode === 'register' && authNameInput.trim()
        ? authNameInput.trim()
        : normalizedEmail.includes('kyle')
        ? 'Kyle Mendoza'
        : authEmailInput
            .split('@')[0]
            .replace(/[._-]/g, ' ')
            .replace(/\b\w/g, (l) => l.toUpperCase());

    setAuthUser({
      isAuthenticated: true,
      role: 'user',
      name: resolvedName,
      email: authEmailInput.trim(),
      staffTitle: null
    });

    setUserProfile((prev) => ({
      ...prev,
      name: resolvedName,
      email: authEmailInput.trim(),
      points: authMode === 'register' ? 100 : prev.points
    }));
    setCustomerName(resolvedName);
    setIsAuthModalOpen(false);
    showToast(
      authMode === 'register'
        ? `Welcome to 0° Coffee Club, ${resolvedName}! +100 welcome pts added`
        : `Welcome back, ${resolvedName}!`
    );
  };

  const handleLogout = () => {
    setAuthUser({
      isAuthenticated: false,
      role: 'guest',
      name: 'Guest',
      email: '',
      staffTitle: null
    });
    setIsProfileOpen(false);
    showToast('Signed out of your account');
  };

  const adjustIngredientStock = async (ingredientId, delta) => {
    const currentIng = ingredients.find((i) => i.id === ingredientId);
    const nextStock = currentIng ? Math.max(0, currentIng.stock + delta) : 0;

    if (firebaseUser && db) {
      try {
        await setDoc(
          doc(db, 'artifacts', appId, 'public', 'data', 'ingredients', ingredientId),
          { id: ingredientId, stock: nextStock },
          { merge: true }
        );
      } catch (err) {
        console.error('Firestore ingredient adjust error:', err);
      }
    }

    setIngredients((prev) =>
      prev.map((ing) =>
        ing.id === ingredientId ? { ...ing, stock: nextStock } : ing
      )
    );
  };

  // ============================================================================
  // NAVIGATION & INTERACTION HANDLERS
  // ============================================================================
  const scrollToRef = (ref) => {
    if (ref && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleTopNavClick = (navKey) => {
    setActiveNav(navKey);
    setShowWishlistOnly(false);

    if (navKey === 'HOME') {
      setActiveStripCategory('All');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (['COFFEE', 'TEA', 'PASTRIES'].includes(navKey)) {
      setActiveStripCategory('All');
      scrollToRef(productsSectionRef);
    } else if (navKey === 'ABOUT') {
      setStoryExpanded(true);
      scrollToRef(storySectionRef);
    } else if (navKey === 'STORES') {
      setStoryExpanded(true);
      scrollToRef(storySectionRef);
    } else if (navKey === 'DELIVERY') {
      setOrderType('Delivery');
      setCheckoutStep('cart');
      setIsCartOpen(true);
    } else if (navKey === 'TRACK ORDER') {
      if (activeOrders.length > 0) {
        setTrackedOrderId(activeOrders[0].id);
      } else {
        setIsHistoryOpen(true);
      }
    } else if (navKey === 'CONTACT US') {
      scrollToRef(footerSectionRef);
    }
  };

  const handleStripCategoryClick = (catId) => {
    setShowWishlistOnly(false);
    setActiveNav('HOME');
    setActiveStripCategory((prev) => (prev === catId ? 'All' : catId));
    scrollToRef(productsSectionRef);
  };

  const openProfileDrawer = () => {
    setProfileDraft(userProfile);
    setIsEditingProfile(false);
    setNewAddressLabel('');
    setNewAddressText('');
    setIsProfileOpen(true);
  };

  const handleSaveProfile = () => {
    setUserProfile(profileDraft);
    setCustomerName(profileDraft.name);
    setCustomerPhone(profileDraft.phone);
    setPaymentMethod(profileDraft.defaultPayment);
    const defAddr =
      profileDraft.savedAddresses.find((a) => a.isDefault)?.address ||
      profileDraft.savedAddresses[0]?.address ||
      '';
    if (defAddr) setDeliveryAddress(defAddr);
    setIsEditingProfile(false);

    if (firebaseUser && db) {
      setDoc(
        doc(db, 'artifacts', appId, 'users', firebaseUser.uid, 'profile', 'main'),
        profileDraft,
        { merge: true }
      ).catch((err) => console.error('Firestore save profile error:', err));
    }

    showToast('Profile & preferences saved');
  };

  const handleAddSavedAddress = () => {
    if (!newAddressText.trim()) return;
    const newEntry = {
      id: `addr-${Date.now()}`,
      label: newAddressLabel.trim() || 'Saved Location',
      address: newAddressText.trim(),
      isDefault: userProfile.savedAddresses.length === 0
    };
    const updatedAddresses = [...userProfile.savedAddresses, newEntry];
    const updatedProfile = { ...userProfile, savedAddresses: updatedAddresses };
    setUserProfile(updatedProfile);
    setProfileDraft((prev) => ({ ...prev, savedAddresses: updatedAddresses }));
    if (newEntry.isDefault) setDeliveryAddress(newEntry.address);
    setNewAddressLabel('');
    setNewAddressText('');

    if (firebaseUser && db) {
      setDoc(
        doc(db, 'artifacts', appId, 'users', firebaseUser.uid, 'profile', 'main'),
        updatedProfile,
        { merge: true }
      ).catch((err) => console.error('Firestore add address error:', err));
    }

    showToast(`Added "${newEntry.label}" to saved addresses`);
  };

  const handleSetDefaultAddress = (addrId) => {
    const updated = userProfile.savedAddresses.map((a) => ({
      ...a,
      isDefault: a.id === addrId
    }));
    const chosen = updated.find((a) => a.id === addrId);
    const updatedProfile = { ...userProfile, savedAddresses: updated };
    setUserProfile(updatedProfile);
    setProfileDraft((prev) => ({ ...prev, savedAddresses: updated }));
    if (chosen) setDeliveryAddress(chosen.address);

    if (firebaseUser && db) {
      setDoc(
        doc(db, 'artifacts', appId, 'users', firebaseUser.uid, 'profile', 'main'),
        updatedProfile,
        { merge: true }
      ).catch((err) => console.error('Firestore set default address error:', err));
    }

    showToast(`Default delivery address set to ${chosen?.label}`);
  };

  const handleDeleteSavedAddress = (addrId) => {
    const remaining = userProfile.savedAddresses.filter((a) => a.id !== addrId);
    if (remaining.length > 0 && !remaining.some((a) => a.isDefault)) {
      remaining[0].isDefault = true;
    }
    const updatedProfile = { ...userProfile, savedAddresses: remaining };
    setUserProfile(updatedProfile);
    setProfileDraft((prev) => ({ ...prev, savedAddresses: remaining }));

    if (firebaseUser && db) {
      setDoc(
        doc(db, 'artifacts', appId, 'users', firebaseUser.uid, 'profile', 'main'),
        updatedProfile,
        { merge: true }
      ).catch((err) => console.error('Firestore delete address error:', err));
    }
  };

  const openItemCustomizer = (item, existingCartEntry = null) => {
    setCustomizingItem(item);
    if (existingCartEntry) {
      setEditingCartItemId(existingCartEntry.cartId);
      setConfig({
        ...existingCartEntry.config,
        qty: existingCartEntry.qty
      });
    } else {
      setEditingCartItemId(null);
      setConfig({
        size: 'Regular',
        ice: item.hasIce ? '0° Extra Ice' : 'No Ice / Hot',
        sweetness: '75% Less Sweet',
        milk: item.defaultMilk || 'Whole Milk',
        addons: [],
        pastryPrep: 'Warmed (Oven Crisp)',
        notes: '',
        qty: 1
      });
    }
  };

  const toggleAddon = (addonId) => {
    setConfig((prev) => {
      const exists = prev.addons.includes(addonId);
      return {
        ...prev,
        addons: exists ? prev.addons.filter((id) => id !== addonId) : [...prev.addons, addonId]
      };
    });
  };

  const handleSaveCustomizedItem = () => {
    if (!customizingItem) return;
    const unitPrice = computeItemUnitPrice(customizingItem, config);
    const cleanConfig = {
      size: config.size,
      ice: config.ice,
      sweetness: config.sweetness,
      milk: config.milk,
      addons: config.addons,
      pastryPrep: config.pastryPrep,
      notes: config.notes.trim()
    };

    if (editingCartItemId) {
      setCart((prev) =>
        prev.map((c) =>
          c.cartId === editingCartItemId
            ? { ...c, qty: config.qty, unitPrice, config: cleanConfig }
            : c
        )
      );
      showToast(`Updated ${customizingItem.name} in your bag`);
    } else {
      setCart((prev) => [
        ...prev,
        {
          cartId: `cart-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          item: customizingItem,
          qty: config.qty,
          unitPrice,
          config: cleanConfig
        }
      ]);
      showToast(`Added ${config.qty}× ${customizingItem.name} to bag`);
    }

    setCustomizingItem(null);
    setEditingCartItemId(null);
  };

  const updateCartQty = (cartId, delta) => {
    setCart((prev) =>
      prev
        .map((c) => (c.cartId === cartId ? { ...c, qty: c.qty + delta } : c))
        .filter((c) => c.qty > 0)
    );
  };

  const handleApplyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    if (!code) return;
    if (code === 'ZERO10') {
      setAppliedPromo('ZERO10');
      setPromoError('');
      showToast('Promo code ZERO10 applied (10% off)');
    } else {
      setPromoError('Invalid promo code. Try ZERO10.');
    }
  };

  const handlePlaceOrder = async () => {
    if (!customerName.trim() || !customerPhone.trim()) {
      setFormError('Please enter your name and mobile number.');
      return;
    }
    if (orderType === 'Delivery' && !deliveryAddress.trim()) {
      setFormError('Please enter a delivery address.');
      return;
    }
    setFormError('');

    const orderNum = `0DC-${Math.floor(810 + Math.random() * 189)}`;
    const etaMap = {
      priority: 1080,
      standard: 2100,
      saver: 3600
    };

    const newOrder = {
      id: orderNum,
      branch: selectedBranch.name,
      orderType,
      deliveryTierName: orderType === 'Delivery' ? activeDeliveryTier.name : null,
      deliveryTierEta: orderType === 'Delivery' ? activeDeliveryTier.eta : null,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      slot:
        orderType === 'Pickup'
          ? pickupSlot
          : `${activeDeliveryTier.name} (${activeDeliveryTier.eta})`,
      deliveryAddress: orderType === 'Delivery' ? deliveryAddress.trim() : null,
      paymentMethod,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sortTimestamp: Date.now(),
      status: 'Active',
      stageIndex: 0,
      etaSeconds: orderType === 'Pickup' ? 720 : etaMap[deliveryTierId] || 2100,
      items: [...cart],
      ...cartSummary
    };

    if (firebaseUser && db) {
      try {
        await setDoc(
          doc(db, 'artifacts', appId, 'public', 'data', 'orders', orderNum),
          newOrder
        );
      } catch (err) {
        console.error('Firestore place order error:', err);
      }
    }

    setOrders((prev) => [newOrder, ...prev]);

    // Deduct raw product ingredients based on ordered recipes (BOM)
    const deductions = {};
    const addDeduction = (id, amount) => {
      deductions[id] = (deductions[id] || 0) + amount;
    };

    cart.forEach((entry) => {
      const qty = entry.qty;
      const item = entry.item;
      const cfg = entry.config;

      if (item.isDrink) {
        if (item.navSection === 'COFFEE') {
          if (item.stripCategory === 'Limited Cold Brew') {
            addDeduction('ing-coldbrew-grounds', 25 * qty);
          } else {
            addDeduction('ing-arabica-beans', 18 * qty);
          }
        } else if (item.navSection === 'TEA') {
          if (item.id.includes('matcha')) {
            addDeduction('ing-uji-matcha', 4 * qty);
          } else {
            addDeduction('ing-hojicha-earl-grey', 6 * qty);
          }
          if (item.id.includes('dirty-matcha')) {
            addDeduction('ing-arabica-beans', 18 * qty);
          }
          if (item.id.includes('coconut')) {
            addDeduction('ing-coconut-water', 200 * qty);
          }
          if (item.id.includes('white-choc')) {
            addDeduction('ing-white-choc-sauce', 30 * qty);
          }
        }

        if (cfg.milk === 'Whole Milk') addDeduction('ing-whole-milk', 180 * qty);
        if (cfg.milk === 'Oat Milk') addDeduction('ing-oat-milk', 180 * qty);
        if (cfg.milk === 'Soy Milk' || cfg.milk === 'Almond Milk') {
          addDeduction('ing-soy-almond-milk', 180 * qty);
        }

        if (item.id.includes('sea-salt') || item.id.includes('tiramisu') || (cfg.addons || []).includes('cold-foam')) {
          addDeduction('ing-mascarpone-cream', 45 * qty);
        }
        if (item.id.includes('spanish')) addDeduction('ing-condensed-milk', 35 * qty);
        if (item.id.includes('caramel') || item.id.includes('earl-grey') || (cfg.addons || []).includes('caramel')) {
          addDeduction('ing-vanilla-caramel-syrup', 25 * qty);
        }
        if (item.id.includes('mocha')) addDeduction('ing-belgian-cacao', 30 * qty);
        if (item.id.includes('yuzu') || item.id.includes('strawberry')) {
          addDeduction('ing-yuzu-strawberry', 45 * qty);
        }
        if (item.id.includes('sesame')) addDeduction('ing-black-sesame', 30 * qty);
        if ((cfg.addons || []).includes('extra-shot')) {
          addDeduction('ing-arabica-beans', 9 * qty);
        }
        if (cfg.ice && cfg.ice !== 'No Ice / Hot') {
          addDeduction('ing-crystal-ice', 150 * qty);
        }
      } else {
        if (item.id.includes('cheesecake')) {
          addDeduction('ing-cream-cheese', 140 * qty);
        } else {
          addDeduction('ing-pastry-butter-flour', 110 * qty);
        }
        if (item.id.includes('matcha')) {
          addDeduction('ing-culinary-matcha', 15 * qty);
        }
        if (item.id.includes('brownie')) {
          addDeduction('ing-belgian-cacao', 40 * qty);
        }
      }
    });

    const updatedIngredientsList = ingredients.map((ing) =>
      deductions[ing.id]
        ? { ...ing, stock: Math.max(0, ing.stock - deductions[ing.id]) }
        : ing
    );
    setIngredients(updatedIngredientsList);

    if (firebaseUser && db) {
      Object.keys(deductions).forEach((ingId) => {
        const updatedIng = updatedIngredientsList.find((i) => i.id === ingId);
        if (updatedIng) {
          setDoc(
            doc(db, 'artifacts', appId, 'public', 'data', 'ingredients', ingId),
            { id: ingId, stock: updatedIng.stock },
            { merge: true }
          ).catch((err) => console.error('Firestore ingredient deduction error:', err));
        }
      });
    }

    if (userProfile.isMember && cartSummary.pointsEarned > 0) {
      const updatedPoints = userProfile.points + cartSummary.pointsEarned;
      setUserProfile((prev) => ({
        ...prev,
        points: updatedPoints
      }));
      if (firebaseUser && db) {
        setDoc(
          doc(db, 'artifacts', appId, 'users', firebaseUser.uid, 'profile', 'main'),
          { ...userProfile, points: updatedPoints },
          { merge: true }
        ).catch((err) => console.error('Firestore points earn error:', err));
      }
    }

    setCart([]);
    setAppliedPromo(null);
    setPromoInput('');
    setCheckoutStep('cart');
    setIsCartOpen(false);
    setTrackedOrderId(orderNum);
  };

  const handleReorder = (pastOrder) => {
    const clonedItems = pastOrder.items.map((entry, idx) => ({
      ...entry,
      cartId: `reorder-${Date.now()}-${idx}`
    }));
    setCart(clonedItems);
    setIsHistoryOpen(false);
    setCheckoutStep('cart');
    setIsCartOpen(true);
    showToast(`Loaded items from #${pastOrder.id} into your bag`);
  };

  const toggleFavorite = (e, itemId) => {
    e.stopPropagation();
    setFavorites((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  const totalCartItems = cart.reduce((sum, i) => sum + i.qty, 0);
  const activeOrders = useMemo(() => orders.filter((o) => o.status === 'Active'), [orders]);
  const currentSlide = HERO_SLIDES[heroSlideIdx];

  const formatCountdown = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const topNavLinks = [
    'HOME',
    'COFFEE',
    'TEA',
    'PASTRIES',
    'ABOUT',
    'STORES',
    'DELIVERY',
    'TRACK ORDER',
    'CONTACT US'
  ];

  // ============================================================================
  // DEDICATED ADMIN PORTAL VIEW (STRICTLY CUSTOMER ORDERS & INGREDIENTS ONLY)
  // ============================================================================
  if (authUser.isAuthenticated && authUser.role === 'admin') {
    const stageNames = [
      '0: Order Confirmed',
      '1: Barista Crafting',
      '2: Chilled & Sealed',
      '3: Ready / Delivered'
    ];
    const lowStockIngredients = ingredients.filter((ing) => ing.stock <= ing.minThreshold);
    const ingredientCategories = [
      'All',
      ...Array.from(new Set(ingredients.map((ing) => ing.category)))
    ];
    const visibleIngredients =
      ingredientCategoryFilter === 'All'
        ? ingredients
        : ingredients.filter((ing) => ing.category === ingredientCategoryFilter);

    return (
      <div className="min-h-screen bg-[#F5F4F1] text-[#222222] font-sans flex flex-col">
        {/* Admin Top Header */}
        <header className="bg-[#140E0A] text-white border-b border-white/10 sticky top-0 z-30">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <BrandLogoBadge compact />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-sm sm:text-base font-extrabold uppercase tracking-wider text-white">
                    0° Caffe Admin Portal
                  </h1>
                  <span className="px-2 py-0.5 bg-[#E5A93C] text-[#140E0A] text-[10px] font-black uppercase">
                    Staff Only
                  </span>
                </div>
                <p className="text-[11px] text-neutral-300">
                  {authUser.name} • Branch: <strong className="text-[#E5A93C]">{selectedBranch.name}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <select
                value={selectedBranch.id}
                onChange={(e) => {
                  const found = BRANCHES.find((b) => b.id === e.target.value);
                  if (found) setSelectedBranch(found);
                }}
                className="px-3 py-1.5 bg-white/10 border border-white/20 text-white text-xs font-bold focus:outline-none"
              >
                {BRANCHES.map((b) => (
                  <option key={b.id} value={b.id} className="text-black">
                    {b.name}
                  </option>
                ))}
              </select>

              <button
                onClick={() => openAuthDialog('login')}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-neutral-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-[#E5A93C]" />
                <span>Switch Account</span>
              </button>

              <button
                onClick={handleLogout}
                className="px-3 py-1.5 bg-[#D63333] hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Admin Main Workspace */}
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 tabular-nums">
            <div className="bg-white border border-neutral-200 p-4 shadow-xs">
              <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                Active Customer Orders
              </p>
              <p className="text-2xl font-extrabold text-[#D63333] mt-1">
                {activeOrders.length} Active
              </p>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                {orders.length} total tickets logged today
              </p>
            </div>

            <div className="bg-white border border-neutral-200 p-4 shadow-xs">
              <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                Tracked Raw Ingredients
              </p>
              <p className="text-2xl font-extrabold text-[#222222] mt-1">
                {ingredients.length} Ingredients
              </p>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                Auto-deducted per drink &amp; pastry recipe
              </p>
            </div>

            <div className="bg-white border border-neutral-200 p-4 shadow-xs">
              <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                Low Ingredient Alerts
              </p>
              <p className="text-2xl font-extrabold text-amber-700 mt-1">
                {lowStockIngredients.length} Low
              </p>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                Ingredients at or below par threshold
              </p>
            </div>
          </div>

          <div className="bg-white border border-neutral-200 shadow-xs">
            <div className="grid grid-cols-2 border-b border-neutral-200">
              <button
                onClick={() => setAdminTab('orders')}
                className={`py-3.5 px-4 text-xs sm:text-sm font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition cursor-pointer ${
                  adminTab === 'orders'
                    ? 'border-[#D63333] bg-red-50/20 text-[#222222]'
                    : 'border-transparent text-neutral-500 hover:text-black'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-[#D63333]" />
                <span>Customer Orders ({orders.length})</span>
              </button>

              <button
                onClick={() => setAdminTab('inventory')}
                className={`py-3.5 px-4 text-xs sm:text-sm font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition cursor-pointer ${
                  adminTab === 'inventory'
                    ? 'border-[#E5A93C] bg-amber-50/20 text-[#222222]'
                    : 'border-transparent text-neutral-500 hover:text-black'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4 text-[#E5A93C]" />
                <span>Product Ingredients ({ingredients.length})</span>
              </button>
            </div>

            <div className="p-5 sm:p-6">
              {adminTab === 'orders' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {orders.map((ord) => (
                    <div
                      key={ord.id}
                      className="p-4 border border-neutral-200 bg-neutral-50/50 space-y-3 text-xs flex flex-col justify-between"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-sm text-[#222222]">
                                #{ord.id}
                              </span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 border ${
                                  ord.status === 'Cancelled'
                                    ? 'bg-red-50 text-[#D63333] border-[#D63333]'
                                    : ord.status === 'Completed'
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                    : 'bg-amber-50 text-amber-900 border-[#E5A93C]'
                                }`}
                              >
                                {ord.status === 'Active' ? stageNames[ord.stageIndex] : ord.status}
                              </span>
                            </div>
                            <p className="text-xs font-bold text-neutral-800 mt-1">
                              {ord.customerName} • {ord.customerPhone}
                            </p>
                            <p className="text-[11px] text-neutral-500">
                              {ord.orderType} ({ord.slot}) • {ord.branch}
                            </p>
                            {ord.deliveryAddress && (
                              <p className="text-[11px] text-neutral-600 mt-0.5">
                                Address: {ord.deliveryAddress}
                              </p>
                            )}
                          </div>
                          <span className="font-extrabold text-sm text-[#C92A2A] tabular-nums">
                            ₱{ord.total.toFixed(2)}
                          </span>
                        </div>

                        <div className="p-3 bg-white border border-neutral-200 space-y-1">
                          {ord.items.map((entry, idx) => (
                            <div key={idx} className="flex justify-between text-[11px]">
                              <span className="text-neutral-800">
                                <strong>{entry.qty}×</strong> {entry.item.name} ({entry.config.size})
                              </span>
                              <span className="text-neutral-500">
                                {entry.config.ice || entry.config.pastryPrep}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {ord.status === 'Active' && (
                        <div className="pt-2 border-t border-neutral-200 flex items-center gap-2">
                          <button
                            onClick={() => {
                              advanceOrderStage(ord.id);
                              showToast(`Customer order #${ord.id} moved to next stage`);
                            }}
                            className="flex-1 py-2 bg-[#222222] hover:bg-black text-white text-xs font-bold cursor-pointer"
                          >
                            Advance Order Stage →
                          </button>
                          {canCancelOrder(ord) && (
                            <button
                              onClick={() => openCancelDialog(ord)}
                              className="py-2 px-3 bg-red-50 hover:bg-red-100 border border-[#D63333] text-[#D63333] text-xs font-bold cursor-pointer"
                            >
                              Cancel &amp; Refund
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-neutral-200">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {ingredientCategories.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setIngredientCategoryFilter(cat)}
                          className={`px-3 py-1 text-[11px] font-bold border transition cursor-pointer ${
                            ingredientCategoryFilter === cat
                              ? 'bg-[#222222] border-[#222222] text-white'
                              : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:border-neutral-400'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                    <span className="text-[11px] text-neutral-500">
                      Showing {visibleIngredients.length} raw ingredients
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {visibleIngredients.map((ing) => {
                      const isDepleted = ing.stock === 0;
                      const isLow = ing.stock > 0 && ing.stock <= ing.minThreshold;

                      return (
                        <div
                          key={ing.id}
                          className={`p-3.5 border flex items-center justify-between gap-3 text-xs ${
                            isDepleted
                              ? 'border-[#D63333] bg-red-50/30'
                              : isLow
                              ? 'border-amber-400 bg-amber-50/30'
                              : 'border-neutral-200 bg-white'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <MenuPhoto
                              src={ing.image}
                              alt={ing.name}
                              gradient="from-stone-800 to-amber-950"
                              className="w-12 h-12 shrink-0 border border-neutral-200"
                            />
                            <div className="min-w-0 space-y-1">
                              <p className="font-bold text-[#222222] truncate">{ing.name}</p>
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="text-[11px] text-neutral-500">{ing.category}</span>
                                <span className="text-neutral-300">•</span>
                                <span className="text-[10px] text-neutral-500 tabular-nums">
                                  Par: {ing.minThreshold.toLocaleString()}
                                  {ing.unit}
                                </span>
                                {isDepleted && (
                                  <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 bg-[#D63333] text-white">
                                    Out of Stock
                                  </span>
                                )}
                                {isLow && (
                                  <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 bg-amber-200 text-amber-950">
                                    Low Stock
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 tabular-nums">
                            <div className="flex items-center border border-neutral-300 bg-neutral-50">
                              <button
                                onClick={() => adjustIngredientStock(ing.id, -ing.adjustStep)}
                                aria-label={`Decrease ${ing.name}`}
                                className="px-2.5 py-1.5 hover:bg-neutral-200 font-bold cursor-pointer"
                              >
                                -
                              </button>
                              <span className="px-2.5 font-extrabold text-[#222222] min-w-[78px] text-center">
                                {ing.stock.toLocaleString()}
                                {ing.unit}
                              </span>
                              <button
                                onClick={() => adjustIngredientStock(ing.id, ing.adjustStep)}
                                aria-label={`Increase ${ing.name}`}
                                className="px-2.5 py-1.5 hover:bg-neutral-200 font-bold cursor-pointer"
                              >
                                +
                              </button>
                            </div>

                            <button
                              onClick={() => {
                                adjustIngredientStock(ing.id, ing.restockStep);
                                showToast(
                                  `Restocked +${ing.restockStep.toLocaleString()}${ing.unit} of ${ing.name}`
                                );
                              }}
                              className="px-2.5 py-1.5 bg-[#222222] hover:bg-black text-white text-[11px] font-bold cursor-pointer"
                              title={`Restock +${ing.restockStep}${ing.unit}`}
                            >
                              +{ing.restockStep}
                              {ing.unit}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>

        {cancellingOrder && (
          <div className="fixed inset-0 z-[60] bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md shadow-2xl overflow-hidden">
              <div className="p-5 bg-[#D63333] text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Ban className="w-4 h-4" />
                  <h3 className="text-sm font-extrabold uppercase tracking-wide">
                    Cancel Order #{cancellingOrder.id}?
                  </h3>
                </div>
                <button
                  onClick={() => setCancellingOrder(null)}
                  className="p-1.5 bg-black/20 hover:bg-black/35 text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                <p className="text-xs text-neutral-700">
                  Cancelling this order will immediately issue a full refund of{' '}
                  <strong>₱{cancellingOrder.total.toFixed(2)}</strong> to{' '}
                  <strong>{cancellingOrder.customerName}</strong>.
                </p>

                <div>
                  <label className="block text-xs font-extrabold text-neutral-700 mb-1.5">
                    Cancellation Reason
                  </label>
                  <select
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 text-xs bg-white"
                  >
                    <option value="Out of stock ingredient">Out of stock ingredient</option>
                    <option value="Customer requested cancellation">
                      Customer requested cancellation
                    </option>
                    <option value="Delivery zone unreachable">Delivery zone unreachable</option>
                    <option value="Duplicate order ticket">Duplicate order ticket</option>
                  </select>
                </div>

                <div className="pt-2 flex gap-2.5">
                  <button
                    onClick={() => setCancellingOrder(null)}
                    className="flex-1 py-2.5 border border-neutral-300 text-xs font-bold text-neutral-700 cursor-pointer"
                  >
                    Keep Order
                  </button>
                  <button
                    onClick={confirmCancelOrder}
                    className="flex-1 py-2.5 bg-[#D63333] hover:bg-red-700 text-white text-xs font-extrabold cursor-pointer"
                  >
                    Confirm Cancellation
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {toast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] bg-[#140E0A] text-white px-4 py-2.5 shadow-xl border border-[#E5A93C] text-xs font-bold flex items-center gap-2 max-w-[92vw]">
            <CheckCircle2 className="w-4 h-4 text-[#E5A93C] shrink-0" />
            <span className="truncate">{toast}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-[#222222] font-sans selection:bg-[#E5A93C]/30 selection:text-black">
      {/* ========================================================================
          1. DARK TRANSLUCENT HEADER & TOP UTILITY BAR
         ======================================================================== */}
      <header className="relative z-30 bg-[#140E0A] text-white border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-2.5 pb-2 flex flex-wrap items-center justify-end gap-x-4 gap-y-1.5 text-[11px] border-b border-white/10">
          <span className="text-[#E5A93C] font-bold tracking-wide mr-auto flex items-center gap-1.5">
            <Phone className="w-3 h-3" />
            <span>call 033-320-0000</span>
            <span className="hidden md:inline text-neutral-400 font-normal ml-2">
              • Branch: <strong className="text-white">{selectedBranch.name}</strong>
            </span>
          </span>

          {authUser.isAuthenticated ? (
            <button
              onClick={openProfileDrawer}
              className="flex items-center gap-1 text-neutral-300 hover:text-white transition cursor-pointer"
              title="Open Profile & Saved Addresses"
            >
              <User className="w-3 h-3 text-[#E5A93C]" />
              <span>
                {authUser.name.split(' ')[0]} ({userProfile.points} pts)
              </span>
            </button>
          ) : (
            <span className="text-neutral-400">Guest Mode</span>
          )}

          <button
            onClick={() => openAuthDialog('login')}
            className="flex items-center gap-1 text-neutral-300 hover:text-[#E5A93C] transition cursor-pointer"
            title="Login for Users and Admins"
          >
            <LogIn className="w-3 h-3 text-[#E5A93C]" />
            <span>Login</span>
          </button>

          {authUser.isAuthenticated && (
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 text-neutral-400 hover:text-[#D63333] transition cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-3 h-3" />
              <span>Logout</span>
            </button>
          )}

          <button
            onClick={() => setIsHistoryOpen(true)}
            className="flex items-center gap-1 text-neutral-300 hover:text-white transition cursor-pointer"
          >
            <History className="w-3 h-3 text-[#E5A93C]" />
            <span>My Orders ({orders.length})</span>
          </button>

          <button
            onClick={() => {
              setShowWishlistOnly((prev) => !prev);
              scrollToRef(productsSectionRef);
            }}
            className={`flex items-center gap-1 transition cursor-pointer ${
              showWishlistOnly ? 'text-[#E5A93C] font-bold' : 'text-neutral-300 hover:text-white'
            }`}
          >
            <Heart className={`w-3 h-3 ${showWishlistOnly ? 'fill-[#E5A93C]' : ''}`} />
            <span>Wishlist ({favorites.length})</span>
          </button>

          <button
            onClick={() => {
              setCheckoutStep('cart');
              setIsCartOpen(true);
            }}
            className="flex items-center gap-2 pl-2 border-l border-white/15 cursor-pointer group"
          >
            <span className="relative inline-flex items-center">
              <ShoppingBag className="w-3.5 h-3.5 text-neutral-200 group-hover:text-white" />
              <span className="ml-1 px-1.5 py-0.2 bg-[#D63333] text-white text-[10px] font-extrabold rounded-xs leading-tight">
                {totalCartItems}
              </span>
            </span>
            <span className="font-extrabold text-[#D63333] tabular-nums">
              ₱{cartSummary.subtotal.toFixed(2)}
            </span>
            <span className="text-neutral-200 group-hover:text-white font-semibold underline-offset-2 group-hover:underline">
              Checkout
            </span>
          </button>
        </div>

        {/* Main Brand Logo + Navigation Row */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <button
            onClick={() => handleTopNavClick('HOME')}
            className="cursor-pointer text-left shrink-0"
          >
            <BrandLogoBadge />
          </button>

          <nav className="hidden lg:flex items-center gap-5 xl:gap-6">
            {topNavLinks.map((link) => {
              const isActive = activeNav === link && !showWishlistOnly;
              return (
                <button
                  key={link}
                  onClick={() => handleTopNavClick(link)}
                  className={`text-[11px] font-bold tracking-[0.12em] uppercase transition cursor-pointer ${
                    isActive
                      ? 'text-[#D63333]'
                      : 'text-neutral-200 hover:text-[#E5A93C]'
                  }`}
                >
                  {link}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => scrollToRef(bottomSearchRef)}
              aria-label="Scroll to Menu Search"
              title="Jump to Menu Search"
              className="px-3 h-8 bg-[#E5A93C] hover:bg-[#d4962b] text-[#140E0A] font-extrabold text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition"
            >
              <Search className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">Find Drink</span>
            </button>
          </div>
        </div>

        {/* Mobile / Tablet Navigation Strip */}
        <div className="lg:hidden border-t border-white/10 px-4 py-2 flex items-center gap-4 overflow-x-auto text-[11px] font-bold tracking-wider uppercase">
          {topNavLinks.map((link) => (
            <button
              key={link}
              onClick={() => handleTopNavClick(link)}
              className={`shrink-0 cursor-pointer ${
                activeNav === link ? 'text-[#D63333]' : 'text-neutral-300'
              }`}
            >
              {link}
            </button>
          ))}
        </div>
      </header>

      {/* Active Order Live Notification Ribbon */}
      {activeOrders.length > 0 && (
        <div className="bg-[#231710] text-white border-b border-[#E5A93C]/30">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#E5A93C] animate-pulse" />
              <span className="font-bold text-[#E5A93C]">
                Active Order #{activeOrders[0].id}:
              </span>
              <span className="text-neutral-200">
                {
                  [
                    'Order Confirmed',
                    'Barista Crafting at 0°',
                    'Chilled & Sealed',
                    'Ready for Pickup'
                  ][activeOrders[0].stageIndex]
                }{' '}
                ({activeOrders[0].orderType} • Est.{' '}
                {formatCountdown(activeOrders[0].etaSeconds)})
              </span>
            </div>

            <div className="flex items-center gap-3">
              {canCancelOrder(activeOrders[0]) && (
                <button
                  onClick={() => openCancelDialog(activeOrders[0])}
                  className="text-[11px] font-bold text-red-300 hover:text-white underline cursor-pointer"
                >
                  Cancel Order
                </button>
              )}
              <button
                onClick={() => setTrackedOrderId(activeOrders[0].id)}
                className="px-2.5 py-1 bg-[#E5A93C] hover:bg-[#d4962b] text-[#140E0A] font-extrabold text-[11px] uppercase tracking-wider cursor-pointer"
              >
                Track Live
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================
          2. FULL-BLEED DARK ROASTED COFFEE HERO WITH 5-COLUMN ICON STRIP
         ======================================================================== */}
      <section className="relative w-full min-h-[450px] sm:min-h-[510px] bg-[#140E0A] text-white flex flex-col justify-between overflow-hidden">
        <img
          src={currentSlide.image}
          alt={currentSlide.title}
          className="absolute inset-0 w-full h-full object-cover object-center opacity-60 transition-all duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0F0A07]/85 via-[#18100B]/60 to-[#0F0A07]/85" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/40" />

        <button
          onClick={() =>
            setHeroSlideIdx((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)
          }
          aria-label="Previous Slide"
          className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 p-2 text-white/75 hover:text-white transition cursor-pointer"
        >
          <ChevronLeft className="w-7 h-7 sm:w-8 sm:h-8 stroke-[1.75]" />
        </button>

        <button
          onClick={() => setHeroSlideIdx((prev) => (prev + 1) % HERO_SLIDES.length)}
          aria-label="Next Slide"
          className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 p-2 text-white/75 hover:text-white transition cursor-pointer"
        >
          <ChevronRight className="w-7 h-7 sm:w-8 sm:h-8 stroke-[1.75]" />
        </button>

        <div className="relative z-10 max-w-6xl mx-auto w-full px-12 sm:px-20 pt-16 sm:pt-24 pb-12 flex-1 flex items-center">
          <div className="w-full md:w-1/2 md:ml-auto text-left space-y-3.5">
            <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-normal tracking-tight text-[#E5A93C] leading-tight">
              {currentSlide.title}
            </h1>
            <p className="text-xs sm:text-sm text-[#E6C79C] leading-relaxed max-w-md">
              {currentSlide.subtitle}
            </p>

            <div className="pt-1 flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => handleStripCategoryClick(currentSlide.targetCategory)}
                className="px-5 py-2 bg-[#D69A3F] hover:bg-[#c5892e] text-[#1D130A] font-bold text-xs tracking-wide rounded-[2px] shadow-md transition cursor-pointer"
              >
                {currentSlide.ctaLabel}
              </button>

              <div className="inline-flex bg-black/55 border border-white/20 text-[11px]">
                <button
                  onClick={() => setOrderType('Pickup')}
                  className={`px-3 py-1.5 font-bold transition cursor-pointer ${
                    orderType === 'Pickup'
                      ? 'bg-white text-black'
                      : 'text-neutral-300 hover:text-white'
                  }`}
                >
                  Pickup ({selectedBranch.pickupMins})
                </button>
                <button
                  onClick={() => setOrderType('Delivery')}
                  className={`px-3 py-1.5 font-bold transition cursor-pointer ${
                    orderType === 'Delivery'
                      ? 'bg-[#D63333] text-white'
                      : 'text-neutral-300 hover:text-white'
                  }`}
                >
                  Delivery (from ₱20)
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 bg-black/55 border-t border-white/15 backdrop-blur-[2px]">
          <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-white/15">
            {HERO_STRIP_CATEGORIES.map((cat) => {
              const IconComponent = cat.icon;
              const isSelected = activeStripCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleStripCategoryClick(cat.id)}
                  className={`py-4 px-3 flex flex-col items-center justify-center gap-2 transition cursor-pointer group ${
                    isSelected ? 'bg-[#E5A93C]/20' : 'hover:bg-white/5'
                  }`}
                >
                  <IconComponent
                    className={`w-6 h-6 stroke-[1.5] transition ${
                      isSelected
                        ? 'text-[#E5A93C]'
                        : 'text-[#D6A668] group-hover:text-[#E5A93C]'
                    }`}
                  />
                  <span
                    className={`text-xs tracking-wide ${
                      isSelected
                        ? 'text-white font-bold'
                        : 'text-[#D6A668] group-hover:text-white'
                    }`}
                  >
                    {cat.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================================
          3. CENTERED WELCOME & BRAND STORY SECTION
         ======================================================================== */}
      <section
        ref={storySectionRef}
        className="max-w-4xl mx-auto px-4 sm:px-6 pt-12 pb-8 text-center"
      >
        <h2 className="text-2xl sm:text-[26px] font-normal text-[#333333] tracking-tight">
          Welcome to 0 Degree Caffe
        </h2>
        <p className="mt-3 text-xs sm:text-[13px] text-[#777777] leading-relaxed max-w-2xl mx-auto">
          0 Degree Caffe is the realization of small-batch Highland Arabica roasting and precision
          sub-zero cold extraction in Iloilo City. Every cup begins at 0.0°C to lock in pure
          chocolate, caramel, and floral aromatics without harsh acidity.
        </p>

        {storyExpanded && (
          <div className="mt-5 p-5 bg-[#FAF8F5] border border-neutral-200 text-left grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            {BRANCHES.map((branch) => {
              const isSelected = selectedBranch.id === branch.id;
              return (
                <div
                  key={branch.id}
                  onClick={() => {
                    setSelectedBranch(branch);
                    setPickupSlot(`ASAP (${branch.pickupMins})`);
                    showToast(`Selected branch: ${branch.name}`);
                  }}
                  className={`p-3.5 border transition cursor-pointer ${
                    isSelected
                      ? 'border-[#D63333] bg-white shadow-xs'
                      : 'border-neutral-200 bg-white/70 hover:border-neutral-400'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-[#222222]">
                    <span>{branch.name}</span>
                    {isSelected && (
                      <span className="text-[10px] uppercase text-[#D63333] font-extrabold">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-neutral-500 mt-1">{branch.address}</p>
                  <p className="text-neutral-700 font-semibold mt-2">
                    Hours: {branch.hours} • Prep: {branch.pickupMins}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        <button
          onClick={() => setStoryExpanded((prev) => !prev)}
          className="mt-4 inline-block text-xs font-bold text-[#333333] hover:text-[#D63333] underline-offset-4 hover:underline cursor-pointer"
        >
          {storyExpanded ? 'Show Less' : 'Read More & Choose Branch'}
        </button>
      </section>

      {/* ========================================================================
          4. HORIZONTAL PROMO BANNER ("IT'S ALL ABOUT THE CUP")
         ======================================================================== */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-10">
        <div className="relative overflow-hidden bg-[#16110D] text-white border border-neutral-800 shadow-xs">
          <div className="flex flex-col sm:flex-row items-center justify-between px-5 sm:px-8 py-4 gap-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 border border-white/40 flex items-center justify-center shrink-0">
                <Coffee className="w-5 h-5 text-[#E5A93C]" />
              </div>
              <span className="text-base sm:text-lg font-normal tracking-wide text-white">
                It&apos;s All About the Cup
              </span>
            </div>

            <button
              onClick={() => setCupPromoExpanded((prev) => !prev)}
              className="px-4 py-1.5 bg-white hover:bg-neutral-100 text-[#222222] text-xs font-bold rounded-[2px] shadow-xs transition cursor-pointer shrink-0"
            >
              {cupPromoExpanded ? 'Close Offer' : 'Read More'}
            </button>

            <div className="hidden md:flex items-center gap-3">
              <div className="text-right text-[11px] text-[#E5A93C] leading-tight">
                <span className="block font-bold">FREE BARISTA OAT MILK</span>
                <span className="text-neutral-300">On Signature Cold Brews + ZERO10</span>
              </div>
              <BrandLogoBadge compact />
            </div>
          </div>

          {cupPromoExpanded && (
            <div className="px-6 py-4 bg-black/80 border-t border-white/15 text-xs text-neutral-200 flex flex-wrap items-center justify-between gap-3">
              <p>
                Enjoy complimentary <strong>Barista Oat Milk</strong> upgrades on all Signature 0°
                Cold Brews, plus enter promo code{' '}
                <code className="px-1.5 py-0.5 bg-[#E5A93C] text-black font-extrabold">
                  ZERO10
                </code>{' '}
                in your bag for 10% off your online order.
              </p>
              <button
                onClick={() => {
                  setAppliedPromo('ZERO10');
                  setIsCartOpen(true);
                  showToast('Promo code ZERO10 applied to your bag!');
                }}
                className="px-3 py-1.5 bg-[#D63333] hover:bg-red-700 text-white font-bold cursor-pointer"
              >
                Apply ZERO10 to Bag
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ========================================================================
          5. 5-COLUMN BORDERED FEATURED PRODUCTS GRID (25 ITEMS)
         ======================================================================== */}
      <main ref={productsSectionRef} className="max-w-5xl mx-auto px-4 sm:px-6 pb-16">
        <div className="text-center mb-6">
          <h2 className="text-xl sm:text-[22px] font-normal text-[#333333]">
            Featured Products
          </h2>

          {(activeStripCategory !== 'All' ||
            activeNav !== 'HOME' ||
            activeSearchTag !== 'All' ||
            showWishlistOnly ||
            searchQuery.trim() !== '') && (
            <div className="mt-2 flex items-center justify-center gap-2 text-xs text-neutral-500">
              <span>
                Showing {filteredMenu.length} of {menuItems.length} items
                {activeStripCategory !== 'All' ? ` in "${activeStripCategory}"` : ''}
                {['COFFEE', 'TEA', 'PASTRIES'].includes(activeNav) ? ` (${activeNav})` : ''}
                {activeSearchTag !== 'All' ? ` • Tag: ${activeSearchTag}` : ''}
                {showWishlistOnly ? ' • Wishlist' : ''}
              </span>
              <button
                onClick={() => {
                  setActiveStripCategory('All');
                  setActiveSearchTag('All');
                  setActiveNav('HOME');
                  setShowWishlistOnly(false);
                  setSearchQuery('');
                }}
                className="text-[#D63333] font-bold hover:underline cursor-pointer"
              >
                Reset Filter
              </button>
            </div>
          )}
        </div>

        {filteredMenu.length === 0 ? (
          <div className="border border-neutral-200 py-14 px-6 text-center">
            <p className="text-sm font-bold text-neutral-700">No products match this filter</p>
            <p className="text-xs text-neutral-500 mt-1">
              Try resetting your search or selecting another coffee or pastry category.
            </p>
            <button
              onClick={() => {
                setActiveStripCategory('All');
                setActiveSearchTag('All');
                setActiveNav('HOME');
                setShowWishlistOnly(false);
                setSearchQuery('');
              }}
              className="mt-4 px-4 py-2 bg-[#222222] text-white text-xs font-bold cursor-pointer"
            >
              Show All 25 Featured Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 border-t border-l border-neutral-200">
            {filteredMenu.map((item) => {
              const isFav = favorites.includes(item.id);
              const inCartCount = cart
                .filter((c) => c.item.id === item.id)
                .reduce((sum, c) => sum + c.qty, 0);

              return (
                <article
                  key={item.id}
                  onClick={() => openItemCustomizer(item)}
                  className="group relative bg-white border-r border-b border-neutral-200 p-4 flex flex-col items-center text-center hover:bg-[#FAF8F5] transition cursor-pointer"
                >
                  <div className="w-full flex items-center justify-between mb-1 min-h-[20px]">
                    {inCartCount > 0 ? (
                      <span className="px-1.5 py-0.5 bg-[#222222] text-white text-[10px] font-bold">
                        {inCartCount} in bag
                      </span>
                    ) : (
                      <span className="text-[10px] text-neutral-400 uppercase tracking-wider">
                        {item.tags[0]}
                      </span>
                    )}

                    <button
                      onClick={(e) => toggleFavorite(e, item.id)}
                      aria-label={`Save ${item.name} to wishlist`}
                      className="p-1 text-neutral-300 hover:text-[#D63333] transition cursor-pointer"
                    >
                      <Heart
                        className={`w-3.5 h-3.5 ${
                          isFav ? 'fill-[#D63333] text-[#D63333]' : ''
                        }`}
                      />
                    </button>
                  </div>

                  <div className="w-32 h-32 my-2 overflow-hidden bg-neutral-100 border border-neutral-100 flex items-center justify-center">
                    <MenuPhoto
                      src={item.image}
                      alt={item.name}
                      gradient={item.accentGradient}
                      className="w-full h-full group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  <h3 className="mt-2 text-xs font-bold text-[#555555] group-hover:text-black transition line-clamp-1">
                    {item.name}
                  </h3>

                  <p className="mt-1 text-[11px] text-[#888888] leading-snug line-clamp-2 min-h-[30px]">
                    {item.shortDesc}
                  </p>

                  <div className="mt-2.5 text-sm font-extrabold text-[#C92A2A] tabular-nums">
                    ₱{item.basePrice.toFixed(2)}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openItemCustomizer(item);
                    }}
                    className="mt-2.5 w-full py-1.5 border border-neutral-300 group-hover:border-[#222222] group-hover:bg-[#222222] group-hover:text-white text-[11px] font-bold text-neutral-700 transition cursor-pointer"
                  >
                    Customize &amp; Order
                  </button>
                </article>
              );
            })}
          </div>
        )}

        {/* ========================================================================
            6. MENU SEARCH & QUICK FILTER BAR (BELOW FEATURED PRODUCTS)
           ======================================================================== */}
        <div
          ref={bottomSearchRef}
          className="mt-8 p-5 sm:p-6 bg-[#FAF8F5] border border-neutral-200"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-extrabold text-[#222222] uppercase tracking-wider">
                Search &amp; Filter the 0° Menu
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Find any drink, single-origin roast, tea, matcha, or pastry across all{' '}
                {menuItems.length} menu items.
              </p>
            </div>

            <div className="relative w-full md:w-96 flex items-center">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search espresso, cold brew, oat milk, matcha..."
                className="w-full pl-9 pr-16 py-2.5 bg-white border border-neutral-300 text-xs text-[#222222] focus:outline-none focus:border-[#222222]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 text-[11px] font-bold text-[#D63333] hover:underline cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3.5 border-t border-neutral-200 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mr-1">
              Quick Filter:
            </span>
            {QUICK_SEARCH_TAGS.map((tag) => {
              const active = activeSearchTag === tag;
              return (
                <button
                  key={tag}
                  onClick={() => setActiveSearchTag(tag)}
                  className={`px-3 py-1 text-[11px] font-bold border transition cursor-pointer ${
                    active
                      ? 'bg-[#222222] border-[#222222] text-white'
                      : 'bg-white border-neutral-200 text-neutral-600 hover:border-neutral-400'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>
      </main>

      {/* ========================================================================
          7. DARK 5-COLUMN FOOTER
         ======================================================================== */}
      <footer ref={footerSectionRef} className="bg-[#111111] text-neutral-400 text-xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8">
          <div>
            <h4 className="text-white font-bold text-xs mb-3">Company Info</h4>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <button
                  onClick={() => handleTopNavClick('ABOUT')}
                  className="hover:text-white cursor-pointer"
                >
                  About Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleTopNavClick('STORES')}
                  className="hover:text-white cursor-pointer"
                >
                  Our Iloilo Branches
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCupPromoExpanded(true)}
                  className="hover:text-white cursor-pointer"
                >
                  Sub-Zero Roasting Standard
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-xs mb-3">Customer Service</h4>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <button
                  onClick={() => {
                    setOrderType('Delivery');
                    setIsCartOpen(true);
                  }}
                  className="hover:text-white cursor-pointer"
                >
                  Delivery Tiers &amp; Rates
                </button>
              </li>
              <li>
                <button
                  onClick={() => setIsHistoryOpen(true)}
                  className="hover:text-white cursor-pointer"
                >
                  Order Cancellation &amp; Refunds
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToRef(bottomSearchRef)}
                  className="hover:text-white cursor-pointer"
                >
                  Search Full Menu
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-xs mb-3">My Account</h4>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <button
                  onClick={() => openAuthDialog('login')}
                  className="hover:text-white cursor-pointer"
                >
                  Account Login
                </button>
              </li>
              <li>
                <button
                  onClick={openProfileDrawer}
                  className="hover:text-white cursor-pointer"
                >
                  My Profile ({userProfile.points} pts)
                </button>
              </li>
              <li>
                <button
                  onClick={() => setIsHistoryOpen(true)}
                  className="hover:text-white cursor-pointer"
                >
                  Order History
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setShowWishlistOnly(true);
                    scrollToRef(productsSectionRef);
                  }}
                  className="hover:text-white cursor-pointer"
                >
                  Saved Wishlist
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-xs mb-3">Call Us</h4>
            <ul className="space-y-1.5 text-[11px]">
              <li>Local: 033-320-0000</li>
              <li>Mobile: +63 917 842 0194</li>
              <li>Email: hello@0degreecaffe.ph</li>
              <li className="pt-1 flex items-center gap-1.5 text-[10px]">
                <span
                  className={`w-2 h-2 rounded-full ${
                    backendConnected ? 'bg-emerald-400' : 'bg-[#E5A93C]'
                  }`}
                />
                <span>
                  Cloud Sync: {backendConnected ? 'Live Cloud Connected' : 'Local Edge Mode'}
                </span>
              </li>
            </ul>
          </div>

          <div className="col-span-2 sm:col-span-1">
            <h4 className="text-white font-bold text-xs mb-3">Newsletter</h4>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newsletterEmail.trim()) return;
                setNewsletterSubscribed(true);
                setNewsletterEmail('');
                showToast('Subscribed to 0 Degree Caffe updates!');
              }}
              className="space-y-2"
            >
              <input
                type="email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Enter email address"
                className="w-full px-2.5 py-1.5 bg-[#2A2A2A] border border-neutral-700 text-white text-[11px] focus:outline-none focus:border-[#E5A93C]"
              />
              <button
                type="submit"
                className="px-3.5 py-1.5 bg-[#D63333] hover:bg-red-700 text-white text-[11px] font-bold rounded-[2px] cursor-pointer"
              >
                {newsletterSubscribed ? 'Subscribed ✓' : 'Subscribe'}
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-neutral-800">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-3 text-[11px] text-neutral-500">
            <span>Copyright © 2026 0 Degree Caffe. All rights reserved.</span>
            <div className="flex items-center gap-3">
              <span>Privacy Policy</span>
              <span>|</span>
              <span>Terms of Use</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-neutral-400 font-bold">Follow Us On</span>
              <span className="w-5 h-5 rounded-full bg-[#D63333] text-white flex items-center justify-center text-[10px] font-bold">
                0°
              </span>
              <span className="w-5 h-5 rounded-full bg-[#3B5998] text-white flex items-center justify-center text-[10px] font-bold">
                f
              </span>
              <span className="w-5 h-5 rounded-full bg-[#1DA1F2] text-white flex items-center justify-center text-[10px] font-bold">
                t
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* ========================================================================
          8. DRINK / PASTRY CUSTOMIZATION MODAL
         ======================================================================== */}
      {customizingItem && (
        <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-lg max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="relative h-44 shrink-0 overflow-hidden bg-[#140E0A]">
              <MenuPhoto
                src={customizingItem.image}
                alt={customizingItem.name}
                gradient={customizingItem.accentGradient}
                className="w-full h-full opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/20" />

              <button
                onClick={() => {
                  setCustomizingItem(null);
                  setEditingCartItemId(null);
                }}
                aria-label="Close customization modal"
                className="absolute top-3.5 right-3.5 p-2 bg-black/60 hover:bg-black text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="absolute bottom-3.5 left-5 right-5 text-white">
                <span className="text-[10px] uppercase tracking-widest text-[#E5A93C] font-bold">
                  {customizingItem.stripCategory}
                </span>
                <h2 className="text-lg font-extrabold leading-tight">
                  {customizingItem.name}
                </h2>
                <p className="text-xs text-neutral-300 mt-0.5 line-clamp-2">
                  {customizingItem.description}
                </p>
              </div>
            </div>

            <div className="p-5 overflow-y-auto space-y-5 flex-1">
              {customizingItem.isDrink ? (
                <>
                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-neutral-700 mb-2">
                      1. Cup Size
                    </label>
                    <div className="grid grid-cols-2 gap-2.5">
                      {SIZE_OPTIONS.map((sz) => {
                        const selected = config.size === sz.id;
                        return (
                          <button
                            key={sz.id}
                            onClick={() => setConfig((prev) => ({ ...prev, size: sz.id }))}
                            className={`p-3 border text-left transition cursor-pointer ${
                              selected
                                ? 'border-[#D63333] bg-red-50/40'
                                : 'border-neutral-200 hover:border-neutral-400'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-[#222222]">
                                {sz.label}
                              </span>
                              <span className="text-xs font-extrabold text-[#C92A2A]">
                                {sz.delta === 0 ? 'Included' : `+₱${sz.delta}`}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {customizingItem.hasIce && (
                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-neutral-700 mb-2">
                        2. Temperature &amp; Ice Level
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {ICE_OPTIONS.map((iceOpt) => {
                          const selected = config.ice === iceOpt.id;
                          return (
                            <button
                              key={iceOpt.id}
                              onClick={() =>
                                setConfig((prev) => ({ ...prev, ice: iceOpt.id }))
                              }
                              className={`p-2.5 border text-left text-xs font-bold transition cursor-pointer ${
                                selected
                                  ? 'border-[#222222] bg-[#222222] text-white'
                                  : 'border-neutral-200 text-neutral-700 hover:border-neutral-400'
                              }`}
                            >
                              {iceOpt.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-neutral-700 mb-2">
                      3. Sweetness Level
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {SWEETNESS_OPTIONS.map((sweet) => {
                        const selected = config.sweetness === sweet;
                        return (
                          <button
                            key={sweet}
                            onClick={() =>
                              setConfig((prev) => ({ ...prev, sweetness: sweet }))
                            }
                            className={`px-3 py-1.5 border text-xs font-bold transition cursor-pointer ${
                              selected
                                ? 'border-[#222222] bg-[#222222] text-white'
                                : 'border-neutral-200 text-neutral-700 hover:border-neutral-400'
                            }`}
                          >
                            {sweet}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {customizingItem.hasMilk && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-extrabold uppercase tracking-wider text-neutral-700">
                          4. Milk Selection
                        </label>
                        {customizingItem.promoOatFree && (
                          <span className="text-[10px] font-bold text-[#C92A2A] bg-red-50 px-2 py-0.5">
                            Oat Milk Free Promo
                          </span>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        {MILK_OPTIONS.map((milkOpt) => {
                          const selected = config.milk === milkOpt.id;
                          const isFreePromoOat =
                            customizingItem.promoOatFree && milkOpt.id === 'Oat Milk';
                          return (
                            <button
                              key={milkOpt.id}
                              onClick={() =>
                                setConfig((prev) => ({ ...prev, milk: milkOpt.id }))
                              }
                              className={`w-full px-3 py-2 border flex items-center justify-between text-xs transition cursor-pointer ${
                                selected
                                  ? 'border-[#D63333] bg-red-50/40 font-bold text-[#222222]'
                                  : 'border-neutral-200 text-neutral-700 hover:border-neutral-400'
                              }`}
                            >
                              <span>{milkOpt.label}</span>
                              <span className="font-extrabold text-[#C92A2A]">
                                {isFreePromoOat
                                  ? 'FREE'
                                  : milkOpt.delta === 0
                                  ? 'Included'
                                  : `+₱${milkOpt.delta}`}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-neutral-700 mb-2">
                      5. Barista Add-Ons
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {ADDON_OPTIONS.map((addon) => {
                        const checked = config.addons.includes(addon.id);
                        return (
                          <button
                            key={addon.id}
                            onClick={() => toggleAddon(addon.id)}
                            className={`p-2.5 border flex items-center justify-between text-xs transition cursor-pointer ${
                              checked
                                ? 'border-[#222222] bg-neutral-100 font-bold text-[#222222]'
                                : 'border-neutral-200 text-neutral-700 hover:border-neutral-400'
                            }`}
                          >
                            <span>{addon.label}</span>
                            <span className="font-extrabold text-[#C92A2A]">
                              +₱{addon.price}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-neutral-700 mb-2">
                    Serving Temperature
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    {PASTRY_PREP_OPTIONS.map((prep) => {
                      const selected = config.pastryPrep === prep.id;
                      return (
                        <button
                          key={prep.id}
                          onClick={() =>
                            setConfig((prev) => ({ ...prev, pastryPrep: prep.id }))
                          }
                          className={`p-3 border text-xs font-bold transition cursor-pointer ${
                            selected
                              ? 'border-[#222222] bg-[#222222] text-white'
                              : 'border-neutral-200 text-neutral-700 hover:border-neutral-400'
                          }`}
                        >
                          {prep.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-neutral-700 mb-1.5">
                  Special Barista Note (Optional)
                </label>
                <input
                  type="text"
                  value={config.notes}
                  onChange={(e) => setConfig((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder="e.g., Extra hot foam, write name on sleeve..."
                  className="w-full px-3 py-2 border border-neutral-300 text-xs focus:outline-none focus:border-[#222222]"
                />
              </div>
            </div>

            <div className="p-4 border-t border-neutral-200 bg-neutral-50 flex items-center gap-3 shrink-0">
              <div className="flex items-center border border-neutral-300 bg-white">
                <button
                  onClick={() =>
                    setConfig((prev) => ({ ...prev, qty: Math.max(1, prev.qty - 1) }))
                  }
                  className="p-2.5 text-neutral-700 hover:bg-neutral-100 cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-3.5 text-xs font-extrabold tabular-nums">
                  {config.qty}
                </span>
                <button
                  onClick={() => setConfig((prev) => ({ ...prev, qty: prev.qty + 1 }))}
                  className="p-2.5 text-neutral-700 hover:bg-neutral-100 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={handleSaveCustomizedItem}
                className="flex-1 py-3 px-4 bg-[#D63333] hover:bg-red-700 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-between cursor-pointer"
              >
                <span>{editingCartItemId ? 'Update Item' : 'Add to Order'}</span>
                <span className="tabular-nums">
                  ₱{(computeItemUnitPrice(customizingItem, config) * config.qty).toFixed(2)}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================
          9. SLIDE-OVER SHOPPING BAG & CHECKOUT DRAWER
         ======================================================================== */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 bg-[#140E0A] text-white flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-sm font-extrabold uppercase tracking-wider">
                  {checkoutStep === 'cart' ? 'Your 0° Order Bag' : 'Checkout & Payment'}
                </h2>
                <p className="text-[11px] text-[#E5A93C]">
                  {selectedBranch.name} • {orderType}
                </p>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <ShoppingBag className="w-10 h-10 text-neutral-300 mb-3" />
                <h3 className="text-sm font-bold text-[#222222]">Your bag is empty</h3>
                <p className="text-xs text-neutral-500 mt-1">
                  Select any coffee, tea, or pastry from the Featured Products grid to start your
                  order.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-5 px-5 py-2.5 bg-[#222222] text-white text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  Browse Menu
                </button>
              </div>
            ) : checkoutStep === 'cart' ? (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  <div className="p-3 bg-neutral-50 border border-neutral-200 space-y-2.5">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setOrderType('Pickup')}
                        className={`py-2 px-3 border text-xs font-bold cursor-pointer ${
                          orderType === 'Pickup'
                            ? 'bg-[#222222] border-[#222222] text-white'
                            : 'bg-white border-neutral-300 text-neutral-700'
                        }`}
                      >
                        Store Pickup (Free)
                      </button>
                      <button
                        onClick={() => setOrderType('Delivery')}
                        className={`py-2 px-3 border text-xs font-bold cursor-pointer ${
                          orderType === 'Delivery'
                            ? 'bg-[#D63333] border-[#D63333] text-white'
                            : 'bg-white border-neutral-300 text-neutral-700'
                        }`}
                      >
                        Delivery (from ₱20)
                      </button>
                    </div>

                    {orderType === 'Delivery' && (
                      <div className="space-y-1.5 pt-1">
                        <span className="block text-[10px] font-extrabold uppercase tracking-wider text-neutral-500">
                          Delivery Speed &amp; Fee
                        </span>
                        {DELIVERY_TIERS.map((tier) => {
                          const selected = deliveryTierId === tier.id;
                          return (
                            <button
                              key={tier.id}
                              onClick={() => setDeliveryTierId(tier.id)}
                              className={`w-full p-2.5 border text-left flex items-center justify-between text-xs transition cursor-pointer ${
                                selected
                                  ? 'border-[#D63333] bg-red-50/40'
                                  : 'border-neutral-200 bg-white hover:border-neutral-400'
                              }`}
                            >
                              <div>
                                <div className="font-bold text-[#222222]">
                                  {tier.name}{' '}
                                  <span className="text-[10px] font-normal text-neutral-500">
                                    ({tier.eta})
                                  </span>
                                </div>
                                <div className="text-[10px] text-neutral-500">{tier.desc}</div>
                              </div>
                              <span className="font-extrabold text-[#C92A2A] tabular-nums">
                                ₱{tier.fee}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2.5">
                    {cart.map((entry) => (
                      <div
                        key={entry.cartId}
                        className="p-3 border border-neutral-200 flex gap-3 items-start"
                      >
                        <MenuPhoto
                          src={entry.item.image}
                          alt={entry.item.name}
                          gradient={entry.item.accentGradient}
                          className="w-12 h-12 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-xs font-bold text-[#222222]">
                              {entry.item.name}
                            </h4>
                            <span className="text-xs font-extrabold text-[#C92A2A] tabular-nums">
                              ₱{(entry.unitPrice * entry.qty).toFixed(2)}
                            </span>
                          </div>
                          <p className="text-[11px] text-neutral-500 mt-0.5">
                            {entry.item.isDrink
                              ? `${entry.config.size} • ${entry.config.ice} • ${entry.config.sweetness} • ${entry.config.milk}`
                              : entry.config.pastryPrep}
                          </p>
                          <div className="mt-2 flex items-center justify-between">
                            <button
                              onClick={() => openItemCustomizer(entry.item, entry)}
                              className="text-[11px] font-bold text-neutral-600 hover:text-black underline cursor-pointer"
                            >
                              Edit
                            </button>
                            <div className="flex items-center border border-neutral-300">
                              <button
                                onClick={() => updateCartQty(entry.cartId, -1)}
                                className="px-2 py-1 hover:bg-neutral-100 cursor-pointer"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="px-2.5 text-xs font-bold tabular-nums">
                                {entry.qty}
                              </span>
                              <button
                                onClick={() => updateCartQty(entry.cartId, 1)}
                                className="px-2 py-1 hover:bg-neutral-100 cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 border border-neutral-200 bg-neutral-50">
                    <label className="block text-[11px] font-bold text-neutral-700 mb-1.5">
                      Promo Code (Try ZERO10)
                    </label>
                    {appliedPromo ? (
                      <div className="flex items-center justify-between text-xs text-emerald-700 font-bold">
                        <span>{appliedPromo} Applied (10% Off)</span>
                        <button
                          onClick={() => setAppliedPromo(null)}
                          className="text-[#D63333] underline cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={promoInput}
                          onChange={(e) => setPromoInput(e.target.value)}
                          placeholder="ZERO10"
                          className="flex-1 px-2.5 py-1.5 bg-white border border-neutral-300 text-xs uppercase"
                        />
                        <button
                          onClick={handleApplyPromo}
                          className="px-3.5 py-1.5 bg-[#222222] text-white text-xs font-bold cursor-pointer"
                        >
                          Apply
                        </button>
                      </div>
                    )}
                    {promoError && (
                      <p className="text-[11px] text-[#D63333] mt-1">{promoError}</p>
                    )}
                  </div>

                  <div className="p-3 border border-neutral-200">
                    <label className="block text-[11px] font-bold text-neutral-700 mb-1.5">
                      Barista Tip
                    </label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[0, 5, 10, 'custom'].map((pct) => (
                        <button
                          key={pct}
                          onClick={() => setTipPercent(pct)}
                          className={`py-1.5 border text-xs font-bold cursor-pointer ${
                            tipPercent === pct
                              ? 'bg-[#222222] border-[#222222] text-white'
                              : 'border-neutral-200 text-neutral-700'
                          }`}
                        >
                          {pct === 0 ? 'None' : pct === 'custom' ? 'Custom' : `${pct}%`}
                        </button>
                      ))}
                    </div>
                    {tipPercent === 'custom' && (
                      <input
                        type="number"
                        min="0"
                        value={customTipAmount}
                        onChange={(e) => setCustomTipAmount(e.target.value)}
                        placeholder="Custom tip in ₱"
                        className="mt-2 w-full px-2.5 py-1.5 border border-neutral-300 text-xs"
                      />
                    )}
                  </div>

                  <div className="p-3.5 bg-neutral-50 border border-neutral-200 space-y-1.5 text-xs tabular-nums">
                    <div className="flex justify-between text-neutral-600">
                      <span>Subtotal</span>
                      <span>₱{cartSummary.subtotal.toFixed(2)}</span>
                    </div>
                    {cartSummary.discount > 0 && (
                      <div className="flex justify-between text-emerald-700 font-bold">
                        <span>Discount (ZERO10)</span>
                        <span>-₱{cartSummary.discount.toFixed(2)}</span>
                      </div>
                    )}
                    {orderType === 'Delivery' && (
                      <div className="flex justify-between text-neutral-600">
                        <span>{activeDeliveryTier.name} Fee</span>
                        <span>₱{cartSummary.deliveryFee.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-neutral-600">
                      <span>VAT (12%)</span>
                      <span>₱{cartSummary.vat.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-neutral-600">
                      <span>Barista Tip</span>
                      <span>₱{cartSummary.tip.toFixed(2)}</span>
                    </div>
                    <div className="pt-2 border-t border-neutral-300 flex justify-between font-extrabold text-sm text-[#222222]">
                      <span>Total</span>
                      <span className="text-[#C92A2A]">₱{cartSummary.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 border-t border-neutral-200 bg-white shrink-0">
                  <button
                    onClick={() => setCheckoutStep('checkout')}
                    className="w-full py-3 bg-[#D63333] hover:bg-red-700 text-white font-extrabold text-xs uppercase tracking-wider cursor-pointer"
                  >
                    Proceed to Checkout • ₱{cartSummary.total.toFixed(2)}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  <button
                    onClick={() => setCheckoutStep('cart')}
                    className="text-xs font-bold text-neutral-600 hover:text-black cursor-pointer"
                  >
                    ← Back to Bag
                  </button>

                  {formError && (
                    <div className="p-3 bg-red-50 border border-[#D63333] text-xs text-[#D63333] font-bold">
                      {formError}
                    </div>
                  )}

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">
                        Customer Name *
                      </label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full px-3 py-2 border border-neutral-300 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">
                        Mobile Number *
                      </label>
                      <input
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full px-3 py-2 border border-neutral-300 text-xs"
                      />
                    </div>

                    {orderType === 'Pickup' ? (
                      <div>
                        <label className="block text-xs font-bold text-neutral-700 mb-1">
                          Pickup Window ({selectedBranch.name})
                        </label>
                        <select
                          value={pickupSlot}
                          onChange={(e) => setPickupSlot(e.target.value)}
                          className="w-full px-3 py-2 border border-neutral-300 text-xs bg-white"
                        >
                          <option value={`ASAP (${selectedBranch.pickupMins})`}>
                            ASAP ({selectedBranch.pickupMins})
                          </option>
                          <option value="In 20 minutes">In 20 minutes</option>
                          <option value="In 30 minutes">In 30 minutes</option>
                        </select>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-neutral-700">
                          Delivery Address *
                        </label>
                        {userProfile.savedAddresses.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {userProfile.savedAddresses.map((addr) => (
                              <button
                                key={addr.id}
                                type="button"
                                onClick={() => setDeliveryAddress(addr.address)}
                                className={`px-2.5 py-1 border text-[11px] font-bold cursor-pointer ${
                                  deliveryAddress === addr.address
                                    ? 'bg-[#222222] text-white border-[#222222]'
                                    : 'bg-neutral-50 border-neutral-300 text-neutral-700'
                                }`}
                              >
                                {addr.label}
                              </button>
                            ))}
                          </div>
                        )}
                        <textarea
                          rows={2}
                          value={deliveryAddress}
                          onChange={(e) => setDeliveryAddress(e.target.value)}
                          className="w-full px-3 py-2 border border-neutral-300 text-xs"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                        Payment Method
                      </label>
                      <div className="space-y-1.5">
                        {[
                          'GCash / E-Wallet',
                          'Credit / Debit Card',
                          orderType === 'Pickup' ? 'Cash at Counter' : 'Cash on Delivery'
                        ].map((method) => (
                          <button
                            key={method}
                            type="button"
                            onClick={() => setPaymentMethod(method)}
                            className={`w-full px-3 py-2.5 border text-left text-xs font-bold flex items-center justify-between cursor-pointer ${
                              paymentMethod === method
                                ? 'border-[#D63333] bg-red-50/40 text-[#222222]'
                                : 'border-neutral-200 text-neutral-700'
                            }`}
                          >
                            <span>{method}</span>
                            {paymentMethod === method && (
                              <Check className="w-4 h-4 text-[#D63333]" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 border-t border-neutral-200 bg-white shrink-0">
                  <button
                    onClick={handlePlaceOrder}
                    className="w-full py-3 bg-[#D63333] hover:bg-red-700 text-white font-extrabold text-xs uppercase tracking-wider cursor-pointer"
                  >
                    Place Order • ₱{cartSummary.total.toFixed(2)}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================
          10. LIVE ORDER PROGRESS TRACKER & RECEIPT MODAL
         ======================================================================== */}
      {activeTrackedOrder && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-5 bg-[#140E0A] text-white flex items-center justify-between shrink-0">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#E5A93C] font-bold">
                  {activeTrackedOrder.status === 'Cancelled'
                    ? 'Order Cancelled'
                    : 'Live Order Tracker'}
                </span>
                <h2 className="text-lg font-extrabold">
                  Order #{activeTrackedOrder.id}
                </h2>
                <p className="text-xs text-neutral-300">
                  {activeTrackedOrder.branch} • {activeTrackedOrder.orderType}
                </p>
              </div>
              <button
                onClick={() => setTrackedOrderId(null)}
                className="p-2 bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-5 flex-1">
              {activeTrackedOrder.status === 'Cancelled' ? (
                <div className="p-4 bg-red-50 border border-[#D63333] space-y-1.5 text-xs">
                  <div className="font-extrabold text-[#D63333] uppercase">
                    Order &amp; Delivery Cancelled
                  </div>
                  <p className="text-neutral-700">
                    <strong>Reason:</strong> {activeTrackedOrder.cancellationReason}
                  </p>
                  <p className="font-bold text-emerald-700">
                    {activeTrackedOrder.refundStatus}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-3.5 bg-[#FAF8F5] border border-neutral-200 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-neutral-500 uppercase">
                        Estimated Time Remaining
                      </span>
                      <p className="text-xl font-extrabold text-[#222222] tabular-nums">
                        {activeTrackedOrder.stageIndex === 3
                          ? 'Ready Now!'
                          : formatCountdown(activeTrackedOrder.etaSeconds)}
                      </p>
                    </div>
                    {activeTrackedOrder.stageIndex < 3 && (
                      <button
                        onClick={() => advanceOrderStage(activeTrackedOrder.id)}
                        className="px-3 py-1.5 bg-[#222222] text-white text-[11px] font-bold cursor-pointer"
                      >
                        Simulate Next Stage →
                      </button>
                    )}
                  </div>

                  <div className="space-y-2.5">
                    {[
                      'Order Confirmed & Sent to Barista',
                      'Barista Crafting at 0° Station',
                      'Chilled & Sealed for Handover',
                      activeTrackedOrder.orderType === 'Pickup'
                        ? 'Ready at Pickup Counter'
                        : 'Delivered to Your Door'
                    ].map((label, idx) => {
                      const done = idx <= activeTrackedOrder.stageIndex;
                      return (
                        <div key={label} className="flex items-center gap-3 text-xs">
                          <div
                            className={`w-6 h-6 flex items-center justify-center font-bold ${
                              done
                                ? 'bg-[#D63333] text-white'
                                : 'bg-neutral-200 text-neutral-500'
                            }`}
                          >
                            {done ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                          </div>
                          <span
                            className={
                              done ? 'font-bold text-[#222222]' : 'text-neutral-400'
                            }
                          >
                            {label}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {canCancelOrder(activeTrackedOrder) && (
                    <div className="p-3 bg-red-50/60 border border-red-200 flex items-center justify-between gap-3">
                      <span className="text-[11px] text-neutral-700">
                        Need to cancel? Eligible for a 100% instant refund before sealing.
                      </span>
                      <button
                        onClick={() => openCancelDialog(activeTrackedOrder)}
                        className="px-3 py-1.5 bg-[#D63333] hover:bg-red-700 text-white text-[11px] font-bold shrink-0 cursor-pointer"
                      >
                        Cancel Order
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="border-t border-neutral-200 pt-4 space-y-2 text-xs">
                <h3 className="font-extrabold uppercase tracking-wider text-neutral-700">
                  Itemized Receipt
                </h3>
                {activeTrackedOrder.items.map((entry, idx) => (
                  <div key={idx} className="flex justify-between py-1">
                    <span>
                      <strong>{entry.qty}×</strong> {entry.item.name} ({entry.config.size})
                    </span>
                    <span className="font-bold tabular-nums">
                      ₱{(entry.unitPrice * entry.qty).toFixed(2)}
                    </span>
                  </div>
                ))}
                <div className="border-t border-neutral-200 pt-2 flex justify-between font-extrabold text-sm">
                  <span>Total Paid ({activeTrackedOrder.paymentMethod})</span>
                  <span className="text-[#C92A2A]">
                    ₱{activeTrackedOrder.total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-neutral-200 bg-neutral-50 shrink-0">
              <button
                onClick={() => setTrackedOrderId(null)}
                className="w-full py-2.5 bg-[#222222] text-white text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================
          11. USER PROFILE & SAVED ADDRESSES DRAWER
         ======================================================================== */}
      {isProfileOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl overflow-hidden">
            <div className="p-5 bg-[#140E0A] text-white flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-sm font-extrabold uppercase tracking-wider">
                  Customer Profile &amp; Club
                </h2>
                <p className="text-xs text-[#E5A93C]">
                  {userProfile.tier} • {userProfile.points} Points
                </p>
              </div>
              <button
                onClick={() => setIsProfileOpen(false)}
                className="p-2 bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
              <div className="p-4 border border-neutral-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold uppercase tracking-wider text-neutral-700">
                    Contact &amp; Preferences
                  </h3>
                  <button
                    onClick={() => {
                      if (isEditingProfile) {
                        handleSaveProfile();
                      } else {
                        setProfileDraft(userProfile);
                        setIsEditingProfile(true);
                      }
                    }}
                    className="font-bold text-[#D63333] hover:underline cursor-pointer"
                  >
                    {isEditingProfile ? 'Save Changes' : 'Edit Profile'}
                  </button>
                </div>

                {isEditingProfile ? (
                  <div className="space-y-2.5">
                    <input
                      type="text"
                      value={profileDraft.name}
                      onChange={(e) =>
                        setProfileDraft((p) => ({ ...p, name: e.target.value }))
                      }
                      className="w-full px-3 py-2 border border-neutral-300"
                    />
                    <input
                      type="email"
                      value={profileDraft.email}
                      onChange={(e) =>
                        setProfileDraft((p) => ({ ...p, email: e.target.value }))
                      }
                      className="w-full px-3 py-2 border border-neutral-300"
                    />
                    <input
                      type="tel"
                      value={profileDraft.phone}
                      onChange={(e) =>
                        setProfileDraft((p) => ({ ...p, phone: e.target.value }))
                      }
                      className="w-full px-3 py-2 border border-neutral-300"
                    />
                  </div>
                ) : (
                  <div className="space-y-1 text-neutral-700">
                    <p>
                      <strong>Name:</strong> {userProfile.name}
                    </p>
                    <p>
                      <strong>Email:</strong> {userProfile.email}
                    </p>
                    <p>
                      <strong>Mobile:</strong> {userProfile.phone}
                    </p>
                    <p>
                      <strong>Usual Order:</strong> {userProfile.drinkPreference}
                    </p>
                  </div>
                )}
              </div>

              <div className="p-4 border border-neutral-200 space-y-3">
                <h3 className="font-extrabold uppercase tracking-wider text-neutral-700">
                  Saved Delivery Addresses
                </h3>

                <div className="space-y-2">
                  {userProfile.savedAddresses.map((addr) => (
                    <div
                      key={addr.id}
                      className={`p-3 border flex items-start justify-between gap-2 ${
                        addr.isDefault ? 'border-[#D63333] bg-red-50/30' : 'border-neutral-200'
                      }`}
                    >
                      <div>
                        <span className="font-bold text-[#222222]">{addr.label}</span>
                        {addr.isDefault && (
                          <span className="ml-2 text-[10px] font-extrabold text-[#D63333] uppercase">
                            Default
                          </span>
                        )}
                        <p className="text-neutral-600 mt-0.5">{addr.address}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {!addr.isDefault && (
                          <button
                            onClick={() => handleSetDefaultAddress(addr.id)}
                            className="text-[11px] font-bold text-neutral-600 underline cursor-pointer"
                          >
                            Set Default
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteSavedAddress(addr.id)}
                          className="text-neutral-400 hover:text-[#D63333] cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-neutral-200 space-y-2">
                  <input
                    type="text"
                    value={newAddressLabel}
                    onChange={(e) => setNewAddressLabel(e.target.value)}
                    placeholder="Label (e.g., Campus, Home)"
                    className="w-full px-3 py-1.5 border border-neutral-300"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newAddressText}
                      onChange={(e) => setNewAddressText(e.target.value)}
                      placeholder="Full street & barangay address..."
                      className="flex-1 px-3 py-1.5 border border-neutral-300"
                    />
                    <button
                      onClick={handleAddSavedAddress}
                      className="px-3 py-1.5 bg-[#222222] text-white font-bold cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================
          11B. MY ORDERS & DELIVERY HISTORY SLIDE-OVER DRAWER
         ======================================================================== */}
      {isHistoryOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-lg h-full flex flex-col shadow-2xl overflow-hidden">
            <div className="p-5 bg-[#140E0A] text-white flex items-center justify-between shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-[#E5A93C]" />
                  <h2 className="text-sm font-extrabold uppercase tracking-wider">
                    My Orders &amp; History
                  </h2>
                </div>
                <p className="text-[11px] text-neutral-300 mt-0.5">
                  View everything you&apos;ve ordered, track active deliveries, or reorder
                </p>
              </div>
              <button
                onClick={() => setIsHistoryOpen(false)}
                aria-label="Close my orders drawer"
                className="p-2 bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs">
              {orders.length === 0 ? (
                <div className="py-16 px-6 text-center border border-neutral-200">
                  <ShoppingBag className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
                  <h3 className="text-sm font-bold text-[#222222]">No orders yet</h3>
                  <p className="text-neutral-500 mt-1">
                    Once you place an order, all your drinks, pastries, and receipts will appear
                    here.
                  </p>
                  <button
                    onClick={() => setIsHistoryOpen(false)}
                    className="mt-4 px-5 py-2.5 bg-[#222222] text-white font-bold uppercase tracking-wider cursor-pointer"
                  >
                    Explore the Menu
                  </button>
                </div>
              ) : (
                orders.map((ord) => {
                  const stageLabels = [
                    'Order Confirmed',
                    'Barista Crafting',
                    'Chilled & Sealed',
                    'Ready / Delivered'
                  ];
                  return (
                    <div
                      key={ord.id}
                      className="border border-neutral-200 bg-[#FAF8F5] p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm text-[#222222]">
                              Order #{ord.id}
                            </span>
                            <span
                              className={`text-[10px] font-extrabold uppercase px-2 py-0.5 border ${
                                ord.status === 'Cancelled'
                                  ? 'bg-red-50 text-[#D63333] border-[#D63333]'
                                  : ord.status === 'Completed'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                  : 'bg-amber-50 text-amber-950 border-[#E5A93C]'
                              }`}
                            >
                              {ord.status === 'Active'
                                ? stageLabels[ord.stageIndex]
                                : ord.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-neutral-500 mt-1">
                            {ord.createdAt} • {ord.branch} •{' '}
                            <strong>{ord.orderType}</strong> ({ord.slot})
                          </p>
                          {ord.deliveryAddress && (
                            <p className="text-[11px] text-neutral-600 mt-0.5">
                              Deliver to: {ord.deliveryAddress}
                            </p>
                          )}
                        </div>

                        <div className="text-right shrink-0">
                          <span className="block font-extrabold text-sm text-[#C92A2A] tabular-nums">
                            ₱{ord.total.toFixed(2)}
                          </span>
                          <span className="text-[10px] text-neutral-500">
                            {ord.items.reduce((s, i) => s + i.qty, 0)} item(s)
                          </span>
                        </div>
                      </div>

                      <div className="bg-white border border-neutral-200 divide-y divide-neutral-100">
                        {ord.items.map((entry, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 flex items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <MenuPhoto
                                src={entry.item.image}
                                alt={entry.item.name}
                                gradient={entry.item.accentGradient}
                                className="w-10 h-10 shrink-0 border border-neutral-100"
                              />
                              <div className="min-w-0">
                                <p className="font-bold text-[#222222] truncate">
                                  {entry.qty}× {entry.item.name}
                                </p>
                                <p className="text-[11px] text-neutral-500 truncate">
                                  {entry.item.isDrink
                                    ? `${entry.config.size}${
                                        entry.config.ice ? ` • ${entry.config.ice}` : ''
                                      }${
                                        entry.config.sweetness
                                          ? ` • ${entry.config.sweetness}`
                                          : ''
                                      }${
                                        entry.config.milk ? ` • ${entry.config.milk}` : ''
                                      }`
                                    : entry.config.pastryPrep || 'Freshly Baked'}
                                </p>
                                {entry.config.addons && entry.config.addons.length > 0 && (
                                  <p className="text-[10px] text-[#C92A2A] font-semibold">
                                    Add-ons: {entry.config.addons.join(', ')}
                                  </p>
                                )}
                              </div>
                            </div>

                            <span className="font-bold text-neutral-800 tabular-nums shrink-0">
                              ₱{(entry.unitPrice * entry.qty).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {ord.status === 'Cancelled' && (
                        <div className="p-2.5 bg-red-50 border border-red-200 text-[11px] text-[#D63333]">
                          <strong>Cancelled:</strong> {ord.cancellationReason}
                          {ord.refundStatus ? ` (${ord.refundStatus})` : ''}
                        </div>
                      )}

                      <div className="pt-1 flex flex-wrap items-center justify-between gap-2">
                        <button
                          onClick={() => {
                            setIsHistoryOpen(false);
                            setTrackedOrderId(ord.id);
                          }}
                          className="px-3 py-1.5 bg-[#222222] hover:bg-black text-white font-bold text-[11px] cursor-pointer"
                        >
                          {ord.status === 'Active' ? 'Track Live Order' : 'View Receipt'}
                        </button>

                        <div className="flex items-center gap-2">
                          {canCancelOrder(ord) && (
                            <button
                              onClick={() => openCancelDialog(ord)}
                              className="px-3 py-1.5 bg-red-50 hover:bg-red-100 border border-[#D63333] text-[#D63333] font-bold text-[11px] cursor-pointer"
                            >
                              Cancel Order
                            </button>
                          )}

                          <button
                            onClick={() => handleReorder(ord)}
                            className="px-3 py-1.5 bg-white hover:bg-neutral-100 border border-neutral-300 text-[#222222] font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Reorder</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================
          12. UNIFIED LOGIN / REGISTER MODAL (CUSTOMERS & ADMINS)
         ======================================================================== */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-[60] bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md shadow-2xl overflow-hidden border border-neutral-800">
            <div className="p-5 bg-[#140E0A] text-white flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <KeyRound className="w-4 h-4 text-[#E5A93C]" />
                <div>
                  <h3 className="text-sm font-extrabold uppercase tracking-wider">
                    {authMode === 'login' ? '0° Caffe Account Login' : 'Join 0° Coffee Club'}
                  </h3>
                  <p className="text-[11px] text-neutral-300">
                    Sign in as a Customer or Staff Admin
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAuthModalOpen(false)}
                aria-label="Close login modal"
                className="p-1.5 bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 border-b border-neutral-200 bg-neutral-50 text-xs font-extrabold">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setAuthError('');
                }}
                className={`py-2.5 border-b-2 transition cursor-pointer ${
                  authMode === 'login'
                    ? 'border-[#D63333] bg-white text-[#222222]'
                    : 'border-transparent text-neutral-500 hover:text-black'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  setAuthError('');
                  setAuthEmailInput('');
                  setAuthPasswordInput('');
                }}
                className={`py-2.5 border-b-2 transition cursor-pointer ${
                  authMode === 'register'
                    ? 'border-[#D63333] bg-white text-[#222222]'
                    : 'border-transparent text-neutral-500 hover:text-black'
                }`}
              >
                Create Customer Account
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="p-5 space-y-4 text-xs">
              {authError && (
                <div className="p-3 bg-red-50 border border-[#D63333] text-[#D63333] font-bold">
                  {authError}
                </div>
              )}

              {authMode === 'register' && (
                <div>
                  <label className="block font-extrabold text-neutral-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={authNameInput}
                    onChange={(e) => setAuthNameInput(e.target.value)}
                    placeholder="e.g., Maria Santos"
                    className="w-full px-3 py-2 border border-neutral-300 focus:outline-none focus:border-[#222222]"
                  />
                </div>
              )}

              <div>
                <label className="block font-extrabold text-neutral-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={authEmailInput}
                  onChange={(e) => setAuthEmailInput(e.target.value)}
                  placeholder="customer@0degreecaffe.ph or admin@0degreecaffe.ph"
                  className="w-full px-3 py-2 border border-neutral-300 focus:outline-none focus:border-[#222222]"
                />
              </div>

              <div>
                <label className="block font-extrabold text-neutral-700 mb-1">Password</label>
                <input
                  type="password"
                  value={authPasswordInput}
                  onChange={(e) => setAuthPasswordInput(e.target.value)}
                  placeholder="Enter password"
                  className="w-full px-3 py-2 border border-neutral-300 focus:outline-none focus:border-[#222222]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#D63333] hover:bg-red-700 text-white font-extrabold uppercase tracking-wider cursor-pointer"
              >
                {authMode === 'login' ? 'Sign In Now' : 'Register & Claim +100 Pts'}
              </button>

              {authMode === 'login' && (
                <div className="pt-3 border-t border-neutral-200 space-y-2">
                  <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                    Quick Demo Access (1-Click Fill &amp; Sign In)
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthUser({
                          isAuthenticated: true,
                          role: 'user',
                          name: 'Kyle Mendoza',
                          email: 'kyle.mendoza@0degreecaffe.ph',
                          staffTitle: null
                        });
                        setUserProfile((prev) => ({
                          ...prev,
                          name: 'Kyle Mendoza',
                          email: 'kyle.mendoza@0degreecaffe.ph'
                        }));
                        setCustomerName('Kyle Mendoza');
                        setIsAuthModalOpen(false);
                        showToast('Signed in as Customer (Kyle Mendoza)');
                      }}
                      className="p-2.5 border border-neutral-300 hover:border-[#222222] bg-neutral-50 text-left transition cursor-pointer"
                    >
                      <span className="block font-extrabold text-[#222222]">Customer Demo</span>
                      <span className="block text-[10px] text-neutral-500 truncate">
                        kyle.mendoza@0degreecaffe.ph
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setAuthUser({
                          isAuthenticated: true,
                          role: 'admin',
                          name: 'Store Manager (Admin)',
                          email: 'admin@0degreecaffe.ph',
                          staffTitle: 'Branch Operations & Barista Lead'
                        });
                        setIsAuthModalOpen(false);
                        setIsCartOpen(false);
                        setIsProfileOpen(false);
                        setIsHistoryOpen(false);
                        showToast('Signed in to Admin Portal (Store Manager)');
                      }}
                      className="p-2.5 border border-[#E5A93C] hover:bg-amber-50 bg-amber-50/40 text-left transition cursor-pointer"
                    >
                      <span className="block font-extrabold text-[#140E0A]">Admin Demo</span>
                      <span className="block text-[10px] text-neutral-600 truncate">
                        admin@0degreecaffe.ph
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================
          13. CUSTOMER ORDER CANCELLATION CONFIRMATION MODAL
         ======================================================================== */}
      {cancellingOrder && (
        <div className="fixed inset-0 z-[60] bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-5 bg-[#D63333] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Ban className="w-4 h-4" />
                <h3 className="text-sm font-extrabold uppercase tracking-wide">
                  Cancel Order #{cancellingOrder.id}?
                </h3>
              </div>
              <button
                onClick={() => setCancellingOrder(null)}
                className="p-1.5 bg-black/20 hover:bg-black/35 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <p className="text-neutral-700">
                Cancelling before your order is sealed issues an immediate full refund of{' '}
                <strong>₱{cancellingOrder.total.toFixed(2)}</strong> back to your{' '}
                <strong>{cancellingOrder.paymentMethod}</strong>.
              </p>

              <div>
                <label className="block font-extrabold text-neutral-700 mb-1.5">
                  Reason for Cancellation
                </label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 bg-white"
                >
                  {CANCELLATION_REASONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-extrabold text-neutral-700 mb-1.5">
                  Additional Note (Optional)
                </label>
                <input
                  type="text"
                  value={cancelNote}
                  onChange={(e) => setCancelNote(e.target.value)}
                  placeholder="Optional note..."
                  className="w-full px-3 py-2 border border-neutral-300"
                />
              </div>

              <div className="pt-2 flex gap-2.5">
                <button
                  onClick={() => setCancellingOrder(null)}
                  className="flex-1 py-2.5 border border-neutral-300 font-bold text-neutral-700 cursor-pointer"
                >
                  Keep Order
                </button>
                <button
                  onClick={confirmCancelOrder}
                  className="flex-1 py-2.5 bg-[#D63333] hover:bg-red-700 text-white font-extrabold cursor-pointer"
                >
                  Confirm Cancel &amp; Refund
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subtle Floating Confirmation Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] bg-[#140E0A] text-white px-4 py-2.5 shadow-xl border border-[#E5A93C] text-xs font-bold flex items-center gap-2 max-w-[92vw]">
          <CheckCircle2 className="w-4 h-4 text-[#E5A93C] shrink-0" />
          <span className="truncate">{toast}</span>
        </div>
      )}
    </div>
  );
}