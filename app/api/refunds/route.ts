import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const orderNumber =
      request.nextUrl.searchParams.get("order");

    const customerCode =
      request.nextUrl.searchParams.get("customer");

    // ==========================================
    // Get refund for specific order
    // ==========================================

    if (orderNumber) {
      const { data: order, error: orderError } =
        await supabase
          .from("orders")
          .select("id, order_number")
          .eq(
            "order_number",
            orderNumber.toUpperCase()
          )
          .maybeSingle();

      if (orderError) {
        throw new Error(orderError.message);
      }

      if (!order) {
        return NextResponse.json(
          {
            success: false,
            error: "Order not found",
          },
          { status: 404 }
        );
      }

      const { data: refund, error } =
        await supabase
          .from("refunds")
          .select("*")
          .eq("order_id", order.id)
          .order("created_at", {
            ascending: false,
          });

      if (error) {
        throw new Error(error.message);
      }

      return NextResponse.json({
        success: true,
        orderNumber: order.order_number,
        refunds: refund,
        count: refund.length,
      });
    }

    // ==========================================
    // Get refunds for customer
    // ==========================================

    if (customerCode) {
      const { data: customer, error: customerError } =
        await supabase
          .from("customers")
          .select("id, customer_code, name")
          .eq(
            "customer_code",
            customerCode.toUpperCase()
          )
          .maybeSingle();

      if (customerError) {
        throw new Error(
          customerError.message
        );
      }

      if (!customer) {
        return NextResponse.json(
          {
            success: false,
            error: "Customer not found",
          },
          { status: 404 }
        );
      }

      const { data: refunds, error } =
        await supabase
          .from("refunds")
          .select(
            `
              *,
              orders (
                order_number,
                product_name
              )
            `
          )
          .eq(
            "customer_id",
            customer.id
          )
          .order("created_at", {
            ascending: false,
          });

      if (error) {
        throw new Error(error.message);
      }

      return NextResponse.json({
        success: true,
        customer: customer,
        refunds,
        count: refunds.length,
      });
    }

    // ==========================================
    // Get all refunds
    // ==========================================

    const { data: refunds, error } =
      await supabase
        .from("refunds")
        .select(
          `
            *,
            orders (
              order_number,
              product_name
            ),
            customers (
              customer_code,
              name
            )
          `
        )
        .order("created_at", {
          ascending: false,
        });

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({
      success: true,
      refunds,
      count: refunds.length,
    });
  } catch (error) {
    console.error(
      "Refunds API error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to retrieve refunds",
      },
      { status: 500 }
    );
  }
}