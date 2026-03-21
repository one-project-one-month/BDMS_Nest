import { ApiProperty } from '@nestjs/swagger';

export class BaseResponseDto<T> {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: 'Request successful' })
  message: string;

  @ApiProperty()
  data: T;

  @ApiProperty({ example: '2024-03-21T12:00:00.000Z' })
  timestamp: string;
}

export class PaginatedResponseDto<T> extends BaseResponseDto<T[]> {
  @ApiProperty({
    example: {
      total: 100,
      page: 1,
      limit: 10,
      totalPages: 10,
    },
  })
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
