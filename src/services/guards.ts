import type { LoadOutput } from '@sveltejs/kit';

export async function authGuard(url: string, isAuthenticated: boolean): Promise<LoadOutput> {
	if (isAuthenticated && url.includes('/auth')) {
		// alert(`navigating to dashboard. Url = ${url} Is logged in: ${isAuthenticated}`);
		return { status: 302, redirect: '/dashboard', props: {isAuthenticated}};
	} else if (isAuthenticated || url.includes('/auth')) {
		// alert(`Not navigating. Url = ${url} Is logged in: ${isAuthenticated}`);
		return {props: {isAuthenticated}};
	} else {
		// alert(`Navigating to auth. Url = ${url} Is logged in: ${isAuthenticated}`);
		return { status: 302, redirect: '/auth' };
	}
}
