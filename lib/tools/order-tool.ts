import { tool } from "@langchain/core/tools";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

// ======================================================
// CREATE ORDER TOOL
// ======================================================

export function createOrderTool(
  customerId: string
) {
  return tool(
    async ({ orderNumber }) => {
      try {
        // ==================================================
        // VALIDATE CUSTOMER
        // ==================================================

        if (!customerId) {
          return JSON.stringify({
            found: false,
            order: null,
            alreadyRefunded: false,
            error:
              "Authenticated customer ID is required.",
          });
        }

        const supabase =
          await createClient();

        console.log(
          "GET ORDER:",
          {
            customerId,
            orderNumber,
          }
        );

        // ==================================================
        // GET CUSTOMER-SCOPED ORDER
        // ==================================================

        const {
          data: order,
          error: orderError,
        } = await supabase
          .from("orders")
          .select("*")
          .eq(
            "order_number",
            orderNumber
          )
          .eq(
            "customer_id",
            customerId
          )
          .maybeSingle();

        // ==================================================
        // ORDER DATABASE ERROR
        // ==================================================

        if (orderError) {
          console.error(
            "ORDER LOOKUP ERROR:",
            orderError
          );

          return JSON.stringify({
            found: false,
            order: null,
            alreadyRefunded: false,
            error:
              "Unable to retrieve the order.",
          });
        }

        // ==================================================
        // ORDER NOT FOUND
        // ==================================================

        if (!order) {
          console.log(
            "ORDER NOT FOUND:",
            {
              customerId,
              orderNumber,
            }
          );

          return JSON.stringify({
            found: false,
            order: null,
            alreadyRefunded: false,
            error:
              "Order not found for the authenticated customer.",
          });
        }

        console.log(
          "ORDER FOUND:",
          {
            orderId: order.id,
            orderNumber:
              order.order_number,
            customerId:
              order.customer_id,
          }
        );

        // ==================================================
        // CHECK REFUNDS TABLE
        // ==================================================

        const {
          data: refund,
          error: refundError,
        } = await supabase
          .from("refunds")
          .select(
            "id, order_id, customer_id, amount, reason, status, created_at"
          )
          .eq(
            "order_id",
            order.id
          )
          .eq(
            "customer_id",
            customerId
          )
          .eq(
            "status",
            "processed"
          )
          .order(
            "created_at",
            {
              ascending: false,
            }
          )
          .limit(1)
          .maybeSingle();

        // ==================================================
        // REFUND LOOKUP ERROR
        // ==================================================

        if (refundError) {
          console.error(
            "REFUND LOOKUP ERROR:",
            refundError
          );

          return JSON.stringify({
            found: true,
            order,
            alreadyRefunded: false,
            error:
              "Order found, but refund status could not be checked.",
          });
        }

        // ==================================================
        // ALREADY REFUNDED
        // ==================================================

        if (refund) {
          console.log(
            "ALREADY REFUNDED:",
            {
              orderId: order.id,
              orderNumber:
                order.order_number,
              refundId:
                refund.id,
              customerId,
              status:
                refund.status,
            }
          );

          return JSON.stringify({
            found: true,

            order,

            alreadyRefunded: true,

            refund: {
              id: refund.id,
              orderId:
                refund.order_id,
              customerId:
                refund.customer_id,
              amount:
                refund.amount,
              reason:
                refund.reason,
              status:
                refund.status,
              createdAt:
                refund.created_at,
            },
          });
        }

        // ==================================================
        // NOT REFUNDED
        // ==================================================

        console.log(
          "NO PROCESSED REFUND FOUND:",
          {
            orderId: order.id,
            orderNumber:
              order.order_number,
          }
        );

        return JSON.stringify({
          found: true,

          order,

          alreadyRefunded: false,

          refund: null,
        });

      } catch (error) {
        console.error(
          "ORDER TOOL ERROR:",
          error
        );

        return JSON.stringify({
          found: false,
          order: null,
          alreadyRefunded: false,
          error:
            error instanceof Error
              ? error.message
              : "Order lookup failed",
        });
      }
    },

    // ====================================================
    // TOOL CONFIGURATION
    // ====================================================

    {
      name: "get_order",

      description:
        "Get an order belonging ONLY to the authenticated customer. Also check the refunds table using the authenticated customer ID and order ID. If a refund with status 'processed' exists, return alreadyRefunded=true. Never access another customer's order or refund.",

      schema: z.object({
        orderNumber: z
          .string()
          .min(1)
          .describe(
            "Order number such as ORD1001"
          ),
      }),
    }
  );
}