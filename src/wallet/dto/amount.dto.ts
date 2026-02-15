import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
} from 'class-validator';

/**
 * Request body for credit and debit operations.
 * Amounts are in the smallest currency unit (e.g. cents) to avoid floating-point issues.
 */
export class AmountDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsNumber()
  @IsPositive()
  @IsInt()
  amount: number;
}
