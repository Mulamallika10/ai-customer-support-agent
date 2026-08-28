**# AI Customer Support Agent**

An AI-powered customer support application built with \*\*Next.js,

LangGraph, LangChain, Google Gemini, and Supabase\*\*.

The system is designed to handle customer-support conversations,

retrieve customer and order information, validate refund requests

against company policy, process eligible refunds, persist

conversations/messages, and expose agent activity through an admin

dashboard.

**------------------------------------------------------------------------**

**## 1. Project Overview**

The **\*\*AI Customer Support Agent\*\*** provides an automated support

experience for customers who need help with orders and refunds.

A typical request flows through the following stages:

1\.  Customer starts or continues a conversation.

2\.  The conversation is stored in Supabase.

3\.  The customer's message is stored in the \`messages\` table.

4\.  The message is sent to the LangGraph refund agent.

5\.  Google Gemini decides whether tools are required.

6\.  The agent calls the required tools.

7\.  Customer and order information is retrieved.

8\.  The refund policy is validated.

9\.  If eligible, the refund is processed.

10\. Agent execution details are stored in \`agent\_logs\`.

11\. The final AI response is stored as an assistant message.

12\. The admin dashboard can inspect the conversation and its agent

    activity using the same \`conversation\_id\`.

The \`conversation\_id\` is the main identifier connecting customer

messages, conversations, and agent logs.

**------------------------------------------------------------------------**

**## 2. Features**

**### Customer Support**

\-   AI-powered customer support chat

\-   Conversation persistence

\-   User and assistant message history

\-   Conversation loading after page refresh

\-   Customer/order lookup

\-   Refund request handling

\-   Refund policy validation

\-   Refund processing

\-   Success and failure responses

\-   Loading states

\-   Error handling

**### Agent**

\-   LangGraph-based workflow

\-   Google Gemini model

\-   Tool calling

\-   Customer lookup

\-   Order lookup

\-   Refund-policy validation

\-   Refund processing

\-   Agent execution logging

\-   Tool execution status tracking

\-   Error logging

**### Database**

\-   Supabase/PostgreSQL

\-   Conversations

\-   Messages

\-   Customers

\-   Orders

\-   Refunds

\-   Agent logs

\-   Foreign-key relationships through IDs

**### Admin Dashboard**

\-   Conversation list

\-   Conversation selection

\-   Customer/assistant message history

\-   Agent activity

\-   Tool execution details

\-   Agent status

\-   Error information

\-   Conversation-based log filtering

**------------------------------------------------------------------------**

**## 3. Architecture**

\`\`\` text

                    ┌──────────────────────┐

                    │      Customer UI     │

                    │   Next.js Frontend   │

                    └──────────┬───────────┘

                               │

                               │ POST /api/chat

                               ▼

                    ┌──────────────────────┐

                    │     Chat API Route   │

                    │      /api/chat       │

                    └──────────┬───────────┘

                               │

                               ▼

                    ┌──────────────────────┐

                    │      LangGraph       │

                    │    Refund Agent      │

                    └──────────┬───────────┘

                               │

                    ┌──────────┴───────────┐

                    │                      │

                    ▼                      ▼

             ┌─────────────┐       ┌─────────────┐

             │ Gemini LLM  │       │ Agent Tools │

             └─────────────┘       └──────┬──────┘

                                           │

                           ┌───────────────┼───────────────┐

                           ▼               ▼               ▼

                    Customer Tool    Order Tool     Refund Tools

                                           │

                                           ▼

                                    ┌─────────────┐

                                    │  Supabase   │

                                    │ PostgreSQL  │

                                    └─────────────┘

                     Admin Dashboard

                           │

                           ▼

                  conversations + messages

                           │

                           ▼

                    agent\_logs

                 filtered by conversation\_id

\`\`\`

**### Conversation Relationship**

\`\`\` text

conversations.id

       │

       ├──────────────► messages.conversation\_id

       │

       └──────────────► agent\_logs.conversation\_id

\`\`\`

This common \`conversation\_id\` allows the admin dashboard to identify

which agent logs belong to a particular customer conversation.

**------------------------------------------------------------------------**

**## 4. Technology Stack**

  Technology      Purpose

**  --------------- -----------------------------------------------------**

  Next.js         Full-stack web application

  React           Customer and admin UI

  TypeScript      Application development

  Tailwind CSS    UI styling

  LangGraph       Agent workflow orchestration

  LangChain       LLM and tool integration

  Google Gemini   LLM reasoning and tool selection

  Supabase        PostgreSQL database and persistence

  PostgreSQL      Relational data storage

  Lucide React    UI icons

  LocalStorage    Persisting the active conversation ID on the client

**### Main Backend Components**

\-   \`lib/conversation.ts\` --- conversation and message persistence

\-   \`lib/chat.ts\` --- chat-related persistence/helper logic

\-   \`lib/agent/state.ts\` --- LangGraph state

\-   \`lib/agent/graph.ts\` --- LangGraph workflow

\-   \`lib/agent/nodes.ts\` --- Gemini and tool execution nodes

\-   \`lib/agent/logger.ts\` --- agent log persistence

\-   \`lib/tools/customer-tool.ts\` --- customer lookup

\-   \`lib/tools/order-tool.ts\` --- order lookup

\-   \`lib/tools/policy-tool.ts\` --- refund policy validation

\-   \`lib/tools/refund-tool.ts\` --- refund processing

**------------------------------------------------------------------------**

**## 5. Agent Workflow**

The refund agent uses a simple iterative LangGraph workflow.

\`\`\` text

START

  │

  ▼

callGemini

  │

  ├── No tool call ───────────────► END

  │

  └── Tool call

          │

          ▼

    executeTools

          │

          ▼

      callGemini

          │

          ├── More tools ─────────► executeTools

          │

          └── Final answer ───────► END

\`\`\`

**### Step 1 --- Customer Message**

The customer sends a message such as:

\`\`\` text

I am CUST002. I want a refund for ORD1002 because I no longer want the product.

\`\`\`

The frontend sends:

\`\`\` json

{

  "message": "I am CUST002. I want a refund for ORD1002 because I no longer want the product.",

  "conversationId": "conversation-uuid"

}

\`\`\`

**### Step 2 --- Save User Message**

The API saves the message:

\`\`\` text

messages

\---------

conversation\_id

role = user

content

created\_at

\`\`\`

**### Step 3 --- Run LangGraph**

The message is passed to:

\`\`\` text

refundAgent.invoke(...)

\`\`\`

**### Step 4 --- Gemini Decision**

Gemini determines whether it needs one or more tools.

A decision is recorded in:

\`\`\` text

agent\_logs

step = LLM\_DECISION

status = success

\`\`\`

**### Step 5 --- Tool Execution**

The required tools are executed.

For example:

\`\`\` text

get\_customer

get\_order

validate\_refund\_policy

process\_refund

\`\`\`

Each tool execution can generate logs such as:

\`\`\` text

TOOL\_EXECUTION / started

TOOL\_EXECUTION / success

TOOL\_EXECUTION / error

\`\`\`

**### Step 6 --- Final Response**

After tool execution, Gemini receives the tool results and generates the

final customer response.

The final response is saved to \`messages\` with:

\`\`\` text

role = assistant

\`\`\`

**------------------------------------------------------------------------**

**## 6. Refund Policy**

Refund decisions are handled through the dedicated refund-policy tool

rather than directly by the UI.

The agent can:

1\.  Identify the customer.

2\.  Identify the order.

3\.  Validate the refund request.

4\.  Determine whether the request is approved or denied.

5\.  Process the refund when permitted.

6\.  Return an appropriate customer-facing response.

The exact business rules should be maintained in:

\`\`\` text

lib/tools/policy-tool.ts

\`\`\`

The UI should display the result returned by the agent rather than

independently deciding whether a refund is allowed.

**### Example --- Approved**

\`\`\` text

Refund Approved

Your refund has been successfully processed.

Order: ORD1002

Amount: ₹1,500

Refund ID: ...

Status: Processed

\`\`\`

**### Example --- Denied**

\`\`\` text

Refund Not Approved

This refund request does not meet the refund policy.

Order: ORD1002

\`\`\`

**------------------------------------------------------------------------**

**## 7. Available Tools**

**### Customer Tool**

\`\`\` text

get\_customer

\`\`\`

Used to retrieve customer information based on the customer identifier.

**### Order Tool**

\`\`\` text

get\_order

\`\`\`

Used to retrieve order information.

**### Refund Policy Tool**

\`\`\` text

validate\_refund\_policy

\`\`\`

Used to determine whether the requested refund satisfies the configured

policy.

**### Refund Tool**

\`\`\` text

process\_refund

\`\`\`

Used to process an eligible refund.

**### Tool Flow**

\`\`\` text

Customer Request

       │

       ▼

get\_customer

       │

       ▼

get\_order

       │

       ▼

validate\_refund\_policy

       │

       ├── denied ─────► Final Response

       │

       └── approved

              │

              ▼

        process\_refund

              │

              ▼

        Final Response

\`\`\`

**------------------------------------------------------------------------**

**## 8. Database Schema**

The application uses Supabase PostgreSQL.

**### \`customers\`**

Stores customer information.

Typical relationship:

\`\`\` text

customers.id

     │

     ▼

conversations.customer\_id

\`\`\`

**### \`conversations\`**

Stores one row for each support conversation.

  Column          Type          Description

**  --------------- ------------- -------------------------**

  \`id\`            uuid          Conversation identifier

  \`customer\_id\`   uuid          Customer identifier

  \`title\`         text          Conversation title

  \`status\`        text          Conversation status

  \`created\_at\`    timestamptz   Creation time

**### \`messages\`**

Stores customer and assistant messages.

  Column              Type          Description

**  ------------------- ------------- -----------------------**

  \`id\`                uuid          Message identifier

  \`conversation\_id\`   uuid          Parent conversation

  \`role\`              text          \`user\` or \`assistant\`

  \`content\`           text          Message content

  \`created\_at\`        timestamptz   Creation time

**### \`agent\_logs\`**

Stores internal agent activity.

  Column              Type          Description

**  ------------------- ------------- ---------------------**

  \`id\`                uuid          Log identifier

  \`conversation\_id\`   uuid          Parent conversation

  \`step\`              text          Agent workflow step

  \`tool\_name\`         text          Tool name

  \`input\`             json/jsonb    Tool/agent input

  \`output\`            json/jsonb    Tool/agent output

  \`status\`            text          Execution status

  \`error\_message\`     text          Error details

  \`created\_at\`        timestamptz   Log creation time

**### \`orders\`**

Stores customer order information.

**### \`refunds\`**

Stores refund processing information.

**### Important Relationship**

The most important relationship for the admin dashboard is:

\`\`\` text

conversations.id

        │

        ├── messages.conversation\_id

        │

        └── agent\_logs.conversation\_id

\`\`\`

Therefore, selecting a conversation allows the dashboard to retrieve:

\`\`\` text

Conversation

    ↓

Messages

    ↓

Agent Logs

\`\`\`

using the same ID.

**------------------------------------------------------------------------**

**## 9. Project Structure**

A representative project structure is:

\`\`\` text

project/

│

├── app/

│   ├── api/

│   │   ├── chat/

│   │   │   └── route.ts

│   │   │

│   │   ├── conversations/

│   │   │   └── route.ts

│   │   │

│   │   ├── logs/

│   │   │   └── route.ts

│   │   │

│   │   └── admin/

│   │       └── conversations/

│   │           └── route.ts

│   │

│   └── ...

│

├── components/

│   ├── ChatInput.tsx

│   ├── ChatWindow\.tsx

│   ├── ConversationDetails.tsx

│   ├── ConversationMessages.tsx

│   ├── AgentLogs.tsx

│   ├── AdminConversations.tsx

│   └── RefundStatus.tsx

│

├── lib/

│   ├── supabase.ts

│   ├── conversation.ts

│   ├── chat.ts

│   │

│   ├── agent/

│   │   ├── graph.ts

│   │   ├── nodes.ts

│   │   ├── state.ts

│   │   ├── logger.ts

│   │   └── prompts.ts

│   │

│   └── tools/

│       ├── customer-tool.ts

│       ├── order-tool.ts

│       ├── policy-tool.ts

│       └── refund-tool.ts

│

├── public/

│

├── .env

├── package.json

├── tsconfig.json

└── README.md

\`\`\`

**------------------------------------------------------------------------**

**## 10. Installation**

**### Prerequisites**

Install:

\-   Node.js

\-   npm

\-   Supabase project

\-   Google Gemini API access

**### Clone the Project**

\`\`\` bash

git clone \<repository-url>

cd \<project-directory>

\`\`\`

**### Install Dependencies**

\`\`\` bash

npm install

\`\`\`

**### Configure Supabase**

Create the required tables in your Supabase PostgreSQL database.

The application expects the Supabase client to be configured in:

\`\`\` text

lib/supabase.ts

\`\`\`

**------------------------------------------------------------------------**

**## 11. Environment Variables**

Create a \`.env.local\` file.

Example:

\`\`\` env

NEXT\_PUBLIC\_SUPABASE\_URL=your\_supabase\_url

NEXT\_PUBLIC\_SUPABASE\_ANON\_KEY=your\_supabase\_anon\_key

GOOGLE\_API\_KEY=your\_google\_gemini\_api\_key

\`\`\`

Use the exact environment-variable names expected by your

implementation.

**### Important**

Do not commit \`.env.local\` or API keys to Git.

Add the environment file to \`.gitignore\`:

\`\`\` gitignore

.env

.env.local

\`\`\`

**------------------------------------------------------------------------**

**## 12. Running the Application**

Start the development server:

\`\`\` bash

npm run dev

\`\`\`

The application will normally be available at:

\`\`\` text

http\://localhost:3000

\`\`\`

**### Production Build**

\`\`\` bash

npm run build

\`\`\`

Then:

\`\`\` bash

npm start

\`\`\`

**------------------------------------------------------------------------**

**## 13. Testing**

The customer support chat is available to **logged-in customers only**.

Before testing, sign in as a customer who has valid customer and order records in
the database. The authenticated customer is used to identify the customer when
processing the request.

### Scenario 1 — Successful Refund

**Customer**

``` text
My headphones arrived damaged yesterday.
I want a refund for order ORD1002.
```

**Agent workflow**

``` text
Logged-in Customer
→ Customer found from authenticated session
→ Order ORD1002 found
→ Order delivered 1 day ago
→ Product is defective/damaged
→ Refund policy checked
→ Policy eligible
→ Refund processed
```

**Result**

``` text
APPROVED
```

The agent should process the refund and return the refund details to the
customer.

### Scenario 2 — Policy Violation

**Customer**

``` text
I bought order ORD1005 45 days ago.
I don't need it anymore.
Can I get a refund?
```

**Agent workflow**

``` text
Logged-in Customer
→ Order ORD1005 found
→ Order delivered 45 days ago
→ Refund policy limit = 30 days
→ Request is outside the allowed refund period
→ Refund not processed
```

**Result**

``` text
DENIED
```

The agent should explain that the order is outside the 30-day refund window.

### Scenario 3 — Previously Refunded Order

**Customer**

``` text
My order ORD1009 arrived damaged.
I would like a refund.
```

**Agent workflow**

``` text
Logged-in Customer
→ Order ORD1009 found
→ Order already refunded
→ Duplicate refund not allowed
→ Refund not processed
```

**Result**

``` text
DENIED
```

The agent should explain that the order has already been refunded.

### Testing Checklist

Verify that:

1. The customer must be logged in before accessing customer support.
2. The authenticated customer is correctly identified.
3. The requested order belongs to the logged-in customer.
4. The order information is retrieved correctly.
5. The refund policy is validated by the agent.
6. Eligible refunds are processed.
7. Ineligible refunds are not processed.
8. The correct order number is included in the response.
9. A conversation is created.
10. A `conversation_id` is generated.
11. The user message is inserted into `messages`.
12. Agent activity is inserted into `agent_logs`.
13. Every relevant agent log contains the same `conversation_id`.
14. The assistant response is inserted into `messages`.
15. The response appears in the customer UI.

### Database Verification

For a selected conversation:

``` text
conversations.id
       =
messages.conversation_id
       =
agent_logs.conversation_id
```

This allows the complete execution trail to be traced.

### Admin Test

1. Open the admin dashboard.
2. Select a conversation.
3. Verify its messages.
4. Verify agent activity.
5. Verify tool names and statuses.
6. Verify that logs belong to the selected conversation.
7. Verify the customer and order information associated with the request.

**------------------------------------------------------------------------**

**## 14. Example Conversations**

The following examples represent the main refund scenarios for **logged-in
customers**.

### Scenario 1 — Successful Refund

**Customer**

``` text
My headphones arrived damaged yesterday.
I want a refund for order ORD1002.
```

**Agent**

``` text
Customer found
→ Order ORD1002 found
→ Delivered 1 day ago
→ Defective product
→ Policy eligible
→ Refund processed
```

**Result**

``` text
APPROVED
```

**Example response**

``` text
Refund Approved

Your refund for order ORD1002 has been successfully processed.

Order: ORD1002
Status: Processed
Refund ID: ...
```

### Scenario 2 — Policy Violation

**Customer**

``` text
I bought order ORD1005 45 days ago.
I don't need it anymore.
Can I get a refund?
```

**Agent**

``` text
Order ORD1005 found
→ Delivered 45 days ago
→ Policy limit = 30 days
→ Not eligible
→ Refund not processed
```

**Result**

``` text
DENIED
```

**Example response**

``` text
Refund Not Approved

Order ORD1005 is outside the 30-day refund policy.
The refund cannot be processed.
```

### Scenario 3 — Previously Refunded Order

**Customer**

``` text
My order ORD1009 arrived damaged.
I would like a refund.
```

**Agent**

``` text
Order ORD1009 found
→ Order already refunded
→ Duplicate refund not allowed
→ Refund not processed
```

**Result**

``` text
DENIED
```

**Example response**

``` text
Refund Not Approved

Order ORD1009 has already been refunded.
A second refund cannot be processed.
```

### Authentication Requirement

All customer refund scenarios are intended to be performed by a **logged-in
customer**. The customer's identity comes from the authenticated session rather
than requiring the customer to manually provide a customer ID in the chat.

The agent should also verify that the requested order belongs to the logged-in
customer before performing any refund operation.

**------------------------------------------------------------------------**

**### Example 2 --- Previously Refunded Order**

**\*\*Customer\*\***

\`\`\` text

I am CUST009. My order ORD1009 arrived damaged. I would like a refund.

\`\`\`

If the order has already been refunded, the agent should not create

another refund.

The assistant can explain that the order has already been refunded and

provide the appropriate information.

**------------------------------------------------------------------------**

**## 15. Admin Dashboard**

The admin dashboard provides visibility into customer conversations and

agent execution.

**### Conversation List**

The administrator can select a conversation using its:

\`\`\` text

conversation\_id

\`\`\`

**### Conversation Messages**

The selected conversation displays:

\`\`\` text

Customer

   ↓

AI Agent

   ↓

Customer

   ↓

AI Agent

\`\`\`

**### Agent Activity**

The dashboard can display:

\`\`\` text

Agent Decision

Tool Execution

Tool Execution

Policy Validation

Refund Processing

Agent Decision

\`\`\`

Each log can show:

\-   Step

\-   Tool name

\-   Status

\-   Timestamp

\-   Input

\-   Output

\-   Error message

\-   Conversation ID

**### Filtering by Conversation**

The logs endpoint can receive:

\`\`\` text

/api/logs?conversationId=\<conversation-id>

\`\`\`

The server then filters:

\`\`\` ts

.from("agent\_logs")

.select("\*")

.eq("conversation\_id", conversationId)

.order("created\_at", {

  ascending: true,

});

\`\`\`

This is the key mechanism for displaying only the logs belonging to the

selected conversation.

**### Recommended Admin Layout**

\`\`\` text

┌────────────────────┬─────────────────────────────────────┐

│ Conversations      │ Conversation                        │

│                    │                                     │

│ Customer Support   │ Customer message                   │

│ Customer Support   │                                     │

│ Customer Support   │ AI Agent response                   │

│                    │                                     │

│                    ├─────────────────────────────────────┤

│                    │ Agent Activity                      │

│                    │                                     │

│                    │ ✓ Agent Decision                    │

│                    │ ✓ Get Customer                      │

│                    │ ✓ Get Order                         │

│                    │ ✓ Validate Refund Policy            │

│                    │ ✓ Process Refund                    │

└────────────────────┴─────────────────────────────────────┘

\`\`\`

**------------------------------------------------------------------------**



**## 19. Demo Video**

Add the project demonstration video here.

Example:

\`\`\` markdown

**## Demo Video**

[Watch the AI Customer Support Agent Demo]\(\<video-url>)

\`\`\`

The demonstration should ideally show:

1\.  Customer starts a conversation.

2\.  Customer submits a refund request.

3\.  Agent identifies the customer.

4\.  Agent retrieves the order.

5\.  Agent validates the refund policy.

6\.  Agent processes or denies the refund.

7\.  Final response appears in the customer UI.

8\.  Admin opens the conversation.

9\.  Admin views messages.

10\. Admin views the corresponding agent logs.

**------------------------------------------------------------------------**

**## 20. Future Improvements**

Potential future improvements include:

**### Authentication**

Customer authentication is implemented and customer support is restricted to
**logged-in customers**.

The authenticated customer is associated with the support conversation:

``` text
Logged-in Customer
       ↓
authenticated customer
       ↓
customer_id
       ↓
conversations
       ↓
messages
       ↓
agent_logs
```

This ensures that customer conversations are associated with the correct
authenticated customer.

The customer should not need to provide their customer ID manually when
starting a support conversation.

**### Customer-Specific Chat History**

Display previous conversations for the authenticated customer.

**### Advanced Admin Filtering**

Add filters for:

\-   Customer

\-   Conversation

\-   Tool

\-   Status

\-   Date

\-   Error

\-   Refund status

**### Agent Observability**

Add:

\-   Execution duration

\-   Token usage

\-   Model information

\-   Tool latency

\-   Failure rate

\-   Agent traces

**### Streaming Responses**

Stream Gemini responses to the customer instead of waiting for the

complete response.

**### Voice Support**

Integrate production speech-to-text and text-to-speech services.

**### Multi-Channel Support**

Extend the agent to:

\-   WhatsApp

\-   Telegram

\-   Email

\-   Voice

\-   Web chat

**### Human Handoff**

Allow the AI agent to transfer complex cases to a human support

representative.

**### Security**

Implement:

\-   Authentication

\-   Authorization

\-   Row Level Security

\-   Input validation

\-   Rate limiting

\-   Secure API-key handling

\-   Audit logging

**------------------------------------------------------------------------**

**## End-to-End Summary**

The complete application flow is:

\`\`\` text

                    CUSTOMER

                       │

                       ▼

                Customer Chat UI

                       │

                       ▼

              Create Conversation

                       │

                       ▼

                conversation\_id

                       │

                       ▼

                 Save Message

                       │

                       ▼

                  LangGraph

                       │

                       ▼

                 Gemini LLM

                       │

              ┌────────┴────────┐

              │                 │

          No tools          Tool calls

              │                 │

              │                 ▼

              │            Execute Tools

              │                 │

              │       ┌─────────┼─────────┐

              │       ▼         ▼         ▼

              │   Customer    Order     Policy

              │     Tool       Tool      Tool

              │                           │

              │                           ▼

              │                     Refund Tool

              │                           │

              └─────────────┬─────────────┘

                            ▼

                       Final Response

                            │

                            ▼

                    Save Assistant Message

                            │

                            ▼

                       Customer UI



              ┌───────────────────────────┐

              │       Supabase            │

              │                           │

              │ conversations             │

              │ messages                  │

              │ customers                 │

              │ orders                    │

              │ refunds                   │

              │ agent\_logs                │

              └───────────────────────────┘

                            ▲

                            │

                    same conversation\_id

                            │

                            ▼

                    Admin Dashboard

                            │

                 ┌──────────┴──────────┐

                 ▼                     ▼

            Messages              Agent Logs

\`\`\`

**## Key Design Principle**

The \`conversation\_id\` is the central link for tracing a support request.

\`\`\` text

conversations.id

        │

        ├── messages.conversation\_id

        │

        └── agent\_logs.conversation\_id

\`\`\`

This makes it possible to move from:

\*\*Customer → Conversation → Message → Agent Decision → Tool Execution →

Refund Result\*\*

without creating a separate mapping system.

**------------------------------------------------------------------------**

**## License**

Add the project's applicable license here.