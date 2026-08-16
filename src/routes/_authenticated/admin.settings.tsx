import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Upload, Save, Plus, Trash2, Pencil, X, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { uploadFile, deleteFile, getSignedUrl } from "@/lib/portfolio";
import { SignedImage } from "@/components/SignedImage";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  component: SettingsAdmin,
});


function SettingsAdmin() {
  return (
    <div className="grid gap-6">
      <SettingsForm />
    </div>
  );
}

function SettingsForm() {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["site_settings_admin"],
    queryFn: async () => {
      const { data } = await supabase.from("site_settings").select("*").limit(1).maybeSingle();
      return data;
    },
  });

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [tagline, setTagline] = useState("");
  const [location, setLocation] = useState("");
  const [education, setEducation] = useState("");
  const [experience, setExperience] = useState("");
  const [greeting, setGreeting] = useState("");
  const [identityLine, setIdentityLine] = useState("");
  const [nameBn, setNameBn] = useState("");
  const [bioBn, setBioBn] = useState("");
  const [taglineBn, setTaglineBn] = useState("");
  const [greetingBn, setGreetingBn] = useState("");
  const [identityLineBn, setIdentityLineBn] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [sliderFiles, setSliderFiles] = useState<File[]>([]);
  const [sliderImages, setSliderImages] = useState<string[]>([]);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (q.data) {
      setName(q.data.name);
      setBio(q.data.bio);
      setTagline(q.data.tagline ?? "");
      setLocation(q.data.location ?? "");
      setEducation(q.data.education ?? "");
      setExperience(q.data.experience ?? "");
      setGreeting((q.data as any).greeting ?? "");
      setIdentityLine((q.data as any).identity_line ?? "");
      setNameBn((q.data as any).name_bn ?? "");
      setBioBn((q.data as any).bio_bn ?? "");
      setTaglineBn((q.data as any).tagline_bn ?? "");
      setGreetingBn((q.data as any).greeting_bn ?? "");
      setIdentityLineBn((q.data as any).identity_line_bn ?? "");
      setSliderImages(((q.data as any).slider_images ?? []) as string[]);
      getSignedUrl(q.data.resume_path).then(setResumeUrl);
    }
  }, [q.data]);

  async function removeSlider(path: string) {
    const next = sliderImages.filter((p) => p !== path);
    // Persist first so the DB never points at a deleted object.
    if (q.data) {
      const { error } = await supabase
        .from("site_settings")
        .update({ slider_images: next } as any)
        .eq("id", q.data.id);
      if (error) { toast.error("Could not remove image"); return; }
    }
    await deleteFile(path);
    setSliderImages(next);
    qc.invalidateQueries({ queryKey: ["site_settings_admin"] });
    qc.invalidateQueries({ queryKey: ["site_settings"] });
    toast.success("Image removed");
  }


  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!q.data) return;
    setSaving(true);
    try {
      let resume_path = q.data.resume_path;
      let avatar_path = q.data.avatar_path;
      let logo_path = (q.data as any).logo_path;
      let hero_image_path = (q.data as any).hero_image_path;
      let slider_images = [...sliderImages];
      if (resumeFile) {
        if (q.data.resume_path) await deleteFile(q.data.resume_path);
        resume_path = await uploadFile(resumeFile, "resume");
      }
      if (avatarFile) {
        if (q.data.avatar_path) await deleteFile(q.data.avatar_path);
        avatar_path = await uploadFile(avatarFile, "avatar");
      }
      if (logoFile) {
        if (logo_path) await deleteFile(logo_path);
        logo_path = await uploadFile(logoFile, "logo");
      }
      if (heroFile) {
        if (hero_image_path) await deleteFile(hero_image_path);
        hero_image_path = await uploadFile(heroFile, "hero");
      }
      if (sliderFiles.length) {
        const uploaded = await Promise.all(sliderFiles.map((f) => uploadFile(f, "slider")));
        slider_images = [...slider_images, ...uploaded];
      }
      const { error } = await supabase.from("site_settings")
        .update({
          name: name.trim(), bio: bio.trim(), tagline, location, education, experience,
          resume_path, avatar_path, logo_path,
          greeting, identity_line: identityLine, hero_image_path,
          slider_images,
          name_bn: nameBn || null, bio_bn: bioBn || null, tagline_bn: taglineBn || null,
          greeting_bn: greetingBn || null, identity_line_bn: identityLineBn || null,
        } as any)
        .eq("id", q.data.id);
      if (error) throw error;
      toast.success("Settings saved");
      qc.invalidateQueries({ queryKey: ["site_settings_admin"] });
      qc.invalidateQueries({ queryKey: ["site_settings"] });
      setResumeFile(null); setAvatarFile(null); setHeroFile(null); setLogoFile(null); setSliderFiles([]);
    } catch (err) {
      console.error(err);
      toast.error("Save failed");
    } finally { setSaving(false); }
  }

  return (
    <form onSubmit={onSubmit} className="glass-strong p-6 grid gap-3">
      <div>
        <h2 className="text-xl font-bold">Site settings</h2>
        <p className="text-sm text-muted-foreground">Your name, bio, profile picture, and resume.</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="h-20 w-20 rounded-full overflow-hidden ring-2 ring-white/70 bg-gradient-to-br from-mint to-emerald-soft flex items-center justify-center">
          {q.data?.avatar_path ? (
            <SignedImage path={q.data.avatar_path} alt="avatar" className="h-full w-full object-cover" />
          ) : (
            <span className="text-2xl font-bold text-white/90">{(q.data?.name ?? "S").charAt(0)}</span>
          )}
        </div>
        <label className="glass-input flex items-center gap-3 px-4 py-2.5 text-sm cursor-pointer flex-1">
          <Upload className="h-4 w-4 text-primary" />
          <span className="text-muted-foreground truncate">
            {avatarFile ? avatarFile.name : q.data?.avatar_path ? "Replace profile picture" : "Upload profile picture"}
          </span>
          <input type="file" accept="image/*" className="hidden" onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)} />
        </label>
      </div>

      <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Header logo (SR mark shown in navbar)</label>
      <div className="flex items-center gap-3">
        <div className="h-14 w-14 rounded-2xl overflow-hidden bg-white ring-1 ring-border shadow-sm flex items-center justify-center shrink-0">
          {(q.data as any)?.logo_path ? (
            <SignedImage path={(q.data as any).logo_path} alt="logo" className="h-full w-full object-cover" />
          ) : (
            <span className="font-display text-sm font-bold text-[#0E2A3F]">SR</span>
          )}
        </div>
        <label className="glass-input flex items-center gap-3 px-4 py-2.5 text-sm cursor-pointer flex-1">
          <Upload className="h-4 w-4 text-primary" />
          <span className="text-muted-foreground truncate">
            {logoFile ? logoFile.name : (q.data as any)?.logo_path ? "Replace logo" : "Upload logo (PNG/SVG)"}
          </span>
          <input type="file" accept="image/*" className="hidden" onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)} />
        </label>
      </div>

      <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Hero slider images (auto-play background)</label>
      {sliderImages.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {sliderImages.map((p) => (
            <div key={p} className="relative aspect-square rounded-xl overflow-hidden border border-border bg-surface-2 group">
              <SignedImage path={p} alt="slider" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removeSlider(p)}
                className="absolute top-1 right-1 h-7 w-7 rounded-full bg-black/70 text-white flex items-center justify-center shadow-md hover:bg-red-600 transition"
                aria-label="Remove image"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
      <label className="glass-input flex items-center gap-3 px-4 py-2.5 text-sm cursor-pointer">
        <Upload className="h-4 w-4 text-primary" />
        <span className="text-muted-foreground truncate">
          {sliderFiles.length ? `${sliderFiles.length} image(s) queued` : "Add slider images (multi-select)"}
        </span>
        <input
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => setSliderFiles(Array.from(e.target.files ?? []))}
        />
      </label>

      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Name (EN)"><input className="glass-input px-4 py-2.5 text-sm w-full" value={name} onChange={(e) => setName(e.target.value)} /></Field>
        <Field label="নাম (BN)"><input className="glass-input px-4 py-2.5 text-sm w-full" value={nameBn} onChange={(e) => setNameBn(e.target.value)} placeholder="শোয়াইবুর রহমান" /></Field>
      </div>
      <Field label="অভিবাদন / Greeting (BN)"><input className="glass-input px-4 py-2.5 text-sm w-full" value={greetingBn} onChange={(e) => setGreetingBn(e.target.value)} /></Field>
      <Field label="পরিচয় লাইন / Identity line (BN)"><input className="glass-input px-4 py-2.5 text-sm w-full" value={identityLineBn} onChange={(e) => setIdentityLineBn(e.target.value)} /></Field>
      <Field label="ট্যাগলাইন / Tagline (BN)"><input className="glass-input px-4 py-2.5 text-sm w-full" value={taglineBn} onChange={(e) => setTaglineBn(e.target.value)} /></Field>
      <Field label="বায়ো / Bio (BN)"><textarea className="glass-input px-4 py-2.5 text-sm w-full min-h-32" value={bioBn} onChange={(e) => setBioBn(e.target.value)} /></Field>
      <Field label="Greeting (shown on home hero)"><input className="glass-input px-4 py-2.5 text-sm w-full" value={greeting} onChange={(e) => setGreeting(e.target.value)} placeholder="Hey, I'm Shoibur." /></Field>
      <Field label="Identity line (footer)"><input className="glass-input px-4 py-2.5 text-sm w-full" value={identityLine} onChange={(e) => setIdentityLine(e.target.value)} placeholder="Student · Web developer · Curious mind" /></Field>
      <Field label="Tagline"><input className="glass-input px-4 py-2.5 text-sm w-full" value={tagline} onChange={(e) => setTagline(e.target.value)} /></Field>
      <Field label="Bio"><textarea className="glass-input px-4 py-2.5 text-sm w-full min-h-32" value={bio} onChange={(e) => setBio(e.target.value)} /></Field>
      <Field label="Location"><input className="glass-input px-4 py-2.5 text-sm w-full" value={location} onChange={(e) => setLocation(e.target.value)} /></Field>
      <p className="text-xs text-muted-foreground">
        Education timeline lives on the <strong>Education</strong> page. Phone, email and social links live on the <strong>Contact &amp; Socials</strong> page.
      </p>


      <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Hero image (large photo on home)</label>
      <label className="glass-input flex items-center gap-3 px-4 py-2.5 text-sm cursor-pointer">
        <Upload className="h-4 w-4 text-primary" />
        <span className="text-muted-foreground truncate">
          {heroFile ? heroFile.name : (q.data as any)?.hero_image_path ? "Replace hero image" : "Upload hero image"}
        </span>
        <input type="file" accept="image/*" className="hidden" onChange={(e) => setHeroFile(e.target.files?.[0] ?? null)} />
      </label>

      <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Resume / CV</label>
      <label className="glass-input flex items-center gap-3 px-4 py-2.5 text-sm cursor-pointer">
        <Upload className="h-4 w-4 text-primary" />
        <span className="text-muted-foreground truncate">
          {resumeFile ? resumeFile.name : q.data?.resume_path ? "Replace resume" : "Upload resume (PDF)"}
        </span>
        <input type="file" accept=".pdf,application/pdf" className="hidden" onChange={(e) => setResumeFile(e.target.files?.[0] ?? null)} />
      </label>
      {resumeUrl && (
        <a href={resumeUrl} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
          <FileText className="h-3.5 w-3.5" /> View current resume
        </a>
      )}
      <button type="submit" disabled={saving} className="btn-primary self-start mt-2 inline-flex items-center gap-2">
        <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save settings"}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
