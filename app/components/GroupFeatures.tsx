import { Button } from "@/shardcn/components/ui/button";
import React from "react";

export interface GroupFeaturesProps {}
export default function GroupFeatures({}: GroupFeaturesProps) {
  return (
    <div className="flex flex-col">
      <Button>Draw</Button>
      <Button>Docs</Button>
      <Button>Drive</Button>
    </div>
  );
}
