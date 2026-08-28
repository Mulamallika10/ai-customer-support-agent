import {
  ChatGoogleGenerativeAI,
} from "@langchain/google-genai";

import {
  createAgentLog,
} from "./logger";

import {
  SystemMessage,
  AIMessage,
  ToolMessage,
} from "@langchain/core/messages";

import {
  AgentStateType,
} from "./state";

import {
  SYSTEM_PROMPT,
} from "./prompts";

import {
  getCustomer,
} from "@/lib/tools/customer-tool";

import {
  getOrder,
} from "@/lib/tools/order-tool";

import {
  validateRefundPolicy,
} from "@/lib/tools/policy-tool";

import {
  processRefund,
} from "@/lib/tools/refund-tool";


// =====================================================
// AVAILABLE TOOLS
// =====================================================

export const tools = [
  getCustomer,
  getOrder,
  validateRefundPolicy,
  processRefund,
];


// =====================================================
// GEMINI MODEL
// =====================================================

const model =
  new ChatGoogleGenerativeAI({
    model: "gemini-3.6-flash",
    temperature: 0,
    maxRetries: 2,
  });


// =====================================================
// MODEL WITH TOOLS
// =====================================================

export const modelWithTools =
  model.bindTools(tools);


// =====================================================
// GEMINI NODE
// =====================================================

export async function callGemini(
  state: AgentStateType
) {
   
  const messages = [
    new SystemMessage(
      SYSTEM_PROMPT
    ),
    ...state.messages,
  ];

  try {

    // ---------------------------------------------
    // Call Gemini
    // ---------------------------------------------

    const response =
      await modelWithTools.invoke(
        messages
      );

    const toolCalls =
      response.tool_calls ?? [];


    // ---------------------------------------------
    // Save LLM log
    // ---------------------------------------------

    await createAgentLog({

      conversationId:
        state.conversationId,

      step:
        "LLM_DECISION",

      toolName:
        null,

      input:
        state.messages[
          state.messages.length - 1
        ]?.content,

      output: {
        toolCalls:
          toolCalls.map(
            (call) => ({
              name: call.name,
              args: call.args,
            })
          ),

        hasToolCalls:
          toolCalls.length > 0,
      },

      status:
        "success",
    });


    return {
      messages: [response],
    };

  } catch (error) {

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Gemini invocation failed";


    // ---------------------------------------------
    // Save LLM error
    // ---------------------------------------------

    await createAgentLog({

      conversationId:
        state.conversationId,

      step:
        "LLM_DECISION",

      toolName:
        null,

      status:
        "error",

      errorMessage,
    });

    throw error;
  }
}


// =====================================================
// TOOL MAP
// =====================================================

const toolMap = {

  get_customer:
    getCustomer,

  get_order:
    getOrder,

  validate_refund_policy:
    validateRefundPolicy,

  process_refund:
    processRefund,
};


// =====================================================
// TOOL NODE
// =====================================================

export async function executeTools(
  state: AgentStateType
) {

  const lastMessage =
    state.messages[
      state.messages.length - 1
    ];


  // ---------------------------------------------
  // Validate AI message
  // ---------------------------------------------

  if (
    !(lastMessage instanceof AIMessage)
  ) {
    return {
      messages: [],
    };
  }


  const toolCalls =
    lastMessage.tool_calls ?? [];

  const toolMessages:
    ToolMessage[] = [];


  // =================================================
  // EXECUTE TOOLS
  // =================================================

  for (const toolCall of toolCalls) {

    const toolName =
      toolCall.name as keyof typeof toolMap;

    const tool =
      toolMap[toolName];


    // =================================================
    // UNKNOWN TOOL
    // =================================================

    if (!tool) {

      await createAgentLog({

        conversationId:
          state.conversationId,

        step:
          "TOOL_EXECUTION",

        toolName,

        input:
          toolCall.args,

        status:
          "error",

        errorMessage:
          `Unknown tool: ${toolName}`,
      });


      toolMessages.push(
        new ToolMessage({
          content:
            JSON.stringify({
              error:
                `Unknown tool: ${toolName}`,
            }),

          tool_call_id:
            toolCall.id ?? "",
        })
      );

      continue;
    }


    // =================================================
    // TOOL STARTED
    // =================================================

    await createAgentLog({

      conversationId:
        state.conversationId,

      step:
        "TOOL_EXECUTION",

      toolName,

      input:
        toolCall.args,

      status:
        "started",
    });


    try {

      // ---------------------------------------------
      // Execute tool
      // ---------------------------------------------

      const result =
        await (
          tool.invoke as (
            input:
              typeof toolCall.args
          ) => Promise<unknown>
        )(
          toolCall.args
        );


      // =================================================
      // TOOL SUCCESS
      // =================================================

      await createAgentLog({

        conversationId:
          state.conversationId,

        step:
          "TOOL_EXECUTION",

        toolName,

        input:
          toolCall.args,

        output:
          result,

        status:
          "success",
      });


      // ---------------------------------------------
      // Tool message
      // ---------------------------------------------

      toolMessages.push(
        new ToolMessage({

          content:
            typeof result === "string"
              ? result
              : JSON.stringify(
                  result
                ),

          tool_call_id:
            toolCall.id ?? "",
        })
      );

    } catch (error) {

      // =================================================
      // TOOL ERROR
      // =================================================

      const errorMessage =
        error instanceof Error
          ? error.message
          : "Tool execution failed";


      await createAgentLog({

        conversationId:
          state.conversationId,

        step:
          "TOOL_EXECUTION",

        toolName,

        input:
          toolCall.args,

        status:
          "error",

        errorMessage,
      });


      toolMessages.push(
        new ToolMessage({

          content:
            JSON.stringify({
              error:
                errorMessage,
            }),

          tool_call_id:
            toolCall.id ?? "",
        })
      );
    }
  }


  return {
    messages:
      toolMessages,
  };
}