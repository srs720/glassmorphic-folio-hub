import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { serverPublicClient } from "@/lib/public-content.functions";

export type CrmCalendar = {
  birthdays: Array<{ id: string; name: string; name_bn: string | null; slug: string; relation: string | null; relation_bn: string | null; photo_path: string | null }>;
  events: Array<{ id: string; title: string; title_bn: string | null; description: string | null; description_bn: string | null; event_date: string; event_time: string | null }>;
};

/** Public read-only CRM calendar (today's birthdays + public events, Asia/Dhaka). */
export const getPublicCrmCalendar = createServerFn({ method: "GET" }).handler(async (): Promise<CrmCalendar> => {
  const sb = serverPublicClient();
  const { data, error } = await (sb.rpc as any)("get_public_crm_calendar");
  if (error || !data) return { birthdays: [], events: [] };
  return { birthdays: data.birthdays ?? [], events: data.events ?? [] };
});

/** Public read-only shared CRM profile by slug (null when private or missing). */
export const getPublicCrmProfile = createServerFn({ method: "GET" })
  .validator((data: { slug: string }) => z.object({ slug: z.string().min(1).max(120) }).parse(data))
  .handler(async ({ data }) => {
    const sb = serverPublicClient();
    const { data: profile, error } = await (sb.rpc as any)("get_public_crm_profile", { _slug: data.slug });
    if (error || !profile) return null;
    return profile as {
      id: string; name: string; name_bn: string | null; slug: string;
      relation: string | null; relation_bn: string | null; dob: string | null;
      hobbies: string | null; hobbies_bn: string | null; bio: string | null;
      bio_bn: string | null; photo_path: string | null;
    };
  });
