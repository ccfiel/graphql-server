<script lang="ts">
	import { GeneratePasswordResetTokenStore } from '$houdini'

	let message: string = '';
	let error: boolean = false;

	async function onResetPassword(event: Event) {
		event.preventDefault()
		const target = event.target as typeof event.target & {
			email: { value: string }
		}
		const email = target.email.value ?? ''

		const store = new GeneratePasswordResetTokenStore()
		const res = await store.mutate({ email })

		if (res.errors && (res.errors?.length ?? 0 > 0)) {
			error = true;
			message = res.errors[0].message ?? '';
		} else {
			error = false;
			message = 'Your password reset link was sent to your inbox';
		}
			
	}
</script>

<h1>Reset password</h1>
<form method="post" on:submit={onResetPassword}>
	<label for="email">Email</label>
	<input name="email" id="email" /><br />
	<input type="submit" />
</form>
{#if message}
	<p class="{error ? 'error' : ''}">{message}</p>
{/if}
<a href="/login">Sign in</a>
