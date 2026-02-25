import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppConfigService } from './config.helper';

@Global()
@Module({
    providers: [
        {
            provide: AppConfigService,
            inject: [ConfigService],
            useFactory: (configService: ConfigService) =>
                new AppConfigService(configService),
        },
    ],
    exports: [AppConfigService],
})
export class AppConfigModule { }