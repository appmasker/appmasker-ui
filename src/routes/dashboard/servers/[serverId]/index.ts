export async function get({ params }) {
	// Do some magic here... ✨
	return {
		headers: { Location: `/dashboard/servers/${params.serverId}/status` },
		status: 302
	};
}
