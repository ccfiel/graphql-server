<script lang="ts">
	import { ChangePasswordStore } from '$houdini';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	let errorMessage: string = '';

	async function onChangePassword(event: Event) {
		event.preventDefault();
		const target = event.target as typeof event.target & {
			password: { value: string };
		};
		const password = target.password.value;

		const store = new ChangePasswordStore();
		const res = await store.mutate({ password, token: $page.params.token });
		console.log('res');
		console.log(res);
		if (res.errors?.length ?? 0 > 0) {
			if (res.errors && res.errors.length > 0) {
				errorMessage = res.errors[0].message;
			}
			if (errorMessage == 'AUTH_INVALID_KEY_ID' || errorMessage == 'AUTH_INVALID_PASSWORD') {
				errorMessage = 'Username or password is incorrect';
			}
		} else {
			goto('/');
		}
	}
</script>

<h1>Reset password</h1>
<form method="post" on:submit={onChangePassword}>
	<label for="password">New Password</label>
	<input name="password" id="password" /><br />
	<input type="submit" />
</form>
{#if errorMessage}
	<p class="error">{errorMessage}</p>
{/if}
