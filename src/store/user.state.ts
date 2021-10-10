import type { AsyncState, User } from '../types';
import { writable } from 'svelte/store';

export const currentUserInitialState = { data: null, isLoading: false };
export const currentUser$ = writable<AsyncState<User>>(currentUserInitialState);
