// import { dev } from '$app/environment';
// import { githubAuth } from '$lib/server/lucia.js';

// export const GET = async ({ cookies, locals }) => {
// 	// const session = await locals.auth.validate();
// 	// if (session) {
// 	// 	return new Response(null, {
// 	// 		status: 302,
// 	// 		headers: {
// 	// 			Location: '/'
// 	// 		}
// 	// 	});
// 	// }
// 	const [url, state] = await githubAuth.getAuthorizationUrl();
//     console.log('url')
//     console.log(url.toString());
//     console.log(state);
// 	cookies.set('github_oauth_state', state, {
// 		httpOnly: true,
// 		secure: !dev,
// 		path: '/',
// 		maxAge: 60 * 60
// 	});
// 	return new Response(null, {
// 		status: 302,
// 		headers: {
// 			Location: url.toString()
// 		}
// 	});
// };
