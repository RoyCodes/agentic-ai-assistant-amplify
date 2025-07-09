## Agentic AI Assistant in Amplify

An AI prototype that where users can simulate an issue and receive a response from the correct backend. 

### ✨ Overview

The goal of this project is to create a front-end where users can pick various customer issues to simulate.
Once chosen, the front-end will send an event to an API Gateway with the chosen issue, 
where it will be analyzed by multiple components in order to determine the root cause and return it to the user. 

This prototype demonstrates:
- Infrastructure-as-Code with [AWS CDK (TypeScript)](https://docs.aws.amazon.com/cdk/latest/guide/home.html)
- Orchestration using [Model Context Protocol (MCP)](https://modelcontextprotocol.io/docs/concepts/architecture)

---

### 🤖 Architecture

```text
[ React Web App | Amplify | Cognito ]
             |
        [ MCP Client ]
             |
-----------------------------
   |     |        |           |
[Config][Subscription][Outage][KnowledgeBase] ⇨ (MCP Servers)
                         |
                         |
                [ LangChain Planner Agent ]
                         |
                  [ LLM Summary to User ]
                         |
```

### 🚀 Stack

| Component  | Tool |
| ------------- | ------------- |
| Orchestration | Model Context Protocol (MCP)  |
| Reasoning Engine  | LangChain (local or Bedrock LLM)  |
| RAG Knowledge Base | see bedrock-kb-prototype |
| Infrastructure | AWS Lambda + API Gateway |

### Steps for Bootstrapping Similar Projects with Amplify Gen 2:
1. create a fresh GitHub repo 
2. create Amplify Gen 2 project from within the AWS Console and point it to fresh repo
3. from CLI, run `npm create amplify@latest` in repo's root folder.
4. `git push` and check Amplify console to ensure that deployment worked.
5. Add Vite frontend in `/frontend` via `npm create vite@latest frontend -- --template react-ts`
6. Back in the Amplify console, update the `amplify.yml` to the following so that deployments will build the frontend and the domain will point to the new index:

```
frontend:
  phases:
    preBuild:
      commands:
        - cd frontend
        - npm install
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: frontend/dist
    files:
      - '**/*'
  cache:
    paths:
      - frontend/node_modules/**/*
```
7. Now commit, check the domain link after the deployment and you should see the react + vite + typescript template hosted from your app now. 
8. From within the frontend folder, grab the amplify ui react package so we can use it's components:
`npm install @aws-amplify/ui-react`
