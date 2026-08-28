interface RefundStatusProps {
  status: "approved" | "denied";
  orderNumber?: string;
  amount?: number;
  refundId?: string;
  reason?: string;
}

export default function RefundStatus({
  status,
  orderNumber,
  amount,
  refundId,
  reason,
}: RefundStatusProps) {
  if (status === "approved") {
    return (
      <div className="mt-3 rounded-xl border border-green-200 bg-green-50 p-4">
        <div className="flex items-start gap-3">

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-100 text-lg text-green-600">
            ✓
          </div>

          <div className="flex-1">

            <h3 className="font-semibold text-green-800">
              Refund Approved
            </h3>

            <p className="mt-1 text-sm text-green-700">
              Your refund has been successfully processed.
            </p>

            <div className="mt-3 space-y-1 text-sm text-green-800">

              {orderNumber && (
                <p>
                  <strong>Order:</strong>{" "}
                  {orderNumber}
                </p>
              )}

              {amount !== undefined && (
                <p>
                  <strong>Amount:</strong>{" "}
                  ₹{amount.toLocaleString("en-IN")}
                </p>
              )}

              {refundId && (
                <p>
                  <strong>Refund ID:</strong>{" "}
                  <span className="font-mono text-xs">
                    {refundId}
                  </span>
                </p>
              )}

              <p>
                <strong>Status:</strong>{" "}
                Processed
              </p>

            </div>

          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-4">
      <div className="flex items-start gap-3">

        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100 text-lg text-red-600">
          !
        </div>

        <div>

          <h3 className="font-semibold text-red-800">
            Refund Not Approved
          </h3>

          <p className="mt-1 text-sm text-red-700">
            {reason ||
              "This refund request does not meet the refund policy."}
          </p>

          {orderNumber && (
            <p className="mt-2 text-sm text-red-800">
              <strong>Order:</strong>{" "}
              {orderNumber}
            </p>
          )}

        </div>

      </div>
    </div>
  );
}