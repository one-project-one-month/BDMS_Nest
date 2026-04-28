import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ForbiddenException,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DonorsService } from './donors.service';
import { CreateDonorDto } from './dto/create-donor.dto';
import { UpdateDonorDto } from './dto/update-donor.dto';
import { DonorsQueryDto } from './dto/query/donors.query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decortor';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { RequestedUser } from '../common/interfaces/requested-user.interface';

@ApiTags('donors')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('donors')
export class DonorsController {
  constructor(private readonly donorsService: DonorsService) {}

  @Post()
  @Permissions('donor.create')
  register(@CurrentUser() user: RequestedUser, @Body() dto: CreateDonorDto) {
    return this.donorsService.register(user, dto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @Permissions('donor.view')
  findAll(@CurrentUser() user: RequestedUser, @Query() query: DonorsQueryDto) {
    if (!user.hospital_id) {
      throw new ForbiddenException('You are not assigned to any hospital');
    }
    return this.donorsService.findAll(user.hospital_id, query);
  }

  @Get('me')
  @Permissions('donor.view')
  findMe(@CurrentUser() user: RequestedUser) {
    return this.donorsService.findMe(user.id);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @Permissions('donor.view')
  findOne(
    @CurrentUser() user: RequestedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    if (!user.hospital_id) {
      throw new ForbiddenException('You are not assigned to any hospital');
    }
    return this.donorsService.findOne(id, user.hospital_id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @Permissions('donor.update')
  update(
    @CurrentUser() user: RequestedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDonorDto,
  ) {
    if (!user.hospital_id) {
      throw new ForbiddenException('You are not assigned to any hospital');
    }
    return this.donorsService.update(id, user.hospital_id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Permissions('donor.delete')
  remove(
    @CurrentUser() user: RequestedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    if (!user.hospital_id) {
      throw new ForbiddenException('You are not assigned to any hospital');
    }
    return this.donorsService.remove(id, user.hospital_id);
  }
}
