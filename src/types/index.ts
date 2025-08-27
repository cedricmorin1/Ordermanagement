export interface Product {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  produced: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  products: Product[];
  deliveryDay: 'mercredi' | 'jeudi' | 'vendredi' | 'samedi';
  createdAt: string;
  notes?: string;
}

export type DeliveryDay = 'mercredi' | 'jeudi' | 'vendredi' | 'samedi';

export interface AdminProduct {
  id: string;
  name: string;
  defaultUnit: string;
  createdAt: string;
}