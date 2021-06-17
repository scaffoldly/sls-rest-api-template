import Joi from 'joi';

export const petTypeSchema = Joi.valid('dog', 'cat', 'bird', 'fish').label('PetType');

export const accountSchema = Joi.object({
  id: Joi.string(),
  name: Joi.string(),
  email: Joi.string(),
}).label('Account');

export const pet = {
  pk: Joi.string().required(),
  sk: Joi.string().required(),
  type: petTypeSchema.optional(),
  name: Joi.string().required(),
  age: Joi.number(),
  createdBy: accountSchema.required(),
};

export const petSchema = Joi.object(pet).label('Pet');
