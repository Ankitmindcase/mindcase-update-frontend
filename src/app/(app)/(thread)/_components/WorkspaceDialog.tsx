"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { PlusIcon } from "@heroicons/react/24/outline";
import { createWorkspace, getAllWorkspaces } from "@/lib/db/workspaces";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/providers/AuthProvider";
import { useRootStore } from "@/providers/RootProvider";
import { Loader2Icon } from "lucide-react";

const formSchema = z.object({
  workspaceName: z.string().min(3, {
    message: "Workspace Name must be at least 3 characters.",
  }),
});

interface CreateDBDialogProps {}

export function WorkspaceDialog({}: CreateDBDialogProps) {
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore((state) => state);
  const { setWorkspaceId, loadWorkspaces } = useRootStore((state) => state);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      workspaceName: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    const workspace = await createWorkspace(supabase, {
      title: values.workspaceName,
      user_id: user?.id,
    });
    if (workspace) {
      const loadWorkspacesToState = async () => {
        if (user) {
          setLoading(true);
          const workspaces = await getAllWorkspaces(supabase, user.id);
          if (workspaces.length > 0) {
            loadWorkspaces(workspaces);
          }
          setLoading(false);
        }
      };
      await loadWorkspacesToState();
      setWorkspaceId(workspace.id);
      form.reset();
    }
    setOpen(false);
    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={(e) => setOpen(e)}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="ghost"
          className="w-full mt-1 px-3 flex items-center justify-start"
        >
          <PlusIcon className="w-4 h-auto mr-1 stroke-2" />
          Add Workspace
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Workspace</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="workspaceName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Workspace</FormLabel>
                  <FormControl>
                    <Input placeholder="Type any workspace name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">
              {loading ? (
                <Loader2Icon className="h-4 w-4 animate-spin" />
              ) : (
                "Create"
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
