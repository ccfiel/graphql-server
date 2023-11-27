<script>
	import { onMount } from "svelte";
    import { GetGitHubVerificationURLStore } from '$houdini'
	import { goto } from "$app/navigation";

    const getGitHubVerificationURL = new GetGitHubVerificationURLStore()

    onMount(async () => {
        const res = await getGitHubVerificationURL.fetch()
        if (res.errors?.length ?? 0 > 0) {
            console.error(res.errors)
        } else {
            console.log(res.data?.getGitHubVerificationURL)
            goto(res.data?.getGitHubVerificationURL ?? '/login')
        }
    })
    
</script>
