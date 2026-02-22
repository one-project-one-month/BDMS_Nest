import { Injectable } from '@nestjs/common';
import { CreateDonationDto } from './dto/create-donation.dto';
import { UpdateDonationDto } from './dto/update-donation.dto';
import { DonationsQueryDto } from './dto/query/donations.dto';
import { paginate, paginatedResult } from 'src/common/helpers/paginate.helper';

@Injectable()
export class DonationsService {
  create(createDonationDto: CreateDonationDto) {
    return 'This action adds a new donation';
  }

  findAll(query: DonationsQueryDto) {
    const { page, limit } = query;
    const { skip, take } = paginate(page, limit);

    const total = 0; // Replace with actual total count from database

    return {
      data: paginatedResult([], total, page, limit),
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} donation`;
  }

  update(id: number, updateDonationDto: UpdateDonationDto) {
    return `This action updates a #${id} donation`;
  }

  remove(id: number) {
    return `This action removes a #${id} donation`;
  }
}
