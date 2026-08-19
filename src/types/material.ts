export interface Material {
  id: string;
  name: string;
  co2Factor: number;
  active: boolean;
  createdAt: string;
}
export interface CreateMaterialInput {
  name: string;
  co2Factor: number;
}

export type UpdateMaterialInput =
  CreateMaterialInput;