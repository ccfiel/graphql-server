<script lang="ts">
    import { SignUpStore } from "$houdini";

    const signup = new SignUpStore()
    let errorMessage: string = '';

    async function onSignUp(event: Event) {
        event.preventDefault();
        const target = event.target as typeof event.target & {
            username: { value: string };
            password: { value: string };
        };
        const username = target.username.value;
        const password = target.password.value;
		console.log('onSignUp', username, password)
        const res = await signup.mutate({ username, password });
        if (res.errors?.length ?? 0 > 0) {
            if (res.errors && res.errors.length > 0 && res.errors[0].message === 'AUTH_DUPLICATE_KEY_ID') {
                errorMessage = 'Username already exists'
            }
        }
    }
</script>

<h1>Sign up</h1>
<form method="post" on:submit={onSignUp}>
	<label for="username">Username</label>
	<input name="username" id="username" /><br />
	<label for="password">Password</label>
	<input type="password" name="password" id="password" /><br />
	<input type="submit" />
</form>
{#if errorMessage}
	<p class="error">{errorMessage}</p>
{/if}
<a href="/login">Sign in</a>
