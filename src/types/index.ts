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
  deliveryDate: string; // Format: YYYY-MM-DD
  deliveryDay: 'mercredi' | 'jeudi' | 'vendredi' | 'samedi';
  createdAt: string;
  notes?: string;
}

export type DeliveryDay = 'mercredi' | 'jeudi' | 'vendredi' | 'samedi';

export interface WeekInfo {
  weekNumber: number;
  startDate: string; // Format: YYYY-MM-DD
  endDate: string; // Format: YYYY-MM-DD
  label: string; // Ex: "Semaine 35 (26 août - 1 sept)"
}

export interface AdminProduct {
  id: string;
  name: string;
  defaultUnit: string;
  createdAt: string;
}