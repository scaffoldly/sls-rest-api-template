import { assertProcessUuid, TypedDynamoDBStreamEvent } from '@scaffoldly/serverless-util';
import { SNSEvent } from 'aws-lambda';
import { Body, Controller, Header, Hidden, Post, Route, Tags } from 'tsoa';
import { PetService } from '../services/PetService';

@Route('/events')
@Tags('Events')
@Hidden()
export class EventController extends Controller {
  petService: PetService;

  constructor() {
    super();
    this.petService = new PetService();
  }

  @Post('aws/dynamodb')
  public async awsDynamoDbEvent(
    @Header('x-process-uuid') processUuid: string,
    @Body() event: TypedDynamoDBStreamEvent<any>,
  ): Promise<void> {
    // Middleware injects process uuid. Ensure it matches
    assertProcessUuid(processUuid);

    return this.petService.handlPetDBEventRecords(event.Records);
  }

  @Post('aws/sns')
  public async awsSnsEvent(
    @Header('x-process-uuid') processUuid: string,
    @Body() event: SNSEvent,
  ): Promise<void> {
    // Middleware injects process uuid. Ensure it matches
    assertProcessUuid(processUuid);

    return this.petService.handlPetMessageRecords(event.Records);
  }
}
