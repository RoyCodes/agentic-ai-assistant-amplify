import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { helpOrchestrator } from './functions/helpOrchestrator/resource';
import { subscriptionChecker } from './functions/subscriptionChecker/resource';
import { configChecker } from './functions/configChecker/resource';
import { Stack } from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Function as LambdaFunction } from 'aws-cdk-lib/aws-lambda'; 
import {
  CorsHttpMethod,
  HttpApi,
  HttpMethod,
} from 'aws-cdk-lib/aws-apigatewayv2';
import { HttpUserPoolAuthorizer } from 'aws-cdk-lib/aws-apigatewayv2-authorizers';
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import { config } from 'process';

const backend = defineBackend({
  auth,
  data,
  helpOrchestrator,
  subscriptionChecker,
  configChecker
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

// Amplify Gen 2 wraps Lambda resources in higher-level constructs that don’t expose CDK methods
// like .addEnvironment() or .addToRolePolicy(). We need to unwrap the underlying CDK Function using
// .node.defaultChild so that we can wire up Lambda-to-Lambda invocations.
const helpOrchestratorCDK = backend.helpOrchestrator.resources.lambda as LambdaFunction;
const subscriptionCheckerCDK = backend.subscriptionChecker.resources.lambda as LambdaFunction;
const configCheckerCDK = backend.configChecker.resources.lambda as LambdaFunction;

// Create an HTTP Lambda integration for helpOrchestrator
const helpLambdaIntegration = new HttpLambdaIntegration(
  'HelpLambdaIntegration',
  helpOrchestratorCDK
);

// Add IAM permission to invoke subscriptionChecker and configChecker
helpOrchestratorCDK.addToRolePolicy(
  new iam.PolicyStatement({
    actions: ['lambda:InvokeFunction'],
    resources: [subscriptionCheckerCDK.functionArn, configCheckerCDK.functionArn],
  })
);

// Pass real function names to helpOrchestrator as env vars
helpOrchestratorCDK.addEnvironment(
  'SUBSCRIPTION_CHECKER_FUNCTION_NAME',
  subscriptionCheckerCDK.functionName
);
helpOrchestratorCDK.addEnvironment(
  'CONFIG_CHECKER_FUNCTION_NAME',
  configCheckerCDK.functionName
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