import { tool } from "@langchain/core/tools";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";


// ======================================================
// CREATE CUSTOMER TOOL
// ======================================================

export function createCustomerTool(
  customerId: string
) {
  return tool(
    async () => {
      try {
        const supabase =
          await createClient();

        const {
          data: customer,
          error,
        } = await supabase
          .from("customers")
          .select(
            "id, customer_code, name, email, phone, status, created_at"
          )
          .eq("id", customerId)
          .single();

        if (error || !customer) {
          return JSON.stringify({
            found: false,
            error:
              "Authenticated customer not found",
          });
        }

        return JSON.stringify({
          found: true,
          customer,
        });
      } catch (error) {
        return JSON.stringify({
          found: false,
          error:
            error instanceof Error
              ? error.message
              : "Customer lookup failed",
        });
      }
    },
    {
      name: "get_customer",
      description:
        "Get the currently authenticated customer's profile. Never use this tool to access another customer.",
      schema: z.object({}),
    }
  );
}