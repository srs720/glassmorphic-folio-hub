/** Server-only helper that talks to the Lovable AI gateway. */

const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-2.5-flash";

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export async function chatComplete(messages: ChatMessage[], maxTokens = 600): Promise<string> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("AI is not configured for this project.");

  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: MODEL, messages, max_tokens: maxTokens }),
  });

  if (res.status === 429) throw new Error("Too many AI requests right now — please try again in a moment.");
  if (res.status === 402) throw new Error("AI credits are exhausted for this workspace.");
  if (!res.ok) {
    const body = await res.text();
    console.error(`AI gateway failed [${res.status}]: ${body}`);
    throw new Error(`AI request failed (${res.status}).`);
  }

  const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  return json.choices?.[0]?.message?.content?.trim() ?? "";
}
