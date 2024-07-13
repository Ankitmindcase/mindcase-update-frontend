"use client";

import { ReactNode, useEffect, useState } from "react";
import { useSelectedLayoutSegment } from "next/navigation";

import { Box } from "@radix-ui/themes";
import { ChatView } from "./_components/CaseView";
import { SidebarLeft } from "./_components/SidebarLeft";
import { SidebarRight } from "./_components/SidebarRight";
import { useRootStore } from "@/providers/RootProvider";
// import { getLocalStorage } from "@/lib/utils";
// import UserDetailsForm from "./_components/userDetailform";

export default function ThreadsLayout({}: { children: ReactNode }) {
  const threadId = useSelectedLayoutSegment();
  const [checked, setChecked] = useState(false);
  const { setWorkspaceId, workspaces, workspaceId } = useRootStore(
    (state) => state
  );

  useEffect(() => {
    // const ls = getLocalStorage();
    // const prevId = ls.getItem("workspaceId");

    if (!threadId && workspaces.length) {
      // if (prevId) {
      //   const founded = workspaces.find((w) => w.id === prevId);
      //   founded && setWorkspaceId(founded.id);
      //   ls.removeItem("workspaceId");
      //   return;
      // }
      if (workspaceId !== workspaces[0].id) {
        setWorkspaceId(workspaces[0].id);
      }
    } else {
      // TODO: handle case of no workspace of user
      if (workspaceId !== "260b11de-b226-473d-96ed-11f5ad4abd5b") {
        setWorkspaceId("260b11de-b226-473d-96ed-11f5ad4abd5b");
      }
    }
  }, [setWorkspaceId, threadId, workspaceId, workspaces]);

  return (
    <Box className="h-full w-full flex relative">
      {/* <UserDetailsForm /> */}
      <SidebarLeft checked={checked} setChecked={setChecked} />
      <ChatView checked={checked} />
      {/* <SidebarRight /> */}
    </Box>
  );
}
