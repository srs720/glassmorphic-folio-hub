import { createFileRoute, Link } from "@tanstack/react-router";
import { getPublicCrmProfile } from "@/lib/crm.functions";
import { SiteLayout } from "@/components/SiteLayout";
import { SignedImage } from "@/components/SignedImage";
import { ShareButton } from "@/components/ShareButton";
import { useLang } from "@/lib/i18n";

export const Route = createFileRoute("/p/$slug")({
  loader: ({ params }) => getPublicCrmProfile({ data: { slug: params.slug } }),
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug} | Shoibur Rahman` },
      { name: "description", content: `A shared profile from Shoibur Rahman's personal site.` },
      { property: "og:title", content: `Profile | Shoibur Rahman` },
      { property: "og:description", content: `A shared profile from Shoibur Rahman's personal site.` },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const profile = Route.useLoaderData() as Awaited<ReturnType<typeof getPublicCrmProfile>>;
  const { lang } = useLang();
  const name = profile ? (lang === "bn" && profile.name_bn ? profile.name_bn : profile.name) : "";
  const relation = profile ? (lang === "bn" && profile.relation_bn ? profile.relation_bn : profile.relation) : "";
  const bio = profile ? (lang === "bn" && profile.bio_bn ? profile.bio_bn : profile.bio) : "";
  const hobbies = profile ? (lang === "bn" && profile.hobbies_bn ? profile.hobbies_bn : profile.hobbies) : "";
  const dayMonth = profile?.dob
    ? new Date(`${profile.dob}T00:00:00`).toLocaleDateString(lang === "bn" ? "bn-BD" : "en-GB", {
        day: "numeric", month: "long",
      })
    : null;

  return (
    <SiteLayout>
      <section className="mx-auto max-w-3xl px-4 md:px-6 py-16 md:py-24">
        {!profile ? (
          <div className="bento p-10 text-center">
            <h1 className="font-display text-3xl">{lang === "bn" ? "প্রোফাইল পাওয়া যায়নি" : "Profile not found"}</h1>
            <p className="mt-2 text-muted-foreground">
              {lang === "bn"
                ? "এই প্রোফাইলটি নিজে থেকে শেয়ার করা হয়নি।"
                : "This profile is not shared publicly."}
            </p>
            <Link to="/" className="btn-primary mt-6 inline-flex">{lang === "bn" ? "হোমে ফিরে যান" : "Back to home"}</Link>
          </div>
        ) : (
          <div className="bento p-6 md:p-10 text-center">
            <div className="mx-auto h-36 w-36 rounded-full overflow-hidden border border-border bg-surface-2">
              {profile.photo_path ? (
                <SignedImage
                  path={profile.photo_path}
                  alt={`${name} — shared profile of Shoibur Rahman`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="grid h-full w-full place-items-center font-display text-5xl text-foreground/40">
                  {name.charAt(0)}
                </div>
              )}
            </div>
            <h1 className="mt-6 font-display text-4xl md:text-5xl tracking-tight">{name}</h1>
            {relation && <p className="label-mono mt-2">{relation}</p>}
            {dayMonth && (
              <p className="mt-1 text-sm text-muted-foreground">
                🎂 {lang === "bn" ? "জন্মদিন" : "Birthday"}: {dayMonth}
              </p>
            )}
            {bio && <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-foreground/80">{bio}</p>}
            {hobbies && (
              <p className="mt-3 text-sm text-muted-foreground">
                {lang === "bn" ? "শখ" : "Hobbies"}: {hobbies}
              </p>
            )}
            <div className="mt-8 flex justify-center">
              <ShareButton
                label
                title={name}
                text={relation ? `${name} — ${relation}` : name}
                url={`/p/${profile.slug}`}
              />
            </div>
          </div>
        )}
      </section>
    </SiteLayout>
  );
}
