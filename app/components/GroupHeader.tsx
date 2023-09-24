"use client";
import React, { useEffect, useState } from "react";

export interface pageProps {
  groupName: string;
  children: React.ReactNode;
  page: string;
  groupId: string;
}

import Image from "next/image";
import { useTheme } from "next-themes";
import { Button } from "@/shardcn/components/ui/button";
import Link from "next/link";
import Chat from "./Chat";
import GroupDrive from "./GroupDrive";

export default function GroupHeader({
  groupName,
  groupId,
  children,
  page,
}: pageProps) {
  
  return (
      );
}
