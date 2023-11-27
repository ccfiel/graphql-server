// import { auth, githubAuth } from '$lib/server/lucia.js';
// import { OAuthRequestError } from '@lucia-auth/oauth';

// export const GET = async ({ url, cookies, locals }) => {
// 	const session = await locals.auth.validate();
// 	if (session) {
// 		return new Response(null, {
// 			status: 302,
// 			headers: {
// 				Location: '/'
// 			}
// 		});
// 	}
// 	const storedState = cookies.get('github_oauth_state');
// 	const state = url.searchParams.get('state');
// 	const code = url.searchParams.get('code');

// 	console.log('server!!!');
// 	console.log('storedState');
// 	console.log(storedState);
// 	console.log('state');
// 	console.log(state);
// 	console.log('code');
// 	console.log(code);

// 	// validate state
// 	if (!storedState || !state || storedState !== state || !code) {
// 		return new Response(null, {
// 			status: 400
// 		});
// 	}
// 	try {
// 		const { getExistingUser, githubUser, createUser } = await githubAuth.validateCallback(code);

// 		console.log('githubUser');
// 		console.log(githubUser);

// 		const getUser = async () => {
// 			const existingUser = await getExistingUser();
// 			if (existingUser) return existingUser;
// 			const user = await createUser({
// 				attributes: {
// 					username: githubUser.login
// 				}
// 			});
// 			return user;
// 		};

// 		const user = await getUser();
// 		const session = await auth.createSession({
// 			userId: user.userId,
// 			attributes: {}
// 		});
// 		locals.auth.setSession(session);
// 		return new Response(null, {
// 			status: 302,
// 			headers: {
// 				Location: '/'
// 			}
// 		});
// 	} catch (e) {
// 		if (e instanceof OAuthRequestError) {
// 			// invalid code
// 			return new Response(null, {
// 				status: 400
// 			});
// 		}
// 		return new Response(null, {
// 			status: 500
// 		});
// 	}
// };
