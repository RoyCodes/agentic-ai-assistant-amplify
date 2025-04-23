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
2. **Checks car configuration** ("feature not supported on current model")
3. **Verifies subscription status** ("remote services expired last week")
4. **Looks for outages** ("known issue impacting 2023 CLA over 5G in West region")
5. **Retrieves similar known resolutions** (via [bedrock-kb-prototype](https://github.com/RoyCodes/bedrock-kb-prototype))
6. **Summarizes a response** to the user and recommends action—or solves it.

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

Component

Tool

Orchestration

Model Context Protocol (MCP)

Reasoning Engine

LangChain (local or Bedrock LLM)

Agent Orchestration

crew.ai

Prompt Evaluation

promptfoo

RAG Knowledge Base

bedrock-kb-prototype

Infrastructure

AWS Lambda + API Gateway via CDK (TypeScript)

Model Hosting

Ollama / Bedrock / OpenRouter (pluggable)

### 🔧 Setup

Coming soon: Full CDK + deployment instructions.

You can run LangChain logic + crew.ai planner locally and mock API Gateway inputs to simulate the MCP payload.

### Attempting to start with fresh repo instead of cloning from AWS template
1. create repo 
2. create Amplify Gen 2 project in AWS Console and point to repo
3. run `npm create amplify@latest` in app's root folder.
4. 

### 🎓 Skills Demonstrated

Capability

Demonstrated In

Agentic Workflow Design

Multi-agent crew.ai + MCP server structure

Prompt Engineering & Evaluation

promptfoo output comparison

Retrieval-Augmented Generation

Linked knowledge base (Bedrock KB prototype)

LLM Integration

LangChain with local or cloud-hosted models

Cloud-Native AI Stack

CDK + Lambda + API Gateway deployment

Modular System Design

Each diagnostic is an independent MCP server

### 🔹 Appendix: Ambient Computing Extension

Future evolution of this project will include passive telemetry + usage monitoring to detect and solve vehicle issues before the customer even opens the support app. This aligns with the concept of ambient computing and predictive support UX.
