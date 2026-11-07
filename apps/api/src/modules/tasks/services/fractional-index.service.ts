import { Injectable } from '@nestjs/common';

@Injectable()
export class FractionalIndexService {
  private readonly digits = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

  /**
   * Generates a lexicographical order key between two existing keys.
   * If both are null, returns initial key 'a0'.
   */
  generateKeyBetween(prevKey: string | null, nextKey: string | null): string {
    if (!prevKey && !nextKey) {
      return 'a0';
    }

    if (!prevKey && nextKey) {
      return this.generatePrecedingKey(nextKey);
    }

    if (prevKey && !nextKey) {
      return this.generateSucceedingKey(prevKey);
    }

    return this.generateMidpoint(prevKey!, nextKey!);
  }

  private generatePrecedingKey(key: string): string {
    const firstChar = key[0];
    const index = this.digits.indexOf(firstChar);

    if (index > 0) {
      return this.digits[index - 1] + key.slice(1);
    }

    return this.digits[0] + key;
  }

  private generateSucceedingKey(key: string): string {
    const firstChar = key[0];
    const index = this.digits.indexOf(firstChar);

    if (index < this.digits.length - 1) {
      return this.digits[index + 1] + key.slice(1);
    }

    return key + this.digits[Math.floor(this.digits.length / 2)];
  }

  private generateMidpoint(prev: string, next: string): string {
    let p = 0;
    while (p < prev.length || p < next.length) {
      const prevChar = prev[p] ?? this.digits[0];
      const nextChar = next[p] ?? this.digits[this.digits.length - 1];

      const prevIndex = this.digits.indexOf(prevChar);
      const nextIndex = this.digits.indexOf(nextChar);

      if (nextIndex - prevIndex > 1) {
        const midIndex = Math.floor((prevIndex + nextIndex) / 2);
        return prev.slice(0, p) + this.digits[midIndex];
      }

      p++;
    }

    // Fallback: append mid-character to prev string
    return prev + this.digits[Math.floor(this.digits.length / 2)];
  }
}
