<script lang="ts">
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { user } from '$lib/store';
	import { GenerateEmailVerificationTokenStore } from '$houdini';

	const generateLink = new GenerateEmailVerificationTokenStore();
	let errorMessage: string = '';

	user.subscribe((value) => {
		if (!value.sessionId && browser) {
			goto('/login');
		}
	});

	async function OnGenerateLink(event: Event) {
		event.preventDefault();
		const res = await generateLink.mutate(null);
		if (res.errors && (res.errors?.length ?? 0 > 0)) {
			errorMessage = res.errors[0].message ?? '';
		} 
	}

</script>

<h1>Email verification</h1>
<p>Your email verification link was sent to your inbox (i.e. console).</p>
<h2>Resend verification link</h2>
<form method="post" on:submit={OnGenerateLink}>
	<input type="submit" value="Resend" />
</form>
{#if errorMessage}
	<p>{errorMessage}</p>
{:else}
	<p>Check your inbox (i.e. console) for the verification link.</p>
{/if}







