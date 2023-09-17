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
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import "./page.scss";
let provider: any;

const Tiptap = ({ params }: { params: { docId: string } }) => {
  const [editor, setEditor] = useState<any>(null);
  const { data: session } = useSession();
  console.log(session?.user.name);
  useEffect(() => {
    console.log("now requestting ,", params.docId);
    provider = new HocuspocusProvider({
      url: `ws://127.0.0.1:1237/document/${params.docId}`,
      name: params.docId,
      token: "super",
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
        CollaborationCursor.configure({
          provider,
          user: {
            name: session?.user.name,
            color: "#f783ac",
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
  }, [session]);
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
