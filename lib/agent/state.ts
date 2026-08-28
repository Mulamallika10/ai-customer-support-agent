import { Annotation } from "@langchain/langgraph";
import { BaseMessage } from "@langchain/core/messages";

export const AgentState = Annotation.Root({

  // =====================================================
  // MESSAGES
  // =====================================================

  messages: Annotation<BaseMessage[]>({
    reducer: (current, next) => [
      ...current,
      ...next,
    ],
    default: () => [],
  }),


  // =====================================================
  // CONVERSATION ID
  // =====================================================

  conversationId: Annotation<string>({
    reducer: (_, next) => next,
    default: () => "",
  }),


  // =====================================================
  // CUSTOMER
  // =====================================================

  customerCode: Annotation<string | null>({
    reducer: (_, next) => next,
    default: () => null,
  }),


  // =====================================================
  // ORDER
  // =====================================================

  orderNumber: Annotation<string | null>({
    reducer: (_, next) => next,
    default: () => null,
  }),


  // =====================================================
  // REFUND DECISION
  // =====================================================

  decision: Annotation<
    "approved" | "denied" | null
  >({
    reducer: (_, next) => next,
    default: () => null,
  }),


  // =====================================================
  // FINAL RESPONSE
  // =====================================================

  finalResponse: Annotation<string>({
    reducer: (_, next) => next,
    default: () => "",
  }),
});

export type AgentStateType =
  typeof AgentState.State;