<script lang="ts">
    function onSignUp(event: Event) {
        event.preventDefault();
        const target = event.target as typeof event.target & {
            username: { value: string };
            password: { value: string };
        };
        const username = target.username.value;
        const password = target.password.value;
		console.log('onSignUp', username, password)
		// Handle sign up logic here
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
<!-- {#if form?.message}
	<p class="error">{form.message}</p>
{/if} -->
<a href="/login">Sign in</a>
