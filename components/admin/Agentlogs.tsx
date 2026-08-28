type AgentLog = {
  id: string | number;
  tool_name?: string | null;
  step?: string | null;
  status: string;
  created_at: string | number | Date;
  error_message?: string | null;
};

function AgentLogs({
  logs,
}: {
  logs: AgentLog[];
}) {
    function getDisplayName(arg0: string | null | undefined) {
      return arg0 || "Unknown";
    }

  return (
    <div className="rounded-xl border bg-white shadow-sm">

      <div className="border-b p-5">

        <h2 className="font-semibold">
          Agent Activity
        </h2>

        <p className="text-sm text-gray-500">
          Logs for this conversation
        </p>

      </div>

      <div className="divide-y">

        {logs.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No agent logs found.
          </div>
        ) : (
          logs.map((log) => {

            const name =
              getDisplayName(
                log.tool_name ||
                log.step
              );

            return (
              <div
                key={log.id}
                className="p-5"
              >

                <div className="flex gap-3">

                  <span
                    className={`mt-1 h-3 w-3 shrink-0 rounded-full ${
                      log.status === "success"
                        ? "bg-green-500"
                        : log.status === "error"
                        ? "bg-red-500"
                        : "bg-yellow-500"
                    }`}
                  />

                  <div className="flex-1">

                    <div className="flex justify-between">

                      <h3 className="font-semibold">
                        {name}
                      </h3>

                      <span className="text-xs text-gray-400">
                        {new Date(
                          log.created_at
                        ).toLocaleTimeString()}
                      </span>

                    </div>

                    <p className="mt-1 text-sm text-gray-500">
                      Status: {log.status}
                    </p>

                    {log.error_message && (
                      <div className="mt-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                        {log.error_message}
                      </div>
                    )}

                  </div>

                </div>

              </div>
            );
          })
        )}

      </div>
    </div>
  );
}