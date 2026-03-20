import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MedicalRecordsService } from './medical-records.service';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';
import { QueryMedicalRecordsDto } from './dto/query-medical-records.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { Roles } from '../auth/decorators/roles.decortor';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import * as requestedUserInterface from '../common/interfaces/requested-user.interface';

@UseGuards(JwtAuthGuard, PermissionsGuard, RolesGuard)
@Controller('medical-records')
export class MedicalRecordsController {
  constructor(private readonly medicalRecordsService: MedicalRecordsService) {}

  @Roles('ADMIN', 'STAFF')
  @Permissions('medical.create')
  @Post()
  create(
    @Body() createMedicalRecordDto: CreateMedicalRecordDto,
    @CurrentUser() user: requestedUserInterface.RequestedUser,
  ) {
    return this.medicalRecordsService.create(createMedicalRecordDto);
  }

  // TODO: Consider allowing USER role to view their own medical records
  // To enable: Add 'medical.access' and 'medical.view' to USER permissions in seed
  @Roles('ADMIN', 'STAFF')
  @Permissions('medical.access')
  @Get()
  findAll(
    @Query() query: QueryMedicalRecordsDto,
    @CurrentUser() user: requestedUserInterface.RequestedUser,
  ) {
    return this.medicalRecordsService.findAll(query, user.hospital_id);
  }

  @Roles('ADMIN', 'STAFF')
  @Permissions('medical.view')
  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: requestedUserInterface.RequestedUser,
  ) {
    return this.medicalRecordsService.findOne(id, user.hospital_id);
  }

  @Roles('ADMIN', 'STAFF')
  @Permissions('medical.update')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateMedicalRecordDto: UpdateMedicalRecordDto,
    @CurrentUser() user: requestedUserInterface.RequestedUser,
  ) {
    return this.medicalRecordsService.update(
      id,
      updateMedicalRecordDto,
      user.hospital_id,
    );
  }

  @Roles('ADMIN', 'STAFF')
  @Permissions('medical.update')
  @Patch(':id/approve')
  approve(
    @Param('id') id: string,
    @CurrentUser() user: requestedUserInterface.RequestedUser,
  ) {
    return this.medicalRecordsService.approve(id, user.hospital_id);
  }

  @Roles('ADMIN', 'STAFF')
  @Permissions('medical.update')
  @Patch(':id/reject')
  reject(
    @Param('id') id: string,
    @CurrentUser() user: requestedUserInterface.RequestedUser,
  ) {
    return this.medicalRecordsService.reject(id, user.hospital_id);
  }

  @Roles('ADMIN')
  @Permissions('medical.delete')
  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentUser() user: requestedUserInterface.RequestedUser,
  ) {
    return this.medicalRecordsService.remove(id, user.hospital_id);
  }
}
