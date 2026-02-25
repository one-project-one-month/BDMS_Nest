import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(
    OmitType(CreateUserDto, ['user_name'] as const), //username not updateable
) { }