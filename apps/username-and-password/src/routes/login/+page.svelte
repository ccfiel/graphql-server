<script lang="ts">
	import { SignInStore } from "$houdini";

	const signin = new SignInStore()

	async function onSignIn(event: Event) {
		event.preventDefault();
		const target = event.target as typeof event.target & {
			username: { value: string };
			password: { value: string };
		};
		const username = target.username.value;
		const password = target.password.value;
		console.log('onSignUp', username, password);
		const res = await signin.mutate({ username, password });
		console.log('res', res.data?.signin.sessionId);
	}
</script>

<h1>Sign in</h1>
<form method="post" on:submit={onSignIn}>
	<label for="username">Username</label>
	<input name="username" id="username" /><br />
	<label for="password">Password</label>
	<input type="password" name="password" id="password" /><br />
	<input type="submit" />
</form>
<!-- {#if form?.message}
	<p class="error">{form.message}</p>
{/if} -->
<a href="/signup">Create an account</a>
