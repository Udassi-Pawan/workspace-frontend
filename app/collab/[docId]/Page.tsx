"use client";
import React, { useCallback, useEffect, useState } from "react";
import DocById from "../../components/DocById";
import axios from "axios";

export interface pageProps {
  params: {
    docId: string;
  };
}
export default function Page({ params }: pageProps) {
  const [docName, setDocName] = useState<string | null>(null);
  const getDocName = useCallback(async () => {
    try {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/doc/single/` + params.docId
      );
      setDocName(data.name);
    } catch (error) {
      // Handle errors if the GET request fails
      console.error("Error fetching document name:", error);
    }
  }, [params.docId, setDocName]);
  useEffect(() => {
    getDocName();
  }, [getDocName]);
  return <>{docName && <DocById docId={params.docId} docName={docName} />}</>;
}
