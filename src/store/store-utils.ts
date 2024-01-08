import type { BackendError, BackendResponse } from '../api';
import type { Writable } from 'svelte/store';
import type { AsyncState } from '../types';

export const effectManager = <Entity, Payload = void>(
	store: Writable<AsyncState<Entity>>,
	effect: (payload: Payload) => Promise<BackendResponse<Entity>>,
	afterEffect?: (data: BackendResponse<Entity> | BackendError, success: boolean) => any
) => {
	return {
		store,
		dispatch: (payload?: Payload, cb?: (error: any) => void) => {
			store.update((state) => {
				return {
					...state,
					isLoading: true,
					isError: false
				};
			});
			effect(payload)
				.then((result) => {
					store.set({ data: result?.data, isLoading: false, message: result?.message, isError: false, statusCode: 200 });
					afterEffect?.(result, true);
					cb?.(null);
					return result;
				})
				.catch((error: BackendError) => {
					console.error(error);
					console.log('error message', error.message);
					store.update((state) => ({ ...state, isLoading: false, message: error?.message, isError: true, statusCode: error.statusCode }));
					afterEffect?.(error, false);
					cb?.(error);
					return error;
				});
		}
	};
};
