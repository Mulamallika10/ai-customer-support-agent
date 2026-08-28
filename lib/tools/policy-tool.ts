import { tool } from "@langchain/core/tools";
import { z } from "zod";


// ======================================================
// REFUND POLICY TOOL
// ======================================================

export function createPolicyTool() {
  return tool(
    async ({
      order,
      refundReason,
    }) => {
      try {
        if (!order) {
          return JSON.stringify({
            eligible: false,
            reason:
              "Order information is required.",
          });
        }

        // ------------------------------------------
        // Order status
        // ------------------------------------------

        if (
          order.status !==
          "delivered"
        ) {
          return JSON.stringify({
            eligible: false,
            reason:
              "Refunds are only available for delivered orders.",
            rulesChecked: [
              "Order must have status 'delivered'",
            ],
          });
        }

        // ------------------------------------------
        // Final sale
        // ------------------------------------------

        if (
          order.is_final_sale === true
        ) {
          return JSON.stringify({
            eligible: false,
            reason:
              "This order is marked as a final sale and is not eligible for refund.",
            rulesChecked: [
              "Order must not be a final sale",
            ],
          });
        }

        // ------------------------------------------
        // Digital product
        // ------------------------------------------

        if (
          order.is_digital === true
        ) {
          return JSON.stringify({
            eligible: false,
            reason:
              "Digital products are not eligible for refund.",
            rulesChecked: [
              "Digital products cannot be refunded",
            ],
          });
        }

        // ------------------------------------------
        // Delivery date
        // ------------------------------------------

        if (!order.delivery_date) {
          return JSON.stringify({
            eligible: false,
            reason:
              "The order does not have a valid delivery date.",
          });
        }

        // ------------------------------------------
        // Refund window
        // ------------------------------------------

        const deliveryDate =
          new Date(
            order.delivery_date
          );

        const today =
          new Date();

        const diffMs =
          today.getTime() -
          deliveryDate.getTime();

        const daysSinceDelivery =
          Math.floor(
            diffMs /
              (1000 *
                60 *
                60 *
                24)
          );

        const REFUND_WINDOW = 30;

        if (
          daysSinceDelivery >
          REFUND_WINDOW
        ) {
          return JSON.stringify({
            eligible: false,

            reason:
              `Refund window exceeded. The order was delivered ${daysSinceDelivery} days ago and the maximum refund window is ${REFUND_WINDOW} days.`,

            rulesChecked: [
              "Order must have status 'delivered'",
              "Order must have a valid delivery date",
              "Refund must be requested within 30 days of delivery",
            ],

            daysSinceDelivery,
          });
        }

        // ------------------------------------------
        // Eligible
        // ------------------------------------------

        return JSON.stringify({
          eligible: true,

          reason:
            "Order is eligible for refund.",

          refundReason,

          refundAmount:
            order.amount,

          rulesChecked: [
            "Order is delivered",
            "Order is not a final sale",
            "Order is not digital",
            "Order is within 30-day refund window",
          ],

          daysSinceDelivery,
        });
      } catch (error) {
        return JSON.stringify({
          eligible: false,
          error:
            error instanceof Error
              ? error.message
              : "Policy validation failed",
        });
      }
    },
    {
      name: "validate_refund_policy",

      description:
        "Validate whether an authenticated customer's order is eligible for a refund.",

      schema: z.object({
        order: z
          .any()
          .describe(
            "Order object returned by get_order"
          ),

        refundReason: z
          .string()
          .describe(
            "Reason provided by the customer"
          ),
      }),
    }
  );
}