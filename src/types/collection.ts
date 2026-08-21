export interface Collection {
  id: string;
  date: string;
  academicTermId: string | null;
  materialId: string;
  kilograms: number;
  location: string | null;
  notes: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CollectionListItem
  extends Collection {
  academicTermLabel: string;
  materialName: string;
}

export interface CreateCollectionInput {
  date: string;
  academicTermId: string;
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