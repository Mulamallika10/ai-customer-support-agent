import { createClient } from "@/lib/supabase/server";

export async function getAuthenticatedCustomer() {
  const supabase = await createClient();

  // ---------------------------------------------
  // Get logged-in Supabase Auth user
  // ---------------------------------------------

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error(
      "You must be logged in to use the chatbot."
    );
  }

  if (!user.email) {
    throw new Error(
      "Authenticated user does not have an email."
    );
  }

  // ---------------------------------------------
  // Find customer using auth.users.id
  // ---------------------------------------------

  const {
    data: customer,
    error: customerError,
  } = await supabase
    .from("customers")
    .select(`
      id,
      user_id,
      customer_code,
      name,
      email,
      phone,
      status
    `)
    .eq("user_id", user.id)
    .maybeSingle();

  if (customerError) {
    console.error(
      "Customer lookup error:",
      customerError
    );

    throw new Error(
      "Failed to find customer profile."
    );
  }

  if (!customer) {
    throw new Error(
      "No customer profile is linked to this account."
    );
  }

  // ---------------------------------------------
  // Optional safety check
  // ---------------------------------------------

  if (customer.status !== "active") {
    throw new Error(
      "Customer account is not active."
    );
  }

  console.log("AUTH USER:", {
    id: user.id,
    email: user.email,
  });

  console.log("AUTHENTICATED CUSTOMER:", {
    id: customer.id,
    user_id: customer.user_id,
    customerCode: customer.customer_code,
    name: customer.name,
  });

  return {
    user,
    customer,
  };
}