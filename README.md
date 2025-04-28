## Agentic AI Automotive Support Assistant

An AI prototype that proactively identifies and resolves vehicle issues before a support case is created. This system uses a modular, MCP-compliant architecture, multi-agent coordination, and LLM-based reasoning to reduce customer friction and support load.

### ✨ Overview

When a customer taps "Help" in their mobile app or in-car head unit, this system launches a series of diagnostics and knowledge base lookups via multiple MCP servers. A reasoning agent then synthesizes these signals and either resolves the issue or escalates it with full context—without needing human intervention.

This prototype demonstrates:
- Agentic workflows with [crew.ai](https://github.com/joaomdmoura/crewAI)
- Prompt evaluation with [promptfoo](https://github.com/promptfoo/promptfoo)
- Reasoning pipelines with [LangChain](https://www.langchain.com/)
- Infrastructure-as-Code with [AWS CDK (TypeScript)](https://docs.aws.amazon.com/cdk/latest/guide/home.html)
- Orchestration using [Model Context Protocol (MCP)](https://modelcontextprotocol.io/docs/concepts/architecture)


---

### 💡 Use Case

> "Remote Start isn’t working" — before the user submits this as a support ticket, the assistant:

1. **Inspects recent user actions** ("user tapped Remote Start 2x")
2. **Checks car configuration** ("feature not yet enabled by user")
3. **Verifies subscription status** ("remote services expired last week")
4. **Looks for outages** ("known issue impacting 5G connectivity in US West region")
5. **Retrieves similar issues from knowledge base** (via [bedrock-kb-prototype](https://github.com/RoyCodes/bedrock-kb-prototype))
6. **Summarizes a response** to the user and recommends actions, or solves it.

---

### 🤖 Architecture

```text
[ Mobile App / Head Unit (MCP Host) ]
             |
        [ MCP Client ]
             |
   -----------------------------
   |     |        |           |
[Config][Subscription][Outage][KnowledgeBase] ⇨ (MCP Servers)
                         |
                 [ crew.ai Agent Team ]
                         |
                [ LangChain Planner Agent ]
                         |
                  [ LLM Summary to User ]
                         |
                [ promptfoo Prompt Evaluation ]
```

### 🚀 Stack

| Component  | Tool |
| ------------- | ------------- |
| Orchestration | Model Context Protocol (MCP)  |
| Reasoning Engine  | LangChain (local or Bedrock LLM)  |
| Agent Orchestration | crew.ai | 
| Prompt Engineering & Evaluation | promptfoo |
| RAG Knowledge Base | bedrock-kb-prototype |
| Infrastructure | AWS Lambda + API Gateway |
| Model Hosting | Ollama / Bedrock / OpenRouter (pluggable) |

### 🔧 Setup

Coming soon: Full CDK + deployment instructions.

You can run LangChain logic + crew.ai planner locally and mock API Gateway inputs to simulate the MCP payload.

### General Tutorial for Building Similar Projects:
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

### 🔹 Appendix: Ambient Computing Extension

Future evolution of this project will include passive telemetry + usage monitoring to detect and solve vehicle issues before the customer even opens the support app. This aligns with the concept of ambient computing and predictive support UX.
