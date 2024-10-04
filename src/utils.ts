import axios from "axios";

export async function fetchWithTimeout(url: string, config: any = {}, sendErr = true, maxRetries = 0) {
    const timeout = config?.timeout || 15000;

    for (let retryCount = 0; retryCount <= maxRetries; retryCount++) {
        try {
            const response = await axios({
                url,
                ...config,
                timeout,
            });
            return response;
        } catch (error) {
            if (sendErr) {
                console.log(`Error (${retryCount + 1}/${maxRetries + 1}): ${error} - ${url}`);
            }

            if (retryCount < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
            } else {
                console.error(`All ${maxRetries + 1} retries failed for ${url}`);
                return undefined;
            }
        }
    }
}

export async function sleep(ms:number) {
    await new Promise(resolve => setTimeout(resolve, ms));
}