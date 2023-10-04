"use client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shardcn/components/ui/alert-dialog";
import { ReactNode, createContext, useState } from "react";

const AlertContext = createContext<any>(null);

export default function AlertProvider({ children }: { children: ReactNode }) {
  const [dialogueText, setDialogueText] = useState<string>("");
  return (
    <AlertContext.Provider value={{ setDialogueText }}>
      <div className="relative">
        <div className="absolute">
          <AlertDialog open={dialogueText != ""}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Alert</AlertDialogTitle>
                <AlertDialogDescription>{dialogueText}</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogAction onClick={() => setDialogueText("")}>
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        {children}
      </div>
    </AlertContext.Provider>
  );
}

export { AlertContext };
