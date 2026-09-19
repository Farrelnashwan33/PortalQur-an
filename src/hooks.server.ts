import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const hostname = event.url.hostname.toLowerCase();
	const pathname = event.url.pathname;
	const isAdminDomain = 
		hostname.startsWith('admin.') || 
		hostname.startsWith('admin-') || 
		hostname.includes('admin-portalquran');

	// If accessing via admin subdomain or dedicated admin domain
	if (isAdminDomain) {
		// If accessing root "/" or customer auth routes
		if (pathname === '/' || pathname === '/login' || pathname === '/register') {
			return new Response(null, {
				status: 302,
				headers: { location: '/admin/login' }
			});
		}
	}

	return resolve(event);
};
