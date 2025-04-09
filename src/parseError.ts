import { notifbot } from "./logbots";
import axios from "axios";

// Extracted from fetchWithTimeout to break circular dependency
async function sendNotification(url: string): Promise<any> {
    try {
        return await axios.get(url, { timeout: 10000 });
    } catch (error) {
        console.error("Failed to send notification:", error);
        return undefined;
    }
}

export const extractMessage = (data: any): string => {
    try {
        if (Array.isArray(data)) {
            return `${data.map((item) => extractMessage(item)).join('\n')}`;
        }

        if (
            typeof data === 'string' ||
            typeof data === 'number' ||
            typeof data === 'boolean'
        ) {
            return String(data);
        }

        if (typeof data === 'object' && data !== null) {
            const messages: string[] = [];

            for (const key in data) {
                const value = data[key];
                const newPrefix = key;

                if (Array.isArray(value)) {
                    messages.push(
                        `${newPrefix}=${value.map((item) => extractMessage(item)).join('\n')}`,
                    );
                } else if (
                    typeof value === 'string' ||
                    typeof value === 'number' ||
                    typeof value === 'boolean'
                ) {
                    messages.push(`${newPrefix}=${value}`);
                } else if (typeof value === 'object' && value !== null) {
                    messages.push(String(extractMessage(value)));
                }
            }

            return messages.length > 0 ? messages.join('\n') : '';
        }

        return ''; // Return empty string for null, undefined, and unhandled types
    } catch (error) {
        console.error("Error in extractMessage:", error);
        return String(data) || 'Error extracting message';
    }
};

export function parseError(
    err: any,
    prefix?: string,
    sendErr: boolean = true
): {
    status: number;
    message: string;
    error: any;
} {
    try {
        const clientId = process.env.clientId || 'UnknownClient';
        const notifChannel = process.env.notifChannel || 'UnknownChannel';
        const prefixStr = `${clientId} - ${prefix || ''}`;
        let status: number = 500;
        let message = 'An unknown error occurred';
        let error: any = 'UnknownError';

        // Handle the case where `err` is undefined
        if (!err) {
            message = 'No error object provided';
            error = 'NoErrorObject';
        } else if (err.response) {
            const response = err.response;
            status =
                response.data?.statusCode ||
                response.data?.status ||
                response.data?.ResponseCode ||
                response.status ||
                err.status ||
                500;
            message =
                response.data?.message ||
                response.data?.errors ||
                response.data?.ErrorMessage ||
                response.data?.errorMessage ||
                response.data?.UserMessage ||
                response.data ||
                response.message ||
                response.statusText ||
                err.message ||
                'An error occurred';
            error =
                response.data?.error || response.error || err.name || err.code || 'Error';
        } else if (err.request) {
            status = err.status || 408;
            message =
                err.data?.message ||
                err.data?.errors ||
                err.data?.ErrorMessage ||
                err.data?.errorMessage ||
                err.data?.UserMessage ||
                err.data ||
                err.message ||
                err.statusText ||
                'The request was triggered but no response was received';
            error = err.name || err.code || 'NoResponseError';
        } else if (err.message) {
            status = err.status || 500;
            message = err.message;
            error = err.name || err.code || 'Error';
        }

        let extractedMessage;
        try {
            extractedMessage = extractMessage(message);
        } catch (e) {
            extractedMessage = String(message) || 'Error extracting message';
        }

        const fullMessage = `${prefixStr} :: ${extractedMessage}`;
        const response = { status, message: err.errorMessage ? err.errorMessage : String(fullMessage).slice(0, 200), error };
        console.log("parsedErr: ", fullMessage);

        if (sendErr) {
            try {
                const shouldSend = !fullMessage.includes("INPUT_USER_DEACTIVATED") &&
                    status.toString() !== "429" &&
                    !fullMessage.toLowerCase().includes("too many req") &&
                    !fullMessage.toLowerCase().includes('could not find') &&
                    !fullMessage.includes('ECONNREFUSED');

                if (shouldSend) {
                    const notifUrl = `${notifbot()}&text=${encodeURIComponent(prefixStr)} :: ${encodeURIComponent(err.errorMessage ? err.errorMessage : extractedMessage)}`;
                    // Use local sendNotification instead of fetchWithTimeout to avoid circular dependency
                    sendNotification(notifUrl).catch(e => console.error("Failed to send error notification:", e));
                }
            } catch (fetchError) {
                console.error('Failed to send error notification:', fetchError);
            }
        }

        return response;
    } catch (fatalError) {
        console.error("Fatal error in parseError:", fatalError);
        return { status: 500, message: "Error in error handling", error: "FatalError" };
    }
}