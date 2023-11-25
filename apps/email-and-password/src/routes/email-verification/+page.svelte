<script lang="ts">
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { user } from '$lib/store';
	import { z } from '$houdini';

	user.subscribe((value) => {
		if (!value.sessionId && browser) {
			goto('/login');
		}
	});

</script>

<h1>Email verification</h1>
<p>Your email verification link was sent to your inbox (i.e. console).</p>
<h2>Resend verification link</h2>
<form method="post" use:enhance>
	<input type="submit" value="Resend" />
</form>
{#if form?.success}
	<p>Your verification link was resent</p>
{/if}
