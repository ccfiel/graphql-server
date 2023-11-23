<script lang="ts">
	import { user } from '$lib/store';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';

	async function onLogOut(event: Event) {
		event.preventDefault();
	}

	user.subscribe((value) => {
		if (!value.sessionId && browser) {
			goto('/login');
		}
	});

</script>

<h1>Profile</h1>
<p>User id: {$user.id}</p>
<p>Username: {$user.name}</p>
<form method="post" action="?/logout" on:submit={onLogOut}>
	<input type="submit" value="Sign out" />
</form>
