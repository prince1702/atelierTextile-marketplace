import axios from 'axios';
import type { User, Design, Order, Ticket } from '../types';

const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (typeof window !== 'undefined' && window.location) {
    const { hostname } = window.location;
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.') || hostname.startsWith('10.') || hostname.startsWith('172.')) {
      return `http://${hostname}:5000`;
    }
  }
  return 'http://localhost:5000';
};

const API_URL = getApiUrl();

const FRONTEND_MOCK_DESIGNS: Design[] = [
  {
    id: 'mock-design-1',
    title: 'Royal Jacquard Weave',
    designer: 'mock-seller',
    designerName: 'Atelier Rousseau',
    designerAvatar: 'AR',
    price: 850,
    category: 'Weaving Design',
    subcategory: 'Kotalichi Design',
    fabric: 'Silk',
    image: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=600&h=600&fit=crop',
    rating: 4.9,
    reviews: 124,
    tags: ['weaving', 'jacquard', 'silk', 'royal'],
    badge: 'Best Seller',
    badgeColor: 'amber',
    description: 'A luxurious Royal Jacquard pattern crafted with fine silk. Features intricate floral motifs and a rich texture that catches the light beautifully.',
    dimensions: '140cm width, repeat 30cm',
    colorways: ['Navy/Gold', 'Emerald/Silver', 'Ruby/Champagne'],
    licenseType: 'Commercial Use',
    status: 'active',
    sales: 142,
    revenue: 120700,
    createdAt: new Date('2024-10-15').toISOString(),
  },
  {
    id: 'mock-design-2',
    title: 'Indigo Sashiko Embroidery',
    designer: 'mock-seller',
    designerName: 'Atelier Rousseau',
    designerAvatar: 'AR',
    price: 1250,
    category: 'Embroidery Design',
    subcategory: 'Multi Design',
    fabric: 'Linen',
    image: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=600&h=600&fit=crop',
    rating: 4.8,
    reviews: 94,
    tags: ['embroidery', 'sashiko', 'hand-stitched', 'indigo'],
    badge: 'Limited Run',
    badgeColor: 'blue',
    description: 'An elegant hand-stitched embroidery design inspired by traditional Japanese Sashiko patterns. Ideal for high-end home textiles and apparel.',
    dimensions: '140cm width, repeat 45cm',
    colorways: ['Indigo/White', 'Navy/Cream', 'Slate/Grey'],
    licenseType: 'Standard Regional',
    status: 'active',
    sales: 31,
    revenue: 38750,
    createdAt: new Date('2024-10-20').toISOString(),
  },
  {
    id: 'mock-design-3',
    title: 'Modern Geometric Digital Print',
    designer: 'mock-seller',
    designerName: 'Studio Verona',
    designerAvatar: 'SV',
    price: 650,
    category: 'Digital Print Design',
    fabric: 'Polyester Blend',
    image: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=600&h=600&fit=crop',
    rating: 4.7,
    reviews: 83,
    tags: ['digital print', 'geometric', 'modern', 'abstract'],
    badge: 'New',
    badgeColor: 'indigo',
    description: 'Sharp, modern geometric motifs styled in a bold contemporary palette. Designed specifically for activewear, tech apparel, or statement home pieces.',
    dimensions: '150cm width, repeat 60cm',
    colorways: ['Electric Blue/Orange', 'Monochrome/Yellow', 'Teal/Magenta'],
    licenseType: 'Standard Regional',
    status: 'active',
    sales: 83,
    revenue: 53950,
    createdAt: new Date('2024-11-01').toISOString(),
  },
  {
    id: 'mock-design-4',
    title: 'Vintage Floral Placement Print',
    designer: 'mock-seller',
    designerName: 'Studio Verona',
    designerAvatar: 'SV',
    price: 950,
    category: 'Position Print Design',
    fabric: 'Cotton Blend',
    image: 'https://images.unsplash.com/photo-1582201942988-13e60e4556ee?w=600&h=600&fit=crop',
    rating: 4.6,
    reviews: 42,
    tags: ['floral', 'vintage', 'placement', 'print'],
    badge: 'Trending',
    badgeColor: 'purple',
    description: 'A classic, highly detailed vintage botanical illustration setup for precise placement prints on t-shirts, hoodies, or center cushion panels.',
    dimensions: 'A3 Size (29.7 x 42cm)',
    colorways: ['Rose Garden', 'Moody Autumn', 'Dusty Lavender'],
    licenseType: 'Extended Global',
    status: 'active',
    sales: 12,
    revenue: 11400,
    createdAt: new Date('2024-11-05').toISOString(),
  },
  {
    id: 'mock-design-5',
    title: 'Herringbone Technical Weaving',
    designer: 'mock-seller',
    designerName: 'Coastal Studio',
    designerAvatar: 'CS',
    price: 750,
    category: 'Weaving Design',
    subcategory: '50 600 Design',
    fabric: 'Wool Blend',
    image: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=600&h=600&fit=crop',
    rating: 4.4,
    reviews: 38,
    tags: ['weaving', 'herringbone', 'texture', 'wool'],
    badge: 'Popular',
    badgeColor: 'green',
    description: 'A robust herringbone weave simulation displaying dense, rich threads. Exceptional for high-durability upholstery and winter coatings.',
    dimensions: '145cm width, repeat 10cm',
    colorways: ['Charcoal/Grey', 'Oatmeal/Cream', 'Olive/Black'],
    licenseType: 'Commercial Use',
    status: 'active',
    sales: 58,
    revenue: 43500,
    createdAt: new Date('2024-10-10').toISOString(),
  },
  {
    id: 'mock-design-6',
    title: 'Gold Thread Royal Embroidery',
    designer: 'mock-seller',
    designerName: 'Coastal Studio',
    designerAvatar: 'CS',
    price: 1450,
    category: 'Embroidery Design',
    subcategory: 'Sequin Design',
    fabric: 'Silk',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&h=600&fit=crop',
    rating: 4.5,
    reviews: 156,
    tags: ['embroidery', 'gold thread', 'royal', 'luxury'],
    badge: 'In Stock',
    badgeColor: 'green',
    description: 'Luxurious heavy embroidery motif with detailed gold stitching simulations, perfect for festive couture and velvet cushions.',
    dimensions: '155cm width, repeat 35cm',
    colorways: ['Gold/Crimson', 'Gold/Emerald', 'Gold/Royal Blue'],
    licenseType: 'Standard Regional',
    status: 'active',
    sales: 134,
    revenue: 194300,
    createdAt: new Date('2024-09-28').toISOString(),
  },
  {
    id: 'mock-design-7',
    title: 'Abstract Watercolor Silk Print',
    designer: 'mock-seller',
    designerName: 'Coastal Studio',
    designerAvatar: 'CS',
    price: 880,
    category: 'Digital Print Design',
    fabric: 'Silk',
    image: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=600&h=600&fit=crop',
    rating: 4.8,
    reviews: 72,
    tags: ['silk', 'digital print', 'watercolor', 'abstract'],
    badge: 'Trending',
    badgeColor: 'purple',
    description: 'Fluid, dreamy watercolor flows scanning gorgeous shades of ocean blues and soft pinks, optimized for digital print output on pure silk habotai.',
    dimensions: '140cm width, repeat 80cm',
    colorways: ['Pacific Blue', 'Sunset Pastel', 'Forest Mist'],
    licenseType: 'Extended Global',
    status: 'active',
    sales: 44,
    revenue: 38720,
    createdAt: new Date('2024-10-18').toISOString(),
  },
  {
    id: 'mock-design-8',
    title: 'Classic Baroque Motif Placement',
    designer: 'mock-seller',
    designerName: 'Studio Verona',
    designerAvatar: 'SV',
    price: 1100,
    category: 'Position Print Design',
    fabric: 'Cotton Sateen',
    image: 'https://images.unsplash.com/photo-1582201942988-13e60e4556ee?w=600&h=600&fit=crop',
    rating: 4.7,
    reviews: 55,
    tags: ['placement', 'baroque', 'classic', 'gold'],
    badge: 'Premium',
    badgeColor: 'amber',
    description: 'Highly detailed golden baroque scrollwork positioned for symmetry, optimal for luxury duvet covers, cushions, and formalwear panels.',
    dimensions: '100 x 100cm panel',
    colorways: ['Gold on Black', 'Gold on Ivory', 'Silver on Midnight'],
    licenseType: 'Extended Global',
    status: 'active',
    sales: 19,
    revenue: 20900,
    createdAt: new Date('2024-10-05').toISOString(),
  }
];

const client = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token if present in localStorage
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('atelier_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Helper to recursively normalize MongoDB _id to frontend id
export const normalize = <T>(item: any): T => {
  if (!item) return item;
  if (Array.isArray(item)) {
    return item.map(i => normalize(i)) as any;
  }
  if (typeof item === 'object') {
    const newItem = { ...item };
    if (newItem._id && !newItem.id) {
      newItem.id = newItem._id.toString();
    }
    // Traverse properties
    for (const key in newItem) {
      if (newItem[key] && typeof newItem[key] === 'object') {
        newItem[key] = normalize(newItem[key]);
      }
    }
    return newItem as T;
  }
  return item;
};

export const api = {
  auth: {
    login: async (email: string, password: string): Promise<{ token: string; user: User }> => {
      const response = await client.post('/auth/login', { email, password });
      return {
        token: response.data.token,
        user: normalize<User>(response.data.user),
      };
    },
    register: async (name: string, email: string, password: string, role: 'seller' | 'customer'): Promise<{ token: string; user: User }> => {
      const response = await client.post('/auth/register', { name, email, password, role });
      return {
        token: response.data.token,
        user: normalize<User>(response.data.user),
      };
    },
    forgotPassword: async (email: string): Promise<{ success: boolean; message: string }> => {
      const response = await client.post('/auth/forgot-password', { email });
      return {
        success: response.data.success,
        message: response.data.data?.message || 'Instructions sent',
      };
    },
    getMe: async (): Promise<User> => {
      const response = await client.get('/auth/me');
      return normalize<User>(response.data.data);
    },
    logout: async (): Promise<void> => {
      await client.post('/auth/logout');
    },
  },

  designs: {
    getAll: async (params?: {
      category?: string;
      subcategory?: string;
      fabric?: string;
      minPrice?: number;
      maxPrice?: number;
      search?: string;
      badge?: string;
      sort?: string;
      status?: string;
      page?: number;
      limit?: number;
    }): Promise<{ designs: Design[]; count: number; total: number; page: number; pages: number }> => {
      try {
        const response = await client.get('/designs', { params });
        return {
          designs: normalize<Design[]>(response.data.data),
          count: response.data.count,
          total: response.data.total,
          page: response.data.page,
          pages: response.data.pages,
        };
      } catch (error) {
        console.warn('API connection failed, falling back to local mock data:', error);
        
        let filtered = [...FRONTEND_MOCK_DESIGNS];
        
        if (params?.category && params.category !== 'All') {
          filtered = filtered.filter(d => d.category === params.category);
        }
        if (params?.subcategory && params.subcategory !== 'All') {
          filtered = filtered.filter(d => d.subcategory === params.subcategory);
        }
        if (params?.fabric && params.fabric !== 'All') {
          filtered = filtered.filter(d => d.fabric === params.fabric);
        }
        if (params?.search) {
          const s = params.search.toLowerCase();
          filtered = filtered.filter(d => 
            d.title.toLowerCase().includes(s) || 
            (d.description && d.description.toLowerCase().includes(s)) || 
            (d.tags && d.tags.some(t => t.toLowerCase().includes(s)))
          );
        }
        if (params?.minPrice !== undefined) {
          filtered = filtered.filter(d => d.price >= params.minPrice!);
        }
        if (params?.maxPrice !== undefined) {
          filtered = filtered.filter(d => d.price <= params.maxPrice!);
        }

        if (params?.sort === 'price_asc') {
          filtered.sort((a, b) => a.price - b.price);
        } else if (params?.sort === 'price_desc') {
          filtered.sort((a, b) => b.price - a.price);
        } else {
          filtered.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
        }

        const limit = params?.limit || 9;
        const page = params?.page || 1;
        const total = filtered.length;
        const pages = Math.ceil(total / limit);
        const startIndex = (page - 1) * limit;
        const designs = filtered.slice(startIndex, startIndex + limit);

        return {
          designs,
          count: designs.length,
          total,
          page,
          pages: pages || 1,
        };
      }
    },
    getById: async (id: string): Promise<Design> => {
      try {
        const response = await client.get(`/designs/${id}`);
        return normalize<Design>(response.data.data);
      } catch (error) {
        console.warn('API connection failed, falling back to local design by ID:', error);
        const design = FRONTEND_MOCK_DESIGNS.find(d => d.id === id) || FRONTEND_MOCK_DESIGNS[0];
        return design;
      }
    },
    getByCategory: async (category: string): Promise<Design[]> => {
      const response = await client.get(`/designs/category/${category}`);
      return normalize<Design[]>(response.data.data);
    },
    getMyListings: async (): Promise<Design[]> => {
      const response = await client.get('/designs/my/listings');
      return normalize<Design[]>(response.data.data);
    },
    create: async (formData: FormData): Promise<Design> => {
      const response = await client.post('/designs', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return normalize<Design>(response.data.data);
    },
    update: async (id: string, formData: FormData): Promise<Design> => {
      const response = await client.put(`/designs/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return normalize<Design>(response.data.data);
    },
    delete: async (id: string): Promise<void> => {
      await client.delete(`/designs/${id}`);
    },
    updateStatus: async (id: string, status: 'active' | 'pending' | 'rejected'): Promise<Design> => {
      const response = await client.patch(`/designs/${id}/status`, { status });
      return normalize<Design>(response.data.data);
    },
  },

  users: {
    getStats: async (): Promise<{
      totalUsers: number;
      totalSellers: number;
      totalCustomers: number;
      totalRevenue: number;
      totalOrders: number;
      monthlyRevenue: number[];
      monthlyUsers: number[];
      monthlyOrders: number[];
    }> => {
      const response = await client.get('/users/stats');
      return response.data.data;
    },
    getAll: async (): Promise<User[]> => {
      const response = await client.get('/users');
      return normalize<User[]>(response.data.data);
    },
    getSellers: async (): Promise<User[]> => {
      const response = await client.get('/users/sellers');
      return normalize<User[]>(response.data.data);
    },
    getById: async (id: string): Promise<User> => {
      const response = await client.get(`/users/${id}`);
      return normalize<User>(response.data.data);
    },
    update: async (id: string, data: Partial<User>): Promise<User> => {
      const response = await client.put(`/users/${id}`, data);
      return normalize<User>(response.data.data);
    },
    updateStatus: async (id: string, status: 'active' | 'pending' | 'suspended'): Promise<User> => {
      const response = await client.patch(`/users/${id}/status`, { status });
      return normalize<User>(response.data.data);
    },
    delete: async (id: string): Promise<void> => {
      await client.delete(`/users/${id}`);
    },
  },

  orders: {
    getAll: async (): Promise<Order[]> => {
      const response = await client.get('/orders');
      return normalize<Order[]>(response.data.data);
    },
    getMyOrders: async (): Promise<Order[]> => {
      const response = await client.get('/orders/my');
      return normalize<Order[]>(response.data.data);
    },
    getSellerOrders: async (): Promise<Order[]> => {
      const response = await client.get('/orders/seller');
      return normalize<Order[]>(response.data.data);
    },
    getById: async (id: string): Promise<Order> => {
      const response = await client.get(`/orders/${id}`);
      return normalize<Order>(response.data.data);
    },
    create: async (designId: string, licenseType: string): Promise<Order> => {
      const response = await client.post('/orders', { designId, licenseType });
      return normalize<Order>(response.data.data);
    },
    updateStatus: async (id: string, status: 'completed' | 'pending' | 'processing' | 'refunded'): Promise<Order> => {
      const response = await client.patch(`/orders/${id}/status`, { status });
      return normalize<Order>(response.data.data);
    },
  },

  cart: {
    get: async (): Promise<{ items: { design: Design; licenseType: string }[] }> => {
      const response = await client.get('/cart');
      return normalize<{ items: { design: Design; licenseType: string }[] }>(response.data.data);
    },
    add: async (designId: string, licenseType: string): Promise<{ items: { design: Design; licenseType: string }[] }> => {
      const response = await client.post('/cart', { designId, licenseType });
      return normalize<{ items: { design: Design; licenseType: string }[] }>(response.data.data);
    },
    remove: async (designId: string): Promise<{ items: { design: Design; licenseType: string }[] }> => {
      const response = await client.delete(`/cart/${designId}`);
      return normalize<{ items: { design: Design; licenseType: string }[] }>(response.data.data);
    },
    clear: async (): Promise<{ items: { design: Design; licenseType: string }[] }> => {
      const response = await client.delete('/cart');
      return normalize<{ items: { design: Design; licenseType: string }[] }>(response.data.data);
    },
  },

  wishlist: {
    get: async (): Promise<{ designs: Design[] }> => {
      const response = await client.get('/wishlist');
      return normalize<{ designs: Design[] }>(response.data.data);
    },
    toggle: async (designId: string): Promise<{ designs: Design[]; action: 'added' | 'removed' }> => {
      const response = await client.post(`/wishlist/${designId}`);
      return {
        designs: normalize<Design[]>(response.data.data.designs),
        action: response.data.action,
      };
    },
  },

  tickets: {
    getAll: async (): Promise<Ticket[]> => {
      const response = await client.get('/tickets');
      return normalize<Ticket[]>(response.data.data);
    },
    getMyTickets: async (): Promise<Ticket[]> => {
      const response = await client.get('/tickets/my');
      return normalize<Ticket[]>(response.data.data);
    },
    getById: async (id: string): Promise<Ticket> => {
      const response = await client.get(`/tickets/${id}`);
      return normalize<Ticket>(response.data.data);
    },
    create: async (ticket: { subject: string; description: string; priority: 'low' | 'medium' | 'high' | 'urgent'; category: string }): Promise<Ticket> => {
      const response = await client.post('/tickets', ticket);
      return normalize<Ticket>(response.data.data);
    },
    updateStatus: async (id: string, status: 'open' | 'in-progress' | 'resolved' | 'closed'): Promise<Ticket> => {
      const response = await client.patch(`/tickets/${id}/status`, { status });
      return normalize<Ticket>(response.data.data);
    },
  },
};
