import type { Handler } from 'aws-lambda';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';

const lambda = new LambdaClient({});

export const handler: Handler = async (event) => {
  try {
    console.log("Received event:", JSON.stringify(event, null, 2));
    const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    console.log("Parsed body:", JSON.stringify(body, null, 2));

    const vehicleId = body.params?.vehicleId ?? 'demo-vehicle';

    // call the subscription checker
    const command = new InvokeCommand({
      FunctionName: 'subscription-checker',
      Payload: Buffer.from(JSON.stringify({
        jsonrpc: '2.0',
        method: 'subscriptionChecker',
        params: { vehicleId },
        id: 'tool-001'
      })),
    });
    
    const response = await lambda.send(command);
    console.log("Raw Lambda response from subscriptionChecker:", response);
    const responseString = new TextDecoder().decode(response.Payload);
    const subStatus = JSON.parse(responseString);

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