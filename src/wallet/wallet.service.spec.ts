import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { WalletService } from './wallet.service';

describe('WalletService', () => {
  let service: WalletService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WalletService],
    }).compile();

    service = module.get<WalletService>(WalletService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('getBalance for unknown user returns 0', () => {
    expect(service.getBalance('nonexistent')).toBe(0);
  });

  it('credit for new user creates wallet', async () => {
    const balance = await service.credit('newUser', 50);
    expect(balance).toBe(50);
    expect(service.getBalance('newUser')).toBe(50);
  });

  it('credit increases balance', async () => {
    const first = await service.credit('userCredit', 100);
    expect(first).toBe(100);
    const second = await service.credit('userCredit', 50);
    expect(second).toBe(150);
    expect(service.getBalance('userCredit')).toBe(150);
  });

  it('debit decreases balance', async () => {
    await service.credit('userDebit', 100);
    const balance = await service.debit('userDebit', 30);
    expect(balance).toBe(70);
    expect(service.getBalance('userDebit')).toBe(70);
  });

  it('debit with insufficient balance throws Insufficient balance', async () => {
    await service.credit('userInsufficient', 10);
    await expect(service.debit('userInsufficient', 20)).rejects.toThrow(
      BadRequestException,
    );
    await expect(service.debit('userInsufficient', 20)).rejects.toThrow(
      'Insufficient balance',
    );
  });
});
