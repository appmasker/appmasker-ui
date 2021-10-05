export async function get() {
	// Do some magic here... ✨

	return {
		headers: { Location: '/dashboard/domains' },
		status: 302
	};
}
