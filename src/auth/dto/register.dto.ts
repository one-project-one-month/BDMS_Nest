import { PartialType } from '@nestjs/mapped-types';
import { LoginDto } from './logint.dto';

export class RegisterDto extends PartialType(LoginDto) { }
