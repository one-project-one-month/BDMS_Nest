import { ConfigService } from '@nestjs/config';

export class AppConfigService {
    constructor(private configService: ConfigService) { }

    // App
    get port(): number {
        return this.configService.get<number>('app.port')!;
    }

    get nodeEnv(): string {
        return this.configService.get<string>('app.nodeEnv')!;
    }

    get appName(): string {
        return this.configService.get<string>('app.name')!;
    }

    // Database
    get databaseUrl(): string {
        return this.configService.get<string>('database.url')!;
    }

    // JWT
    get jwtSecret(): string {
        return this.configService.get<string>('jwt.secret')!;
    }

    get jwtExpiresIn(): string {
        return this.configService.get<string>('jwt.expiresIn')!;
    }

    get jwtRefreshSecret(): string {
        return this.configService.get<string>('jwt.refreshSecret')!;
    }

    get jwtRefreshExpiresIn(): string {
        return this.configService.get<string>('jwt.refreshExpiresIn')!;
    }
}