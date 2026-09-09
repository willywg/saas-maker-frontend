import { describe, expect, it } from 'vitest';
import { cn } from './utils';

describe('cn', () => {
  it('merges conditional classes', () => {
    const isActive: boolean = Math.random() > 2; // always false, not a constant expression
    expect(cn('a', isActive && 'b', undefined, null, 'c')).toBe('a c');
  });

  it('resolves tailwind conflicts keeping the last one', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4');
  });
});
