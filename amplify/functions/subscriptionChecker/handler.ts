import type { Handler } from 'aws-lambda';

export const handler: Handler = async (event, context) => {
    console.log("Received event in subscriptionChecker:", JSON.stringify(event, null, 2));
    try {
        const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
        console.log("Parsed body in subscriptionChecker:", JSON.stringify(body, null, 2));

        const vehicleId = body.params?.vehicleId ?? 'unknown';

        const features = ['Remote Start', 'Geofencing', 'Vehicle Finder', 'Speed Alerts', 'Remote Unlock'];

        const result = features.map((name) => ({
        name,
        status: Math.random() > 0.5 ? 'Valid' : 'Expired'
    }));

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
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
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        error: {
          code: -32603,
          message: 'Internal error in subscriptionChecker'
        },
        id: event.body?.id ?? null
      })
    };
  }
};