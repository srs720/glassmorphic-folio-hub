import { describe, it, expect } from "bun:test";
import { notifyTelegram, saveThenNotify } from "./telegram.server";

describe("submission notifications", () => {
  it("notifies only after a successful save", async () => {
    const events: string[] = [];
    await saveThenNotify(async () => { events.push("saved"); return { error: null }; }, async () => { events.push("notified"); });
    expect(events).toEqual(["saved", "notified"]);
  });
  it("does not notify failed or duplicate saves", async () => {
    let calls = 0;
    await saveThenNotify(async () => ({ error: { code: "23505", message: "duplicate" } }), async () => { calls++; });
    expect(calls).toBe(0);
  });
  it("preserves success when notification fails", async () => {
    const result = await saveThenNotify(async () => ({ error: null }), async () => { throw new Error("unavailable"); });
    expect(result.error).toBeNull();
  });
  it("sends both alerts to the specified chat using Markdown", async () => {
    const bodies: Array<{ chat_id: string; parse_mode: string; text: string }> = [];
    const transport = (async (_input: unknown, init?: RequestInit) => {
      bodies.push(JSON.parse(String(init?.body)));
      return Response.json({ ok: true });
    }) as typeof fetch;
    for (const kind of ["contact", "cv"] as const) await notifyTelegram("test-only", kind, { name: "Test_User", email: "test@example.com", detail: "Hello *there*" }, transport);
    expect(bodies.map(b => b.chat_id)).toEqual(["8480630530", "8480630530"]);
    expect(bodies.map(b => b.parse_mode)).toEqual(["Markdown", "Markdown"]);
    expect(bodies[0]?.text).toContain("Test\\_User");
    expect(bodies[1]?.text.endsWith("Go to Admin Panel to approve.")).toBe(true);
  });
  it("swallows transport and Telegram rejection failures", async () => {
    await expect(notifyTelegram(undefined, "cv", { name: "Test", email: "test@example.com", detail: "Test" })).resolves.toBeUndefined();
    await expect(notifyTelegram("test-only", "cv", { name: "Test", email: "test@example.com", detail: "Test" }, (async () => { throw new Error("offline"); }) as typeof fetch)).resolves.toBeUndefined();
  });
});