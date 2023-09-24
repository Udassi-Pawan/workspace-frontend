"use client";
import { EditorContent, useEditor } from "@tiptap/react";
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
import { Menubar } from "@/app/components/menubar";
import Color from "@tiptap/extension-color";
import TextStyle from "@tiptap/extension-text-style";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import juice from "juice";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import ListItem from "@tiptap/extension-list-item";
import Table from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import Gapcursor from "@tiptap/extension-gapcursor";
import Highlight from "@tiptap/extension-highlight";
import { MenuBar } from "@/app/tiptap/page";
let provider: any;

const Tiptap = ({ params }: { params: { docId: string } }) => {
  const [editor, setEditor] = useState<any>(null);
  const { data: session } = useSession();
  provider = new HocuspocusProvider({
    url: `ws://127.0.0.1:1237/document/${params.docId}`,
    name: params.docId,
    token: "super",
  });

  const initiatliseEditor = function () {
    const _editor = new Editor({
      extensions: [
        TextStyle.configure({ types: [ListItem.name] } as any),
        Color.configure({ types: [TextStyle.name, ListItem.name] }),
        Document,
        Paragraph,
        Highlight,
        Text,
        Gapcursor,
        Table.configure({
          resizable: true,
        }),
        TableRow,
        TableHeader,
        TableCell,
        Heading.configure({
          levels: [1, 2, 3],
        }),
        StarterKit.configure({
          // The Collaboration extension comes with its own history handling
          history: false,
          heading: {
            levels: [1, 2, 3],
          },
          bulletList: {
            keepMarks: true,
            keepAttributes: false, // TODO : Making this as `false` becase marks are not preserved when I try to preserve attrs, awaiting a bit of help
          },
          orderedList: {
            keepMarks: true,
            keepAttributes: false, // TODO : Making this as `false` becase marks are not preserved when I try to preserve attrs, awaiting a bit of help
          },
        }),
        TextAlign.configure({
          types: ["heading", "paragraph"],
        }),
        Underline.configure({
          HTMLAttributes: {
            class: "my-custom-class",
          },
        }),
        CollaborationCursor.configure({
          provider,
          user: {
            name: session?.user?.name,
            color: "#f783ac",
          },
        }),
        Collaboration.configure({
          document: provider.document,
        }),
      ],
      autofocus: true,
      editable: true,
      editorProps: {
        attributes: {
          class: "m-2 focus:outline-none",
        },
      },
    });
    setEditor(_editor);
  };

  useEffect(() => {
    console.log("now requestting ,", params.docId);
    provider = new HocuspocusProvider({
      url: `ws://127.0.0.1:1237/document/${params.docId}`,
      name: params.docId,
      token: "super",
    });
    if (session) {
      initiatliseEditor();
    }
  }, [session]);
  return (
    <div className="w-full border-black border-4 rounded-2xl">
      <MenuBar editor={editor} />
      <EditorContent
        className="w-full p-3 max-h-[600px] overflow-auto"
        editor={editor}
      />
    </div>
  );
};

export default Tiptap;
