import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  Bold, Italic, List, ListOrdered, Heading2, Heading3, Quote, Undo, Redo, Image as ImageIcon, Link2,
} from "lucide-react";
import { uploadFile, getSignedUrl } from "@/lib/portfolio";

function Btn({ active, onClick, title, children }: { active?: boolean; onClick: () => void; title: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={
        "inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border transition " +
        (active ? "bg-foreground text-background" : "bg-white hover:bg-surface-2")
      }
    >
      {children}
    </button>
  );
}

export function RichTextEditor({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Image.configure({ inline: false }),
      Link.configure({ openOnClick: false, autolink: true }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "prose-editor min-h-[240px] w-full rounded-xl border border-border bg-white px-4 py-3 text-sm focus:outline-none",
      },
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  async function onPickImage(file: File | null) {
    if (!file || !editor) return;
    try {
      const path = await uploadFile(file, "posts");
      const url = await getSignedUrl(path, 60 * 60 * 24 * 365);
      if (!url) throw new Error("no url");
      editor.chain().focus().setImage({ src: url, alt: file.name }).run();
    } catch {
      toast.error("Image upload failed");
    }
  }

  if (!editor) return <div className="min-h-[240px] rounded-xl border border-border bg-white" />;

  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap gap-1.5">
        <Btn title="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}><Bold className="h-3.5 w-3.5" /></Btn>
        <Btn title="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic className="h-3.5 w-3.5" /></Btn>
        <Btn title="Heading 2" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 className="h-3.5 w-3.5" /></Btn>
        <Btn title="Heading 3" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}><Heading3 className="h-3.5 w-3.5" /></Btn>
        <Btn title="Bullet list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}><List className="h-3.5 w-3.5" /></Btn>
        <Btn title="Numbered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered className="h-3.5 w-3.5" /></Btn>
        <Btn title="Quote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}><Quote className="h-3.5 w-3.5" /></Btn>
        <Btn title="Insert image" onClick={() => fileRef.current?.click()}><ImageIcon className="h-3.5 w-3.5" /></Btn>
        <Btn
          title="Link"
          active={editor.isActive("link")}
          onClick={() => {
            const url = window.prompt("Link URL", editor.getAttributes("link").href ?? "https://");
            if (url === null) return;
            if (url === "") editor.chain().focus().unsetLink().run();
            else editor.chain().focus().setLink({ href: url }).run();
          }}
        ><Link2 className="h-3.5 w-3.5" /></Btn>
        <Btn title="Undo" onClick={() => editor.chain().focus().undo().run()}><Undo className="h-3.5 w-3.5" /></Btn>
        <Btn title="Redo" onClick={() => editor.chain().focus().redo().run()}><Redo className="h-3.5 w-3.5" /></Btn>
      </div>
      {placeholder && !editor.getText() && (
        <p className="text-xs text-muted-foreground">{placeholder}</p>
      )}
      <EditorContent editor={editor} />
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { onPickImage(e.target.files?.[0] ?? null); e.target.value = ""; }}
      />
    </div>
  );
}
