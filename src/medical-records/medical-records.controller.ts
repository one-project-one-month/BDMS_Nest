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
import {
  ApiTags,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
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
import {
  MedicalRecordEntity,
  PaginatedMedicalRecordEntity,
} from './entities/medical-record.entity';

@ApiTags('Medical Records')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, PermissionsGuard, RolesGuard)
@Controller('medical-records')
export class MedicalRecordsController {
  constructor(private readonly medicalRecordsService: MedicalRecordsService) {}

  @Roles('ADMIN', 'STAFF')
  @Permissions('medical.create')
  @Post()
  @ApiCreatedResponse({
    description: 'The medical record has been successfully created.',
    type: MedicalRecordEntity,
  })
  create(@Body() createMedicalRecordDto: CreateMedicalRecordDto) {
    return this.medicalRecordsService.create(createMedicalRecordDto);
  }

  @Roles('ADMIN', 'STAFF')
  @Permissions('medical.access')
  @Get()
  @ApiOkResponse({
    description: 'List of medical records retrieved successfully.',
    type: PaginatedMedicalRecordEntity,
  })
  findAll(
    @Query() query: QueryMedicalRecordsDto,
    @CurrentUser() user: requestedUserInterface.RequestedUser,
  ) {
    return this.medicalRecordsService.findAll(query, user.hospital_id);
  }

  @Roles('ADMIN', 'STAFF')
  @Permissions('medical.view')
  @Get(':id')
  @ApiOkResponse({
    description: 'Medical record found.',
    type: MedicalRecordEntity,
  })
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: requestedUserInterface.RequestedUser,
  ) {
    return this.medicalRecordsService.findOne(id, user.hospital_id);
  }

  @Roles('ADMIN', 'STAFF')
  @Permissions('medical.update')
  @Patch(':id')
  @ApiOkResponse({
    description: 'Medical record updated successfully.',
    type: MedicalRecordEntity,
  })
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
  @ApiOkResponse({
    description: 'Medical record approved.',
    type: MedicalRecordEntity,
  })
  approve(
    @Param('id') id: string,
    @CurrentUser() user: requestedUserInterface.RequestedUser,
  ) {
    return this.medicalRecordsService.approve(id, user.hospital_id);
  }

  @Roles('ADMIN', 'STAFF')
  @Permissions('medical.update')
  @Patch(':id/reject')
  @ApiOkResponse({
    description: 'Medical record rejected.',
    type: MedicalRecordEntity,
  })
  reject(
    @Param('id') id: string,
    @CurrentUser() user: requestedUserInterface.RequestedUser,
  ) {
    return this.medicalRecordsService.reject(id, user.hospital_id);
  }

  @Roles('ADMIN')
  @Permissions('medical.delete')
  @Delete(':id')
  @ApiOkResponse({
    description: 'Medical record deleted successfully.',
    type: MedicalRecordEntity,
  })
  remove(
    @Param('id') id: string,
    @CurrentUser() user: requestedUserInterface.RequestedUser,
  ) {
    return this.medicalRecordsService.remove(id, user.hospital_id);
  }
}
