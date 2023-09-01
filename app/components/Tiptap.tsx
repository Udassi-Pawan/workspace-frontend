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
// import * as Y from "yjs";

// import { WebrtcProvider } from "y-webrtc";

import * as Y from "yjs";
// import { WebsocketProvider } from "y-websocket";
import { useEffect } from "react";

const doc = new Y.Doc();

const provider = new HocuspocusProvider({
  url: "ws://127.0.0.1:1237",
  name: "example-document",
  token: "super-secret-token",
});

const editor = new Editor({
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
  content: "<p>Hello World! 🌎️</p>",
  autofocus: true,
  editable: true,
  //   injectCSS: false,
});

const Tiptap = () => {
  return (
    <>
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={editor.isActive("bold") ? "is-active" : ""}
      >
        bold
      </button>{" "}
      <EditorContent editor={editor} />;
    </>
  );
};

export default Tiptap;
