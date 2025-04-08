require('dotenv').config();
import { Application } from './Application'
import { fetchWithTimeout } from './fetchWithTimeout';
import { notifbot } from './logbots';
import { parseError } from './parseError';

/**
 * Entrypoint for bootstrapping and starting the application.
 * Might configure aspects like logging, telemetry, memory leak observation or even orchestration before.
 * This is about to come later!
 */

export async function getDataAndSetEnvVariables(url: string) {
    try {
        const response = await fetch(url);
        const jsonData: any = await response.json();
        for (const key in jsonData) {
            process.env[key] = jsonData[key];
        }
        console.log('Environment variables set successfully!');
    } catch (error) {
        console.error('Error retrieving data or setting environment variables:', error);
    }
}

async function setEnv() {
    await getDataAndSetEnvVariables(`https://api.npoint.io/cc57d60feea67e47b6c4`);
}

setEnv().then(() => {
    process.env['clientId'] = "EventManager";
    Application.createApplication().then(async () => {
        await fetchWithTimeout(`${notifbot()}&text=EventManager started!`);
        console.info('The application was started! Kill it using Ctrl + C')
    })
})

process.on('unhandledRejection', (reason, promise) => {
    console.log('Unhandled Rejection at:', promise, 'reason:', reason);
    // Application specific logging, throwing an error, or other logic here
    fetchWithTimeout(`${notifbot(process.env.accountsChannel)}&text=Unhandled Promise Rejection ${JSON.stringify(reason)}`);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    parseError(error, "Uncaught Exception")
});