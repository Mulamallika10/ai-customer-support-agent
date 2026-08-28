import {
  NextRequest,
  NextResponse,
} from "next/server";

import { createClient } from "@/lib/supabase/server";

import {
  createConversation,
  getConversationMessages,
} from "@/lib/conversation";

async function getConversation(
  conversationId: string
) {
  const supabase = await createClient();

  const {
    data,
    error,
  } = await supabase
    .from("conversations")
    .select("*")
    .eq("id", conversationId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }

    throw error;
  }

  return data;
}


// =====================================================
// GET LOGGED-IN CUSTOMER
// =====================================================

async function getLoggedInCustomer() {
  const supabase = await createClient();

  // -----------------------------------------------
  // Get authenticated Supabase user
  // -----------------------------------------------

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("You must be logged in");
  }

  // -----------------------------------------------
  // Find customer using auth.users.id
  // customers.user_id = auth.users.id
  // -----------------------------------------------

  const {
    data: customer,
    error: customerError,
  } = await supabase
    .from("customers")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (customerError || !customer) {
    console.error(
      "Customer lookup error:",
      customerError
    );

    throw new Error(
      "Customer account is not linked to your login"
    );
  }

  return {
    user,
    customer,
  };
}


// =====================================================
// POST
// CREATE NEW CONVERSATION
// =====================================================

export async function POST(
  request: NextRequest
) {
  try {

    // -----------------------------------------------
    // Get logged-in customer
    // -----------------------------------------------

    const {
      customer,
    } = await getLoggedInCustomer();

    // -----------------------------------------------
    // Read request body
    // -----------------------------------------------

    let body: any = {};

    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const title =
      typeof body.title === "string" &&
      body.title.trim()
        ? body.title.trim()
        : "Customer Support";

    // -----------------------------------------------
    // IMPORTANT
    //
    // DO NOT use:
    //
    // body.customerId
    //
    // Customer must come from authentication.
    // -----------------------------------------------

    console.log(
      "CREATING CONVERSATION:",
      {
        customerId: customer.id,
        customerCode:
          customer.customer_code,
        userId: customer.user_id,
        title,
      }
    );

    // -----------------------------------------------
    // Create conversation
    // -----------------------------------------------

    const conversation =
      await createConversation(
        customer.id,
        title
      );

    console.log(
      "CONVERSATION CREATED:",
      conversation
    );

    return NextResponse.json({
      success: true,

      conversation,

      customer: {
        id: customer.id,
        customerCode:
          customer.customer_code,
        name: customer.name,
        email: customer.email,
      },
    });

  } catch (error) {

    console.error(
      "Create conversation error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to create conversation";

    if (
      message ===
        "You must be logged in" ||
      message ===
        "Customer account is not linked to your login"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: message,
        },
        {
          status: 401,
        }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      {
        status: 500,
      }
    );
  }
}


// =====================================================
// GET
// GET ONE CONVERSATION + MESSAGES
// =====================================================

export async function GET(
  request: NextRequest
) {
  try {

    // -----------------------------------------------
    // Get logged-in customer
    // -----------------------------------------------

    const {
      customer,
    } = await getLoggedInCustomer();

    // -----------------------------------------------
    // Read conversation ID
    // -----------------------------------------------

    const conversationId =
      request.nextUrl.searchParams.get(
        "id"
      );

    if (!conversationId) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Conversation ID is required",
        },
        {
          status: 400,
        }
      );
    }

    // -----------------------------------------------
    // Get conversation
    // -----------------------------------------------

    const conversation =
      await getConversation(
        conversationId
      );

    if (!conversation) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Conversation not found",
        },
        {
          status: 404,
        }
      );
    }

    // -----------------------------------------------
    // SECURITY CHECK
    //
    // Customer can ONLY access their own
    // conversation.
    // -----------------------------------------------

    if (
      conversation.customer_id !==
      customer.id
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "You are not authorized to access this conversation",
        },
        {
          status: 403,
        }
      );
    }

    // -----------------------------------------------
    // Get messages
    // -----------------------------------------------

    const messages =
      await getConversationMessages(
        conversationId,
        customer.id
      );

    // -----------------------------------------------
    // Return conversation
    // -----------------------------------------------

    return NextResponse.json({
      success: true,

      conversation,

      messages,

      customer: {
        id: customer.id,
        customerCode:
          customer.customer_code,
        name: customer.name,
        email: customer.email,
      },
    });

  } catch (error) {

    console.error(
      "Get conversation error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to get conversation";

    if (
      message ===
        "You must be logged in" ||
      message ===
        "Customer account is not linked to your login"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: message,
        },
        {
          status: 401,
        }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      {
        status: 500,
      }
    );
  }
}