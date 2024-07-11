import { SupabaseClient } from "@supabase/supabase-js";
import { Conversations, Database, Insert, Update } from ".";

export const getConversationsByThread = async (
  supabase: SupabaseClient<Database>,
  thread_id: string
): Promise<Conversations[]> => {
  const { data, error } = await supabase
    .from("conversations")
    .select()
    .eq("thread_id", thread_id)
    .order("created_at", { ascending: true });
  if (error) return Array<Conversations>();
  return data;
};

export const insertConversation = async (
  supabase: SupabaseClient<Database>,
  conversation: Insert<"conversations">
): Promise<Conversations | null> => {
  const { data, error } = await supabase
    .from("conversations")
    .insert(conversation)
    .select()
    .single();
  if (error) return null;
  return data;
};

export const updateConversationById = async (
  supabase: SupabaseClient<Database>,
  id: string,
  params: Update<"conversations">
): Promise<Conversations | null> => {
  const { data, error } = await supabase
    .from("conversations")
    .update(params)
    .eq("id", id)
    .select()
    .single();
  if (error) return null;
  return data;
};
