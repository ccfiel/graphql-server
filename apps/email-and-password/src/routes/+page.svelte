<script lang="ts">
	import { user } from '$lib/store';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { LogOutStore } from '$houdini';

	const logout = new LogOutStore();

	async function onLogOut(event: Event) {
		event.preventDefault();
		const res = await logout.mutate(null);
		if (res.errors?.length ?? 0 > 0) {
			console.error(res.errors);
		} else {
			user.set({ id: '', sessionId: '', name: '', emailVerified: false });
			goto('/login');
		}
	}

	user.subscribe((value) => {
		console.log('user');
		console.log(value);
		if (!value.sessionId && browser) {
			console.log('goto login');
			goto('/login');
		}
		if (!value.emailVerified && browser) {
			console.log('goto email-verification');
			goto('/email-verification');
		}

	});
</script>

<h1>Profile</h1>
<p>User id: {$user.id}</p>
<p>Username: {$user.name}</p>
<form method="post" action="?/logout" on:submit={onLogOut}>
	<input type="submit" value="Sign out" />
</form>
