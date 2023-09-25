"use client";
import React, { useEffect, useState } from "react";
import DocById from "../../components/DocById";
import axios from "axios";

export interface pageProps {
  params: {
    docId: string;
  };
}
export default function page({ params }: pageProps) {
  const [docName, setDocName] = useState<string | null>(null);
  async function getDocName() {
    const { data } = await axios.get(
      "http://localhost:3333/doc/single/" + params.docId
    );
    setDocName(data.name);
  }
  useEffect(() => {
    getDocName();
  }, []);
  return <>{docName && <DocById docId={params.docId} docName={docName} />}</>;
}
