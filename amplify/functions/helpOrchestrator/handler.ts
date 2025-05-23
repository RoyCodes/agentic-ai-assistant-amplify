import type { Handler } from 'aws-lambda';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';

// function just returning "OK" placeholder when JSON-RPC 2.0 request received from front-end for now.

const lambda = new LambdaClient({});

export const handler: Handler = async (event) => {
  try {
    const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
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
    const responseString = new TextDecoder().decode(response.Payload);
    const subStatus = JSON.parse(responseString);


    return {
      statusCode: 200,
      body: JSON.stringify(response),
    };
  } catch (error) {
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
