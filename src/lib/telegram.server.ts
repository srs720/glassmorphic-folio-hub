type Submission = { name: string; email: string; detail: string };

function escapeMarkdown(value: string) {
  return value.replace(/[\\_*`\[\]]/g, "\\$&");
}

export async function notifyTelegram(
  token: string | undefined,
  kind: "contact" | "cv",
  submission: Submission,
  transport: typeof fetch = fetch,
): Promise<void> {
  try {
    if (!token) throw new Error("Telegram token is not configured");
    const text = [
      kind === "contact" ? "📬 *New Portfolio Message!*" : "📄 *New CV Request!*",
      `*Name:* ${escapeMarkdown(submission.name)}`,
      `*Email:* ${escapeMarkdown(submission.email)}`,
      `*${kind === "contact" ? "Message" : "Purpose"}:* ${escapeMarkdown(submission.detail)}`,
      ...(kind === "cv" ? ["Go to Admin Panel to approve."] : []),
    ].join("\n");
    const response = await transport(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: "8480630530", text, parse_mode: "Markdown" }),
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) {
      console.error("Telegram notification failed", { status: response.status });
      return;
    }
    const result = await response.json() as { ok?: boolean };
    if (result.ok !== true) console.error("Telegram notification was rejected");
  } catch {
    // Never log fetch errors or URLs: Telegram includes the private token in its URL.
    console.error("Telegram notification could not be delivered; submission remains saved");
  }
}

export async function saveThenNotify(
  save: () => Promise<{ error: { code?: string; message: string } | null }>,
  notify: () => Promise<void>,
) {
  const result = await save();
  if (result.error) return result;
  try { await notify(); } catch {
    console.error("Notification failed; submission remains saved");
  }
  return result;
}