import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('Utils', () => {
  describe('cn() - className merge utility', () => {
    it('should merge class names', () => {
      const result = cn('class1', 'class2');
      expect(result).toContain('class1');
      expect(result).toContain('class2');
    });

    it('should handle conditional classes', () => {
      const isActive = true;
      const result = cn('base', isActive && 'active');
      expect(result).toContain('base');
      expect(result).toContain('active');
    });

    it('should handle false conditional classes', () => {
      const isActive = false;
      const result = cn('base', isActive && 'active');
      expect(result).toContain('base');
      expect(result).not.toContain('active');
    });

    it('should handle undefined and null', () => {
      const result = cn('base', undefined, null, 'end');
      expect(result).toBe('base end');
    });

    it('should merge tailwind classes correctly', () => {
      const result = cn('px-2 py-1', 'px-4');
      expect(result).toContain('px-4');
      expect(result).not.toContain('px-2'); // px-4 should override px-2
    });

    it('should handle object syntax', () => {
      const result = cn('base', { active: true, disabled: false });
      expect(result).toContain('base');
      expect(result).toContain('active');
      expect(result).not.toContain('disabled');
    });

    it('should handle array syntax', () => {
      const result = cn(['class1', 'class2'], 'class3');
      expect(result).toContain('class1');
      expect(result).toContain('class2');
      expect(result).toContain('class3');
    });

    it('should return empty string for no arguments', () => {
      const result = cn();
      expect(result).toBe('');
    });

    it('should handle empty strings', () => {
      const result = cn('base', '', 'end');
      expect(result).toBe('base end');
    });
  });
});
