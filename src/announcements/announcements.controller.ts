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
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { AnnouncementsService } from './announcements.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';
import { UpdateExpiryDto } from './dto/update-expiry.dto';
import { AnnouncementsQueryDto } from './dto/query/announcements.dto';

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Roles } from 'src/auth/decorators/roles.decortor';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Permissions } from 'src/auth/decorators/permissions.decorator';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';

@ApiTags('announcements')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('announcements')
export class AnnouncementsController {
  constructor(private readonly announcementsService: AnnouncementsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @Permissions('announcement.create')
  @ApiOperation({
    summary: 'Create a new announcement (Admin & Staff only)',
    description: 'Admin or Staff can create a new announcement.',
  })
  create(@Body() createAnnouncementDto: CreateAnnouncementDto) {
    return this.announcementsService.create(createAnnouncementDto);
  }

  @Get()
  @Permissions('announcement.view')
  @ApiOperation({
    summary: 'Get all announcements',
    description:
      'All authenticated users can view announcements. Supports ?is_active=, ?search=, ?page=, ?limit=.',
  })
  findAll(@Query() query: AnnouncementsQueryDto) {
    return this.announcementsService.findAll(query);
  }

  @Get(':id')
  @Permissions('announcement.view')
  @ApiOperation({
    summary: 'Get an announcement by ID',
    description: 'Retrieve a specific announcement by its UUID.',
  })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.announcementsService.findOne(id);
  }

  @Patch(':id/toggle-active')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @Permissions('announcement.update')
  @ApiOperation({
    summary: 'Toggle announcement active status (Admin & Staff only)',
    description: 'Flips the is_active flag of the announcement.',
  })
  toggleActive(@Param('id', ParseUUIDPipe) id: string) {
    return this.announcementsService.toggleActive(id);
  }

  @Patch(':id/update-expiry')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @Permissions('announcement.update')
  @ApiOperation({
    summary: 'Update announcement expiry date (Admin & Staff only)',
    description: 'Change the expiry date of an announcement.',
  })
  updateExpiry(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateExpiryDto: UpdateExpiryDto,
  ) {
    return this.announcementsService.updateExpiry(id, updateExpiryDto);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @Permissions('announcement.update')
  @ApiOperation({
    summary: 'Update an announcement (Admin & Staff only)',
    description: 'Admin or Staff can update any fields of an announcement.',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAnnouncementDto: UpdateAnnouncementDto,
  ) {
    return this.announcementsService.update(id, updateAnnouncementDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Permissions('announcement.delete')
  @ApiOperation({
    summary: 'Delete an announcement (Admin only)',
    description: 'Admin can permanently delete an announcement.',
  })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.announcementsService.remove(id);
  }
}
