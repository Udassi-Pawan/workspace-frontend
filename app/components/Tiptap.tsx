"use client";
import { EditorContent } from "@tiptap/react";
import { Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import { HocuspocusProvider } from "@hocuspocus/provider";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import Heading from "@tiptap/extension-heading";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

let provider: any;

const Tiptap = (props: { id: string }) => {
  const [editor, setEditor] = useState<any>(null);
  // const { session: data } = useSession();
  useEffect(() => {
    provider = new HocuspocusProvider({
      url: `ws://127.0.0.1:1237/document/${props.id}`,
      name: props.id,
      token: "super-secret-token",
    });

    const _editor = new Editor({
      extensions: [
        Document,
        Paragraph,
        Text,
        Heading.configure({
          levels: [1, 2, 3],
        }),
        StarterKit.configure({
          // The Collaboration extension comes with its own history handling
          history: false,
          heading: {
            levels: [1, 2, 3],
          },
        }),
        // Register the document with Tiptap
        Collaboration.configure({
          document: provider.document,
        }),
      ],
      autofocus: true,
      editable: true,
      //   injectCSS: false,
    });
    setEditor(_editor);
  }, []);
  console.log(editor);
  return (
    <>
      {" "}
      {editor && (
        <div className="">
          <button
            onClick={() => editor?.chain().focus().toggleBold().run()}
            disabled={!editor?.can().chain().focus().toggleBold().run()}
            className={editor?.isActive("bold") ? "is-active" : ""}
          >
            bold
          </button>{" "}
          <EditorContent editor={editor} />;
        </div>
      )}
    </>
  );
};

export default Tiptap;
