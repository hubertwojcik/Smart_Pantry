export interface Product {
  id: string;
  name: string;
  quantity: number;
  weight: number;
  weightUnit: "g" | "ml" | "szt";
  category: Category;
  expiryDate: string;
  location?: string;
  barcode?: string;
  imageUrl?: string;
  addedAt: string;
}

export type Category =
  | "Nabiał"
  | "Pieczywo"
  | "Mięso"
  | "Warzywa"
  | "Suche"
  | "Napoje"
  | "Inne";

export const CATEGORIES: Category[] = [
  "Nabiał",
  "Pieczywo",
  "Mięso",
  "Warzywa",
  "Suche",
  "Napoje",
  "Inne",
];

export const LOCATIONS = ["Lodówka", "Spiżarnia", "Szafka", "Zamrażarka"] as const;
export type Location = (typeof LOCATIONS)[number];

export type ExpiryStatus = "expired" | "critical" | "warning" | "ok";

export interface Notification {
  id: string;
  productId: string;
  productName: string;
  message: string;
  status: ExpiryStatus;
  createdAt: string;
  read: boolean;
  type: "expiry" | "restock" | "info";
}

export type SortOption = "expiryDate" | "name" | "category";
