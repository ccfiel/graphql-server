<script lang="ts">
	import { SignInStore } from '$houdini';
	import { user } from '$lib/store';
	import { goto } from '$app/navigation';

	const signin = new SignInStore();
	let errorMessage: string = '';

	async function onSignIn(event: Event) {
		event.preventDefault();
		const target = event.target as typeof event.target & {
			username: { value: string };
			password: { value: string };
		};
		const username = target.username.value;
		const password = target.password.value;

		const res = await signin.mutate({ username, password });
		if (res.errors?.length ?? 0 > 0) {
			if (res.errors && res.errors.length > 0) {
				errorMessage = res.errors[0].message;
			}
			if (errorMessage == 'AUTH_INVALID_KEY_ID') {
				errorMessage = 'Username or password is incorrect';
			}
		} else {
			user.set({
				id: res.data?.signin.user.userId ?? '',
				sessionId: res.data?.signin.sessionId ?? '',
				emailVerified: res.data?.signin.user.emailVerified ?? false,
				email: res.data?.signin.user.email ?? ''
			});
			goto('/');
		}
	}
</script>

<h1>Sign in</h1>
<form method="post" on:submit={onSignIn}>
	<label for="email">Email</label>
	<input name="email" id="email" /><br />
	<label for="password">Password</label>
	<input type="password" name="password" id="password" /><br />
	<input type="submit" />
</form>
{#if errorMessage}
	<p class="error">{errorMessage}</p>
{/if}
<a href="/signup">Create an account</a>
