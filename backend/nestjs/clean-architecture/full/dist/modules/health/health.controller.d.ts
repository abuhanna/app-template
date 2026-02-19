import { DataSource } from 'typeorm';
export declare class HealthController {
    private readonly dataSource;
    constructor(dataSource: DataSource);
    health(): {
        status: string;
        timestamp: string;
        application: string;
        version: string;
    };
    ready(): Promise<{
        status: string;
        timestamp: string;
        database: string;
    }>;
    live(): {
        status: string;
        timestamp: string;
    };
}
