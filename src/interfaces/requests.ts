import { PetType } from '../models/interfaces';

export type CreatePetRequest = {
  type: PetType;
  name: string;
  age?: number;
};

export type UpdatePetRequest = {
  type?: PetType;
  name?: string;
  age?: number;
};
