import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/store/cartStore";

export type OrderStatus = "pending" | "processing" | "shipping" | "delivered" | "cancelled" | "returned";

export interface OrderCustomer {
  name: string;
  phone: string;
  email: string;
  address: string;
}

export interface Order {
  id: string;
  createdAt: string;
  status: OrderStatus;
  paymentMethod: "cod" | "bank";
  customer: OrderCustomer;
  items: CartItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
}

interface OrderStore {
  orders: Order[];
  addOrder: (order: Order) => void;
  clearOrders: () => void;
  getOrderById: (orderId: string) => Order | undefined;
}

export const useOrderStore = create<OrderStore>()(
  persist(
    (set, get) => ({
      orders: [],
      addOrder: (order) => set((state) => ({ orders: [order, ...state.orders] })),
      clearOrders: () => set({ orders: [] }),
      getOrderById: (orderId) => get().orders.find((order) => order.id === orderId),
    }),
    {
      name: "order-storage",
    }
  )
);
