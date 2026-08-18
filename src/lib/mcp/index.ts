import { defineMcp } from "@lovable.dev/mcp-js";
import getProfile from "./tools/get-profile";
import listEducation from "./tools/list-education";
import listCertificates from "./tools/list-certificates";
import listDiary from "./tools/list-diary";
import listPosts from "./tools/list-posts";
import getPost from "./tools/get-post";

export default defineMcp({
  name: "aura-portfolio",
  title: "Aura Portfolio",
  version: "0.1.0",
  instructions:
    "Read-only tools for Shoibur Rahman's bilingual (English/Bengali) personal knowledge hub. " +
    "Use `get_profile` for bio and contact details, `list_education` and `list_certificates` for the " +
    "academic journey, `list_diary` for people, hobbies and quotes, and `list_posts` / `get_post` for " +
    "published research articles.",
  tools: [getProfile, listEducation, listCertificates, listDiary, listPosts, getPost],
});
