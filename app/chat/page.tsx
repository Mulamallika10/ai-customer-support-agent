"use client";

import { useState } from "react";
import ChatWindow from "@/components/ChatWindow";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Clock3,
  MessageCircle,
  PackageCheck,
  RefreshCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

export default function ChatPage() {
  const [isChatOpen, setIsChatOpen] = useState(true);

  const features = [
    {
      icon: Search,
      title: "Order Assistance",
      description:
        "Instantly look up order details, status, delivery information and related customer requests.",
    },
    {
      icon: RefreshCcw,
      title: "Refund Support",
      description:
        "Guide customers through refund requests while validating eligibility against refund policies.",
    },
    {
      icon: PackageCheck,
      title: "Order Management",
      description:
        "Help customers with order-related actions such as cancellation and status enquiries.",
    },
    {
      icon: Bot,
      title: "AI-Powered Support",
      description:
        "Understand customer questions and provide contextual responses using an intelligent support workflow.",
    },
    {
      icon: ShieldCheck,
      title: "Policy-Aware Responses",
      description:
        "Keep responses aligned with configured business rules and customer-support policies.",
    },
    {
      icon: Clock3,
      title: "24/7 Availability",
      description:
        "Provide instant assistance without waiting for a support representative to become available.",
    },
  ];

  const workflow = [
    {
      number: "01",
      title: "Customer asks",
      description:
        "The customer explains their order, refund or support requirement.",
    },
    {
      number: "02",
      title: "AI understands",
      description:
        "The assistant identifies the customer's intent and gathers the required information.",
    },
    {
      number: "03",
      title: "Tools execute",
      description:
        "The AI uses the appropriate order, refund or customer-support tools.",
    },
    {
      number: "04",
      title: "Customer gets an answer",
      description:
        "The customer receives a clear response based on real data and business policies.",
    },
  ];

  return (
    <main className="min-h-screen bg-[#f7f9fc] text-slate-900">
      {/* =========================================================
          HEADER
      ========================================================= */}
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500 shadow-sm">
              <Bot className="h-5 w-5 text-white" />
            </div>

            <div>
              <h1 className="text-[15px] font-bold tracking-tight text-slate-950">
                AI Customer Support
              </h1>

              <p className="text-xs text-slate-500">
                Refund & Order Assistant
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-6 md:flex">
            <a
              href="#features"
              className="text-sm font-medium text-slate-600 transition hover:text-slate-950"
            >
              Features
            </a>

            <a
              href="#workflow"
              className="text-sm font-medium text-slate-600 transition hover:text-slate-950"
            >
              How it works
            </a>

            <button
              onClick={() => setIsChatOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              <MessageCircle className="h-4 w-4" />
              Open Assistant
            </button>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <span className="text-xs font-semibold text-emerald-600">
              Online
            </span>
          </div>
        </div>
      </header>

      {/* =========================================================
          MAIN CONTENT
      ========================================================= */}
      <div className="relative overflow-hidden">
        {/* Decorative background */}
        <div className="pointer-events-none absolute left-1/2 top-0 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-blue-100/40 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          {/* =====================================================
              HERO
          ===================================================== */}
          <section className="grid min-h-[650px] items-center gap-12 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
            <div className="max-w-2xl">
              {/* Status badge */}
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3.5 py-2 shadow-sm">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                </span>

                <span className="text-xs font-semibold text-emerald-700">
                  AI Assistant Online
                </span>
              </div>

              {/* Heading */}
              <h2 className="text-4xl font-bold leading-[1.08] tracking-tight text-slate-950 sm:text-5xl lg:text-[58px]">
                Smarter support.
                <br />

                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                  Faster resolutions.
                </span>
              </h2>

              <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
                An AI-powered customer support assistant designed to help
                customers with orders, refunds, cancellations and policy
                questions — instantly and intelligently.
              </p>

              {/* CTA */}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => setIsChatOpen(true)}
                  className="group flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-slate-950/10 transition hover:-translate-y-0.5 hover:bg-slate-800"
                >
                  Start a conversation

                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </button>

                <a
                  href="#features"
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
                >
                  Explore features
                </a>
              </div>

              {/* Trust indicators */}
              <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3">
                {[
                  "Real-time assistance",
                  "Policy aware",
                  "Secure workflow",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 text-xs font-medium text-slate-500"
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Hero visual */}
            <div className="relative hidden lg:block">
              <div className="relative mx-auto max-w-[500px]">
                {/* Main card */}
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-300/40">
                  {/* Card header */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                        <Bot className="h-5 w-5 text-blue-600" />
                      </div>

                      <div>
                        <p className="text-sm font-bold text-slate-900">
                          Customer AI Support
                        </p>

                        <div className="mt-0.5 flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          <span className="text-[11px] font-medium text-emerald-600">
                            Online
                          </span>
                        </div>
                      </div>
                    </div>

                    <Sparkles className="h-5 w-5 text-violet-500" />
                  </div>

                  {/* Conversation preview */}
                  <div className="space-y-4 py-5">
                    <div className="ml-auto max-w-[72%] rounded-2xl rounded-br-md bg-blue-600 px-4 py-3 text-sm leading-5 text-white">
                      I want to check my order status.
                    </div>

                    <div className="flex items-start gap-2">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                        <Bot className="h-4 w-4 text-blue-600" />
                      </div>

                      <div className="max-w-[78%] rounded-2xl rounded-tl-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-5 text-slate-600">
                        Sure! I can help you check your order status. Let me
                        look up the latest information.
                      </div>
                    </div>

                    <div className="flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50/70 p-3">
                      <PackageCheck className="h-4 w-4 text-blue-600" />

                      <div>
                        <p className="text-xs font-bold text-slate-800">
                          Order information retrieved
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-500">
                          Your order is currently being processed.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Input preview */}
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">
                        Ask about your order or refund...
                      </span>

                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-950">
                        <ArrowRight className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating card */}
                <div className="absolute -bottom-7 -left-10 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
                      <Zap className="h-5 w-5 text-emerald-600" />
                    </div>

                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        Instant assistance
                      </p>

                      <p className="mt-0.5 text-[11px] text-slate-500">
                        Available 24/7
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* =====================================================
              PROJECT INTRO
          ===================================================== */}
          <section className="border-t border-slate-200 py-20">
            <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr]">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
                  About the project
                </p>

                <h3 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
                  A modern AI support experience
                </h3>
              </div>

              <div className="max-w-3xl">
                <p className="text-base leading-7 text-slate-600">
                  AI Customer Support is an intelligent assistant built to
                  automate common customer-service interactions. Instead of
                  forcing customers to navigate multiple pages or wait for an
                  agent, the assistant provides a conversational interface for
                  order and refund-related requests.
                </p>

                <p className="mt-5 text-base leading-7 text-slate-600">
                  The system combines conversational AI, customer information,
                  order data and business policies to deliver useful responses
                  while keeping the interaction simple for the customer.
                </p>
              </div>
            </div>
          </section>

          {/* =====================================================
              FEATURES
          ===================================================== */}
          <section id="features" className="scroll-mt-24 py-20">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
                Capabilities
              </p>

              <h3 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                Everything customers need,
                <br />
                in one conversation.
              </h3>

              <p className="mt-4 text-base leading-7 text-slate-600">
                Designed to handle the most common support workflows without
                making customers search through complicated interfaces.
              </p>
            </div>

            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => {
                const Icon = feature.icon;

                return (
                  <div
                    key={feature.title}
                    className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-200/50"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 transition group-hover:bg-blue-50">
                      <Icon className="h-5 w-5 text-slate-700 group-hover:text-blue-600" />
                    </div>

                    <h4 className="mt-5 text-base font-bold text-slate-900">
                      {feature.title}
                    </h4>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* =====================================================
              WORKFLOW
          ===================================================== */}
          <section
            id="workflow"
            className="scroll-mt-24 rounded-3xl bg-slate-950 px-6 py-14 sm:px-10 lg:px-14 lg:py-16"
          >
            <div className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr]">
              <div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>

                <h3 className="mt-6 text-3xl font-bold tracking-tight text-white">
                  How the AI assistant works
                </h3>

                <p className="mt-4 text-sm leading-6 text-slate-400">
                  A simple conversational experience powered by an intelligent
                  workflow that connects customer requests with the right
                  information and actions.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {workflow.map((item) => (
                  <div
                    key={item.number}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] p-5"
                  >
                    <span className="text-xs font-bold tracking-widest text-blue-400">
                      {item.number}
                    </span>

                    <h4 className="mt-3 text-sm font-bold text-white">
                      {item.title}
                    </h4>

                    <p className="mt-2 text-xs leading-5 text-slate-400">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* =====================================================
              SUPPORT CTA
          ===================================================== */}
          <section className="py-20">
            <div className="relative overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-violet-50 px-6 py-14 text-center sm:px-10">
              <div className="relative mx-auto max-w-2xl">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">
                  <MessageCircle className="h-5 w-5 text-blue-600" />
                </div>

                <h3 className="mt-5 text-3xl font-bold tracking-tight text-slate-950">
                  Need help with an order?
                </h3>

                <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-600">
                  Start a conversation with the AI support assistant and get
                  help with your order, refund or support request.
                </p>

                <button
                  onClick={() => setIsChatOpen(true)}
                  className="mt-7 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-6 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:bg-slate-800"
                >
                  Chat with support
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </section>

          {/* =====================================================
              FOOTER
          ===================================================== */}
          <footer className="border-t border-slate-200 py-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-bold text-slate-900">
                  AI Customer Support
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Intelligent assistance for orders and refunds.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs font-medium text-emerald-600">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Service Online
              </div>
            </div>
          </footer>
        </div>
      </div>

      {/* =========================================================
          CHAT WINDOW
      ========================================================= */}
      <ChatWindow
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />

      {/* =========================================================
          FLOATING CHAT BUTTON
      ========================================================= */}
      {!isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          aria-label="Open customer support"
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-slate-950 text-white shadow-2xl shadow-slate-950/30 transition hover:-translate-y-1 hover:bg-slate-800"
        >
          <MessageCircle className="h-6 w-6" />

          <span className="absolute right-0 top-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500" />
        </button>
      )}
    </main>
  );
}