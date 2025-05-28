import type { Handler } from 'aws-lambda';

export const handler: Handler = async (event, context) => {
    console.log("configChecker has received event:", JSON.stringify(event, null, 2));
    try {
        const vehicleId = event.params?.vehicleId ?? 'unknown';
        const features = ['Remote Start', 'Geofencing', 'Vehicle Finder', 'Speed Alerts', 'Remote Unlock'];
        const result = features.map((name) => ({
            name,
            status: Math.random() > 0.5 ? 'Enabled' : 'Disabled'
        })
    );

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
        id: event.id ?? null
      })
    };
  } catch (err) {
    console.error("configChecker failed:", err);
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        error: {
          code: -32603,
          message: 'Internal error in configChecker'
        },
        id: (event as any).id ?? null
      })
    };
  }
};