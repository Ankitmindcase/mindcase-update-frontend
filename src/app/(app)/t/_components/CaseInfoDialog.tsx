"use client";

import { useState } from "react";
import { Courier_Prime } from "next/font/google";

import { Box } from "@radix-ui/themes";
import { Dialog, DialogContent2, DialogTrigger } from "@/components/ui/dialog";

const courier = Courier_Prime({
  subsets: ["latin"],
  weight: "400",
});

interface Props {
  children: JSX.Element;
  caseInfo: {
    category: string;
    fileID: string;
    pdf_link: string;
    court: string | null;
  };
}
export function CasesInformationDialog({ children, caseInfo }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={(e) => setOpen(e)} modal>
      <DialogTrigger>{children}</DialogTrigger>
      <DialogContent2 className="h-[90%] w-[90%] md:min-w-[640px] lg:min-w-[920px] 2xl:min-w-[1280px]">
        <Box className={courier.className + "w-full h-full"}>
          {caseInfo.category === "Acts" && (
            <iframe
              loading="lazy"
              src={caseInfo.pdf_link}
              width="100%"
              height="100%"
            />
          )}
          {caseInfo.category === "CaseLaws" && (
            <iframe
              loading="lazy"
              src={caseInfo.pdf_link}
              width="100%"
              height="100%"
            />
          )}
        </Box>
      </DialogContent2>
    </Dialog>
  );
}
