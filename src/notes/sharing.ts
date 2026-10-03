import type { Metadata } from "next";
import type { Note } from "./model";

const SITE_URL = "https://myblackcat913.com";

function excerpt(value: string, limit: number) {
  const characters = Array.from(value.replace(/\s+/g, " ").trim());
  return characters.length > limit ? `${characters.slice(0, limit - 1).join("")}…` : characters.join("");
}

export function publicNoteUrl(id: string) {
  return `${SITE_URL}/notes/${encodeURIComponent(id)}`;
}

export function xShareUrl(note: Pick<Note, "id" | "title" | "body">) {
  // Leave room for the URL even when every character is Japanese or an emoji.
  const text = excerpt(note.title.trim() || note.body, 100);
  const query = new URLSearchParams({ text, url: publicNoteUrl(note.id) });
  return `https://twitter.com/intent/tweet?${query.toString()}`;
}

export function noteMetadata(note: Note): Metadata {
  const title = `${excerpt(note.title.trim() || note.body, 60)} | Notes`;
  const description = excerpt(note.body, 160);
  const image = `${SITE_URL}/icons/icon-512x512.png`;
  return {
    title,
    description,
    alternates: { canonical: publicNoteUrl(note.id) },
    openGraph: {
      type: "article",
      locale: "ja_JP",
      siteName: "くろねこ。の実験室",
      title,
      description,
      url: publicNoteUrl(note.id),
      publishedTime: note.createdAt,
      images: [{ url: image, width: 512, height: 512, type: "image/png", alt: "くろねこ。の実験室" }],
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: [{ url: image, alt: "くろねこ。の実験室" }],
    },
  };
}
