import type { Handler } from 'aws-lambda';

// function just returning "OK" placeholder when JSON-RPC 2.0 request received from front-end for now.

export const handler: Handler = async (event) => {
  try {
    const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;

    const response = {
      jsonrpc: '2.0',
      result: 'OK',
      id: body.id ?? null,
    };

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
