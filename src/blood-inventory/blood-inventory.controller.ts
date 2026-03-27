import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Put,
  Query,
  UseGuards,
  ForbiddenException,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { BloodInventoryService } from './blood-inventory.service';
import { CreateBloodInventoryDto } from './dto/create-blood-inventory.dto';
import { UpdateBloodInventoryDto } from './dto/update-blood-inventory.dto';
import { BloodInventoryQueryDto } from './dto/query/blood-inventroy.dto';
import { MarkUsedBloodInventoryDto } from './dto/mark-used-blood-inventory.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { Roles } from '../auth/decorators/roles.decortor';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { RequestedUser } from '../common/interfaces/requested-user.interface';

@ApiTags('blood-inventories')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('blood-inventories')
export class BloodInventoryController {
  constructor(private readonly bloodInventoryService: BloodInventoryService) {}

  @Post()
  @ApiOperation({ summary: 'Create blood inventory item' })
  @Permissions('inventory.create')
  create(
    @CurrentUser() user: RequestedUser,
    @Body() createBloodInventoryDto: CreateBloodInventoryDto,
  ) {
    if (!user.hospital_id) {
      throw new ForbiddenException('You are not assigned to any hospital');
    }

    return this.bloodInventoryService.create(createBloodInventoryDto, user);
  }

  @Get()
  @ApiOperation({
    summary: 'List blood inventories with grouping and pagination',
  })
  @Permissions('inventory.view')
  findAll(
    @CurrentUser() user: RequestedUser,
    @Query() query: BloodInventoryQueryDto,
  ) {
    if (!user.hospital_id) {
      throw new ForbiddenException('You are not assigned to any hospital');
    }

    return this.bloodInventoryService.findAll(query, user.hospital_id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get blood inventory by ID' })
  @Permissions('inventory.view')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: RequestedUser,
  ) {
    if (!user.hospital_id) {
      throw new ForbiddenException('You are not assigned to any hospital');
    }

    return this.bloodInventoryService.findOne(id, user.hospital_id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update blood inventory by ID' })
  @Permissions('inventory.update')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: RequestedUser,
    @Body() updateBloodInventoryDto: UpdateBloodInventoryDto,
  ) {
    if (!user.hospital_id) {
      throw new ForbiddenException('You are not assigned to any hospital');
    }

    return this.bloodInventoryService.update(
      id,
      updateBloodInventoryDto,
      user.hospital_id,
    );
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @Put(':id/used')
  @ApiOperation({ summary: 'Mark blood inventory as used' })
  @Permissions('inventory.manage')
  markUsed(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: RequestedUser,
    @Body() dto: MarkUsedBloodInventoryDto,
  ) {
    if (!user.hospital_id) {
      throw new ForbiddenException('You are not assigned to any hospital');
    }

    return this.bloodInventoryService.markUsed(id, dto, user.hospital_id);
  }
}
