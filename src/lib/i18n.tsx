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
  nav_diary: { en: "Food Diary", bn: "খাদ্য ডায়েরি" },
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
  tile_diary_caption: { en: "Pizza, pasta & more", bn: "পিজ্জা, পাস্তা ও আরও" },
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

  // Diary
  chapter_four: { en: "Chapter four", bn: "অধ্যায় চার" },
  diary_title: { en: "A little food diary.", bn: "ছোট্ট একটি খাদ্য ডায়েরি।" },
  diary_intro: {
    en: "The dishes I keep coming back to, with a small note on each.",
    bn: "যে খাবারগুলোতে বারবার ফিরে যাই, প্রতিটির সাথে ছোট্ট একটি নোট।",
  },
  still_tasting: { en: "Still tasting.", bn: "এখনও চেখে দেখছি।" },

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
  coming_soon: { en: "Coming soon.", bn: "শীঘ্রই আসছে।" },

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

export function useLang() {
  const ctx = useContext(LangCtx);
  if (!ctx) return { lang: "en" as Lang, setLang: () => {}, t: (k: keyof typeof T) => T[k]?.en ?? String(k) };
  return ctx;
}
