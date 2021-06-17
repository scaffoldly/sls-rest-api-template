import { DecodedJwtPayload, HttpError } from '@scaffoldly/serverless-util';
import { ulid } from 'ulid';
import { CreatePetRequest, UpdatePetRequest } from '../interfaces/requests';
import { ListResponse, PetResponse } from '../interfaces/responses';
import { PetModel } from '../models/PetModel';
import { AccountApi, Configuration } from './openapi/auth';

export class PetService {
  petModel: PetModel;

  constructor() {
    this.petModel = new PetModel();
  }

  public createPet = async (
    request: CreatePetRequest,
    user: DecodedJwtPayload,
    token: string,
  ): Promise<PetResponse> => {
    const accountApi = new AccountApi(new Configuration({ accessToken: token }));

    const { data: account } = await accountApi.getAccountById(user.id, {
      validateStatus: (status: number) => status === 200 || status === 404, // Don't thow errors on 404s
    });

    const pet = await this.petModel.model.create({
      ...request,
      pk: ulid(),
      sk: 'pet',
      createdBy: { id: user.id, email: account.email, name: account.name },
    });

    return {
      ...pet.attrs,
    };
  };

  public listPets = async (
    lastKey?: string,
    limit?: number,
  ): Promise<ListResponse<PetResponse>> => {
    let scan = this.petModel.model.scan();

    if (lastKey) {
      scan = scan.startKey(lastKey, 'pet');
    }

    if (limit) {
      scan = scan.limit(limit);
    }

    const result = await scan.exec().promise();

    return {
      results: result[0].Items.map((item) => item.attrs),
    };
  };

  public getPet = async (id: string): Promise<PetResponse> => {
    const result = await this.petModel.model.get(id, 'pet');

    if (!result) {
      throw new HttpError(404, 'Not Found');
    }

    return result.attrs;
  };

  public updatePet = async (
    id: string,
    request: UpdatePetRequest,
    user: DecodedJwtPayload,
  ): Promise<PetResponse> => {
    let result = await this.petModel.model.get(id, 'pet');

    if (!result) {
      throw new HttpError(404, 'Not Found');
    }

    if (result.attrs.createdBy.id !== user.id) {
      throw new HttpError(403, 'Forbidden');
    }

    result = await this.petModel.model.update({ ...result.attrs, ...request });

    return result.attrs;
  };

  public deletePet = async (id: string, user: DecodedJwtPayload): Promise<void> => {
    let result = await this.petModel.model.get(id, 'pet');

    if (!result) {
      throw new HttpError(404, 'Not Found');
    }

    if (result.attrs.createdBy.id !== user.id) {
      throw new HttpError(403, 'Forbidden');
    }

    result = await this.petModel.model.destroy(id, 'pet');
  };
}
