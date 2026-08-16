import { supabase } from "@/integrations/supabase/client";

export const BUCKET = "portfolio-assets";

const EXPIRES = 3600;
// path -> { url, expiresAt } so repeated renders never re-sign the same object.
const cache = new Map<string, { url: string; expiresAt: number }>();
const inflight = new Map<string, Promise<string | null>>();

export async function getSignedUrl(
  path: string | null | undefined,
  expiresIn = EXPIRES,
): Promise<string | null> {
  if (!path) return null;

  const hit = cache.get(path);
  if (hit && hit.expiresAt > Date.now()) return hit.url;

  const pending = inflight.get(path);
  if (pending) return pending;

  const p = (async () => {
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, expiresIn);
    inflight.delete(path);
    if (error || !data?.signedUrl) return null;
    cache.set(path, { url: data.signedUrl, expiresAt: Date.now() + (expiresIn - 60) * 1000 });
    return data.signedUrl;
  })();

  inflight.set(path, p);
  return p;
}

export async function uploadFile(file: File, folder: string): Promise<string> {
  const ext = file.name.split(".").pop() ?? "bin";
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;
  return path;
}

export async function deleteFile(path: string | null | undefined) {
  if (!path) return;
  cache.delete(path);
  await supabase.storage.from(BUCKET).remove([path]);
}
