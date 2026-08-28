import Link from "next/link";


export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto min-h-screen max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        {/* Header */}
        <header className="border-b border-slate-200 pb-6">
          <div className="flex items-start justify-between gap-6">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                Customer Support
              </h1>

              <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                Get quick assistance with your orders, refunds, returns, and
                customer policies.
              </p>
            </div>

            {/* Login Button */}
            <Link
              href="/login"
              className="shrink-0 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Login
            </Link>
          </div>
        </header>

        {/* Support Topics */}
        <section className="py-8">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-900">
              How can we help?
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Choose a topic or ask our AI customer support assistant.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

            {/* Customer Orders */}
            <div className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-md">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 2h9l3 3v17H6z" />
                  <path d="M14 2v4h4" />
                  <path d="M9 10h6" />
                  <path d="M9 14h6" />
                  <path d="M9 18h4" />
                </svg>
              </div>

              <h3 className="mt-5 text-base font-semibold text-slate-900">
                Customer Orders
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Get help with your orders, order status, cancellations, and
                delivery information.
              </p>
            </div>

            {/* Refunds */}
            <div className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-md">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 12a9 9 0 1 0 3-6.7" />
                  <path d="M3 4v5h5" />
                  <path d="M12 7v5l3 2" />
                </svg>
              </div>

              <h3 className="mt-5 text-base font-semibold text-slate-900">
                Refunds
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Check refund eligibility, refund status, and get assistance
                with refund requests.
              </p>
            </div>

            {/* Customer Policies */}
            <div className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-md sm:col-span-2 lg:col-span-1">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 3 5 6v5c0 4.5 2.9 8.3 7 10 4.1-1.7 7-5.5 7-10V6z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>

              <h3 className="mt-5 text-base font-semibold text-slate-900">
                Customer Policies
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Learn about return, cancellation, refund, and other customer
                support policies.
              </p>
            </div>

          </div>
        </section>

        {/* AI Customer Support */}
        <section className="pb-8">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

            {/* Chat Header */}
            <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
                    <path d="M8 10h8" />
                    <path d="M8 14h5" />
                  </svg>
                </div>

                <div>
                  <h2 className="text-base font-semibold text-slate-900">
                    AI Customer Support
                  </h2>

                  <div className="mt-0.5 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />

                    <span className="text-xs text-slate-500">
                      Online and ready to help
                    </span>
                  </div>
                </div>

              </div>
            </div>

            {/* Chat Window */}
            {/* 
            <div className="h-[650px]">
              <ChatWindow />
            </div>
            */}

          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-slate-200 py-5 text-center">
          <p className="text-xs text-slate-400">
            AI Customer Support • Orders • Refunds • Policies
          </p>
        </footer>

      </div>
    </main>
  );
}