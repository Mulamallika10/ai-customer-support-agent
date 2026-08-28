import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  request: NextRequest
) {
  try {
    const customerCode =
      request.nextUrl.searchParams.get("id");

    // Get a specific customer
    if (customerCode) {
      const { data, error } =
        await supabase
          .from("customers")
          .select("*")
          .eq(
            "customer_code",
            customerCode.toUpperCase()
          )
          .maybeSingle();

      if (error) {
        throw new Error(error.message);
      }

      if (!data) {
        return NextResponse.json(
          {
            success: false,
            error: "Customer not found",
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        customer: data,
      });
    }

    // Get all customers
    const { data, error } =
      await supabase
        .from("customers")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({
      success: true,
      customers: data,
      count: data.length,
    });
  } catch (error) {
    console.error(
      "Customers API error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to retrieve customers",
      },
      { status: 500 }
    );
  }
}