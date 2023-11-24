<script lang="ts">
	import { SignUpStore } from '$houdini';
	import { user } from '$lib/store';
	import { goto } from '$app/navigation';

	const signup = new SignUpStore();
	let errorMessage: string = '';

	async function onSignUp(event: Event) {
		event.preventDefault();
		const target = event.target as typeof event.target & {
			email: { value: string };
			password: { value: string };
		};
		const email = target.email.value;
		const password = target.password.value;

		const res = await signup.mutate({ username, password });
		if (res.errors?.length ?? 0 > 0) {
			if (res.errors && res.errors.length > 0) {
				errorMessage = res.errors[0].message;
			}
			if (errorMessage == 'AUTH_DUPLICATE_KEY_ID') {
				errorMessage = 'Username already exists';
			}
		} else {
			user.set({
				id: res.data?.signup.user.userId ?? '',
				sessionId: res.data?.signup.sessionId ?? '',
				name: username
			});
			goto('/');
		}
	}
</script>

<h1>Sign up</h1>
<form method="post" on:submit={onSignUp}>
	<label for="email">Email</label>
	<input name="username" id="username" /><br />
	<label for="password">Password</label>
	<input type="password" name="password" id="password" /><br />
	<input type="submit" />
</form>
{#if errorMessage}
	<p class="error">{errorMessage}</p>
{/if}
<a href="/login">Sign in</a>
