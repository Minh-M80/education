/**
 * MoMo Payment Utilities
 * Based on: https://github.com/momo-wallet/payment/tree/master/nodejs
 */

export interface MoMoPaymentRequest {
  orderId: string;
  amount: number;
  orderInfo: string;
  redirectUrl: string;
  ipnUrl: string;
  extraData?: string;
}

export interface MoMoPaymentResponse {
  partnerCode: string;
  orderId: string;
  requestId: string;
  amount: number;
  responseTime: number;
  message: string;
  resultCode: number;
  payUrl: string;
  shortLink?: string;
  deeplink?: string;
  qrCodeUrl?: string;
}

export interface MoMoCallbackData {
  partnerCode: string;
  orderId: string;
  requestId: string;
  amount: number;
  orderInfo: string;
  orderType: string;
  transId: number;
  resultCode: number;
  message: string;
  payType: string;
  responseTime: number;
  extraData: string;
  signature: string;
}

/**
 * MoMo Result Codes
 */
export const MOMO_RESULT_CODES = {
  SUCCESS: 0,
  PENDING: 1000,
  FAILED: 1001,
  REJECTED: 1002,
  CANCELLED: 1003,
  TIMEOUT: 1004,
  INVALID_AMOUNT: 1005,
  INVALID_SIGNATURE: 1006,
} as const;

/**
 * Check if payment was successful
 */
export const isPaymentSuccessful = (resultCode: number): boolean => {
  return resultCode === MOMO_RESULT_CODES.SUCCESS;
};

/**
 * Get payment status message in Vietnamese
 */
export const getPaymentStatusMessage = (resultCode: number): string => {
  switch (resultCode) {
    case MOMO_RESULT_CODES.SUCCESS:
      return 'Thanh toán thành công';
    case MOMO_RESULT_CODES.PENDING:
      return 'Đang xử lý thanh toán';
    case MOMO_RESULT_CODES.FAILED:
      return 'Thanh toán thất bại';
    case MOMO_RESULT_CODES.REJECTED:
      return 'Giao dịch bị từ chối';
    case MOMO_RESULT_CODES.CANCELLED:
      return 'Giao dịch đã bị hủy';
    case MOMO_RESULT_CODES.TIMEOUT:
      return 'Giao dịch hết hạn';
    case MOMO_RESULT_CODES.INVALID_AMOUNT:
      return 'Số tiền không hợp lệ';
    case MOMO_RESULT_CODES.INVALID_SIGNATURE:
      return 'Chữ ký không hợp lệ';
    default:
      return 'Lỗi không xác định';
  }
};

/**
 * Generate unique order ID
 */
export const generateOrderId = (): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORDER_${timestamp}_${random}`;
};

/**
 * Generate unique request ID
 */
export const generateRequestId = (): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `REQ_${timestamp}_${random}`;
};

/**
 * Validate MoMo payment amount (must be >= 1000 VND)
 */
export const validateAmount = (amount: number): { valid: boolean; message?: string } => {
  if (!Number.isInteger(amount)) {
    return { valid: false, message: 'Số tiền phải là số nguyên' };
  }
  if (amount < 1000) {
    return { valid: false, message: 'Số tiền tối thiểu là 1,000 VND' };
  }
  if (amount > 50000000) {
    return { valid: false, message: 'Số tiền tối đa là 50,000,000 VND' };
  }
  return { valid: true };
};

/**
 * Format amount for display
 */
export const formatMoMoAmount = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(amount);
};

/**
 * Parse callback query string to MoMoCallbackData
 */
export const parseCallbackData = (queryString: string): Partial<MoMoCallbackData> => {
  const params = new URLSearchParams(queryString);
  return {
    partnerCode: params.get('partnerCode') || undefined,
    orderId: params.get('orderId') || undefined,
    requestId: params.get('requestId') || undefined,
    amount: params.get('amount') ? parseInt(params.get('amount')!, 10) : undefined,
    orderInfo: params.get('orderInfo') || undefined,
    orderType: params.get('orderType') || undefined,
    transId: params.get('transId') ? parseInt(params.get('transId')!, 10) : undefined,
    resultCode: params.get('resultCode') ? parseInt(params.get('resultCode')!, 10) : undefined,
    message: params.get('message') || undefined,
    payType: params.get('payType') || undefined,
    responseTime: params.get('responseTime') ? parseInt(params.get('responseTime')!, 10) : undefined,
    extraData: params.get('extraData') || undefined,
    signature: params.get('signature') || undefined,
  };
};

/**
 * Encode extra data to base64 (handles Unicode)
 */
export const encodeExtraData = (data: Record<string, unknown>): string => {
  const jsonString = JSON.stringify(data);
  // Handle Unicode by encoding to UTF-8 first
  const utf8Bytes = new TextEncoder().encode(jsonString);
  const binaryString = Array.from(utf8Bytes, byte => String.fromCharCode(byte)).join('');
  return btoa(binaryString);
};

/**
 * Decode extra data from base64 (handles Unicode)
 */
export const decodeExtraData = (encoded: string): Record<string, unknown> | null => {
  try {
    const binaryString = atob(encoded);
    const utf8Bytes = Uint8Array.from(binaryString, char => char.charCodeAt(0));
    const jsonString = new TextDecoder().decode(utf8Bytes);
    return JSON.parse(jsonString);
  } catch {
    return null;
  }
};
