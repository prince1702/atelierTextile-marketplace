import { designs, users, orders, type Design, type User, type Order } from '../data/mockData';

// Simulated network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  designs: {
    getAll: async (): Promise<Design[]> => {
      await delay(500);
      return designs;
    },
    getById: async (id: string): Promise<Design | undefined> => {
      await delay(300);
      return designs.find(d => d.id === id);
    },
    getByCategory: async (category: string): Promise<Design[]> => {
      await delay(500);
      if (category === 'All') return designs;
      return designs.filter(d => d.category === category);
    }
  },
  
  users: {
    getCurrentUser: async (): Promise<User | null> => {
      await delay(400);
      // Simulating a logged-in user for now, this would be tied to real auth
      return users[0];
    },
    getAll: async (): Promise<User[]> => {
      await delay(600);
      return users;
    }
  },

  orders: {
    getAll: async (): Promise<Order[]> => {
      await delay(600);
      return orders;
    },
    getByUserId: async (_userId: string): Promise<Order[]> => {
      await delay(500);
      // When backend is integrated, filter by real userId
      return orders;
    }
  }
};
