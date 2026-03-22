import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMoMoPayment } from '@/hooks/useMoMoPayment';

// Mock supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
  },
}));

// Mock window.location
const mockLocation = {
  origin: 'http://localhost:3000',
  href: '',
};
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});

import { supabase } from '@/integrations/supabase/client';

describe('useMoMoPayment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocation.href = '';
  });

  describe('initial state', () => {
    it('should have correct initial values', () => {
      const { result } = renderHook(() => useMoMoPayment());
      
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(typeof result.current.initiatePayment).toBe('function');
      expect(typeof result.current.checkPaymentStatus).toBe('function');
    });

    it('should expose utility functions', () => {
      const { result } = renderHook(() => useMoMoPayment());
      
      expect(typeof result.current.isPaymentSuccessful).toBe('function');
      expect(typeof result.current.getPaymentStatusMessage).toBe('function');
    });
  });

  describe('initiatePayment', () => {
    it('should validate amount before making request', async () => {
      const onError = vi.fn();
      const { result } = renderHook(() => useMoMoPayment({ onError }));

      await act(async () => {
        const response = await result.current.initiatePayment({
          amount: 500, // Below minimum
          orderInfo: 'Test order',
          courseIds: ['course1'],
          userId: 'user1',
        });
        
        expect(response).toBeNull();
      });

      expect(onError).toHaveBeenCalled();
      expect(result.current.error?.message).toBe('Số tiền tối thiểu là 1,000 VND');
    });

    it('should reject non-integer amounts', async () => {
      const onError = vi.fn();
      const { result } = renderHook(() => useMoMoPayment({ onError }));

      await act(async () => {
        await result.current.initiatePayment({
          amount: 1000.5,
          orderInfo: 'Test order',
          courseIds: ['course1'],
          userId: 'user1',
        });
      });

      expect(onError).toHaveBeenCalled();
      expect(result.current.error?.message).toBe('Số tiền phải là số nguyên');
    });

    it('should call supabase function with correct parameters', async () => {
      const mockInvoke = vi.mocked(supabase.functions.invoke);
      mockInvoke.mockResolvedValueOnce({
        data: {
          resultCode: 0,
          payUrl: 'https://momo.vn/pay',
          orderId: 'ORDER_123',
          requestId: 'REQ_123',
        },
        error: null,
      });

      const { result } = renderHook(() => useMoMoPayment());

      await act(async () => {
        await result.current.initiatePayment({
          amount: 100000,
          orderInfo: 'Test order',
          courseIds: ['course1', 'course2'],
          userId: 'user123',
        });
      });

      expect(mockInvoke).toHaveBeenCalledWith('momo-payment', expect.objectContaining({
        body: expect.objectContaining({
          amount: 100000,
          orderInfo: 'Test order',
          redirectUrl: 'http://localhost:3000/checkout/callback',
        }),
      }));
    });

    it('should set loading state during request', async () => {
      const mockInvoke = vi.mocked(supabase.functions.invoke);
      
      mockInvoke.mockResolvedValueOnce({
        data: { resultCode: 0, payUrl: 'https://momo.vn' },
        error: null,
      });

      const { result } = renderHook(() => useMoMoPayment());

      // Initially not loading
      expect(result.current.isLoading).toBe(false);

      await act(async () => {
        await result.current.initiatePayment({
          amount: 100000,
          orderInfo: 'Test',
          courseIds: ['course1'],
          userId: 'user1',
        });
      });

      // After completion, not loading
      expect(result.current.isLoading).toBe(false);
    });

    it('should handle successful payment response', async () => {
      const mockInvoke = vi.mocked(supabase.functions.invoke);
      const onSuccess = vi.fn();
      
      mockInvoke.mockResolvedValueOnce({
        data: {
          resultCode: 0,
          payUrl: 'https://momo.vn/pay/123',
          orderId: 'ORDER_123',
          requestId: 'REQ_123',
          amount: 100000,
          message: 'Success',
        },
        error: null,
      });

      const { result } = renderHook(() => useMoMoPayment({ onSuccess }));

      await act(async () => {
        const response = await result.current.initiatePayment({
          amount: 100000,
          orderInfo: 'Test order',
          courseIds: ['course1'],
          userId: 'user1',
        });

        expect(response).not.toBeNull();
        expect(response?.resultCode).toBe(0);
      });

      expect(onSuccess).toHaveBeenCalled();
      expect(mockLocation.href).toBe('https://momo.vn/pay/123');
    });

    it('should handle failed payment response', async () => {
      const mockInvoke = vi.mocked(supabase.functions.invoke);
      const onError = vi.fn();
      
      mockInvoke.mockResolvedValueOnce({
        data: {
          resultCode: 1001,
          message: 'Transaction failed',
        },
        error: null,
      });

      const { result } = renderHook(() => useMoMoPayment({ onError }));

      await act(async () => {
        const response = await result.current.initiatePayment({
          amount: 100000,
          orderInfo: 'Test order',
          courseIds: ['course1'],
          userId: 'user1',
        });

        expect(response).toBeNull();
      });

      expect(onError).toHaveBeenCalled();
      expect(result.current.error).not.toBeNull();
    });

    it('should handle function invoke error', async () => {
      const mockInvoke = vi.mocked(supabase.functions.invoke);
      const onError = vi.fn();
      
      mockInvoke.mockResolvedValueOnce({
        data: null,
        error: { message: 'Network error' },
      });

      const { result } = renderHook(() => useMoMoPayment({ onError }));

      await act(async () => {
        const response = await result.current.initiatePayment({
          amount: 100000,
          orderInfo: 'Test order',
          courseIds: ['course1'],
          userId: 'user1',
        });

        expect(response).toBeNull();
      });

      expect(onError).toHaveBeenCalled();
    });
  });

  describe('checkPaymentStatus', () => {
    it('should return payment status for orderId', async () => {
      const { result } = renderHook(() => useMoMoPayment());

      await act(async () => {
        const status = await result.current.checkPaymentStatus('ORDER_123');
        
        expect(status.orderId).toBe('ORDER_123');
        expect(status.status).toBe('pending');
      });
    });
  });

  describe('utility functions', () => {
    it('isPaymentSuccessful should work correctly', () => {
      const { result } = renderHook(() => useMoMoPayment());
      
      expect(result.current.isPaymentSuccessful(0)).toBe(true);
      expect(result.current.isPaymentSuccessful(1001)).toBe(false);
    });

    it('getPaymentStatusMessage should return correct messages', () => {
      const { result } = renderHook(() => useMoMoPayment());
      
      expect(result.current.getPaymentStatusMessage(0)).toBe('Thanh toán thành công');
      expect(result.current.getPaymentStatusMessage(1001)).toBe('Thanh toán thất bại');
    });
  });
});
