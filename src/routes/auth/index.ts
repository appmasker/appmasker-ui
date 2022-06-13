export async function get() {
	// Do some magic here... ✨

	return {
		headers: { Location: '/auth/login' },
		status: 302
	};
}
