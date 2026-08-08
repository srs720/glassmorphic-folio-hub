import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "bn";

type Dict = Record<string, { en: string; bn: string }>;

export const T: Dict = {
  fullName: { en: "Shoibur Rahman", bn: "শোয়াইবুর রহমান" },
  tagline: { en: "Student · Full-stack web developer", bn: "শিক্ষার্থী · ফুল-স্ট্যাক ওয়েব ডেভেলপার" },

  // Nav
  nav_home: { en: "Home", bn: "হোম" },
  nav_journey: { en: "Journey", bn: "যাত্রা" },
  nav_people: { en: "People", bn: "মানুষজন" },
  nav_memories: { en: "Memories", bn: "স্মৃতি" },
  nav_certificates: { en: "Certificates", bn: "সার্টিফিকেট" },
  nav_posts: { en: "Research & Posts", bn: "গবেষণা ও পোস্ট" },
  nav_thoughts: { en: "Thoughts", bn: "ভাবনা" },
  nav_contact: { en: "Contact", bn: "যোগাযোগ" },
  menu: { en: "Menu", bn: "মেনু" },

  // Home
  home_kicker: { en: "A digital diary", bn: "একটি ডিজিটাল ডায়েরি" },
  home_greeting: { en: "Hey, I'm Shoibur Rahman.", bn: "হাই, আমি শোয়াইবুর রহমান।" },
  home_bio: {
    en: "Shoibur Rahman. Student of Darunnazat Siddikia Kamil Madrasah and passionate full-stack web developer.",
    bn: "শোয়াইবুর রহমান। দারুননাজাত সিদ্দিকিয়া কামিল মাদ্রাসার শিক্ষার্থী এবং একজন আগ্রহী ফুল-স্ট্যাক ওয়েব ডেভেলপার।",
  },
  home_cta_journey: { en: "My journey", bn: "আমার যাত্রা" },
  home_cta_memories: { en: "Peek at memories", bn: "স্মৃতিতে উঁকি দিন" },
  tile_journey_caption: { en: "10th grade & self-taught dev", bn: "দশম শ্রেণি ও স্ব-শিক্ষিত ডেভ" },
  tile_people_caption: { en: "Family, teachers & friends", bn: "পরিবার, শিক্ষক ও বন্ধু" },
  tile_memories_caption: { en: "Hobbies & travel", bn: "শখ ও ভ্রমণ" },
  profile_picture: { en: "profile picture", bn: "প্রোফাইল ছবি" },
  featured_memory: { en: "memory", bn: "স্মৃতি" },
  more_soon: { en: "More stories are being written — check back soon.", bn: "আরও গল্প লেখা হচ্ছে — শীঘ্রই আবার আসুন।" },
  open: { en: "open", bn: "খুলুন" },

  // Journey
  chapter_one: { en: "Chapter one", bn: "অধ্যায় এক" },
  journey_title: { en: "My education journey.", bn: "আমার শিক্ষার যাত্রা।" },
  journey_intro: {
    en: "A running log of where I've studied, what I'm learning now, and where I'd like to go next.",
    bn: "আমি কোথায় পড়েছি, এখন কী শিখছি এবং সামনে কোথায় যেতে চাই — তার একটি চলমান বিবরণ।",
  },
  edu_current: { en: "Right now", bn: "এখন" },
  edu_past: { en: "Where I've been", bn: "যেখানে ছিলাম" },
  edu_future: { en: "What's next", bn: "সামনে যা" },
  edu_cert: { en: "Certificates & self-study", bn: "সার্টিফিকেট ও স্ব-শিক্ষা" },
  timeline_soon: { en: "Timeline is being written.", bn: "টাইমলাইন লেখা হচ্ছে।" },

  // People
  chapter_two: { en: "Chapter two", bn: "অধ্যায় দুই" },
  people_title: { en: "The people in my story.", bn: "আমার গল্পের মানুষজন।" },
  people_intro: {
    en: "The ones who cheer me on, teach me, and keep the days warm.",
    bn: "যারা আমাকে উৎসাহ দেয়, শেখায় এবং দিনগুলোকে উষ্ণ রাখে।",
  },
  group_family: { en: "Family", bn: "পরিবার" },
  group_teachers: { en: "Teachers", bn: "শিক্ষকগণ" },
  group_friends: { en: "Close friends", bn: "ঘনিষ্ঠ বন্ধুরা" },
  people_soon: { en: "This chapter is being written.", bn: "এই অধ্যায় লেখা হচ্ছে।" },

  // Memories
  chapter_three: { en: "Chapter three", bn: "অধ্যায় তিন" },
  memories_title: { en: "Hobbies & memories.", bn: "শখ ও স্মৃতি।" },
  memories_intro: {
    en: "The small joys — building PCs, tinkering with code, and short trips that stick.",
    bn: "ছোট ছোট আনন্দ — পিসি বানানো, কোড নিয়ে খেলা, আর মনে গেঁথে থাকা ভ্রমণ।",
  },
  hobbies: { en: "Hobbies", bn: "শখ" },
  travel_memories: { en: "Travel memories", bn: "ভ্রমণের স্মৃতি" },
  memory_book_empty: { en: "Memory book is empty for now.", bn: "স্মৃতির খাতা এখন খালি।" },

  // Certificates
  chapter_four: { en: "Chapter four", bn: "অধ্যায় চার" },
  certificates_title: { en: "Certificates & achievements.", bn: "সার্টিফিকেট ও অর্জন।" },
  certificates_intro: {
    en: "Courses finished, contests joined, and milestones worth keeping.",
    bn: "সম্পন্ন করা কোর্স, অংশ নেওয়া প্রতিযোগিতা এবং রাখার মতো অর্জনগুলো।",
  },
  certificates_empty: { en: "Certificates are on the way.", bn: "সার্টিফিকেট শীঘ্রই আসছে।" },
  view_certificate: { en: "View certificate", bn: "সার্টিফিকেট দেখুন" },
  close: { en: "Close", bn: "বন্ধ করুন" },

  // Posts
  chapter_six: { en: "Chapter six", bn: "অধ্যায় ছয়" },
  posts_title: { en: "Research & posts.", bn: "গবেষণা ও পোস্ট।" },
  posts_intro: {
    en: "Articles, notes and research I publish as I learn.",
    bn: "শেখার পথে লেখা আমার প্রবন্ধ, নোট ও গবেষণা।",
  },
  posts_empty: { en: "First post is being written.", bn: "প্রথম পোস্টটি লেখা হচ্ছে।" },
  read_more: { en: "Read more", bn: "আরও পড়ুন" },
  back_home: { en: "Back to home", bn: "হোমে ফিরুন" },
  published_on: { en: "Published", bn: "প্রকাশিত" },
  post_not_found: { en: "This post could not be found.", bn: "এই পোস্টটি খুঁজে পাওয়া যায়নি।" },
  loading: { en: "Loading…", bn: "লোড হচ্ছে…" },

  // Thoughts
  chapter_five: { en: "Chapter five", bn: "অধ্যায় পাঁচ" },
  thoughts_title: { en: "Thoughts I keep close.", bn: "যে ভাবনাগুলো কাছে রাখি।" },
  thoughts_intro: {
    en: "A small collection of lines that keep me steady.",
    bn: "যে কথাগুলো আমাকে স্থির রাখে — তার ছোট্ট একটি সংগ্রহ।",
  },
  still_thinking: { en: "Still thinking.", bn: "এখনও ভাবছি।" },

  // Contact
  say_hello: { en: "Say hello", bn: "হ্যালো বলুন" },
  lets_talk: { en: "Let's talk.", bn: "চলুন কথা বলি।" },
  your_name: { en: "Your name", bn: "আপনার নাম" },
  your_email: { en: "Your email", bn: "আপনার ইমেইল" },
  message: { en: "Message", bn: "বার্তা" },
  name_placeholder: { en: "Shoibur's friend", bn: "শোয়াইবুরের বন্ধু" },
  msg_placeholder: { en: "Say hi, share thoughts, or ask anything.", bn: "হ্যালো বলুন, ভাবনা ভাগ করুন বা কিছু জিজ্ঞেস করুন।" },
  send_message: { en: "Send message", bn: "বার্তা পাঠান" },
  sending: { en: "Sending...", bn: "পাঠানো হচ্ছে..." },
  fill_all: { en: "Please fill in every field.", bn: "অনুগ্রহ করে সব ঘর পূরণ করুন।" },
  send_error: { en: "Couldn't send — please try again.", bn: "পাঠানো যায়নি — আবার চেষ্টা করুন।" },
  send_ok: { en: "Sent — thanks for saying hello.", bn: "পাঠানো হয়েছে — হ্যালো বলার জন্য ধন্যবাদ।" },
  prefer_other: { en: "Prefer another way?", bn: "অন্যভাবে যোগাযোগ চান?" },
  channels_note: { en: "Use any of the channels below — I read them all.", bn: "নিচের যেকোনো মাধ্যম ব্যবহার করুন — সবগুলোই আমি পড়ি।" },
  find_me_at: { en: "Find me at", bn: "আমাকে পাবেন এখানে" },
  share: { en: "Share", bn: "শেয়ার" },
  link_copied: { en: "Link copied to clipboard", bn: "লিংক কপি হয়েছে" },
  share_failed: { en: "Couldn't share this link.", bn: "লিংক শেয়ার করা যায়নি।" },

  // Post extras
  min_read: { en: "min read", bn: "মিনিট পড়া" },
  related_posts: { en: "Related posts", bn: "সম্পর্কিত পোস্ট" },

  // Ask-about-this-post chat
  chat_open: { en: "Ask about this post", bn: "এই পোস্ট নিয়ে জিজ্ঞেস করুন" },
  chat_title: { en: "Ask about this post", bn: "এই পোস্ট নিয়ে জিজ্ঞেস করুন" },
  chat_close: { en: "Close chat", bn: "চ্যাট বন্ধ করুন" },
  chat_hint: {
    en: "Ask anything about this article — answers come only from what's written here.",
    bn: "এই লেখাটি নিয়ে যা খুশি জিজ্ঞেস করুন — উত্তর কেবল এই লেখা থেকেই আসবে।",
  },
  chat_placeholder: { en: "Your question…", bn: "আপনার প্রশ্ন…" },
  chat_send: { en: "Send question", bn: "প্রশ্ন পাঠান" },
  chat_thinking: { en: "Reading the article…", bn: "লেখাটি পড়া হচ্ছে…" },
  chat_error: { en: "Something went wrong — please try again.", bn: "কিছু ভুল হয়েছে — আবার চেষ্টা করুন।" },


  // Footer
  footer_note: { en: "Written from Bangladesh, with care.", bn: "যত্নের সাথে বাংলাদেশ থেকে লেখা।" },
};

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (key: keyof typeof T) => string };
const LangCtx = createContext<Ctx | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("shoibur_lang") as Lang | null;
      if (saved === "en" || saved === "bn") setLangState(saved);
    } catch {}
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    try { window.localStorage.setItem("shoibur_lang", l); } catch {}
    if (typeof document !== "undefined") document.documentElement.lang = l === "bn" ? "bn" : "en";
  };

  const t = (key: keyof typeof T) => (T[key] ? T[key][lang] : String(key));
  return <LangCtx.Provider value={{ lang, setLang, t }}>{children}</LangCtx.Provider>;
}

/** Bilingual field picker: falls back to English when the Bengali value is empty. */
export function pickLang(row: any, key: string, lang: Lang): string {
  if (!row) return "";
  if (lang === "bn") return (row[`${key}_bn`] || row[key] || "") as string;
  return (row[key] || "") as string;
}

export function useLang() {
  const ctx = useContext(LangCtx);
  if (!ctx) return { lang: "en" as Lang, setLang: () => {}, t: (k: keyof typeof T) => T[k]?.en ?? String(k) };
  return ctx;
}
