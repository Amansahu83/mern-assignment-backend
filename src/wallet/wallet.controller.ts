import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { AmountDto } from './dto/amount.dto';
import { BalanceQueryDto } from './dto/balance-query.dto';
import { WalletService } from './wallet.service';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get('balance')
  getBalance(@Query() query: BalanceQueryDto) {
    return {
      balance: this.walletService.getBalance(query.userId),
    };
  }

  @Post('credit')
  async credit(@Body() body: AmountDto) {
    const balance = await this.walletService.credit(body.userId, body.amount);
    return { balance };
  }

  @Post('debit')
  async debit(@Body() body: AmountDto) {
    const balance = await this.walletService.debit(body.userId, body.amount);
    return { balance };
  }
}
