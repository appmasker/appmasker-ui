import type { AsyncState } from "../../types";
import type { Server } from "../../types/server";
import { writable } from "svelte/store";

export const accountServers$ = writable<AsyncState<Server[]>>({
  data: [],
  isLoading: false,
  isError: false,
});

export const launchServer$ = writable<AsyncState<Server>>({
  data: null,
  isLoading: false,
  isError: false,
});

export const getServer$ = writable<AsyncState<Server>>({
  data: null,
  isLoading: false,
  isError: false,
});

export const deleteServer$ = writable<AsyncState<void>>({
  data: null,
  isLoading: false,
  isError: false,
});

export const updateServer$ = writable<AsyncState<Server>>({
  data: null,
  isLoading: false,
  isError: false,
});