/* eslint-disable @typescript-eslint/no-explicit-any */
import { HoudiniClient } from '$houdini';
import { get } from 'svelte/store';
import { user } from '$lib/store';

function headerData(session: any) {
    const data =  get(user)
    if (data?.sessionId) {
        return {
            headers: {
                Authorization: `Bearer ${data.sessionId}`,
            }
        }    
    } else {
        console.log('no data')
        return {}
    }
}
export default new HoudiniClient({
    url: 'http://localhost:8080',
    fetchParams({ session }) {
        return headerData(session)
    }
})
