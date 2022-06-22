import { goto } from "$app/navigation";
import { backendCall } from "../../api";
import type { Server, ServerInput, ServerUpdateInput } from "../../types";
import { effectManager } from "../store-utils";
import { showNotification$ } from "../user.state";
import { accountServers$, deleteServer$, getServer$, launchServer$, updateServer$ } from "./server.state";

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

export const launchServer = effectManager<Server, ServerInput>(
  launchServer$,
  (data) => backendCall('/server', 'POST', data),
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
)

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