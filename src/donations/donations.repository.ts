import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { DonationStatus, Prisma } from '@prisma/client';
import { DonationsQueryDto } from './dto/query/donations.dto';
import { CreateDonationDto } from './dto/create-donation.dto';
import { UpdateDonationStatusDto } from './dto/update-donation-status.dto';

@Injectable()
export class DonationsRepository {
  constructor(private readonly prisma: DatabaseService) {}

  public readonly selectDonation: Prisma.DonationSelect = {
    id: true,
    donor_id: true,
    hospital_id: true,
    blood_request_id: true,
    created_by: true,
    donation_code: true,
    blood_group: true,
    units_donated: true,
    donation_date: true,
    status: true,
    approved_by: true,
    approved_at: true,
    remarks: true,
    created_at: true,
    updated_at: true,
    donor: {
      select: {
        user: { select: { user_name: true, email: true } },
      },
    },
    hospital: {
      select: { name: true, phone: true },
    },
    creator: {
      select: { user_name: true },
    },
  };

  async createDonation(params: {
    donorId: string;
    hospitalId: string;
    userId: string;
    donationCode: string;
    dto: CreateDonationDto;
  }) {
    const { donorId, hospitalId, userId, donationCode, dto } = params;
    return this.prisma.donation.create({
      data: {
        donor: { connect: { id: donorId } },
        hospital: { connect: { id: hospitalId } },
        creator: { connect: { id: userId } },
        ...(dto.blood_request_id && {
          blood_request: { connect: { id: dto.blood_request_id } },
        }),
        blood_group: dto.blood_group,
        units_donated: dto.units_donated,
        donation_date: new Date(dto.donation_date),
        remarks: dto.remarks,
        donation_code: donationCode,
      },
      select: this.selectDonation,
    });
  }

  async findById(id: string) {
    return this.prisma.donation.findFirst({
      where: { id, deleted_at: null },
      select: this.selectDonation,
    });
  }

  async findByIdRaw(id: string) {
    return this.prisma.donation.findFirst({ where: { id, deleted_at: null } });
  }

  async queryWithCount(
    query: DonationsQueryDto,
    baseFilter: Prisma.DonationWhereInput,
    skip?: number,
    take?: number,
  ) {
    const where = this.buildWhereClause(query, baseFilter);
    return Promise.all([
      this.prisma.donation.findMany({
        where,
        select: this.selectDonation,
        skip,
        take,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.donation.count({ where }),
    ]);
  }

  async cancelIfPending(id: string, hospitalId?: string, donorId?: string) {
    const updated = await this.prisma.donation.updateMany({
      where: {
        id,
        status: DonationStatus.pending,
        ...(hospitalId && { hospital_id: hospitalId }),
        ...(donorId && { donor_id: donorId }),
      },
      data: { status: DonationStatus.cancelled },
    });
    return updated.count;
  }

  async applyStatusUpdate(
    id: string,
    dto: UpdateDonationStatusDto,
    adminId: string,
    hospitalId?: string,
  ) {
    const updated = await this.prisma.donation.updateMany({
      where: {
        id,
        ...(hospitalId && { hospital_id: hospitalId }),
      },
      data: {
        status: dto.status,
        remarks: dto.remarks,
        units_donated: dto.units_donated,
        ...(dto.status === DonationStatus.approved && {
          approved_by: adminId,
          approved_at: new Date(),
        }),
      },
    });
    return updated.count;
  }

  async softDelete(id: string) {
    return this.prisma.donation.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }

  async findDonorByUserId(userId: string) {
    return this.prisma.donor.findUnique({ where: { user_id: userId } });
  }

  private buildWhereClause(
    query: DonationsQueryDto,
    filters: Prisma.DonationWhereInput,
  ): Prisma.DonationWhereInput {
    const {
      status,
      blood_group,
      donor_id,
      from_date,
      to_date,
      with_deleted,
      search,
    } = query;

    return {
      ...filters,
      ...(status && { status }),
      ...(blood_group && { blood_group }),
      ...(donor_id && { donor_id }),
      ...(!with_deleted && { deleted_at: null }),
      ...(search && {
        OR: [
          { donation_code: { contains: search, mode: 'insensitive' } },
          { remarks: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...((from_date || to_date) && {
        donation_date: {
          ...(from_date && { gte: new Date(from_date) }),
          ...(to_date && { lte: new Date(to_date) }),
        },
      }),
    };
  }
}
