import { goto } from '$app/navigation';
import { BACKEND_HOST } from '../utils/environment';

const host = BACKEND_HOST;

export interface BackendResponse<T> {
	data: T;
	message: string;
	errors: any[];
}

export const backendCall = <Entity, Body = void>(
	url: string,
	method: 'GET' | 'POST' | 'DELETE' | 'PUT' = 'GET',
	body?: Body
): Promise<BackendResponse<Entity>> =>
	fetch(`${host}${url}`, {
		method,
		body: body ? JSON.stringify(body) : undefined,
		credentials: 'include',
		redirect: 'follow',
		headers: {
			'Content-Type': 'application/json'
		}
	}).then(async (resp) => {
		const data = (await resp?.json()) || {};
		if (resp.status === 401 && !location.href.includes('/auth')) {
			return goto('/auth/login');
		}
		if (resp.ok) {
			return data;
		}
		throw new Error(data?.['message'] || 'An error occurred');
	});
