import { createStore } from "zustand";
import { type User } from "@supabase/supabase-js";
import { Conversations, Threads, Workspaces } from "@/lib/db";

export type AuthState = {
  user: User | null;
};

export type AuthActions = {
  setUser: (user: User) => void;
  removeUser: () => void;
};

export type AuthStore = AuthState & AuthActions;

export const defaultInitState: AuthState = {
  user: null,
};

export const createAuthStore = (initState: AuthState = defaultInitState) => {
  return createStore<AuthStore>()((set) => ({
    ...initState,
    setUser: (user) => set({ user: user }),
    removeUser: () => set({ user: null }),
  }));
};

export type RootState = {
  workspaceId: string;
  workspaces: Workspaces[];
  messages: Conversations[];
  threads: Threads[];
  fixedThreads: Threads[];
  newThreadLoading: boolean;
  currentThreadHeading: boolean;
  rightSidebarVisible: boolean;
  currentCourts: string[];
};

export type RootActions = {
  setWorkspaceId: (id: string) => void;
  loadWorkspaces: (w: Workspaces[]) => void;
  loadMessages: (w: Conversations[]) => void;
  loadThreads: (w: Threads[]) => void;
  loadFixedThreads: (w: Threads[]) => void;
  setNewThreadLoading: (b: boolean) => void;
  setThreadHeadingIndicator: (b: boolean) => void;
  setRightSidebarVisibility: (b: boolean) => void;
  setCurrentCourts: (cc: string[]) => void;
};

export type RootStore = RootState & RootActions;

export const defaultRootState: RootState = {
  workspaceId: "",
  workspaces: [],
  messages: [],
  threads: [],
  fixedThreads: [],
  newThreadLoading: false,
  currentThreadHeading: false,
  rightSidebarVisible: true,
  currentCourts: [],
};

export const createRootStore = (initState: RootState = defaultRootState) => {
  return createStore<RootStore>()((set) => ({
    ...initState,
    setWorkspaceId: (id) => set({ workspaceId: id }),
    loadWorkspaces: (w) => set({ workspaces: w }),
    loadMessages: (m) => set({ messages: m }),
    loadThreads: (t) => set({ threads: t }),
    loadFixedThreads: (t) => set({ fixedThreads: t }),
    setNewThreadLoading: (b) => set({ newThreadLoading: b }),
    setThreadHeadingIndicator: (b) => set({ currentThreadHeading: b }),
    setRightSidebarVisibility: (b) => set({ rightSidebarVisible: b }),
    setCurrentCourts: (cc) => set({ currentCourts: cc }),
  }));
};
