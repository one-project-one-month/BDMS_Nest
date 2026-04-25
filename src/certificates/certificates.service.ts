import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AppointmentStatus } from '@prisma/client';
import { DatabaseService } from '../database/database.service';
import { CreateCertificateDto } from './dto/create-certificate.dto';

@Injectable()
export class CertificatesService {
  constructor(private readonly db: DatabaseService) {}

  async generateCertificate(createCertificateDto: CreateCertificateDto) {
    const { donor_id, certificate_title, certificate_description } =
      createCertificateDto;

    const donor = await this.db.donor.findFirst({
      where: {
        id: donor_id,
        deleted_at: null,
        is_active: true,
      },
      select: {
        id: true,
        user_id: true,
        nrc_no: true,
      },
    });

    if (!donor) {
      throw new BadRequestException('Donor not found or is inactive');
    }

    const hasCompletedDonation = await this.db.appointment.findFirst({
      where: {
        user_id: donor.user_id,
        donation_id: {
          not: null,
        },
        status: AppointmentStatus.completed,
        deleted_at: null,
      },
      select: {
        id: true,
      },
    });

    if (!hasCompletedDonation) {
      throw new BadRequestException(
        'Donor must have at least one completed donation to generate a certificate',
      );
    }

    const certificate = await this.db.certificate.create({
      data: {
        user_id: donor.user_id,
        certificate_title: certificate_title ?? 'Donation Certificate',
        certificate_description:
          certificate_description ??
          `Certificate for blood donor ${donor.nrc_no}`,
        certificate_date: new Date(),
      },
    });

    return {
      message: 'Certificate generated successfully',
      data: certificate,
    };
  }

  async findAll() {
    const certificates = await this.db.certificate.findMany({
      where: {
        deleted_at: null,
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return {
      message: 'Certificates fetched successfully',
      data: certificates,
    };
  }

  async findOne(id: string) {
    const certificate = await this.db.certificate.findFirst({
      where: {
        id,
        deleted_at: null,
      },
    });

    if (!certificate) {
      throw new NotFoundException('Certificate not found');
    }

    return {
      message: 'Success',
      data: certificate,
    };
  }

  async findByDonorId(donorId: string) {
    const donor = await this.db.donor.findFirst({
      where: {
        id: donorId,
        deleted_at: null,
      },
      select: {
        user_id: true,
      },
    });

    if (!donor) {
      throw new NotFoundException('Donor not found');
    }

    const certificates = await this.db.certificate.findMany({
      where: {
        user_id: donor.user_id,
        deleted_at: null,
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return {
      message: 'Success',
      data: certificates,
    };
  }

  async remove(id: string) {
    const certificate = await this.db.certificate.findFirst({
      where: {
        id,
        deleted_at: null,
      },
      select: {
        id: true,
      },
    });

    if (!certificate) {
      throw new NotFoundException('Certificate not found');
    }

    await this.db.certificate.update({
      where: {
        id,
      },
      data: {
        deleted_at: new Date(),
      },
    });

    return {
      message: 'Certificate deleted successfully',
      data: null,
    };
  }
}
