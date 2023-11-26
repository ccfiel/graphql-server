<script>
	import { onMount } from "svelte";
    import { goto } from '$app/navigation';
    import { browser } from '$app/environment';
    import { user } from '$lib/store';
    import { ValidateEmailVerificationTokenStore } from '$houdini';
	import { page } from "$app/stores";
    import { get } from 'svelte/store';

    onMount(async () => {
        console.log('onMount');
        if (!browser) return;
        console.log($page.params.token);
        const validateEmailVerificationToken = new ValidateEmailVerificationTokenStore();
        const res = await validateEmailVerificationToken.mutate({ token: $page.params.token });
        if (res.errors && (res.errors?.length ?? 0 > 0)) {
            console.log('error');
            goto('/login');
        }
        else {
            console.log('success');
            const data = get(user);
            console.log(res.data);
            user.set({
				id: res.data?.validateEmailVerificationToken.user.userId ?? '',
				sessionId: res.data?.validateEmailVerificationToken.sessionId ?? '',
				email: res.data?.validateEmailVerificationToken.user.email ?? '',
                emailVerified: true,
			});
            goto('/');
        }
    });
</script>