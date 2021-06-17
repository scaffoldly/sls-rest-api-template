import { Pet } from '../models/interfaces';

export type PetResponse = Pet;

export type ListResponse<T> = {
  results: T[];
};
