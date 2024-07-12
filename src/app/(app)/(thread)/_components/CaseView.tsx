"use client";

import React, { FormEvent, useCallback, useEffect, useState } from "react";
import { useSelectedLayoutSegment } from "next/navigation";

import { Box, Text } from "@radix-ui/themes";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";

import {
  getConversationsByThread,
  insertConversation,
} from "@/lib/db/conversations";
import { Conversations } from "@/lib/db";
import { createNewThread, updateThreadById } from "@/lib/db/threads";
import { createClient } from "@/lib/supabase/client";
import { useRootStore } from "@/providers/RootProvider";

import { ChatNewThread } from "./chatNewThread";

import { Loader2Icon } from "lucide-react";
import { PaperAirplaneIcon } from "@heroicons/react/24/outline";
import { AllMessages } from "./AllMessages";
import { getThreadHeading } from "./api";
import { cn, getLocalStorage } from "@/lib/utils";
import { ArrowLeftCircleIcon } from "@heroicons/react/24/solid";

export function ChatView() {
  const supabase = createClient();
  const threadId = useSelectedLayoutSegment() as string;
  const {
    workspaceId,
    messages,
    loadMessages,
    currentThreadHeading,
    setNewThreadLoading,
    newThreadLoading,
    currentCourts,
    setRightSidebarVisibility,
    rightSidebarVisible,
  } = useRootStore((state) => state);

  const [input, setInput] = useState("");
  const [newThread, setNewThread] = useState(true);
  const [generatedData, setGeneratedData] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [rootLoading, setRootLoading] = useState(false);
  const [newMessage, setNewMessage] = useState<Conversations | null>(null);

  // check if current thread is brand new or not
  useEffect(() => {
    if (!threadId || !messages.length) {
      !newThread && setNewThread(true);
    } else {
      newThread && setNewThread(false);
    }
  }, [messages.length, threadId]);

  // sets the prev messages of current thread
  useEffect(() => {
    setInput("");
    const getMessages = async () => {
      if (threadId) {
        setRootLoading(true);
        const data = await getConversationsByThread(supabase, threadId);
        loadMessages(data);
        setRootLoading(false);
      }
    };

    getMessages();
  }, [threadId]);

  const settingThreadHeadline = async () => {
    if (newMessage) {
      if (!currentThreadHeading) {
        const chat_heading = await getThreadHeading({
          chat_history: newMessage.answer || newMessage.query,
        });
        await updateThreadById(supabase, newMessage.thread_id, {
          title: chat_heading,
        });
        setNewThreadLoading(true);
      }
    }
  };

  // after generate ai response, it add the message to db
  useEffect(() => {
    if (!streaming && newMessage) {
      insertConversation(supabase, {
        thread_id: newMessage.thread_id,
        query: newMessage.query,
        answer: newMessage.answer,
        // type: "answer",
        // cases: newMessage.cases,
        // analysis: newMessage.analysis,
        // documents: newMessage.documents,
      })
        .then((resp) => console.log(`conversation inserted ${resp?.id}`))
        .catch((err) => console.log(`conversation error ${err.message}`));
      settingThreadHeadline();
      loadMessages([...messages, newMessage]);
      setNewMessage(null);
    }
  }, [streaming]);

  const sendMessage = async (message: string, thread: string = threadId) => {
    const queryData: Conversations = {
      thread_id: thread,
      query: message,
      answer: "",
      id: "",
      user_id: "",
      created_at: "",
      // type: "loading",
      // analysis: "",
      // cases: null,
      // documents: null,
      // jurisdiction: currentCourts,
    };
    const res = await fetch(
      `http://localhost:8080/generate_response_med42_only?query=${message}&thread_id=${thread}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const resp = await res.json();
    setGeneratedData(resp);
    setStreaming(true);
    setNewMessage(queryData);
  };

  const handleSubmit = useCallback(async (inputString: string) => {
    if (inputString.length === 0) return;
    if (threadId) {
      newThread && setNewThread(false);
      sendMessage(inputString, threadId);
      setInput("");
    } else {
      const thread = await createNewThread(supabase, {
        title: inputString,
      });
      if (!thread) {
        console.error("failed creating new thread");
        return;
      }
      setNewThreadLoading(true);
      const localStorage = getLocalStorage();
      localStorage.setItem("message", inputString);
      // await new Promise((resolve) => setTimeout(resolve, 1000));
      // router.replace("/t/" + "thread.id");
      // await sendMessage(inputString, thread.id);
    }
  }, []);

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleSubmit(input);
  };

  useEffect(() => {
    const localStorage = getLocalStorage();
    let message = localStorage.getItem("message");
    if (message && !newThreadLoading && threadId) {
      setInput(message);
      localStorage.removeItem("message");
      document.getElementById("querySubmitButton")?.click();
    }
  }, [newThreadLoading, threadId, handleSubmit]);

  return (
    <Box className="relative w-full h-full flex flex-col justify-end text-sm">
      <Box className={cn("absolute top-0 right-0 z-10 p-4")}>
        <Button
          variant="outline"
          onClick={() => setRightSidebarVisibility(!rightSidebarVisible)}
          className={cn(" flex gap-2", rightSidebarVisible ? "hidden" : "")}
        >
          <ArrowLeftCircleIcon className={cn("w-5 h-auto text-primary")} />
          <Text className={cn("text-md whitespace-nowrap")}>Data Sources</Text>
        </Button>
      </Box>
      {rootLoading ? (
        <Loader2Icon className="w-6 h-auto animate-spin absolute top-[50%] left-[50%]" />
      ) : newThread ? (
        <Box className="h-full w-full mx-auto max-w-[800px] px-10"></Box>
      ) : (
        <ScrollArea className="max-h-full h-full w-full">
          <Box className="h-full w-full mx-auto max-w-[800px] px-10">
            <AllMessages
              messages={messages}
              generatedData={generatedData}
              setGeneratedData={setGeneratedData}
              newMessage={newMessage}
              setNewMessage={setNewMessage}
              setStreaming={setStreaming}
            />
          </Box>
        </ScrollArea>
      )}

      {/* Message input box */}
      {!rootLoading && (
        <Box className="relative px-8 flex flex-row items-center mx-auto w-full max-w-[800px] mb-6">
          <Box className="relative h-full m-2 shadow-lg rounded-lg flex w-full items-center border-[1px] border-gray-600">
            <form
              onSubmit={handleFormSubmit}
              className="flex w-full items-center gap-2 px-1"
            >
              <Textarea
                autoFocus
                id="message"
                placeholder="Type your message..."
                className="text-md font-normal resize-none border-0 focus-visible:ring-transparent"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    if (e.shiftKey) setInput((i) => `${i}\n`);
                    else handleSubmit(input);
                  }
                }}
              />
              <Button
                id="querySubmitButton"
                type="submit"
                size="icon"
                className="mr-2"
                disabled={input.length === 0}
              >
                <PaperAirplaneIcon className="w-4 h-auto" />
              </Button>
            </form>
          </Box>
        </Box>
      )}
    </Box>
  );
}
