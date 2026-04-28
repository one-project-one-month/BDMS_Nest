import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from '../database/database.service';
import { DonorsQueryDto } from './dto/query/donors.query.dto';

@Injectable()
export class DonorsRepository {
  constructor(private readonly prisma: DatabaseService) {}

  private readonly selectDonor: Prisma.DonorSelect = {
    id: true,
    user_id: true,
    nrc_no: true,
    date_of_birth: true,
    gender: true,
    blood_group: true,
    weight: true,
    last_donation_date: true,
    remarks: true,
    emergency_contact: true,
    emergency_phone: true,
    address: true,
    is_active: true,
    created_at: true,
    updated_at: true,
    user: {
      select: { user_name: true, email: true },
    },
  };

  async create(data: Prisma.DonorUncheckedCreateInput) {
    return this.prisma.donor.create({ data, select: this.selectDonor });
  }

  async findById(id: string) {
    return this.prisma.donor.findFirst({
      where: { id, deleted_at: null },
      select: this.selectDonor,
    });
  }

  async findByIdWithHospital(id: string) {
    return this.prisma.donor.findFirst({
      where: { id, deleted_at: null },
      select: {
        ...this.selectDonor,
        user: { select: { user_name: true, email: true, hospital_id: true } },
      },
    });
  }

  async findByUserId(userId: string) {
    return this.prisma.donor.findUnique({
      where: { user_id: userId },
      select: this.selectDonor,
    });
  }

  async findByNrcNo(nrcNo: string, excludeId?: string) {
    return this.prisma.donor.findFirst({
      where: {
        nrc_no: nrcNo,
        ...(excludeId && { id: { not: excludeId } }),
      },
      select: { id: true },
    });
  }

  async queryWithCount(
    query: DonorsQueryDto,
    hospitalId: string,
    skip: number,
    take: number,
  ) {
    const where = this.buildWhereClause(query, hospitalId);
    return Promise.all([
      this.prisma.donor.findMany({
        where,
        select: this.selectDonor,
        skip,
        take,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.donor.count({ where }),
    ]);
  }

  async updateById(id: string, data: Prisma.DonorUncheckedUpdateInput) {
    return this.prisma.donor.update({
      where: { id },
      data,
      select: this.selectDonor,
    });
  }

  async softDelete(id: string) {
    return this.prisma.donor.update({
      where: { id },
      data: { deleted_at: new Date() },
      select: { id: true },
    });
  }

  private buildWhereClause(
    query: DonorsQueryDto,
    hospitalId: string,
  ): Prisma.DonorWhereInput {
    const { blood_group, gender, is_active, search } = query;
    return {
      deleted_at: null,
      user: { hospital_id: hospitalId },
      ...(blood_group && { blood_group }),
      ...(gender && { gender }),
      ...(is_active !== undefined && { is_active }),
      ...(search && {
        OR: [
          { nrc_no: { contains: search, mode: 'insensitive' } },
          { address: { contains: search, mode: 'insensitive' } },
          {
            user: { user_name: { contains: search, mode: 'insensitive' } },
          },
          {
            user: { email: { contains: search, mode: 'insensitive' } },
          },
        ],
      }),
    };
  }
}
