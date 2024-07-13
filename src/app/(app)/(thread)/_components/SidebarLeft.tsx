"use client";

import Fuse from "fuse.js";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useRouter, useSelectedLayoutSegment } from "next/navigation";

import { Box, Flex, Text } from "@radix-ui/themes";
import { createClient } from "@/lib/supabase/client";
import { Times, cn, getLocalStorage } from "@/lib/utils";
import { getWorkspaceId } from "@/lib/db/workspaces";
import * as Switch from "@radix-ui/react-switch";
import { createNewThread, getThreadsByUser } from "@/lib/db/threads";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Toggle } from "@/components/ui/toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenuShortcut } from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import MainNav from "@/components/header/Logo";
import Profile from "@/components/sidebar/profileDropdown";

import {
  ChatBubbleLeftEllipsisIcon,
  MagnifyingGlassIcon,
  FolderOpenIcon,
  ChevronDownIcon,
  PlusCircleIcon,
} from "@heroicons/react/24/outline";
import {
  ArrowLeftCircleIcon,
  ArrowRightCircleIcon,
} from "@heroicons/react/24/solid";
import { Loader2Icon } from "lucide-react";

import { useAuthStore } from "@/providers/AuthProvider";
import { useRootStore } from "@/providers/RootProvider";
import { TimeSeparatedThreads } from "./TimeSeparateEle";
import { WorkspaceDialog } from "./WorkspaceDialog";

export function SidebarLeft({
  checked,
  setChecked,
}: {
  checked: boolean;
  setChecked: Dispatch<SetStateAction<boolean>>;
}) {
  const router = useRouter();
  const supabase = createClient();
  const threadId = useSelectedLayoutSegment();

  const {
    workspaceId,
    setWorkspaceId,
    newThreadLoading,
    setNewThreadLoading,
    loadThreads,
    fixedThreads,
    loadFixedThreads,
    threads,
  } = useRootStore((state) => state);
  const { user } = useAuthStore((state) => state);

  const [sidebar, setSidebar] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [showAllThread, setShowAllThread] = useState(true);
  const [isPending, setIsPending] = useState(true);

  // sets thread if not selected
  useEffect(() => {
    if (!threadId) {
      if (threads.length) {
        router.replace(`/${threads[0].id}`);
      }
    }
  }, [threadId, threads]);

  // sets workspaceId based on the current thread if already not set
  useEffect(() => {
    const setWorkspaceIdBasedOnThread = async () => {
      if (threadId) {
        const workspace = await getWorkspaceId(supabase, threadId);
        if (workspace) {
          workspaceId !== workspace && setWorkspaceId(workspace);
        } else {
          router.replace("/");
        }
      }
    };

    !workspaceId && setWorkspaceIdBasedOnThread();
  }, [threadId]);

  // sets available threads by workspace id
  useEffect(() => {
    const loadAllThreads = async () => {
      if (workspaceId) {
        setIsPending(true);
        // console.log("user", user);
        try {
          const threads = await getThreadsByUser(supabase, user?.id ?? "");
          console.log("threads", threads);

          loadThreads(threads);
          loadFixedThreads(threads);
          if (threads.length === 0) {
            // const thread = await createNewThread(supabase, {
            //   workspace_id: workspaceId,
            // });
            // if (!thread) {
            //   toast({
            //     title: "Failed creating new thread",
            //   });
            // } else {
            //   router.push("/t/" + thread.id);
            // }
          }
        } catch (error) {
          console.error(error);
        }
        setIsPending(false);
      }
      if (newThreadLoading) setNewThreadLoading(false);
    };

    loadAllThreads();
  }, [workspaceId, newThreadLoading]);

  const toggleSidebar = () => setSidebar(!sidebar);
  const handleNewThread = async () => {
    if (!workspaceId) {
      console.error("no workspaceId selected");
      return;
    }
    if (user) {
      setNewThreadLoading(true);
      const thread = await createNewThread(supabase, {
        title: "New Thread",
      });
      if (!thread) {
        console.error("failed creating new thread");
        return;
      }
      setNewThreadLoading(false);
      router.push("/" + thread.id);
    }
  };

  const handleWorkspaceChange = (val: string) => {
    loadThreads([]);
    loadFixedThreads([]);
    setWorkspaceId(val);
    // const ls = getLocalStorage();
    // ls.setItem("workspaceId", val);
    router.replace("/");
  };

  useEffect(() => {
    // hot keyboard implementation with debounce 3s
    const isMac = window.navigator.userAgent.includes("Apple");
    let lastPressAt = 0;
    const handleKeyboardAction = (e: globalThis.KeyboardEvent) => {
      e.stopImmediatePropagation();
      if (e.code === "KeyK" && (isMac ? e.metaKey : e.ctrlKey)) {
        const now = new Date().getTime();
        if (now - lastPressAt >= 3000) {
          handleNewThread();
        }
        lastPressAt = now;
      }
      if (e.code === "KeyE" && (isMac ? e.metaKey : e.ctrlKey) && e.shiftKey) {
        const now = new Date().getTime();
        if (now - lastPressAt >= 3000) {
          document.getElementById("thread-search-bar")?.focus();
        }
        lastPressAt = now;
      }
    };

    window.addEventListener("keydown", handleKeyboardAction);
    return () => window.removeEventListener("keydown", handleKeyboardAction);
  }, [workspaceId]);

  const WorkspaceSelectItems = ({ title, val }: any) => {
    return (
      <SelectItem value={val}>
        <Text>{title}</Text>
      </SelectItem>
    );
  };

  // const lastPressAt = useRef(0);

  useEffect(() => {
    const handleSearch = (searchText: string) => {
      const fuse = new Fuse(fixedThreads, {
        keys: ["title", "desciption", "created_at"],
      });
      const results = fuse.search(searchText);
      loadThreads(results.map((r) => r.item));
    };

    if (searchText.length) {
      /* const now = new Date().getTime();
      if (now - lastPressAt.current >= 3000) { */
      handleSearch(searchText);
      // }
      // lastPressAt.current = now;
    } else {
      loadThreads(fixedThreads);
    }
  }, [searchText, fixedThreads]);

  return (
    <Box
      className={cn(
        "relative h-full w-full flex flex-col md:max-w-[320px] border-r transition-all duration-500 bg-secondary text-sm",
        sidebar ? "shrink-0" : "ml-[-100%] md:ml-[-260px]"
      )}
    >
      <Box
        className={cn(
          "absolute top-11 z-10 left-[300px] transition-all duration-500",
          sidebar ? "" : "left-[270px] top-16 "
        )}
      >
        <Button
          size="icon"
          variant="link"
          onClick={toggleSidebar}
          className="p-0"
        >
          <ArrowLeftCircleIcon
            className={cn(
              "w-6 h-auto text-primary drop-shadow-lg",
              sidebar ? "" : "hidden opacity-0"
            )}
          />
          <ArrowRightCircleIcon
            className={cn(
              "w-6 h-auto text-primary drop-shadow-lg",
              sidebar ? "hidden opacity-0" : ""
            )}
          />
        </Button>
      </Box>
      <Box
        className={cn(
          sidebar ? "flex flex-col h-full w-full" : "hidden opacity-0"
        )}
      >
        {/* Workspace selection */}
        <Flex justify="between" align="center" className="p-4">
          <MainNav enableText={false} />
          <div className="flex items-center">
            <label
              className="Label"
              htmlFor="airplane-mode"
              style={{ paddingRight: 15 }}
            >
              {!checked ? "V1" : "V2"}
            </label>
            <Switch.Root
              checked={checked}
              onCheckedChange={() => setChecked((prev) => !prev)}
              className="SwitchRoot"
              id="airplane-mode"
            >
              <Switch.Thumb className="SwitchThumb" />
            </Switch.Root>
          </div>
          {/* <Select value={workspaceId} onValueChange={handleWorkspaceChange}>
            <SelectTrigger className="max-w-[70%] truncate self-end shadow-sm w-fit focus:ring-0 focus-visible:ring-0 font-medium text-md">
              <Box className=" flex space-x-2">
                <FolderOpenIcon className="w-4 h-auto" />
                <SelectValue
                  placeholder={
                    <Loader2Icon className="w-3 h-auto animate-spin ml-1" />
                  }
                />
              </Box>
            </SelectTrigger>
            <SelectContent className="focus-visible:ring-0 max-w-xs z-50">
              <WorkspaceSelectItems
                title="Public"
                val="260b11de-b226-473d-96ed-11f5ad4abd5b"
              />
              {workspaces.map((w, i) => (
                <WorkspaceSelectItems
                  key={i}
                  title={w.title ?? ""}
                  val={w.id}
                />
              ))}
              <WorkspaceDialog />
            </SelectContent>
          </Select> */}
        </Flex>
        <div className="flex flex-col px-4 gap-y-4">
          {/* New chat with collasp button */}
          <Flex className="w-full items-center rounded-md ">
            <Button className="w-full shadow-sm" onClick={handleNewThread}>
              <div className="w-full flex justify-between items-center">
                <div className="flex gap-2 items-center">
                  <PlusCircleIcon className="w-5 h-auto" />
                  <Text size="2" weight="bold">
                    New Thread
                  </Text>
                  {newThreadLoading ? (
                    <Loader2Icon
                      className={cn("w-4 h-auto animate-spin ml-1")}
                    />
                  ) : (
                    <></>
                  )}
                </div>
                <DropdownMenuShortcut className="font-bold">
                  ⌘K
                </DropdownMenuShortcut>
              </div>
            </Button>
          </Flex>

          {/* Search bar */}
          {/* <Flex
            align="center"
            justify="center"
            className="w-full border-[1px] p-1 px-1.5 rounded-lg shadow-sm h-10 bg-background"
          >
            <MagnifyingGlassIcon className="p-1 rounded-md w-6 h-auto" />
            <Input
              id="thread-search-bar"
              value={searchText}
              placeholder="Search"
              onChange={(e) => setSearchText(e.currentTarget.value)}
              className="shadow-none border-0 focus-visible:ring-transparent flex-1 h-8"
            />
            <DropdownMenuShortcut className="font-bold bg-accent p-1 rounded-md">
              ⌘⇧E
            </DropdownMenuShortcut>
          </Flex> */}
        </div>
        <div className="flex-1">
          {/* Threads */}
          <Flex direction="column" align="center" className="flex-1">
            <Toggle
              className="ml-4 my-2 self-start flex hover:bg-transparent data-[state=on]:bg-transparent p-0 items-center justify-center mb-1"
              onClick={() => setShowAllThread((p) => !p)}
            >
              <ChatBubbleLeftEllipsisIcon className="w-4 h-auto" />
              <h4 className="font-medium ml-1.5 mr-1">Threads</h4>
              <ChevronDownIcon
                className={`w-4 h-auto ${showAllThread ? "" : "rotate-180"}`}
              />
            </Toggle>
            {isPending && (
              <Box className="mt-4 flex flex-1 w-full h-full items-center justify-center">
                <Loader2Icon size="16" className="mr-2 animate-spin" />
                <Text size="3">Loading...</Text>
              </Box>
            )}
            {!isPending && showAllThread && (
              <ScrollArea className="h-[calc(100vh-320px)] w-full pl-4 overflow-y-scroll">
                {/* <h1>dcsdbc</h1> */}
                <TimeSeparatedThreads timeText={Times.Today} />
                {/* <TimeSeparatedThreads timeText={Times.Yesterday} /> */}
                {/* <TimeSeparatedThreads timeText={Times.ThisWeek} /> */}
                {/* <TimeSeparatedThreads timeText={Times.BeforeThisWeek} /> */}
              </ScrollArea>
            )}
          </Flex>
        </div>
        <Box className="h-20 w-full border-t-[1px] flex items-center justify-center px-4">
          <Profile />
        </Box>
      </Box>
      <Box
        className={cn(
          "place-self-end flex flex-col h-full w-[60px] justify-between items-center py-4",
          sidebar ? "hidden opacity-0" : ""
        )}
      >
        <MainNav enableText={false} />
        <Box className="h-fit w-full flex items-center justify-center">
          <Profile enableEmail={false} bgTransparent={true} />
        </Box>
      </Box>
    </Box>
  );
}
