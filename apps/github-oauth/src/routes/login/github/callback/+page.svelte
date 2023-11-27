<script>
    import { onMount } from 'svelte';
    import { get } from 'svelte/store';

    
    
    onMount(async () => {
        const code = new URLSearchParams(window.location.search).get('code');
    });
</script>