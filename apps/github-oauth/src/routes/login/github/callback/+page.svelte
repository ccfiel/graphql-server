<script>
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import { ValidateGitHubVerificationTokenStore } from '$houdini';
    import { goto } from '$app/navigation';
    import { user } from '$lib/store';

	console.log('im here!');
	onMount(async () => {
		if (browser) {
			const code = new URLSearchParams(window.location.search).get('code');

			const validateGitHubVerificationTokenStore = new ValidateGitHubVerificationTokenStore();
			const res = await validateGitHubVerificationTokenStore.mutate({ token: code ?? '' });

			if (res.errors && (res.errors?.length ?? 0 > 0)) {
				goto('/login');
			} else {
				user.set({
					id: res.data?.validateGitHubVerificationToken.user.userId ?? '',
					sessionId: res.data?.validateGitHubVerificationToken.sessionId ?? '',
					email: res.data?.validateGitHubVerificationToken.user.email ?? '',
					username: res.data?.validateGitHubVerificationToken.user.username ?? '',
					emailVerified: true
				});
				goto('/');
			}
		} else {
			console.log('not browser');
		}
	});
</script>

<h1>Hello world!!!</h1>
