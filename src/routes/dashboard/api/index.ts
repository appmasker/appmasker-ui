export async function get() {
	// Do some magic here... ✨
	return {
		headers: { Location: '/dashboard/api/docs' },
		status: 302
	};
}
