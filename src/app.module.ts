import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { RequestsModule } from './requests/requests.module';
import { DonationsModule } from './donations/donations.module';
import { BloodInventoryModule } from './blood-inventory/blood-inventory.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { AnnouncementsModule } from './announcements/announcements.module';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import appConfig, { validationSchema } from './config/app.config';
import { AppConfigService } from './config/config.helper';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      validationSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: false, // shows ALL missing vars at once
      }
    }),
    UsersModule, RequestsModule, DonationsModule, BloodInventoryModule, AppointmentsModule, AnnouncementsModule, AuthModule, DatabaseModule],
  controllers: [AppController],
  providers: [AppService,
    {
      provide: AppConfigService,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => new AppConfigService(configService),
    }
  ],
})
export class AppModule { }
