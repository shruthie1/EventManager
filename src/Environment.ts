
export class Environment {
    public static isLocal(): boolean {
        return Environment.getStage() === 'local'
    }

    public static isStaging(): boolean {
        return Environment.getStage() === 'staging'
    }

    public static isProd(): boolean {
        return Environment.getStage() === 'prod'
    }

    public static getStage(): string {
        return process.env.STAGE || 'local'
    }

    public static getPort(): number {
        return 8000
    }

    public static getVerticalName() {
        return process.env.VERTICAL_NAME || 'events'
    }

    public static getServiceName() {
        return process.env.SERVICE_NAME || 'Call-event-manager'
    }
}
