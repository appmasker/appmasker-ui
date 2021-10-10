import { BACKEND_HOST } from '../utils/environment';
import * as cookie from 'cookie';

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
	})
		.then((resp) => resp.json())
		.catch((reason) => {
			console.log('reson next');
			console.log(reason);
			return reason;
		});
