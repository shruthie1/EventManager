require('dotenv').config();
import { Application } from './Application'

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
    Application.createApplication().then(() => {
        console.info('The application was started! Kill it using Ctrl + C')
    })
})