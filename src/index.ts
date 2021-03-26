import * as dotenv from 'dotenv';
import { handleError, handleSuccess } from '@scaffoldly/serverless-util';
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import * as serviceUrls from '../.scaffoldly/service-urls.json';
import * as sharedEnvVars from '../.scaffoldly/shared-env-vars.json';
import * as jokes from './jokes/jokes.json';

dotenv.config();

export const getJokeV1 = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  console.log(`Event: ${JSON.stringify(event, null, 2)}`);
  console.log(`Context: ${JSON.stringify(context, null, 2)}`);
  try {
    console.log('Service URLs', serviceUrls);
    console.log('Shared Env Vars', sharedEnvVars);

    return handleSuccess(event, jokes.valueOf()[Math.floor(Math.random() * jokes.length)]);
  } catch (e) {
    return handleError(event, e);
  }
};
