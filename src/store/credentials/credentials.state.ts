import type { AsyncState } from '../../types';
import { writable } from 'svelte/store';
import type { Credential } from '../../types/credential';

export const credentials$ = writable<AsyncState<Credential[]>>({
	data: [],
	isLoading: false,
	isError: false
});

export const createCredential$ = writable<AsyncState<Credential>>({
	data: null,
	isLoading: false,
	isError: false
});
