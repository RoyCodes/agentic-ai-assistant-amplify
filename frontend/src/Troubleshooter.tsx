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


// Logic
  const handleHelpClick = async () => {
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
      setResult(json.result);         // should be "OK" for now
      setChainOfThought([]);          // will fill later
    } else {
      setResult("Unexpected response format.");
      setChainOfThought([]);
    }

  } catch (err) {
    console.error("POST /help failed:", err);
    setResult("Error sending help request.");
    setChainOfThought([]);
  }
};

  //   // Placeholder: this would later trigger your MCP client call
  //   const simulatedResult = `We detected a problem: ${problem}. Here's what you should do...`;
  //   const simulatedChain = [
  //     'Checked car configuration — OK',
  //     'Checked subscription — Expired',
  //     'Determined likely cause — Subscription issue',
  //     'Generated response to user'
  //   ];

  //   setResult(simulatedResult);
  //   setChainOfThought(simulatedChain);
  // };

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
          isDisabled={!problem}
        >
          Help Me
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