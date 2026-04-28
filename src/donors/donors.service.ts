import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CreateDonorDto } from './dto/create-donor.dto';
import { UpdateDonorDto } from './dto/update-donor.dto';
import { DonorsQueryDto } from './dto/query/donors.query.dto';
import { DonorsRepository } from './donors.repository';
import { RequestedUser } from '../common/interfaces/requested-user.interface';
import { paginate, paginatedResult } from '../common/helpers/paginate.helper';

@Injectable()
export class DonorsService {
  constructor(private readonly donorsRepo: DonorsRepository) {}

  async register(user: RequestedUser, dto: CreateDonorDto) {
    let userId = dto.user_id;

    if (user.role === 'USER') {
      userId = user.id;
    } else if (!userId) {
      throw new BadRequestException('user_id is required');
    }

    const existing = await this.donorsRepo.findByUserId(userId);
    if (existing) {
      throw new ConflictException('This user is already registered as a donor');
    }

    const nrcTaken = await this.donorsRepo.findByNrcNo(dto.nrc_no);
    if (nrcTaken) {
      throw new ConflictException('NRC number already registered');
    }

    try {
      const donor = await this.donorsRepo.create({
        ...dto,
        user_id: userId,
        date_of_birth: new Date(dto.date_of_birth),
      });

      return { message: 'Donor registered successfully', data: donor };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('User not found');
      }
      throw error;
    }
  }

  async findAll(hospitalId: string, query: DonorsQueryDto) {
    const { page, limit } = query;
    const { skip, take } = paginate(page, limit);

    const [data, total] = await this.donorsRepo.queryWithCount(
      query,
      hospitalId,
      skip,
      take,
    );

    return {
      message: 'Donors fetched successfully',
      data: paginatedResult(data, total, page, limit),
    };
  }

  async findMe(userId: string) {
    const donor = await this.donorsRepo.findByUserId(userId);
    if (!donor) {
      throw new NotFoundException('You are not registered as a donor');
    }
    return { message: 'Donor profile fetched successfully', data: donor };
  }

  async findOne(id: string, hospitalId: string) {
    const donor = await this.findDonorOrThrow(id, hospitalId);
    return { message: 'Donor fetched successfully', data: donor };
  }

  async update(id: string, hospitalId: string, dto: UpdateDonorDto) {
    await this.findDonorOrThrow(id, hospitalId);

    if (dto.nrc_no) {
      const nrcTaken = await this.donorsRepo.findByNrcNo(dto.nrc_no, id);
      if (nrcTaken) {
        throw new ConflictException('NRC number already registered');
      }
    }

    const updated = await this.donorsRepo.updateById(id, {
      ...dto,
      ...(dto.date_of_birth && { date_of_birth: new Date(dto.date_of_birth) }),
    });

    return { message: 'Donor updated successfully', data: updated };
  }

  async remove(id: string, hospitalId: string) {
    await this.findDonorOrThrow(id, hospitalId);
    await this.donorsRepo.softDelete(id);
    return { message: 'Donor deleted successfully' };
  }

  private async findDonorOrThrow(id: string, hospitalId: string) {
    const donor = await this.donorsRepo.findByIdWithHospital(id);

    if (!donor) {
      throw new NotFoundException('Donor not found');
    }

    if ((donor.user as { hospital_id: string }).hospital_id !== hospitalId) {
      throw new ForbiddenException('Donor does not belong to your hospital');
    }

    return donor;
  }
}
