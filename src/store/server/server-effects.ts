import { goto } from "$app/navigation";
import { derived } from "svelte/store";
import { backendCall } from "../../api";
import type { Server, ServerInput, ServerUpdateInput } from "../../types";
import { effectManager } from "../store-utils";
import { showNotification$ } from "../user.state";
import { accountServers$, deleteServer$, getServer$, createServer$, updateServer$ } from "./server.state";

export const getServers = effectManager<Server[]>(
  accountServers$,
  () => backendCall('/server/all'),
  (response, success) => {
    if (!success) {
      showNotification$.set({
        title: 'Failed to retrieve your servers',
        message: response.message,
        kind: 'error'
      });
    }
  }
)

export const regionCount = derived(getServers.store, $servers => {
  console.log('servers', $servers)
  const regionCount = $servers.data.reduce((prev, curr) => {
    return prev + curr.regions.length;
  }, 0);
  return regionCount;
});

export const createServer = effectManager<Server, ServerInput>(
  createServer$,
  (data) => backendCall('/server', 'POST', data),
  (response, success) => {
    if (!success) {
      // showNotification$.set({
      //   title: 'Failed to retrieve your servers',
      //   message: response.message,
      //   kind: 'error',
      // });
    } else {
      showNotification$.set({
        title: 'Server Created!',
        message: 'Please verify your DNS records before launching it.',
        kind: 'success'
      });
    }
  }
);

export const launchServer = effectManager<Server, Server>(
  createServer$,
  (data) => backendCall(`/server/launch/${data.id}`, 'POST', data),
  (response, success) => {
    if (!success) {
      // showNotification$.set({
      //   title: 'Failed to retrieve your servers',
      //   message: response.message,
      //   kind: 'error',
      // });
    } else {
      goto('/dashboard/servers');
      showNotification$.set({
        title: 'Success!',
        message: 'Your Caddy Server is headed to the cloud 🚀',
        kind: 'success'
      });
    }
  }
);

export const getServer = effectManager<Server, string>(
  getServer$,
  (id) => backendCall(`/server/${id}`),
  (response, success) => {
    if (!success) {
      showNotification$.set({
        title: `Failed to retrieve server`,
        message: response.message,
        kind: 'error'
      });
    }
  }
)

export const deleteServer = effectManager<void, string>(
  deleteServer$,
  (id) => backendCall(`/server/${id}`, 'DELETE'),
  (response, success) => {
    if (!success) {
      // showNotification$.set({
      //   title: 'Failed to delete the server',
      //   message: response.message,
      //   kind: 'error',
      // });
    } else {
      goto('/dashboard/servers');
      showNotification$.set({
        title: 'Success!',
        message: 'Server was deleted.',
        kind: 'success'
      });
    }
  }
)

export const updateServer = effectManager<Server, ServerUpdateInput>(
  updateServer$,
  (input) => backendCall(`/server/update`, 'POST', input),
  (response, success) => {
    if (!success) {
      // showNotification$.set({
      //   title: 'Failed to update the server',
      //   message: response.message,
      //   kind: 'error',
      // });
    } else {
      showNotification$.set({
        title: 'Success!',
        message: 'Server was updated.',
        kind: 'success'
      });
    }
  }
)