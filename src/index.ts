import * as dotenv from 'dotenv';
import { handleError, handleSuccess } from '@scaffoldly/serverless-util';
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import * as packageJson from '../package.json';

dotenv.config();

export const getVersion = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  console.log(`Event: ${JSON.stringify(event, null, 2)}`);
  console.log(`Context: ${JSON.stringify(context, null, 2)}`);
  try {
    const version = packageJson.version;
    return handleSuccess(event, { version });
  } catch (e) {
    return handleError(event, e);
  }
};
