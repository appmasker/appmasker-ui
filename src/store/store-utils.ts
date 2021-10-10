import type { BackendResponse } from '../api';
import type { Writable } from 'svelte/store';
import type { AsyncState } from '../types';

export const effectManager = <Entity, Payload = void>(
	store: Writable<AsyncState<Entity>>,
	effect: (payload: Payload) => Promise<BackendResponse<Entity>>,
	afterEffect?: (data: BackendResponse<Entity>) => any
) => {
	store.update((state) => {
		return {
			...state,
			isLoading: true
		};
	});
	return {
		store,
		dispatch: (payload?: Payload) =>
			effect(payload)
				.then((result) => {
					store.set({ data: result?.data, isLoading: false });
					console.log('effect:', result);
					afterEffect?.(result);
					return result;
				})
				.catch((error) => {
					console.error(error);
					afterEffect?.(error);
					return error;
				})
	};
};
