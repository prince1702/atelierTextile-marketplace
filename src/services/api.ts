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

const FRONTEND_MOCK_DESIGNS: Design[] = [];



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
