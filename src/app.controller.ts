import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { AppConfigService } from './config/config.helper';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly appConfig: AppConfigService) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  getHealth() {
    return {
      service: this.appConfig.appName,
      version: 'v1.0.0',
      status: 'OK'
    };
  }
}
