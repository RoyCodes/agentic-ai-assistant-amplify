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

    const responseString = new TextDecoder().decode(response.Payload);
    const subCheckerResponse = JSON.parse(responseString);
    console.log("Parsed subscriptionChecker response:", subCheckerResponse);

    return {
      statusCode: 200,
      body: JSON.stringify(response),
    };
  } catch (error) {
    console.error("Help orchestrator failed:", error);

    return {
      statusCode: 400,
      body: JSON.stringify({
        jsonrpc: '2.0',
        error: {
          code: -32600,
          message: 'Invalid Request',
        },
        id: null,
      }),
    };
  }
};