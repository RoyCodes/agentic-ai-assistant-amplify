// import * as React from "react";
import { post } from 'aws-amplify/api';
import { fetchAuthSession } from 'aws-amplify/auth';

import { 
  View, 
  Heading, 
  SelectField, 
  Button, 
  Card, 
  Text, 
  Flex, 
  Divider, 
  Accordion, 
} from '@aws-amplify/ui-react';
import { useState } from 'react'

export default function Troubleshooter() {

// State
const [problem, setProblem] = useState('');
const [result, setResult] = useState('');
const [chainOfThought, setChainOfThought] = useState<string[]>([]);
const [isLoading, setIsLoading] = useState(false);

// Logic
  const handleHelpClick = async () => {
    setIsLoading(true);
  try {
    const session = await fetchAuthSession();
    const token = session.tokens?.accessToken?.toString();

    const restOperation = post({
      apiName: 'HelpApi', // ← Must match name in amplify_outputs.json
      path: '/help',
      options: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: {
          jsonrpc: "2.0",
          method: "helpRequest",
          params: {
            problemType: problem,
            timestamp: new Date().toISOString(),
          },
          id: "request-001"
        }
      }
    });

    const { body } = await restOperation.response;
    const rawResponse = await body.text();
    const json = JSON.parse(rawResponse);

    if (json?.result) {
      // If a result is present, display it (stringifying the object for readability)
      setResult(JSON.stringify(json.result, null, 2));
      setChainOfThought([]); // Reset or populate chain of thought here
    } else if (json?.error) {

      // If an error is present, display the error message
      setResult(`Error: ${json.error.message} (Code: ${json.error.code})`);
      setChainOfThought([]);
      console.error("JSON-RPC Error received:", json.error);
    }
     else {
      setResult("Unexpected response format.");
      setChainOfThought([]);
    }

  } catch (err) {
    console.error("POST /help failed:", err);
    setResult("Error sending help request or network issue.");
    setChainOfThought([]);
  } finally {
    setIsLoading(false);
  }
};

// Render
return (
<View>
      <Flex direction="column" gap="2rem">
        <Heading level={3}>Simulate a Vehicle Problem</Heading>

        <SelectField 
          label="Select a Problem to Simulate"
          value={problem}
          onChange={(e) => setProblem(e.target.value)}
          placeholder="Choose an issue..."
          isRequired
        >
          <option value="subscription_expired">Subscription Expired</option>
          <option value="service_outage">Service Outage</option>
          <option value="car_misconfiguration">Car Misconfiguration</option>
          <option value="known_issue_kb">Known Issue (Knowledge Base)</option>
          <option value="unknown_issue">Unknown Issue (Edge Case)</option>
        </SelectField>

        <Button 
          variation="primary" 
          onClick={handleHelpClick}
          isDisabled={!problem || isLoading}
        >
          {isLoading ? 'Loading...' : 'Help Me'}
        </Button>

        {result && (
          <Card>
            <Heading level={5}>Resolution</Heading>
            <Text marginTop="0.5rem">{result}</Text>

            <Divider marginTop="1rem" marginBottom="1rem" />

            <Accordion
              items={[
                {
                  value: 'chainOfThought',
                  trigger: 'View Chain of Thought',
                  content: (
                    <Flex direction="column" gap="0.5rem">
                      {chainOfThought.map((step, index) => (
                        <Text key={index}>• {step}</Text>
                      ))}
                    </Flex>
                  )
                }
              ]}
            />

          </Card>
        )}
      </Flex>
      </View>


);
}