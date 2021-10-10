import { goto } from '$app/navigation';
import type { LoadInput, LoadOutput } from '@sveltejs/kit';
import type { AppSession, User } from 'src/types';

export async function authGuard(url: string, isAuthenticated: boolean): Promise<LoadOutput> {
	console.log('current session', isAuthenticated);
	if (isAuthenticated && url.includes('/auth')) {
		// alert(`navigating to dashboard. Url = ${url} Is logged in: ${isAuthenticated}`);
		return { status: 302, redirect: '/dashboard' };
	} else if (isAuthenticated || url.includes('/auth')) {
		// alert(`Not navigating. Url = ${url} Is logged in: ${isAuthenticated}`);
		return {};
	} else {
		// alert(`Navigating to auth. Url = ${url} Is logged in: ${isAuthenticated}`);
		return { status: 302, redirect: '/auth' };
	}
}
