import { Injectable, BadRequestException } from '@nestjs/common';

type Wallet = {
  userId: string;
  balance: number;
};

const wallets: Record<string, Wallet> = {
  u1: { userId: 'u1', balance: 100 },
};

/**
 * Wallet service with in-memory storage.
 * Amounts are in the smallest currency unit (e.g. cents); use integers to avoid floating-point issues.
 * Operations for the same user are serialized via a per-user lock to prevent race conditions (e.g. over-deduction).
 */
@Injectable()
export class WalletService {
  /** Per-user lock: each user's operations run one after another. */
  private pendingByUser = new Map<string, Promise<unknown>>();

  /**
   * Runs an operation for the given user after any previous operation for that user has completed.
   * Prevents concurrent credit/debit from causing inconsistent balance (e.g. double-spend).
   */
  private runSerialized<T>(userId: string, fn: () => Promise<T> | T): Promise<T> {
    const prev = this.pendingByUser.get(userId) ?? Promise.resolve();
    const next = prev.then(() => fn());
    this.pendingByUser.set(userId, next.catch(() => {}));
    return next;
  }

  getBalance(userId: string): number {
    return wallets[userId]?.balance ?? 0;
  }

  /**
   * Credits amount to the user's wallet. If the user has no wallet yet, creates one with balance 0 then applies the credit.
   */
  async credit(userId: string, amount: number): Promise<number> {
    return this.runSerialized(userId, () => {
      let wallet = wallets[userId];
      if (!wallet) {
        wallet = { userId, balance: 0 };
        wallets[userId] = wallet;
      }
      wallet.balance += amount;
      return wallet.balance;
    });
  }

  /**
   * Debits amount from the user's wallet. Throws if wallet does not exist or balance is insufficient.
   */
  async debit(userId: string, amount: number): Promise<number> {
    return this.runSerialized(userId, () => {
      const wallet = wallets[userId];
      if (!wallet) {
        throw new BadRequestException('Wallet not found');
      }
      if (wallet.balance < amount) {
        throw new BadRequestException('Insufficient balance');
      }
      wallet.balance -= amount;
      return wallet.balance;
    });
  }
}
