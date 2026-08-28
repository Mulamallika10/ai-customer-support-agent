import { tool } from "@langchain/core/tools";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

// ======================================================
// CREATE REFUND TOOL
// ======================================================

export function createRefundTool(
  customerId: string
) {
  return tool(
    async ({
      orderNumber,
      refundReason,
      refundAmount,
    }) => {
      try {
        // ==================================================
        // VALIDATE CUSTOMER
        // ==================================================

        if (!customerId) {
          return JSON.stringify({
            success: false,
            error:
              "Authenticated customer ID is required.",
          });
        }

        const supabase =
          await createClient();

        console.log(
          "PROCESS REFUND:",
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
        // ORDER NOT FOUND
        // ==================================================

        if (orderError || !order) {
          console.error(
            "ORDER NOT FOUND:",
            orderError
          );

          return JSON.stringify({
            success: false,
            error:
              "Order not found for the authenticated customer.",
          });
        }

        // ==================================================
        // CHECK REFUNDS TABLE
        // ==================================================

        const {
          data: existingRefund,
          error: refundCheckError,
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
        // REFUND CHECK ERROR
        // ==================================================

        if (refundCheckError) {
          console.error(
            "REFUND CHECK ERROR:",
            refundCheckError
          );

          return JSON.stringify({
            success: false,
            error:
              "Unable to verify existing refund status.",
          });
        }

        // ==================================================
        // ALREADY REFUNDED
        // ==================================================

        if (existingRefund) {
          console.log(
            "DUPLICATE REFUND BLOCKED:",
            {
              customerId,
              orderId: order.id,
              orderNumber:
                order.order_number,
              refundId:
                existingRefund.id,
            }
          );

          return JSON.stringify({
            success: false,

            alreadyRefunded: true,

            refund: {
              id:
                existingRefund.id,

              orderId:
                existingRefund.order_id,

              orderNumber:
                order.order_number,

              amount:
                existingRefund.amount,

              reason:
                existingRefund.reason,

              status:
                existingRefund.status,

              createdAt:
                existingRefund.created_at,
            },

            message:
              "This order has already been refunded.",
          });
        }

        // ==================================================
        // INSERT REFUND
        // ==================================================

        const {
          data: refund,
          error: refundError,
        } = await supabase
          .from("refunds")
          .insert({
            order_id:
              order.id,

            customer_id:
              customerId,

            reason:
              refundReason,

            amount:
              refundAmount ??
              order.amount,

            status:
              "processed",
          })
          .select()
          .single();

        // ==================================================
        // REFUND INSERT ERROR
        // ==================================================

        if (
          refundError ||
          !refund
        ) {
          console.error(
            "REFUND INSERT ERROR:",
            refundError
          );

          return JSON.stringify({
            success: false,
            error:
              "Failed to process refund.",
          });
        }

        // ==================================================
        // UPDATE ORDER
        // ==================================================

        const {
          error: updateError,
        } = await supabase
          .from("orders")
          .update({
            status:
              "refunded",
          })
          .eq(
            "id",
            order.id
          )
          .eq(
            "customer_id",
            customerId
          );

        if (updateError) {
          console.error(
            "ORDER UPDATE ERROR:",
            updateError
          );
        }

        // ==================================================
        // SUCCESS
        // ==================================================

        console.log(
          "REFUND PROCESSED:",
          {
            refundId:
              refund.id,

            orderId:
              order.id,

            orderNumber:
              order.order_number,

            customerId,

            status:
              refund.status,
          }
        );

        return JSON.stringify({
          success: true,

          alreadyRefunded: false,

          refund: {
            id:
              refund.id,

            orderId:
              refund.order_id,

            orderNumber:
              order.order_number,

            amount:
              refund.amount,

            reason:
              refund.reason,

            status:
              refund.status,
          },

          message:
            "Refund processed successfully.",
        });

      } catch (error) {
        console.error(
          "REFUND TOOL ERROR:",
          error
        );

        return JSON.stringify({
          success: false,

          error:
            error instanceof Error
              ? error.message
              : "Refund processing failed",
        });
      }
    },

    // ====================================================
    // TOOL CONFIGURATION
    // ====================================================

    {
      name:
        "process_refund",

      description:
        "Process a refund ONLY for an order belonging to the authenticated customer. Before processing, check the refunds table for an existing processed refund using both customer_id and order_id. Never create a duplicate refund.",

      schema: z.object({
        orderNumber:
          z.string(),

        refundReason:
          z.string(),

        refundAmount:
          z.number().optional(),
      }),
    }
  );
}