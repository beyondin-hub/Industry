import { NextResponse } from "next/server";
import { getAssistantReply } from "@/lib/claude/assistant";
import type { ChatMessage } from "@/types";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { messages?: ChatMessage[] };
    const messages = (body.messages ?? []).filter(
      (m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string",
    );
    if (messages.length === 0) {
      return NextResponse.json({ reply: "¿En qué insumo MRO te puedo ayudar hoy?" });
    }
    const reply = await getAssistantReply(messages.slice(-12));
    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json(
      { reply: "Tuve un problema procesando tu mensaje. Escríbenos por WhatsApp y te atendemos al instante." },
      { status: 200 },
    );
  }
}
