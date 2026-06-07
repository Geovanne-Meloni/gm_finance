export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

export function formatBrazilianPhone(value: string): string {
  const digits = onlyDigits(value).slice(0, 11);

  if (digits.length === 0) return "";
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function normalizeBrazilianPhone(value: string): string {
  const digits = onlyDigits(value);

  if (!digits) return "";

  if (digits.length === 11) {
    return `+55${digits}`;
  }

  if (digits.length === 13 && digits.startsWith("55")) {
    return `+${digits}`;
  }

  if (digits.length === 12 && digits.startsWith("55")) {
    return `+${digits}`;
  }

  if (digits.length >= 10 && digits.length <= 11) {
    return `+55${digits}`;
  }

  return `+${digits}`;
}

export function isBrazilianPhoneValueValid(value: string): boolean {
  return normalizeBrazilianPhone(value).match(/^\+55\d{10,11}$/) !== null;
}
