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
import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import "./DocById.scss";
import Color from "@tiptap/extension-color";
import TextStyle from "@tiptap/extension-text-style";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import ListItem from "@tiptap/extension-list-item";
import Table from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import Gapcursor from "@tiptap/extension-gapcursor";
import Highlight from "@tiptap/extension-highlight";
import { MenuBar } from "./Tiptap";
import { toast } from "react-toastify";
let provider: any;
const niceColors = [
  "#FF5733",
  "#33FF57",
  "#5733FF",
  "#FF33A1",
  "#33A1FF",
  "#A1FF33",
  "#FF33E8",
  "#33E8FF",
  "#E8FF33",
  "#FF3367",
  "#3367FF",
  "#67FF33",
  "#FF33FF",
  "#33FFFF",
  "#FFFF33",
  "#3367A1",
];
function getColorForName(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  const index = Math.abs(hash % niceColors.length);
  return niceColors[index];
}
const DocById = ({ docId, docName }: { docId: string; docName: string }) => {
  const [editor, setEditor] = useState<any>(null);
  const { data: session } = useSession();
  provider = new HocuspocusProvider({
    url: `${process.env.NEXT_PUBLIC_COLLAB_SERVER}/document/${docId}`,
    name: docId,
    token: process.env.NEXT_PUBLIC_COLLAB_SECRET,
  });

  const initiatliseEditor = useCallback(
    function () {
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
            history: false,
            heading: {
              levels: [1, 2, 3],
            },
            bulletList: {
              keepMarks: true,
              keepAttributes: false,
            },
            orderedList: {
              keepMarks: true,
              keepAttributes: false,
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
              color: getColorForName(session?.user?.name!),
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
    },
    [session?.user?.name]
  );

  useEffect(() => {
    provider = new HocuspocusProvider({
      url: `${process.env.NEXT_PUBLIC_COLLAB_SERVER}/document/${docId}`,
      name: docId,
      token: process.env.NEXT_PUBLIC_COLLAB_SECRET,
    });
    if (session) {
      initiatliseEditor();
    }
  }, [session?.authToken, docId, initiatliseEditor]);

  return (
    <div className="flex flex-col border-primary border-4 rounded-2xl">
      <div className="py-1 px-2  bg-gray-200 rounded-xl text-black">
        <p className="text-xl text-center font-bold">{docName + ".wdox"}</p>
      </div>{" "}
      <div style={{ overflowX: "auto" }}>
        <MenuBar editor={editor} />
      </div>
      <EditorContent editor={editor} />
    </div>
  );
};

export default DocById;
