export interface Collection {
  id: string;
  date: string;
  materialId: string;
  kilograms: number;
  location: string | null;
  notes: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}