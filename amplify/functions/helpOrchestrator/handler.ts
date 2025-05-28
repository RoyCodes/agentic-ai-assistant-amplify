import type { Handler } from 'aws-lambda';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';

const lambda = new LambdaClient({});

// Get the function name from environment variable
const SUBSCRIPTION_CHECKER_FUNCTION_NAME = process.env.SUBSCRIPTION_CHECKER_FUNCTION_NAME;

export const handler: Handler = async (event) => {
  try {
    console.log("Received event:", JSON.stringify(event, null, 2));
    const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    console.log("Parsed body:", JSON.stringify(body, null, 2));

    if (!SUBSCRIPTION_CHECKER_FUNCTION_NAME) {
      throw new Error("SUBSCRIPTION_CHECKER_FUNCTION_NAME environment variable is not set. Cannot invoke subscriptionChecker.");
    }

    const problemType = body.params?.problemType;
    const vehicleId = body.params?.vehicleId ?? 'demo-vehicle';


    const subscriptionCheckerPayload = {
      jsonrpc: '2.0',
      method: 'subscriptionChecker',
      params: { vehicleId },
      id: body.id || 'help-orchestrator-request' 
    };

    // call the subscription checker
    const command = new InvokeCommand({
      FunctionName: SUBSCRIPTION_CHECKER_FUNCTION_NAME,
      InvocationType: 'RequestResponse',
      Payload: Buffer.from(JSON.stringify(subscriptionCheckerPayload)),
    });
    
    const response = await lambda.send(command);
    console.log("Raw Lambda response from subscriptionChecker:", response);

    const responseString = response.Payload ? new TextDecoder().decode(response.Payload) : '{}';
    const lambdaProxyResponse = JSON.parse(responseString); 
    console.log("Parsed Lambda Proxy Response:", lambdaProxyResponse);

    const subCheckerResponse = JSON.parse(lambdaProxyResponse.body); 
    console.log("Parsed subscriptionChecker response (final):", subCheckerResponse); 

    if (subCheckerResponse.jsonrpc === '2.0' && 'result' in subCheckerResponse) {
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          result: subCheckerResponse.result,
          id: subCheckerResponse.id || body.id || null
        }),
      };
    } 
    else if (subCheckerResponse.jsonrpc === '2.0' && 'error' in subCheckerResponse) {
      return{
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          error: subCheckerResponse.error,
          id: subCheckerResponse.id || body.id || null
          }),
        };
      }
      else {
        throw new Error("Unexpected JSON-RPC response format from subscriptionChecker.");
      }

    } catch (error) {
      console.error("Help orchestrator failed:", error);

      let errorMessage = 'An unexpected internal error occurred in helpOrchestrator.';
      let errorCode = -32000; // Default JSON-RPC Internal error code

      if (error instanceof Error) {
        errorMessage = error.message;
        console.error("Error stack", error.stack);
      } else if (typeof error === 'object' && error != null && 'message' in error) {
        errorMessage = (error as any).message;
      }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        error: {
          code: errorCode,
          message: `Internal Server Error: ${errorMessage}`,
          data: null
        },
        id: event.body?.id || null, 
      }),
    };
  }
};