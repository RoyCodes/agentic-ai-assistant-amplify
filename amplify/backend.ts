import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { helpOrchestrator } from './functions/helpOrchestrator/resource';
import { subscriptionChecker } from './functions/subscriptionChecker/resource';
import { Stack } from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import {
  CorsHttpMethod,
  HttpApi,
  HttpMethod,
} from 'aws-cdk-lib/aws-apigatewayv2';
import { HttpUserPoolAuthorizer } from 'aws-cdk-lib/aws-apigatewayv2-authorizers';
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';


/**
 * @see https://docs.amplify.aws/react/build-a-backend/ to add storage, functions, and more
 */

const backend = defineBackend({
  auth,
  data,
  helpOrchestrator,
  subscriptionChecker
});

// Create an API stack for client -> helpOrchestrator
const helpOrchestratorApiStack = backend.createStack('help-orchestrator-api-stack');

// Create a User Pool authorizer
const userPoolAuthorizer = new HttpUserPoolAuthorizer(
  'userPoolAuth',
  backend.auth.resources.userPool,
  {
    userPoolClients: [backend.auth.resources.userPoolClient],
  }
);


// Create HTTP API for client -> helpOrchestrator
const helpHttpApi = new HttpApi(helpOrchestratorApiStack, 'HelpHttpApi', {
  apiName: 'HelpApi',
  corsPreflight: {
    allowMethods: [CorsHttpMethod.POST],
    allowOrigins: ['*'],
    allowHeaders: ['*'],
  },
  createDefaultStage: true,
});

// Create an HTTP Lambda integration for helpOrchestrator
const helpLambdaIntegration = new HttpLambdaIntegration(
  'HelpLambdaIntegration',
  backend.helpOrchestrator.resources.lambda
);

// Allow helpOrchestrator to call subscriptionChecker
backend.helpOrchestrator.resources.lambda.addToRolePolicy(
  new iam.PolicyStatement({
    actions: ['lambda:InvokeFunction'],
    resources: [
      backend.subscriptionChecker.resources.lambda.functionArn
    ]
  })
);

// Add /help route
helpHttpApi.addRoutes({
  path: '/help',
  methods: [HttpMethod.POST],
  integration: helpLambdaIntegration,
  authorizer: userPoolAuthorizer,
});

// Output
backend.addOutput({
  custom: {
    API: {
      [helpHttpApi.httpApiName!]: {
        endpoint: helpHttpApi.url,
        region: Stack.of(helpHttpApi).region,
        apiName: helpHttpApi.httpApiName,
      },
    },
  },
});