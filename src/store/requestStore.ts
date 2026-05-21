import { create } from "zustand";
import { persist } from "zustand/middleware";

export type RequestStatus = "open" | "in_progress" | "resolved";

export interface CustomerRequest {
  id: string;
  title: string;
  message: string;
  status: RequestStatus;
  createdAt: string;
}

interface RequestStore {
  requests: CustomerRequest[];
  addRequest: (request: CustomerRequest) => void;
  updateStatus: (id: string, status: RequestStatus) => void;
  clearRequests: () => void;
}

export const useRequestStore = create<RequestStore>()(
  persist(
    (set) => ({
      requests: [],
      addRequest: (request) => set((state) => ({ requests: [request, ...state.requests] })),
      updateStatus: (id, status) =>
        set((state) => ({
          requests: state.requests.map((request) =>
            request.id === id ? { ...request, status } : request
          ),
        })),
      clearRequests: () => set({ requests: [] }),
    }),
    {
      name: "customer-request-storage",
    }
  )
);
