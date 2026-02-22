import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersQueryDto } from './dto/query/users.dto';
import { paginate, paginatedResult } from 'src/common/helpers/paginate.helper';

@Injectable()
export class UsersService {
  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  findAll(query: UsersQueryDto) {
    const { page, limit } = query;
    const { skip, take } = paginate(page, limit);

    const total = 0; // Replace with actual total count from database

    return {
      data: paginatedResult([], total, page, limit),
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
