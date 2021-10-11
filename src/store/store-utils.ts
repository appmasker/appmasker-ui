import type { BackendResponse } from '../api';
import type { Writable } from 'svelte/store';
import type { AsyncState } from '../types';

export const effectManager = <Entity, Payload = void>(
	store: Writable<AsyncState<Entity>>,
	effect: (payload: Payload) => Promise<BackendResponse<Entity>>,
	afterEffect?: (data: BackendResponse<Entity>, success: boolean) => any
) => {
	return {
		store,
		dispatch: (payload?: Payload) => {
			store.update((state) => {
				return {
					...state,
					isLoading: true
				};
			});
			effect(payload)
				.then((result) => {
					store.set({ data: result?.data, isLoading: false });
					console.log('effect:', result);
					afterEffect?.(result, true);
					return result;
				})
				.catch((error) => {
					console.error(error);
					afterEffect?.(error, false);
					return error;
				});
		}
	};
};
