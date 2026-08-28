import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  request: NextRequest
) {
  try {
    const orderNumber =
      request.nextUrl.searchParams.get("id");

    const customerCode =
      request.nextUrl.searchParams.get(
        "customer"
      );

    // ==========================================
    // Specific order
    // ==========================================

    if (orderNumber) {
      const { data, error } =
        await supabase
          .from("orders")
          .select(
            `
              *,
              customers (
                customer_code,
                name,
                email
              )
            `
          )
          .eq(
            "order_number",
            orderNumber.toUpperCase()
          )
          .maybeSingle();

      if (error) {
        throw new Error(error.message);
      }

      if (!data) {
        return NextResponse.json(
          {
            success: false,
            error: "Order not found",
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        order: data,
      });
    }

    // ==========================================
    // Orders for customer
    // ==========================================

    if (customerCode) {
      const { data: customer, error: customerError } =
        await supabase
          .from("customers")
          .select("id")
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

      const { data, error } =
        await supabase
          .from("orders")
          .select("*")
          .eq(
            "customer_id",
            customer.id
          )
          .order("order_date", {
            ascending: false,
          });

      if (error) {
        throw new Error(error.message);
      }

      return NextResponse.json({
        success: true,
        orders: data,
        count: data.length,
      });
    }

    // ==========================================
    // All orders
    // ==========================================

    const { data, error } =
      await supabase
        .from("orders")
        .select("*")
        .order("order_date", {
          ascending: false,
        });

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({
      success: true,
      orders: data,
      count: data.length,
    });
  } catch (error) {
    console.error(
      "Orders API error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to retrieve orders",
      },
      { status: 500 }
    );
  }
}