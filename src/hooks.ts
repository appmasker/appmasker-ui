import * as cookie from 'cookie';
import { backendCall } from './api';
import type { User } from './types';

export async function getSession({ headers }) {
	const cookies = cookie.parse(headers.cookie || '');
	const hasAuthCookie = !!cookies?.['auth'];
	return {
		isAuthenticated: hasAuthCookie
	};
}
