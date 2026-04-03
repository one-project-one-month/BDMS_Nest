import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { Roles } from '../auth/decorators/roles.decortor';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CertificatesService } from './certificates.service';
import { CreateCertificateDto } from './dto/create-certificate.dto';

@ApiTags('certificates')
@UseGuards(JwtAuthGuard, PermissionsGuard, RolesGuard)
@Roles('ADMIN')
@Controller('certificates')
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

  @ApiOperation({ summary: 'Generate certificate for donor' })
  @Permissions('certificate.create')
  @Post('generate')
  generateCertificate(@Body() createCertificateDto: CreateCertificateDto) {
    return this.certificatesService.generateCertificate(createCertificateDto);
  }

  @ApiOperation({ summary: 'Get all certificates' })
  @Permissions('certificate.access')
  @Get('list')
  findAll() {
    return this.certificatesService.findAll();
  }

  @ApiOperation({ summary: 'Get certificate by id' })
  @Permissions('certificate.view')
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.certificatesService.findOne(id);
  }

  @ApiOperation({ summary: 'Get certificates by donor id' })
  @Permissions('certificate.view')
  @Get('donor/:donorId')
  findByDonorId(@Param('donorId', ParseUUIDPipe) donorId: string) {
    return this.certificatesService.findByDonorId(donorId);
  }

  @ApiOperation({ summary: 'Soft delete certificate by id' })
  @Permissions('certificate.delete')
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.certificatesService.remove(id);
  }
}
