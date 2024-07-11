import type { Database } from "./database.types";

export type { Database };

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type Insert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type Update<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
export type Enums<T extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][T];
export type DbResult<T> = T extends PromiseLike<infer U> ? U : never;
export type DbResultOk<T> = T extends PromiseLike<{ data: infer U }>
  ? Exclude<U, null>
  : never;
// export type DbResultErr = PostgrestError;

export type Workspaces = Tables<"workspaces">;
export type Threads = Tables<"threads">;
export type Conversations = Tables<"conversations">;
export type Cases = Tables<"cases">;
export type Acts = Tables<"acts">;
export type Databases = Tables<"databases">;
