import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { BloodInventoryService } from './blood-inventory.service';
import { CreateBloodInventoryDto } from './dto/create-blood-inventory.dto';
import { UpdateBloodInventoryDto } from './dto/update-blood-inventory.dto';

@Controller('blood-inventory')
export class BloodInventoryController {
  constructor(private readonly bloodInventoryService: BloodInventoryService) {}

  @Post()
  create(@Body() createBloodInventoryDto: CreateBloodInventoryDto) {
    return this.bloodInventoryService.create(createBloodInventoryDto);
  }

  @Get()
  findAll() {
    return this.bloodInventoryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bloodInventoryService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateBloodInventoryDto: UpdateBloodInventoryDto,
  ) {
    return this.bloodInventoryService.update(+id, updateBloodInventoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bloodInventoryService.remove(+id);
  }
}
