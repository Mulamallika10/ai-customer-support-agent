"use client";

import { useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleAlert,
  Clock,
  Copy,
  Database,
  FileText,
  Hash,
  ShieldAlert,
  Wrench,
  XCircle,
} from "lucide-react";

interface AgentLog {
  id: string;
  conversation_id?: string | null;
  step: string;
  tool_name: string | null;
  input: any;
  output: any;
  status: string;
  error_message: string | null;
  created_at: string;
}

export default function AgentLogs({
  logs,
}: {
  logs: AgentLog[];
}) {
  if (!logs.length) {
    return (
      <div className="p-12 text-center">
        <Database className="mx-auto h-10 w-10 text-gray-300" />

        <h3 className="mt-4 font-semibold text-gray-700">
          No agent activity
        </h3>

        <p className="mt-1 text-sm text-gray-400">
          Agent execution logs will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {logs.map((log) => (
        <AgentLogRow key={log.id} log={log} />
      ))}
    </div>
  );
}

function AgentLogRow({
  log,
}: {
  log: AgentLog;
}) {
  const [expanded, setExpanded] = useState(false);

  const parsedInput = parseJson(log.input);
  const parsedOutput = parseJson(log.output);

  const denied =
    log.tool_name === "validate_refund_policy" &&
    parsedOutput?.eligible === false;

  const isError =
    log.status?.toLowerCase() === "error";

  const isSuccess =
    log.status?.toLowerCase() === "success";

  return (
    <div
      className={`p-5 transition-colors ${
        denied
          ? "bg-red-50/40"
          : isError
          ? "bg-red-50/20"
          : "bg-white hover:bg-gray-50/70"
      }`}
    >
      {/* Header */}
      <div className="flex items-start gap-4">

        {/* Status icon */}
        <div className="mt-0.5 shrink-0">
          {denied ? (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-100">
              <ShieldAlert className="h-5 w-5 text-red-600" />
            </div>
          ) : isError ? (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-100">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
          ) : isSuccess ? (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-yellow-100">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
          )}
        </div>

        {/* Main content */}
        <div className="min-w-0 flex-1">

          {/* Title row */}
          <div className="flex flex-wrap items-start justify-between gap-3">

            <div>
              <div className="flex flex-wrap items-center gap-2">

                <h3 className="font-semibold text-gray-900">
                  {getDisplayName(
                    log.tool_name || log.step
                  )}
                </h3>

                <StatusBadge
                  status={log.status}
                  denied={denied}
                />

              </div>

              {log.tool_name && (
                <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
                  <Wrench className="h-3.5 w-3.5" />
                  {log.tool_name}
                </p>
              )}
            </div>

            {/* Timestamp */}
            <div className="text-right text-xs text-gray-400">
              <div>
                {formatDate(log.created_at)}
              </div>

              <div className="mt-0.5">
                {formatTime(log.created_at)}
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className="mt-3 flex flex-wrap gap-2">

            <MetadataBadge
              icon={<FileText className="h-3.5 w-3.5" />}
              label={`Step: ${log.step}`}
            />

            {log.conversation_id && (
              <MetadataBadge
                icon={<Hash className="h-3.5 w-3.5" />}
                label={`Conversation: ${log.conversation_id}`}
                copyValue={log.conversation_id}
              />
            )}

            <MetadataBadge
              icon={<Hash className="h-3.5 w-3.5" />}
              label={`Log: ${log.id}`}
              copyValue={log.id}
            />

          </div>

          {/* Denial */}
          {denied && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">

              <div className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-red-600" />

                <span className="text-sm font-semibold text-red-800">
                  REFUND DENIED
                </span>
              </div>

              {parsedOutput?.reason && (
                <p className="mt-2 text-sm text-red-700">
                  {parsedOutput.reason}
                </p>
              )}
            </div>
          )}

          {/* Error */}
          {log.error_message && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">

              <div className="flex items-center gap-2">
                <CircleAlert className="h-4 w-4 text-red-600" />

                <span className="text-sm font-semibold text-red-800">
                  Error
                </span>
              </div>

              <p className="mt-2 whitespace-pre-wrap text-sm text-red-700">
                {log.error_message}
              </p>
            </div>
          )}

          {/* Expand button */}
          <button
            onClick={() =>
              setExpanded((previous) => !previous)
            }
            className="mt-4 flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"
          >
            {expanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}

            {expanded
              ? "Hide execution data"
              : "View execution data"}
          </button>

          {/* Full execution data */}
          {expanded && (
            <div className="mt-4 grid gap-4 lg:grid-cols-2">

              {/* Input */}
              <JsonPanel
                title="Input"
                value={parsedInput}
              />

              {/* Output */}
              <JsonPanel
                title="Output"
                value={parsedOutput}
              />

            </div>
          )}

        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* JSON PANEL                                                                  */
/* -------------------------------------------------------------------------- */

function JsonPanel({
  title,
  value,
}: {
  title: string;
  value: any;
}) {
  const [copied, setCopied] = useState(false);

  const formatted = formatJson(value);

  async function copyData() {
    try {
      await navigator.clipboard.writeText(
        formatted
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch (error) {
      console.error(
        "Failed to copy:",
        error
      );
    }
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50">

      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">

        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-gray-500" />

          <span className="text-sm font-semibold text-gray-700">
            {title}
          </span>
        </div>

        <button
          onClick={copyData}
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
        >
          <Copy className="h-3.5 w-3.5" />

          {copied ? "Copied" : "Copy"}
        </button>

      </div>

      <pre className="max-h-[400px] overflow-auto p-4 text-xs leading-6 text-gray-700">
        {formatted}
      </pre>

    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* STATUS BADGE                                                                */
/* -------------------------------------------------------------------------- */

function StatusBadge({
  status,
  denied,
}: {
  status: string;
  denied: boolean;
}) {
  if (denied) {
    return (
      <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
        DENIED
      </span>
    );
  }

  const normalized =
    status?.toLowerCase();

  if (normalized === "success") {
    return (
      <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
        SUCCESS
      </span>
    );
  }

  if (normalized === "error") {
    return (
      <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
        ERROR
      </span>
    );
  }

  return (
    <span className="rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-semibold text-yellow-700">
      {status?.toUpperCase()}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* METADATA BADGE                                                              */
/* -------------------------------------------------------------------------- */

function MetadataBadge({
  icon,
  label,
  copyValue,
}: {
  icon: React.ReactNode;
  label: string;
  copyValue?: string;
}) {
  async function copy() {
    if (!copyValue) return;

    try {
      await navigator.clipboard.writeText(
        copyValue
      );
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <button
      onClick={copyValue ? copy : undefined}
      className={`flex max-w-full items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-500 ${
        copyValue
          ? "cursor-pointer hover:bg-gray-50"
          : ""
      }`}
      title={copyValue || undefined}
    >
      {icon}

      <span className="max-w-[350px] truncate">
        {label}
      </span>

      {copyValue && (
        <Copy className="h-3 w-3 shrink-0" />
      )}
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* HELPERS                                                                     */
/* -------------------------------------------------------------------------- */

function parseJson(value: any): any {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value !== "string") {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function formatJson(value: any): string {
  if (value === null || value === undefined) {
    return "No data";
  }

  if (typeof value === "string") {
    return value;
  }

  try {
    return JSON.stringify(
      value,
      null,
      2
    );
  } catch {
    return String(value);
  }
}

function formatDate(
  date: string
): string {
  return new Date(date).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

function formatTime(
  date: string
): string {
  return new Date(date).toLocaleTimeString(
    "en-IN",
    {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }
  );
}

function getDisplayName(
  name: string
) {
  const names: Record<string, string> = {
    get_customer:
      "👤 Customer Lookup",

    get_order:
      "📦 Order Lookup",

    validate_refund_policy:
      "🛡️ Policy Validation",

    process_refund:
      "💰 Refund Processing",

    LLM_DECISION:
      "🤖 Agent Decision",

    TOOL_EXECUTION:
      "🔧 Tool Execution",

    get_customer_details:
      "👤 Customer Details",

    get_order_details:
      "📦 Order Details",

    create_refund:
      "💰 Create Refund",

    check_refund_status:
      "🔎 Refund Status",
  };

  return names[name] || name;
}

