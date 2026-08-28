import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  HumanMessage,
} from "@langchain/core/messages";

import {
  createRefundAgent,
} from "@/lib/agent/graph";

import {
  saveMessage,
} from "@/lib/conversation";

import {
  getAuthenticatedCustomer,
} from "@/lib/customer-auth";


// ======================================================
// POST /api/chat
// ======================================================

export async function POST(
  request: NextRequest
) {
  try {
    // ==========================================
    // READ REQUEST
    // ==========================================

    const body =
      await request.json();

    const message =
      body.message;

    const conversationId =
      body.conversationId;

    console.log(
      "CHAT REQUEST:",
      {
        message,
        conversationId,
      }
    );


    // ==========================================
    // VALIDATE MESSAGE
    // ==========================================

    if (
      !message ||
      typeof message !== "string"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Message is required",
        },
        {
          status: 400,
        }
      );
    }


    // ==========================================
    // VALIDATE CONVERSATION
    // ==========================================

    if (
      !conversationId ||
      typeof conversationId !== "string"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "conversationId is required",
        },
        {
          status: 400,
        }
      );
    }


    // ==========================================
    // AUTHENTICATED CUSTOMER
    // ==========================================

    const {
      user,
      customer,
    } =
      await getAuthenticatedCustomer();

    console.log(
      "AUTHENTICATED USER:",
      user.email
    );

    console.log(
      "AUTHENTICATED CUSTOMER:",
      {
        id: customer.id,
        customerCode:
          customer.customer_code,
        name: customer.name,
      }
    );


    // ==========================================
    // SAVE USER MESSAGE
    // ==========================================

    await saveMessage(
      conversationId,
      "user",
      message.trim()
    );


    // ==========================================
    // CREATE CUSTOMER-SCOPED AGENT
    // ==========================================

    const agent =
      createRefundAgent(
        customer.id,
        customer.customer_code,
        customer.name
      );


    // ==========================================
    // RUN AGENT
    // ==========================================

    console.log(
      "STARTING AGENT:",
      {
        conversationId,
        customerId:
          customer.id,
        customerCode:
          customer.customer_code,
      }
    );

    const result =
      await agent.invoke({

        conversationId,

        messages: [
          new HumanMessage(
            message.trim()
          ),
        ],
      });


    console.log(
      "AGENT COMPLETED:",
      {
        conversationId,
        customerCode:
          customer.customer_code,
      }
    );


    // ==========================================
    // GET FINAL RESPONSE
    // ==========================================

    const messages =
      result.messages ?? [];

    const lastMessage =
      messages[
        messages.length - 1
      ];

    let response = "";


    // ------------------------------------------
    // String
    // ------------------------------------------

    if (
      typeof lastMessage?.content ===
      "string"
    ) {
      response =
        lastMessage.content;
    }


    // ------------------------------------------
    // Array
    // ------------------------------------------

    else if (
      Array.isArray(
        lastMessage?.content
      )
    ) {
      response =
        lastMessage.content
          .map((item: any) => {

            if (
              typeof item ===
              "string"
            ) {
              return item;
            }

            return (
              item?.text ?? ""
            );
          })
          .join("");
    }


    // ==========================================
    // SAVE ASSISTANT MESSAGE
    // ==========================================

    await saveMessage(
      conversationId,
      "assistant",
      response
    );


    // ==========================================
    // RESPONSE
    // ==========================================

    return NextResponse.json({

      success: true,

      conversationId,

      customer: {
        id: customer.id,
        customerCode:
          customer.customer_code,
        name:
          customer.name,
      },

      response,
    });


  } catch (error) {

    console.error(
      "CHAT API ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        error:
          error instanceof Error
            ? error.message
            : "Failed to process chat",
      },
      {
        status: 500,
      }
    );
  }
}