import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Text } from "@radix-ui/themes";

import { CreditCard, LogOut, Settings, User } from "lucide-react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import { useAuthStore } from "@/providers/AuthProvider";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

export default function Profile({
  enableEmail = true,
  bgTransparent = false,
}: any) {
  const { user } = useAuthStore((s) => s);
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={(val) => setOpen(val)}>
      <DropdownMenuTrigger asChild>
        <div
          className={cn(
            "cursor-pointer flex rounded-md w-full h-fit hover:shadow-md gap-2 border",
            bgTransparent ? "bg-transparent" : "bg-background",
            enableEmail ? "p-2" : "w-fit",
            open ? "shadow-md" : "",
            enableEmail ? "" : "rounded-full",
            ""
          )}
        >
          <Button
            size="icon"
            variant="ghost"
            className="relative w-fit h-10 rounded-full focus-visible:ring-transparent bg-transparent"
          >
            <Avatar className="h-full rounded-sm">
              <AvatarImage
                src="/profile-avatar.svg"
                alt="dummhy profile avatar"
                className="w-fit h-10"
              />
              <AvatarFallback className="bg-primary-foreground text-black text-lg">
                {user?.email?.slice(0, 1).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Button>
          {enableEmail ? (
            <div className="flex-1 flex items-center justify-between">
              <div className="hidden md:flex">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger disabled asChild>
                      <div className="flex flex-col">
                        <Text className="whitespace-nowrap font-medium line-clamp-1">
                          {user?.user_metadata.name}
                        </Text>
                        <Text
                          className={cn(
                            "whitespace-nowrap font-normal line-clamp-1 text-xs",
                            // user?.user_metadata.name.length ? "" : "text-md"
                          )}
                        >
                          {user?.email?.length! > 26
                            ? user?.email?.substring(0, 26) + "..."
                            : user?.email}
                        </Text>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <Text className="whitespace-nowrap font-normal line-clamp-1">
                        {user?.email}
                      </Text>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="w-5 h-5 flex flex-col items-center justify-center">
                <ChevronUpIcon className="w-4 h-auto" />
                <ChevronDownIcon className="w-4 h-auto" />
              </div>
            </div>
          ) : null}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" side="right" forceMount>
        <DropdownMenuGroup>
          <DropdownMenuItem disabled>
            <User className="w-4 h-4 mr-2" />
            <span>Profile</span>
            <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem disabled>
            <CreditCard className="w-4 h-4 mr-2" />
            <span>Billing (Coming soon)</span>
            <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem disabled>
            <Settings className="w-4 h-4 mr-2" />
            <span>Settings</span>
            <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/logout">
            <LogOut className="w-4 h-4 mr-2" />
            <span>Log out</span>
            <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
