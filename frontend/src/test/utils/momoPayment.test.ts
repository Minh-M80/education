import { describe, it, expect } from 'vitest';
import {
  MOMO_RESULT_CODES,
  isPaymentSuccessful,
  getPaymentStatusMessage,
  generateOrderId,
  generateRequestId,
  validateAmount,
  formatMoMoAmount,
  parseCallbackData,
  encodeExtraData,
  decodeExtraData,
} from '@/utils/momoPayment';

describe('MoMo Payment Utilities', () => {
  describe('MOMO_RESULT_CODES', () => {
    it('should have correct result code values', () => {
      expect(MOMO_RESULT_CODES.SUCCESS).toBe(0);
      expect(MOMO_RESULT_CODES.PENDING).toBe(1000);
      expect(MOMO_RESULT_CODES.FAILED).toBe(1001);
      expect(MOMO_RESULT_CODES.REJECTED).toBe(1002);
      expect(MOMO_RESULT_CODES.CANCELLED).toBe(1003);
      expect(MOMO_RESULT_CODES.TIMEOUT).toBe(1004);
      expect(MOMO_RESULT_CODES.INVALID_AMOUNT).toBe(1005);
      expect(MOMO_RESULT_CODES.INVALID_SIGNATURE).toBe(1006);
    });
  });

  describe('isPaymentSuccessful', () => {
    it('should return true for SUCCESS code', () => {
      expect(isPaymentSuccessful(0)).toBe(true);
      expect(isPaymentSuccessful(MOMO_RESULT_CODES.SUCCESS)).toBe(true);
    });

    it('should return false for non-success codes', () => {
      expect(isPaymentSuccessful(MOMO_RESULT_CODES.PENDING)).toBe(false);
      expect(isPaymentSuccessful(MOMO_RESULT_CODES.FAILED)).toBe(false);
      expect(isPaymentSuccessful(MOMO_RESULT_CODES.REJECTED)).toBe(false);
      expect(isPaymentSuccessful(MOMO_RESULT_CODES.CANCELLED)).toBe(false);
      expect(isPaymentSuccessful(MOMO_RESULT_CODES.TIMEOUT)).toBe(false);
      expect(isPaymentSuccessful(1234)).toBe(false);
    });
  });

  describe('getPaymentStatusMessage', () => {
    it('should return correct Vietnamese messages for each code', () => {
      expect(getPaymentStatusMessage(MOMO_RESULT_CODES.SUCCESS)).toBe('Thanh toán thành công');
      expect(getPaymentStatusMessage(MOMO_RESULT_CODES.PENDING)).toBe('Đang xử lý thanh toán');
      expect(getPaymentStatusMessage(MOMO_RESULT_CODES.FAILED)).toBe('Thanh toán thất bại');
      expect(getPaymentStatusMessage(MOMO_RESULT_CODES.REJECTED)).toBe('Giao dịch bị từ chối');
      expect(getPaymentStatusMessage(MOMO_RESULT_CODES.CANCELLED)).toBe('Giao dịch đã bị hủy');
      expect(getPaymentStatusMessage(MOMO_RESULT_CODES.TIMEOUT)).toBe('Giao dịch hết hạn');
      expect(getPaymentStatusMessage(MOMO_RESULT_CODES.INVALID_AMOUNT)).toBe('Số tiền không hợp lệ');
      expect(getPaymentStatusMessage(MOMO_RESULT_CODES.INVALID_SIGNATURE)).toBe('Chữ ký không hợp lệ');
    });

    it('should return default message for unknown codes', () => {
      expect(getPaymentStatusMessage(9999)).toBe('Lỗi không xác định');
      expect(getPaymentStatusMessage(-1)).toBe('Lỗi không xác định');
    });
  });

  describe('generateOrderId', () => {
    it('should generate unique order IDs', () => {
      const id1 = generateOrderId();
      const id2 = generateOrderId();
      
      expect(id1).not.toBe(id2);
    });

    it('should start with ORDER_ prefix', () => {
      const id = generateOrderId();
      expect(id.startsWith('ORDER_')).toBe(true);
    });

    it('should contain timestamp', () => {
      const before = Date.now();
      const id = generateOrderId();
      const after = Date.now();
      
      const parts = id.split('_');
      const timestamp = parseInt(parts[1], 10);
      
      expect(timestamp).toBeGreaterThanOrEqual(before);
      expect(timestamp).toBeLessThanOrEqual(after);
    });

    it('should have random suffix', () => {
      const id = generateOrderId();
      const parts = id.split('_');
      
      expect(parts.length).toBe(3);
      expect(parts[2].length).toBe(6);
    });
  });

  describe('generateRequestId', () => {
    it('should generate unique request IDs', () => {
      const id1 = generateRequestId();
      const id2 = generateRequestId();
      
      expect(id1).not.toBe(id2);
    });

    it('should start with REQ_ prefix', () => {
      const id = generateRequestId();
      expect(id.startsWith('REQ_')).toBe(true);
    });
  });

  describe('validateAmount', () => {
    it('should accept valid amounts', () => {
      expect(validateAmount(1000)).toEqual({ valid: true });
      expect(validateAmount(100000)).toEqual({ valid: true });
      expect(validateAmount(50000000)).toEqual({ valid: true });
    });

    it('should reject amounts below minimum', () => {
      const result = validateAmount(500);
      expect(result.valid).toBe(false);
      expect(result.message).toBe('Số tiền tối thiểu là 1,000 VND');
    });

    it('should reject amounts above maximum', () => {
      const result = validateAmount(100000000);
      expect(result.valid).toBe(false);
      expect(result.message).toBe('Số tiền tối đa là 50,000,000 VND');
    });

    it('should reject non-integer amounts', () => {
      const result = validateAmount(1000.5);
      expect(result.valid).toBe(false);
      expect(result.message).toBe('Số tiền phải là số nguyên');
    });

    it('should reject zero amount', () => {
      const result = validateAmount(0);
      expect(result.valid).toBe(false);
    });

    it('should reject negative amounts', () => {
      const result = validateAmount(-1000);
      expect(result.valid).toBe(false);
    });
  });

  describe('formatMoMoAmount', () => {
    it('should format amounts in VND currency', () => {
      expect(formatMoMoAmount(1000)).toContain('1.000');
      expect(formatMoMoAmount(100000)).toContain('100.000');
      expect(formatMoMoAmount(1500000)).toContain('1.500.000');
    });

    it('should include VND symbol', () => {
      const formatted = formatMoMoAmount(1000);
      expect(formatted).toMatch(/₫|VND/);
    });

    it('should not show decimal places', () => {
      const formatted = formatMoMoAmount(1000);
      expect(formatted).not.toContain(',00');
    });
  });

  describe('parseCallbackData', () => {
    it('should parse valid callback query string', () => {
      const queryString = 'partnerCode=MOMO&orderId=ORDER_123&amount=100000&resultCode=0&message=Success';
      const result = parseCallbackData(queryString);
      
      expect(result.partnerCode).toBe('MOMO');
      expect(result.orderId).toBe('ORDER_123');
      expect(result.amount).toBe(100000);
      expect(result.resultCode).toBe(0);
      expect(result.message).toBe('Success');
    });

    it('should handle missing fields', () => {
      const queryString = 'partnerCode=MOMO';
      const result = parseCallbackData(queryString);
      
      expect(result.partnerCode).toBe('MOMO');
      expect(result.orderId).toBeUndefined();
      expect(result.amount).toBeUndefined();
    });

    it('should parse numeric fields correctly', () => {
      const queryString = 'amount=50000&resultCode=1001&transId=123456789&responseTime=1699999999999';
      const result = parseCallbackData(queryString);
      
      expect(result.amount).toBe(50000);
      expect(result.resultCode).toBe(1001);
      expect(result.transId).toBe(123456789);
      expect(result.responseTime).toBe(1699999999999);
    });

    it('should handle empty query string', () => {
      const result = parseCallbackData('');
      
      expect(result.partnerCode).toBeUndefined();
      expect(result.orderId).toBeUndefined();
    });
  });

  describe('encodeExtraData', () => {
    it('should encode object to base64', () => {
      const data = { courseIds: ['course1', 'course2'], userId: 'user123' };
      const encoded = encodeExtraData(data);
      
      expect(encoded).toBe(btoa(JSON.stringify(data)));
    });

    it('should produce valid base64 string', () => {
      const data = { test: 'value' };
      const encoded = encodeExtraData(data);
      
      // Valid base64 characters only
      expect(encoded).toMatch(/^[A-Za-z0-9+/=]*$/);
    });
  });

  describe('decodeExtraData', () => {
    it('should decode base64 to object', () => {
      const original = { courseIds: ['course1'], userId: 'user123' };
      const encoded = encodeExtraData(original);
      const decoded = decodeExtraData(encoded);
      
      expect(decoded).toEqual(original);
    });

    it('should return null for invalid base64', () => {
      const result = decodeExtraData('not-valid-base64!!!');
      expect(result).toBeNull();
    });

    it('should return null for invalid JSON after decode', () => {
      const invalidJson = btoa('not json');
      const result = decodeExtraData(invalidJson);
      expect(result).toBeNull();
    });

    it('should handle empty encoded string', () => {
      const encoded = encodeExtraData({});
      const decoded = decodeExtraData(encoded);
      expect(decoded).toEqual({});
    });
  });

  describe('Integration: encode/decode roundtrip', () => {
    it('should maintain data integrity through encode/decode cycle', () => {
      const testCases = [
        { simple: 'data' },
        { nested: { deep: { value: 123 } } },
        { array: [1, 2, 3, 'four'] },
        { unicode: 'Thanh toán khóa học' },
        { special: 'chars!@#$%^&*()' },
      ];

      testCases.forEach((testData) => {
        const encoded = encodeExtraData(testData);
        const decoded = decodeExtraData(encoded);
        expect(decoded).toEqual(testData);
      });
    });
  });
});
