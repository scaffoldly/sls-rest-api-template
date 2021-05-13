import {
  GetIdentity,
  handleError,
  handleSuccess,
  HttpError,
  Joi,
  optionalParameters,
  requiredParameters,
  Table,
} from '@scaffoldly/serverless-util';
import { AuthorizedEvent } from '@scaffoldly/serverless-util/dist/auth';
import { APIGatewayProxyResult, Context } from 'aws-lambda';
import { boolean } from 'boolean';
import * as moment from 'moment';
import { SERVICE_NAME, STAGE, TABLE_SUFFIX } from 'src/constants';
import { ulid } from 'ulid';

const table = new Table(
  TABLE_SUFFIX,
  SERVICE_NAME,
  STAGE,
  {
    id: Joi.string().required(),
    sk: Joi.string().required(),
    message: Joi.string().required(),
    expires: Joi.number().optional(),
  },
  'id',
  'sk'
);

// TODO: Demonstrate DynamoDB Stream events
// TODO: Demonstrate accessing another service in the org
// TODO: Secrets Example

export const createSampleV1 = async (
  event: AuthorizedEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  console.log(`Event: ${JSON.stringify(event, null, 2)}`);
  console.log(`Context: ${JSON.stringify(context, null, 2)}`);
  try {
    const identity = await GetIdentity(event, context);

    const params = requiredParameters(event.body, ['message']);

    const row = await table.model.create({ id: identity, sk: ulid(), ...params });

    return handleSuccess(event, row.attrs);
  } catch (e) {
    return handleError(event, e);
  }
};

export const readSampleV1 = async (
  event: AuthorizedEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  console.log(`Event: ${JSON.stringify(event, null, 2)}`);
  console.log(`Context: ${JSON.stringify(context, null, 2)}`);
  try {
    const identity = await GetIdentity(event, context);

    const params = requiredParameters(event.pathParameters, ['sk']);

    const row = await table.model.get(identity, params.sk, {});

    if (!row || !row.attrs) {
      throw new HttpError(404, 'Not Found');
    }

    return handleSuccess(event, row.attrs);
  } catch (e) {
    return handleError(event, e);
  }
};

export const updateSampleV1 = async (
  event: AuthorizedEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  console.log(`Event: ${JSON.stringify(event, null, 2)}`);
  console.log(`Context: ${JSON.stringify(context, null, 2)}`);
  try {
    const identity = await GetIdentity(event, context);

    const params = requiredParameters(event.pathParameters, ['sk']);
    const body = optionalParameters(event.body, ['message']);

    const row = await table.model.get(identity, params.sk, {});
    if (!row || !row.attrs) {
      throw new HttpError(404, 'Not Found');
    }

    const updated = await table.model.update({ ...row.attrs, ...body }, {});

    if (!updated) {
      throw new HttpError(500, 'Error updating row');
    }

    return handleSuccess(event, updated);
  } catch (e) {
    return handleError(event, e);
  }
};

export const deleteSampleV1 = async (
  event: AuthorizedEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  console.log(`Event: ${JSON.stringify(event, null, 2)}`);
  console.log(`Context: ${JSON.stringify(context, null, 2)}`);
  try {
    const identity = await GetIdentity(event, context);

    const params = requiredParameters(event.pathParameters, ['sk']);
    const body = optionalParameters(event.body, ['immediate'], { allowEmptyStrings: true });

    const immediate = boolean(body.immediate);

    const row = await table.model.get(identity, params.sk, {});
    if (!row || !row.attrs) {
      throw new HttpError(404, 'Not Found');
    }

    if (immediate) {
      const deleted = await table.model.destroy(row.get('id'), row.get('sk'), {
        ReturnValues: 'ALL_OLD',
      });
      if (!deleted) {
        throw new HttpError(500, 'Error deleting row');
      }
      return handleSuccess(event, deleted);
    }

    if (row.get('expires')) {
      throw new HttpError(400, 'Row is already queued for expiration', row.attrs);
    }

    const updated = await table.model.update({ ...row.attrs, expires: moment().unix() });
    if (!updated) {
      throw new HttpError(500, 'Error expiring row');
    }
    return handleSuccess(event, updated);
  } catch (e) {
    return handleError(event, e);
  }
};
