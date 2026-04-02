import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { BloodGroup } from '@prisma/client';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { BloodInventoryService } from './blood-inventory.service';
import { UseFromInventoryDto } from './dto/update-blood-inventory.dto';
import { BloodInventoryQueryDto } from './dto/query/blood-inventroy.dto';

@ApiTags('blood-inventory')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('blood-inventory')
export class BloodInventoryController {
  constructor(private readonly bloodInventoryService: BloodInventoryService) {}

  @ApiOperation({ summary: 'Get all blood inventory' })
  @Permissions('inventory.access')
  @Get('list')
  findAll(@Query() query: BloodInventoryQueryDto) {
    return this.bloodInventoryService.findAll(query);
  }

  @ApiOperation({
    summary: 'Get available stock summary by hospital/blood group',
  })
  @Permissions('inventory.view')
  @Get('available-stock')
  getAvailableStock(
    @Query('hospitalId') hospitalId?: string,
    @Query('bloodGroup') bloodGroup?: BloodGroup,
  ) {
    return this.bloodInventoryService.getAvailableStock(hospitalId, bloodGroup);
  }

  @ApiOperation({ summary: 'Get inventory records by hospital' })
  @Permissions('inventory.view')
  @Get('hospital/:hospitalId')
  findByHospital(@Param('hospitalId', ParseUUIDPipe) hospitalId: string) {
    return this.bloodInventoryService.findByHospital(hospitalId);
  }

  @ApiOperation({ summary: 'Get inventory item by id' })
  @Permissions('inventory.view')
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.bloodInventoryService.findOne(id);
  }

  @ApiOperation({ summary: 'Add donation to blood inventory' })
  @Permissions('inventory.create')
  @Post('add/:donationId')
  addToInventory(@Param('donationId', ParseUUIDPipe) donationId: string) {
    return this.bloodInventoryService.addToInventory({
      donation_id: donationId,
    });
  }

  @ApiOperation({ summary: 'Mark inventory unit as used for a blood request' })
  @Permissions('inventory.update')
  @Patch('use')
  useFromInventory(@Body() useFromInventoryDto: UseFromInventoryDto) {
    return this.bloodInventoryService.useFromInventory(useFromInventoryDto);
  }

  @ApiOperation({ summary: 'Run stock take and mark expired available units' })
  @Permissions('inventory.manage')
  @Post('stock-take')
  runStockTake(@Query('hospitalId') hospitalId?: string) {
    return this.bloodInventoryService.runStockTake(hospitalId);
  }

  @ApiOperation({ summary: 'Soft delete inventory item' })
  @Permissions('inventory.delete')
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.bloodInventoryService.remove(id);
  }
}
