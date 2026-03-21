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
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
  ApiUnprocessableEntityResponse,
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiParam,
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
import { MedicalRecordEntity } from './entities/medical-record.entity';

@ApiTags('Medical Records')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, PermissionsGuard, RolesGuard)
@Controller('medical-records')
export class MedicalRecordsController {
  constructor(private readonly medicalRecordsService: MedicalRecordsService) {}

  @Roles('ADMIN', 'STAFF')
  @Permissions('medical.create')
  @Post()
  @ApiOperation({ summary: 'Create a new medical record' })
  @ApiCreatedResponse({
    description: 'The medical record has been successfully created.',
    type: MedicalRecordEntity,
  })
  @ApiBadRequestResponse({ description: 'Invalid input data.' })
  @ApiConflictResponse({ description: 'Donation already has a record.' })
  create(
    @Body() createMedicalRecordDto: CreateMedicalRecordDto,
    @CurrentUser() user: requestedUserInterface.RequestedUser,
  ) {
    return this.medicalRecordsService.create(createMedicalRecordDto);
  }

  @Roles('ADMIN', 'STAFF')
  @Permissions('medical.access')
  @Get()
  @ApiOperation({ summary: 'Retrieve all medical records for the hospital' })
  @ApiOkResponse({
    description: 'List of medical records retrieved successfully.',
    type: [MedicalRecordEntity],
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
  @ApiOperation({ summary: 'Get a specific medical record by ID' })
  @ApiParam({ name: 'id', description: 'Medical Record UUID' })
  @ApiOkResponse({
    description: 'Medical record found.',
    type: MedicalRecordEntity,
  })
  @ApiNotFoundResponse({ description: 'Medical record not found.' })
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: requestedUserInterface.RequestedUser,
  ) {
    return this.medicalRecordsService.findOne(id, user.hospital_id);
  }

  @Roles('ADMIN', 'STAFF')
  @Permissions('medical.update')
  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing medical record' })
  @ApiParam({ name: 'id', description: 'Medical Record UUID' })
  @ApiOkResponse({
    description: 'Medical record updated successfully.',
    type: MedicalRecordEntity,
  })
  @ApiNotFoundResponse({ description: 'Medical record not found.' })
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
  @ApiOperation({ summary: 'Approve a medical record' })
  @ApiParam({ name: 'id', description: 'Medical Record UUID' })
  @ApiOkResponse({
    description: 'Medical record approved.',
    type: MedicalRecordEntity,
  })
  @ApiUnprocessableEntityResponse({
    description: 'Cannot approve record with positive test results.',
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
  @ApiOperation({ summary: 'Reject a medical record' })
  @ApiParam({ name: 'id', description: 'Medical Record UUID' })
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
  @ApiOperation({ summary: 'Delete a medical record (Soft Delete)' })
  @ApiParam({ name: 'id', description: 'Medical Record UUID' })
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
