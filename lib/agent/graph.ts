import {
  ChatGoogleGenerativeAI,
} from "@langchain/google-genai";

import {
  SystemMessage,
  ToolMessage,
} from "@langchain/core/messages";

import {
  createCustomerTool,
} from "@/lib/tools/customer-tool";

import {
  createOrderTool,
} from "@/lib/tools/order-tool";

import {
  createPolicyTool,
} from "@/lib/tools/policy-tool";

import {
  createRefundTool,
} from "@/lib/tools/refund-tool";

import {
  saveAgentLog,
} from "@/lib/conversation";


// ======================================================
// CREATE MODEL
// ======================================================

function createModel() {
  return new ChatGoogleGenerativeAI({
    model:
      process.env.GEMINI_MODEL ||
      "gemini-2.5-flash",

    temperature: 0,
  });
}


// ======================================================
// CREATE CUSTOMER AGENT
// ======================================================

export function createRefundAgent(
  customerId: string,
  customerCode: string,
  customerName: string
) {
  const model =
    createModel();


  // ====================================================
  // CUSTOMER-SCOPED TOOLS
  // ====================================================

  const customerTool =
    createCustomerTool(
      customerId
    );

  const orderTool =
    createOrderTool(
      customerId
    );

  const policyTool =
    createPolicyTool();

  const refundTool =
    createRefundTool(
      customerId
    );


  // ====================================================
  // TOOL MAP
  // ====================================================

  const toolMap: Record<
    string,
    any
  > = {
    get_customer:
      customerTool,

    get_order:
      orderTool,

    validate_refund_policy:
      policyTool,

    process_refund:
      refundTool,
  };


  // ====================================================
  // MODEL WITH TOOLS
  // ====================================================

  const modelWithTools =
    model.bindTools([
      customerTool,
      orderTool,
      policyTool,
      refundTool,
    ]);


  // ====================================================
  // SYSTEM MESSAGE
  // ====================================================

  const systemMessage =
    new SystemMessage(`

You are an AI Customer Support Agent.

======================================================
AUTHENTICATED CUSTOMER
======================================================

Customer ID:
${customerId}

Customer Code:
${customerCode}

Customer Name:
${customerName}


======================================================
SECURITY RULES
======================================================

1. The authenticated customer is already known.

2. Never trust customer ID or customer code
   supplied by the user.

3. Never access another customer's data.

4. Orders must belong to the authenticated customer.

5. Refunds must only be processed for the
   authenticated customer's orders.

6. Never expose another customer's information.

7. Never ask the customer for their customer code.

8. Always use the authenticated customer ID
   supplied by the backend.


======================================================
REFUND WORKFLOW
======================================================

For a refund request:

1. Identify the order number.

2. Call get_order.

3. Verify the order belongs to the
   authenticated customer.

4. Check whether get_order reports:

   alreadyRefunded = true

5. If alreadyRefunded is true:

   - Do NOT call validate_refund_policy.
   - Do NOT call process_refund.
   - Tell the customer the refund has
     already been completed.
   - If available, provide refund ID,
     amount and status.

6. If alreadyRefunded is false:

   - Call validate_refund_policy.

7. If policy says eligible=false:

   - Do NOT call process_refund.
   - Explain why the refund is not eligible.

8. If policy says eligible=true:

   - Call process_refund.

9. After process_refund succeeds:

   - Tell the customer the refund was processed.
   - Provide refund ID, amount and status.


======================================================
IMPORTANT
======================================================

If a refund already exists in the refunds table
where:

customer_id = authenticated customer ID

AND

order_id = requested order ID

AND

status = "processed"

then the order has already been refunded.

NEVER create another refund.

`);


  // ======================================================
  // INVOKE AGENT
  // ======================================================

  return {

    async invoke({
      messages,
      conversationId,
    }: {
      messages: any[];
      conversationId: string;
    }) {


      // ==================================================
      // VALIDATE CONVERSATION
      // ==================================================

      if (!conversationId) {
        throw new Error(
          "conversationId is required"
        );
      }


      // ==================================================
      // WORKING MESSAGES
      // ==================================================

      const workingMessages: any[] = [
        systemMessage,
        ...messages,
      ];


      // ==================================================
      // LOG AGENT START
      // ==================================================

      try {
        await saveAgentLog({
          conversationId,

          step:
            "agent_start",

          toolName:
            null,

          input: {
            customerId,
            customerCode,
            customerName,
          },

          output:
            null,

          status:
            "started",
        });

      } catch (error) {

        console.error(
          "AGENT START LOG ERROR:",
          error
        );
      }


      // ==================================================
      // MAX ITERATIONS
      // ==================================================

      const MAX_ITERATIONS = 10;

      let finalResponse:
        any = null;


      // ==================================================
      // AGENT LOOP
      // ==================================================

      for (
        let iteration = 0;
        iteration < MAX_ITERATIONS;
        iteration++
      ) {

        console.log(
          `AGENT ITERATION ${
            iteration + 1
          }`
        );


        // ==================================================
        // LOG ITERATION START
        // ==================================================

        try {

          await saveAgentLog({
            conversationId,

            step:
              `agent_iteration_${
                iteration + 1
              }`,

            toolName:
              null,

            input: {
              iteration:
                iteration + 1,
            },

            output:
              null,

            status:
              "started",
          });

        } catch (error) {

          console.error(
            "ITERATION LOG ERROR:",
            error
          );
        }


        // ==================================================
        // CALL MODEL
        // ==================================================

        const response =
          await modelWithTools.invoke(
            workingMessages
          );


        // ==================================================
        // ADD RESPONSE
        // ==================================================

        workingMessages.push(
          response
        );


        // ==================================================
        // TOOL CALLS
        // ==================================================

        const toolCalls =
          response.tool_calls ?? [];


        console.log(
          "TOOL CALLS:",
          toolCalls
        );


        // ==================================================
        // NO TOOL CALL
        // ==================================================

        if (
          toolCalls.length === 0
        ) {

          finalResponse =
            response;

          // ----------------------------------------------
          // LOG FINAL MODEL RESPONSE
          // ----------------------------------------------

          try {

            await saveAgentLog({
              conversationId,

              step:
                "agent_response",

              toolName:
                null,

              input: {
                iteration:
                  iteration + 1,
              },

              output: {
                response:
                  response.content,
              },

              status:
                "success",
            });

          } catch (error) {

            console.error(
              "AGENT RESPONSE LOG ERROR:",
              error
            );
          }

          break;
        }


        // ==================================================
        // EXECUTE TOOLS
        // ==================================================

        for (
          const toolCall of toolCalls
        ) {

          const toolName =
            toolCall.name;

          const toolArgs =
            toolCall.args ?? {};


          console.log(
            "EXECUTING TOOL:",
            {
              toolName,
              toolArgs,
              customerId,
            }
          );


          // ==================================================
          // LOG TOOL START
          // ==================================================

          try {

            await saveAgentLog({
              conversationId,

              step:
                "tool_call",

              toolName,

              input: {
                customerId,
                ...toolArgs,
              },

              output:
                null,

              status:
                "started",
            });

          } catch (error) {

            console.error(
              "TOOL CALL LOG ERROR:",
              error
            );
          }


          // ==================================================
          // FIND TOOL
          // ==================================================

          const selectedTool =
            toolMap[toolName];


          // ==================================================
          // UNKNOWN TOOL
          // ==================================================

          if (!selectedTool) {

            const errorMessage =
              `Unknown tool: ${toolName}`;


            console.error(
              errorMessage
            );


            try {

              await saveAgentLog({
                conversationId,

                step:
                  "tool_error",

                toolName,

                input:
                  toolArgs,

                output:
                  null,

                status:
                  "error",

                errorMessage,
              });

            } catch (error) {

              console.error(
                "UNKNOWN TOOL LOG ERROR:",
                error
              );
            }


            workingMessages.push(
              new ToolMessage({
                tool_call_id:
                  toolCall.id ?? "",

                content:
                  JSON.stringify({
                    success: false,
                    error:
                      errorMessage,
                  }),
              })
            );

            continue;
          }


          // ==================================================
          // EXECUTE TOOL
          // ==================================================

          try {

            const toolResult =
              await selectedTool.invoke(
                toolArgs
              );


            console.log(
              "TOOL RESULT:",
              {
                toolName,
                toolResult,
              }
            );


            // ==================================================
            // NORMALIZE RESULT
            // ==================================================

            const normalizedResult =
              typeof toolResult ===
              "string"
                ? toolResult
                : JSON.stringify(
                    toolResult
                  );


            // ==================================================
            // LOG TOOL SUCCESS
            // ==================================================

            try {

              await saveAgentLog({
                conversationId,

                step:
                  "tool_result",

                toolName,

                input:
                  toolArgs,

                output:
                  thisSafeJsonParse(
                    normalizedResult
                  ),

                status:
                  "success",
              });

            } catch (error) {

              console.error(
                "TOOL RESULT LOG ERROR:",
                error
              );
            }


            // ==================================================
            // ADD TOOL MESSAGE
            // ==================================================

            workingMessages.push(
              new ToolMessage({
                tool_call_id:
                  toolCall.id ?? "",

                content:
                  normalizedResult,
              })
            );

          } catch (error) {

            console.error(
              `TOOL ERROR: ${toolName}`,
              error
            );


            const errorMessage =
              error instanceof Error
                ? error.message
                : "Tool execution failed";


            // ==================================================
            // LOG TOOL ERROR
            // ==================================================

            try {

              await saveAgentLog({
                conversationId,

                step:
                  "tool_error",

                toolName,

                input:
                  toolArgs,

                output:
                  null,

                status:
                  "error",

                errorMessage,
              });

            } catch (logError) {

              console.error(
                "TOOL ERROR LOG ERROR:",
                logError
              );
            }


            // ==================================================
            // ADD ERROR TOOL MESSAGE
            // ==================================================

            workingMessages.push(
              new ToolMessage({
                tool_call_id:
                  toolCall.id ?? "",

                content:
                  JSON.stringify({
                    success: false,
                    error:
                      errorMessage,
                  }),
              })
            );
          }
        }
      }


      // ======================================================
      // FALLBACK
      // ======================================================

      if (!finalResponse) {

        finalResponse =
          workingMessages[
            workingMessages.length - 1
          ];
      }


      // ======================================================
      // FINAL TEXT
      // ======================================================

      let finalText = "";


      if (
        typeof finalResponse?.content ===
        "string"
      ) {

        finalText =
          finalResponse.content;

      } else if (
        Array.isArray(
          finalResponse?.content
        )
      ) {

        finalText =
          finalResponse.content
            .map(
              (item: any) => {

                if (
                  typeof item ===
                  "string"
                ) {
                  return item;
                }

                return (
                  item?.text ?? ""
                );
              }
            )
            .join("");
      }


      // ======================================================
      // LOG AGENT COMPLETED
      // ======================================================

      try {

        await saveAgentLog({
          conversationId,

          step:
            "agent_completed",

          toolName:
            null,

          input: {
            customerId,
            customerCode,
          },

          output: {
            response:
              finalText,
          },

          status:
            "success",
        });

      } catch (error) {

        console.error(
          "FINAL AGENT LOG ERROR:",
          error
        );
      }


      // ======================================================
      // CONSOLE
      // ======================================================

      console.log(
        "AGENT COMPLETED:",
        {
          conversationId,
          customerCode,
        }
      );


      // ======================================================
      // RETURN
      // ======================================================

      return {

        messages: [
          ...messages,
          finalResponse,
        ],

        conversationId,
      };
    },
  };
}


// ======================================================
// SAFE JSON PARSER
// ======================================================

function thisSafeJsonParse(
  value: string
) {
  try {
    return JSON.parse(value);
  } catch {
    return {
      value,
    };
  }
}