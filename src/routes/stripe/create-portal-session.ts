import { BACKEND_HOST } from '../../utils/environment';

export async function post(request) {
	const response = await fetch(`${BACKEND_HOST}/stripe/create-portal-session`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			cookie: request.headers.cookie
		}
	}).catch((error) => {
		console.error(error);
		return error;
	});
	const responseJson: { data: { url: string } } = await response.json();
	return {
		headers: { Location: responseJson.data.url },
		status: 302
	};
}
