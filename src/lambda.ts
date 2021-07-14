import {
  dynamoDBStreamEventRequestMapper,
  dynamoDBStreamEventResponseMapper,
  snsEventRequestMapper,
  snsEventResponseMapper,
} from '@scaffoldly/serverless-util';
import { configure } from '@vendia/serverless-express';
import * as dotenv from 'dotenv';
import app from './app';

// import { AWS } from '@scaffoldly/serverless-util';
// AWS.config.logger = console;

dotenv.config();

exports.handler = configure({ app });
exports.dynamoDbEventHandler = configure({
  app,
  eventSource: {
    getRequest: dynamoDBStreamEventRequestMapper('/events/aws/dynamodb'),
    getResponse: dynamoDBStreamEventResponseMapper(),
  },
});
exports.snsEventHandler = configure({
  app,
  eventSource: {
    getRequest: snsEventRequestMapper('/events/aws/sns'),
    getResponse: snsEventResponseMapper(),
  },
});
