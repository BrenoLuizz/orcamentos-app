export type BudgetStatus = 'draft' | 'sent' | 'approved' | 'declined';

export interface ServiceItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
}

export interface Budget {
  id: string;
  title: string;
  client: string;
  status: BudgetStatus;
  services: ServiceItem[];
  discount?: number; // porcentagem
  createdAt: string;
  updatedAt?: string;
}