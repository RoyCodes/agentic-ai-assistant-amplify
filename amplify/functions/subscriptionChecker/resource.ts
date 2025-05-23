import { defineFunction } from '@aws-amplify/backend';

export const subscriptionChecker = defineFunction({
  // optionally specify a name for the Function (defaults to directory name)
  name: 'subscription-checker',
  // optionally specify a path to your handler (defaults to "./handler.ts")
  entry: './handler.ts'
});