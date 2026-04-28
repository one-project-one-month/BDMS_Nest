import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, DonationStatus } from '@prisma/client';
import { randomInt } from 'crypto';
import { CreateDonationDto } from './dto/create-donation.dto';
import { UpdateDonationStatusDto } from './dto/update-donation-status.dto';
import { DonationsQueryDto } from './dto/query/donations.dto';
import { DonationsRepository } from './donations.repository';
import { RequestedUser } from '../common/interfaces/requested-user.interface';
import { paginate, paginatedResult } from '../common/helpers/paginate.helper';

@Injectable()
export class DonationsService {
  constructor(private readonly donationsRepo: DonationsRepository) {}

  async create(user: RequestedUser, dto: CreateDonationDto) {
    if (!user.hospital_id) {
      throw new ForbiddenException('You are not assigned to any hospital');
    }

    let donorId = dto.donor_id;

    if (user.role === 'USER') {
      const donor = await this.donationsRepo.findDonorByUserId(user.id);
      if (!donor) {
        throw new BadRequestException('You are not registered as a donor');
      }
      donorId = donor.id;
    } else if (!donorId) {
      throw new BadRequestException('donor_id is required');
    }

    try {
      const donation = await this.donationsRepo.createDonation({
        donorId: donorId,
        hospitalId: user.hospital_id,
        userId: user.id,
        donationCode: this.generateDonationCode(),
        dto,
      });

      return { message: 'Donation created successfully', data: donation };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Donor or blood request not found');
      }
      throw error;
    }
  }

  async findAll(hospitalId: string, query: DonationsQueryDto) {
    const { page, limit } = query;
    const { skip, take } = paginate(page, limit);

    const [data, total] = await this.donationsRepo.queryWithCount(
      query,
      { hospital_id: hospitalId },
      skip,
      take,
    );

    return {
      message: 'Donations fetched successfully',
      data: paginatedResult(data, total, page, limit),
    };
  }

  async findMyDonations(userId: string, query: DonationsQueryDto) {
    const donor = await this.donationsRepo.findDonorByUserId(userId);
    if (!donor) {
      throw new BadRequestException('You are not registered as a donor');
    }

    const { page, limit } = query;
    const { skip, take } = paginate(page, limit);

    const [data, total] = await this.donationsRepo.queryWithCount(
      query,
      { donor_id: donor.id },
      skip,
      take,
    );

    return {
      message: 'My donations fetched successfully',
      data: paginatedResult(data, total, page, limit),
    };
  }

  async findOne(user: RequestedUser, id: string) {
    const donation = await this.findDonationOrThrow(id);

    const isAdminOrStaff = user.role === 'ADMIN' || user.role === 'STAFF';

    if (isAdminOrStaff) {
      if (user.hospital_id && donation.hospital_id !== user.hospital_id) {
        throw new NotFoundException('Donation not found');
      }
    } else {
      const donor = await this.donationsRepo.findDonorByUserId(user.id);
      if (!donor || donation.donor_id !== donor.id) {
        throw new ForbiddenException(
          'You do not have permission to view this donation',
        );
      }
    }

    return {
      message: 'Donation fetched successfully',
      data: await this.donationsRepo.findById(id),
    };
  }

  async updateStatus(
    id: string,
    adminId: string,
    dto: UpdateDonationStatusDto,
    hospitalId?: string,
  ) {
    if (dto.status === DonationStatus.pending) {
      throw new BadRequestException('Cannot revert a donation back to pending');
    }

    await this.findDonationOrThrow(id, { hospitalId });

    const updated = await this.donationsRepo.applyStatusUpdate(
      id,
      dto,
      adminId,
      hospitalId,
    );

    if (updated === 0) {
      throw new BadRequestException('Failed to update donation status');
    }

    return {
      message: `Donation status updated to ${dto.status} successfully`,
      data: await this.donationsRepo.findById(id),
    };
  }

  async cancelDonation(id: string, userId: string, hospitalId?: string) {
    const donor = await this.donationsRepo.findDonorByUserId(userId);
    if (!donor) {
      throw new BadRequestException('You are not registered as a donor');
    }

    const updated = await this.donationsRepo.cancelIfPending(
      id,
      hospitalId,
      donor.id,
    );

    if (updated === 0) {
      await this.findDonationOrThrow(id, { hospitalId, donorId: donor.id });
      throw new BadRequestException(
        'Cannot cancel donation. It is not in pending status',
      );
    }

    return {
      message: 'Donation cancelled successfully',
      data: await this.donationsRepo.findById(id),
    };
  }

  async remove(id: string, hospitalId?: string) {
    await this.findDonationOrThrow(id, { hospitalId });
    await this.donationsRepo.softDelete(id);
    return { message: 'Donation deleted successfully' };
  }

  private async findDonationOrThrow(
    id: string,
    options: {
      hospitalId?: string;
      donorId?: string;
      notFoundMessage?: string;
    } = {},
  ) {
    const donation = await this.donationsRepo.findByIdRaw(id);

    if (
      !donation ||
      (options.hospitalId && donation.hospital_id !== options.hospitalId) ||
      (options.donorId && donation.donor_id !== options.donorId)
    ) {
      throw new NotFoundException(
        options.notFoundMessage ?? 'Donation not found',
      );
    }

    return donation;
  }

  private generateDonationCode() {
    return `DON-${randomInt(100000, 1000000)}`;
  }
}
