import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { helpOrchestrator } from './functions/helpOrchestrator/resource';
import { subscriptionChecker } from './functions/subscriptionChecker/resource';
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

// Amplify Gen 2 wraps Lambda resources in higher-level constructs that don’t expose CDK methods
// like .addEnvironment() or .addToRolePolicy(). We need to unwrap the underlying CDK Function using
// .node.defaultChild so that we can wire up Lambda-to-Lambda invocations.
const helpOrchestratorCDK = backend.helpOrchestrator.resources.lambda.node.defaultChild as LambdaFunction;
const subscriptionCheckerCDK = backend.subscriptionChecker.resources.lambda.node.defaultChild as LambdaFunction;

// Add IAM permission to invoke subscriptionChecker
helpOrchestratorCDK.addToRolePolicy(
  new iam.PolicyStatement({
    actions: ['lambda:InvokeFunction'],
    resources: [subscriptionCheckerCDK.functionArn],
  })
);

// Pass real function name to helpOrchestrator as an env var
helpOrchestratorCDK.addEnvironment(
  'SUBSCRIPTION_CHECKER_FUNCTION_NAME',
  subscriptionCheckerCDK.functionName
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