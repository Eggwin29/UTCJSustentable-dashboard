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

export interface CollectionListItem extends Collection {
  materialName: string;
}

export interface CreateCollectionInput {
  date: string;
  materialId: string;
  kilograms: number;
  location?: string | null;
  notes?: string | null;
  createdBy: string;
}

export type UpdateCollectionInput = Omit<
  CreateCollectionInput,
  "createdBy"
>;