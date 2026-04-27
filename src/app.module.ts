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
import { ConfigModule } from '@nestjs/config';
import appConfig, { validationSchema } from './config/app.config';
import { AppConfigModule } from './config/module.config';
import { AppConfigService } from './config/config.helper';
import { MedicalRecordsModule } from './medical-records/medical-records.module';
import { CertificatesModule } from './certificates/certificates.module';
import { MailModule } from './mail/mail.module';
import { HospitalsModule } from './hospitals/hospitals.module';
import { CacheModule } from '@nestjs/cache-manager';
import KeyvRedis from '@keyv/redis';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      validationSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
    }),
    AppConfigModule,
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) => ({
        stores: config.redisUrl ? [new KeyvRedis(config.redisUrl)] : [],
      }),
    }),
    MailModule,
    UsersModule,
    RequestsModule,
    DonationsModule,
    BloodInventoryModule,
    AppointmentsModule,
    AnnouncementsModule,
    AuthModule,
    DatabaseModule,
    MedicalRecordsModule,
    CertificatesModule,
    HospitalsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
