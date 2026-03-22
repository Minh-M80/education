import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  generateOrderId, 
  validateAmount, 
  isPaymentSuccessful,
  getPaymentStatusMessage,
  encodeExtraData,
  type MoMoPaymentResponse 
} from '@/utils/momoPayment';

interface UseMoMoPaymentOptions {
  onSuccess?: (response: MoMoPaymentResponse) => void;
  onError?: (error: Error) => void;
}

interface PaymentParams {
  amount: number;
  orderInfo: string;
  courseIds: string[];
  userId: string;
}

export const useMoMoPayment = (options: UseMoMoPaymentOptions = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const initiatePayment = useCallback(async (params: PaymentParams) => {
    const { amount, orderInfo, courseIds, userId } = params;
    
    // Validate amount
    const validation = validateAmount(amount);
    if (!validation.valid) {
      const err = new Error(validation.message);
      setError(err);
      options.onError?.(err);
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const orderId = generateOrderId();
      const baseUrl = window.location.origin;
      
      // Encode extra data with course info
      const extraData = encodeExtraData({
        courseIds,
        userId,
        orderId,
      });

      const { data, error: fnError } = await supabase.functions.invoke('momo-payment', {
        body: {
          orderId,
          amount,
          orderInfo,
          redirectUrl: `${baseUrl}/checkout/callback`,
          ipnUrl: `${baseUrl}/api/momo-ipn`, // This would be handled by edge function
          extraData,
        },
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (fnError) {
        throw new Error(fnError.message || 'Failed to create MoMo payment');
      }

      const response = data as MoMoPaymentResponse;

      if (response.resultCode !== 0) {
        throw new Error(response.message || getPaymentStatusMessage(response.resultCode));
      }

      options.onSuccess?.(response);
      
      // Redirect to MoMo payment page
      if (response.payUrl) {
        window.location.href = response.payUrl;
      }

      return response;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      options.onError?.(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  const checkPaymentStatus = useCallback(async (orderId: string) => {
    // This would check payment status via edge function
    // For now, return mock data
    return {
      orderId,
      status: 'pending',
    };
  }, []);

  return {
    initiatePayment,
    checkPaymentStatus,
    isLoading,
    error,
    isPaymentSuccessful,
    getPaymentStatusMessage,
  };
};
