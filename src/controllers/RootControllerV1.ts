import {
  ErrorResponse,
  extractRequestToken,
  HttpRequestWithUser,
} from '@scaffoldly/serverless-util';
import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Path,
  Post,
  Query,
  Request,
  Response,
  Route,
  Security,
  Tags,
} from 'tsoa';
import { CreatePetRequest, UpdatePetRequest } from '../interfaces/requests';
import { ListResponse, PetResponse } from '../interfaces/responses';
import { PetService } from '../services/PetService';

@Route('/api/v1')
@Tags('Pets')
export class RootControllerV1 extends Controller {
  petService: PetService;

  constructor() {
    super();
    this.petService = new PetService();
  }

  @Get()
  @Response<ErrorResponse>('4XX')
  @Response<ErrorResponse>('5XX')
  public async list(
    @Query() lastKey?: string,
    @Query() limit?: number,
  ): Promise<ListResponse<PetResponse>> {
    return this.petService.listPets(lastKey, limit);
  }

  @Post()
  @Response<ErrorResponse>('4XX')
  @Response<ErrorResponse>('5XX')
  @Security('jwt')
  public async create(
    @Body() petRequest: CreatePetRequest,
    @Request() request: HttpRequestWithUser,
  ): Promise<PetResponse> {
    return this.petService.createPet(petRequest, request.user, extractRequestToken(request));
  }

  @Get('{id}')
  @Response<ErrorResponse>('4XX')
  @Response<ErrorResponse>('5XX')
  public async get(@Path() id: string): Promise<PetResponse> {
    return this.petService.getPet(id);
  }

  @Patch('{id}')
  @Response<ErrorResponse>('4XX')
  @Response<ErrorResponse>('5XX')
  @Security('jwt')
  public async update(
    @Path() id: string,
    @Body() petRequest: UpdatePetRequest,
    @Request() request: HttpRequestWithUser,
  ): Promise<PetResponse> {
    return this.petService.updatePet(id, petRequest, request.user);
  }

  @Delete('{id}')
  @Response<void>('204')
  @Response<ErrorResponse>('4XX')
  @Response<ErrorResponse>('5XX')
  @Security('jwt')
  public async delete(@Path() id: string, @Request() request: HttpRequestWithUser): Promise<void> {
    return this.petService.deletePet(id, request.user);
  }
}
