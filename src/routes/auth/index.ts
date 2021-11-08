export async function get() {
	// Do some magic here... ✨

	return {
		headers: { Location: '/auth/signup' },
		status: 302
	};
}
