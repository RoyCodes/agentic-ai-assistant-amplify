import type { Handler } from 'aws-lambda';

export const handler: Handler = async (event, context) => {
  try {
    const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    const vehicleId = body.params?.vehicleId ?? 'unknown';

    const features = ['Remote Start', 'Geofencing', 'Vehicle Finder', 'Speed Alerts', 'Remote Unlock'];

    const result = features.map((name) => ({
      name,
      status: Math.random() > 0.5 ? 'Valid' : 'Expired'
    }));

    return {
      statusCode: 200,
      body: JSON.stringify({
        jsonrpc: '2.0',
        result: {
          features: result
        },
        id: body.id ?? null
      })
    };
  } catch (err) {
    console.error("checkSubscriptionStatus failed:", err);
    return {
      statusCode: 400,
      body: JSON.stringify({
        jsonrpc: '2.0',
        error: {
          code: -32603,
          message: 'Internal error'
        },
        id: null
      })
    };
  }
};
