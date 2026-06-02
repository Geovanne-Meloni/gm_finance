import { twMerge } from 'tailwind-merge';

export function cn(...inputs: (string | undefined | null | false)[]) {
  const list = inputs.filter(Boolean) as string[];
  return list.length ? twMerge(...list) : '';
}
