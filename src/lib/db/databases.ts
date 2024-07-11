import { SupabaseClient } from "@supabase/supabase-js";
import { Database, Insert, Databases } from ".";

export const fetchDatabases = async (
  supabase: SupabaseClient<Database>
): Promise<Databases[] | null> => {
  const { data, error } = await supabase.from("databases").select("*");
  if (error) return null;
  return data;
};

export const createDatabase = async (
  supabase: SupabaseClient<Database>,
  params: Insert<"databases">
) => {
  const { data, error } = await supabase
    .from("databases")
    .insert(params)
    .select()
    .single();
  if (error) return null;
  console.log(data);
  return data;
};

export const deleteDatabase = async (
  supabase: SupabaseClient<Database>,
  id: string
): Promise<boolean> => {
  const { error } = await supabase.from("databases").delete().eq("id", id);
  return !error;
};
