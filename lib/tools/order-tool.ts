import { tool } from "@langchain/core/tools";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

// ======================================================
// GET ORDER TOOL
// ======================================================

export function createOrderTool(customerId: string) {
  return tool(
    async ({ orderNumber, productName }) => {
      try {
        // ==================================================
        // VALIDATE CUSTOMER
        // ==================================================

        if (!customerId) {
          return JSON.stringify({
            found: false,
            order: null,
            orders: [],
            multipleOrders: false,
            alreadyRefunded: false,
            error: "Authenticated customer ID is required.",
          });
        }

        const supabase = await createClient();

        console.log("GET ORDER:", {
          customerId,
          orderNumber,
          productName,
        });

        // ==================================================
        // CASE 1:
        // SPECIFIC ORDER NUMBER
        // ==================================================

        if (orderNumber) {
          const {
            data: order,
            error: orderError,
          } = await supabase
            .from("orders")
            .select("*")
            .eq("order_number", orderNumber)
            .eq("customer_id", customerId)
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
              orders: [],
              multipleOrders: false,
              alreadyRefunded: false,
              error: "Unable to retrieve the order.",
            });
          }

          // ==================================================
          // ORDER NOT FOUND
          // ==================================================

          if (!order) {
            console.log("ORDER NOT FOUND:", {
              customerId,
              orderNumber,
            });

            return JSON.stringify({
              found: false,
              order: null,
              orders: [],
              multipleOrders: false,
              alreadyRefunded: false,
              error:
                "Order not found for the authenticated customer.",
            });
          }

          console.log("ORDER FOUND:", {
            orderId: order.id,
            orderNumber: order.order_number,
            productName: order.product_name,
            customerId: order.customer_id,
          });

          // Check refund status
          return await checkRefundStatus(
            supabase,
            order,
            customerId
          );
        }

        // ==================================================
        // CASE 2:
        // SEARCH BY PRODUCT NAME
        // ==================================================

        if (productName) {
          const {
            data: orders,
            error: orderError,
          } = await supabase
            .from("orders")
            .select("*")
            .eq("customer_id", customerId)
            .ilike(
              "product_name",
              `%${productName}%`
            )
            .order("created_at", {
              ascending: false,
            });

          // ==================================================
          // ORDER DATABASE ERROR
          // ==================================================

          if (orderError) {
            console.error(
              "PRODUCT ORDER LOOKUP ERROR:",
              orderError
            );

            return JSON.stringify({
              found: false,
              order: null,
              orders: [],
              multipleOrders: false,
              alreadyRefunded: false,
              error:
                "Unable to retrieve orders for this product.",
            });
          }

          // ==================================================
          // NO PRODUCT ORDER FOUND
          // ==================================================

          if (!orders || orders.length === 0) {
            console.log(
              "NO ORDERS FOUND FOR PRODUCT:",
              {
                customerId,
                productName,
              }
            );

            return JSON.stringify({
              found: false,
              order: null,
              orders: [],
              multipleOrders: false,
              alreadyRefunded: false,
              error:
                "No order for this product was found for the authenticated customer.",
            });
          }

          // ==================================================
          // MULTIPLE ORDERS FOR SAME PRODUCT
          // ==================================================

          if (orders.length > 1) {
            console.log(
              "MULTIPLE PRODUCT ORDERS FOUND:",
              {
                customerId,
                productName,
                count: orders.length,
              }
            );

            return JSON.stringify({
              found: true,
              order: null,
              orders,
              multipleOrders: true,
              alreadyRefunded: false,
              message:
                "Multiple orders were found for this product. Ask the customer to specify the order number.",
            });
          }

          // ==================================================
          // SINGLE PRODUCT ORDER
          // ==================================================

          const order = orders[0];

          console.log(
            "SINGLE PRODUCT ORDER FOUND:",
            {
              orderId: order.id,
              orderNumber: order.order_number,
              productName: order.product_name,
              customerId: order.customer_id,
            }
          );

          return await checkRefundStatus(
            supabase,
            order,
            customerId
          );
        }

        // ==================================================
        // CASE 3:
        // NO ORDER NUMBER OR PRODUCT NAME
        //
        // Customer asks:
        // "What are my orders?"
        // "Show my order details"
        // "What orders have I placed?"
        // ==================================================

        console.log(
          "GETTING ALL ORDERS FOR CUSTOMER:",
          customerId
        );

        const {
          data: orders,
          error: ordersError,
        } = await supabase
          .from("orders")
          .select("*")
          .eq("customer_id", customerId)
          .order("created_at", {
            ascending: false,
          });

        // ==================================================
        // CUSTOMER ORDERS DATABASE ERROR
        // ==================================================

        if (ordersError) {
          console.error(
            "CUSTOMER ORDERS LOOKUP ERROR:",
            ordersError
          );

          return JSON.stringify({
            found: false,
            order: null,
            orders: [],
            multipleOrders: false,
            alreadyRefunded: false,
            error:
              "Unable to retrieve your orders.",
          });
        }

        // ==================================================
        // NO ORDERS
        // ==================================================

        if (!orders || orders.length === 0) {
          return JSON.stringify({
            found: false,
            order: null,
            orders: [],
            multipleOrders: false,
            alreadyRefunded: false,
            message:
              "No orders were found for the authenticated customer.",
          });
        }

        // ==================================================
        // ALL CUSTOMER ORDERS FOUND
        // ==================================================

        console.log(
          "CUSTOMER ORDERS FOUND:",
          {
            customerId,
            count: orders.length,
          }
        );

        return JSON.stringify({
          found: true,
          order: null,
          orders,
          multipleOrders: orders.length > 1,
          allCustomerOrders: true,
          alreadyRefunded: false,
        });

      } catch (error) {
        console.error(
          "ORDER TOOL ERROR:",
          error
        );

        return JSON.stringify({
          found: false,
          order: null,
          orders: [],
          multipleOrders: false,
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
        "Retrieve orders for the authenticated customer only. If orderNumber is provided, retrieve that specific order. If productName is provided, find the customer's order(s) containing that product. If neither orderNumber nor productName is provided, retrieve all orders belonging to the authenticated customer. Never access another customer's orders. For a specific order, also check the refunds table and return alreadyRefunded=true when a processed refund exists.",

      schema: z.object({
        orderNumber: z
          .string()
          .min(1)
          .optional()
          .describe(
            "Specific order number such as ORD1001. Use when the customer provides an order number."
          ),

        productName: z
          .string()
          .min(1)
          .optional()
          .describe(
            "Product name such as Backpack or Headphones. Use when the customer identifies an order by product name."
          ),
      }),
    }
  );
}

// ======================================================
// CHECK REFUND STATUS
// ======================================================

async function checkRefundStatus(
  supabase: any,
  order: any,
  customerId: string
) {
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
    .eq("order_id", order.id)
    .eq("customer_id", customerId)
    .eq("status", "processed")
    .order("created_at", {
      ascending: false,
    })
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
      orders: [order],
      multipleOrders: false,
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
        orderNumber: order.order_number,
        refundId: refund.id,
        customerId,
        status: refund.status,
      }
    );

    return JSON.stringify({
      found: true,

      order,

      orders: [order],

      multipleOrders: false,

      alreadyRefunded: true,

      refund: {
        id: refund.id,
        orderId: refund.order_id,
        customerId: refund.customer_id,
        amount: refund.amount,
        reason: refund.reason,
        status: refund.status,
        createdAt: refund.created_at,
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
      orderNumber: order.order_number,
    }
  );

  return JSON.stringify({
    found: true,

    order,

    orders: [order],

    multipleOrders: false,

    alreadyRefunded: false,

    refund: null,
  });
}

