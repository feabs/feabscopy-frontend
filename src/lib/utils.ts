
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Masks an account number, showing only the first few and last few digits.
 * e.g., "1234567890" -> "123...890" or "9905380079" -> "990...079"
 * @param accountNumber The account number string.
 * @param visibleStart Number of digits to show at the start.
 * @param visibleEnd Number of digits to show at the end.
 * @returns Masked account number string.
 */
export function maskAccountNumber(
  accountNumber: string,
  visibleStart: number = 3,
  visibleEnd: number = 3
): string {
  if (!accountNumber || accountNumber.length <= visibleStart + visibleEnd) {
    return accountNumber; // Not enough digits to mask meaningfully or invalid input
  }
  const start = accountNumber.substring(0, visibleStart);
  const end = accountNumber.substring(accountNumber.length - visibleEnd);
  return `${start}••••••${end}`;
}
