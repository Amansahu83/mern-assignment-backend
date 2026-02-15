import { IsNotEmpty, IsString } from 'class-validator';

/**
 * Query parameters for GET /wallet/balance.
 */
export class BalanceQueryDto {
  @IsString()
  @IsNotEmpty()
  userId: string;
}
