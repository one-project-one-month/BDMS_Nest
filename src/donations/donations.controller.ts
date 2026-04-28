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
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DonationsService } from './donations.service';
import { CreateDonationDto } from './dto/create-donation.dto';
import { UpdateDonationStatusDto } from './dto/update-donation-status.dto';
import { DonationsQueryDto } from './dto/query/donations.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decortor';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { RequestedUser } from '../common/interfaces/requested-user.interface';

@ApiTags('donations')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('donations')
export class DonationsController {
  constructor(private readonly donationsService: DonationsService) {}

  @Post()
  @Permissions('donation.create')
  create(
    @CurrentUser() user: RequestedUser,
    @Body() createDonationDto: CreateDonationDto,
  ) {
    return this.donationsService.create(user, createDonationDto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @Permissions('donation.view')
  findAll(
    @CurrentUser() user: RequestedUser,
    @Query() query: DonationsQueryDto,
  ) {
    if (!user.hospital_id) {
      throw new ForbiddenException('You are not assigned to any hospital');
    }
    return this.donationsService.findAll(user.hospital_id, query);
  }

  @Get('my')
  @Permissions('donation.view')
  findMyDonations(
    @CurrentUser() user: RequestedUser,
    @Query() query: DonationsQueryDto,
  ) {
    return this.donationsService.findMyDonations(user.id, query);
  }

  @Get(':id')
  @Permissions('donation.view')
  findOne(
    @CurrentUser() user: RequestedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.donationsService.findOne(user, id);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @Permissions('donation.update')
  updateStatus(
    @CurrentUser() user: RequestedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDonationStatusDto,
  ) {
    return this.donationsService.updateStatus(
      id,
      user.id,
      dto,
      user.hospital_id,
    );
  }

  @Patch(':id/cancel')
  @Permissions('donation.update')
  cancelDonation(
    @CurrentUser() user: RequestedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.donationsService.cancelDonation(id, user.id, user.hospital_id);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Permissions('donation.delete')
  remove(
    @CurrentUser() user: RequestedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.donationsService.remove(id, user.hospital_id);
  }
}
