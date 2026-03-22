import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import MoMoQRPayment from '@/components/checkout/MoMoQRPayment';
import React from 'react';

// Mock window.location and window.open
const mockOpen = vi.fn();
Object.defineProperty(window, 'open', { value: mockOpen, writable: true });

const originalLocation = window.location;
const mockLocation = { href: '' };
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});

describe('MoMoQRPayment Component', () => {
  const defaultProps = {
    isLoading: false,
    amount: 1500000,
    onCancel: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockLocation.href = '';
  });

  describe('Loading State', () => {
    it('should show loading spinner when isLoading is true', () => {
      render(<MoMoQRPayment {...defaultProps} isLoading={true} />);
      
      expect(screen.getByText(/Đang tạo mã thanh toán/i)).toBeInTheDocument();
      expect(screen.getByText(/Vui lòng chờ trong giây lát/i)).toBeInTheDocument();
    });

    it('should not show QR code when loading', () => {
      render(<MoMoQRPayment {...defaultProps} isLoading={true} qrCodeUrl="https://example.com/qr.png" />);
      
      expect(screen.queryByAltText('MoMo QR Code')).not.toBeInTheDocument();
    });

    it('should not show cancel button when loading', () => {
      render(<MoMoQRPayment {...defaultProps} isLoading={true} />);
      
      expect(screen.queryByText(/Hủy thanh toán/i)).not.toBeInTheDocument();
    });
  });

  describe('Amount Display', () => {
    it('should display formatted amount', () => {
      render(<MoMoQRPayment {...defaultProps} amount={1500000} />);
      
      expect(screen.getByText(/1\.500\.000/)).toBeInTheDocument();
    });

    it('should display "Số tiền thanh toán" label', () => {
      render(<MoMoQRPayment {...defaultProps} />);
      
      expect(screen.getByText('Số tiền thanh toán')).toBeInTheDocument();
    });

    it('should format different amounts correctly', () => {
      const { rerender } = render(<MoMoQRPayment {...defaultProps} amount={999000} />);
      expect(screen.getByText(/999\.000/)).toBeInTheDocument();

      rerender(<MoMoQRPayment {...defaultProps} amount={50000} />);
      expect(screen.getByText(/50\.000/)).toBeInTheDocument();
    });
  });

  describe('QR Code Display', () => {
    it('should display QR code image when qrCodeUrl is provided', () => {
      render(<MoMoQRPayment {...defaultProps} qrCodeUrl="https://example.com/qr.png" />);
      
      const qrImage = screen.getByAltText('MoMo QR Code');
      expect(qrImage).toBeInTheDocument();
      expect(qrImage).toHaveAttribute('src', 'https://example.com/qr.png');
    });

    it('should show QR scan instruction when QR code is present', () => {
      render(<MoMoQRPayment {...defaultProps} qrCodeUrl="https://example.com/qr.png" />);
      
      expect(screen.getByText(/Quét mã QR bằng ứng dụng MoMo/i)).toBeInTheDocument();
    });

    it('should show smartphone icon when only payUrl is provided', () => {
      render(<MoMoQRPayment {...defaultProps} payUrl="https://momo.vn/pay" />);
      
      expect(screen.getByText(/Nhấn nút bên dưới để mở ứng dụng MoMo/i)).toBeInTheDocument();
    });
  });

  describe('Action Buttons', () => {
    it('should show "Mở ứng dụng MoMo" button when payUrl is provided', () => {
      render(<MoMoQRPayment {...defaultProps} payUrl="https://momo.vn/pay" />);
      
      expect(screen.getByText('Mở ứng dụng MoMo')).toBeInTheDocument();
    });

    it('should show "Mở ứng dụng MoMo" button when deeplink is provided', () => {
      render(<MoMoQRPayment {...defaultProps} deeplink="momo://pay?id=123" />);
      
      expect(screen.getByText('Mở ứng dụng MoMo')).toBeInTheDocument();
    });

    it('should not show "Mở ứng dụng MoMo" button when no URL is provided', () => {
      render(<MoMoQRPayment {...defaultProps} />);
      
      expect(screen.queryByText('Mở ứng dụng MoMo')).not.toBeInTheDocument();
    });

    it('should always show cancel button when not loading', () => {
      render(<MoMoQRPayment {...defaultProps} />);
      
      expect(screen.getByText('Hủy thanh toán')).toBeInTheDocument();
    });

    it('should call onCancel when cancel button is clicked', () => {
      const onCancel = vi.fn();
      render(<MoMoQRPayment {...defaultProps} onCancel={onCancel} />);
      
      fireEvent.click(screen.getByText('Hủy thanh toán'));
      expect(onCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe('Open MoMo Action', () => {
    it('should use deeplink when available', () => {
      render(<MoMoQRPayment {...defaultProps} deeplink="momo://pay?id=123" payUrl="https://momo.vn" />);
      
      fireEvent.click(screen.getByText('Mở ứng dụng MoMo'));
      expect(mockLocation.href).toBe('momo://pay?id=123');
    });

    it('should use payUrl when deeplink is not available', () => {
      render(<MoMoQRPayment {...defaultProps} payUrl="https://momo.vn/pay" />);
      
      fireEvent.click(screen.getByText('Mở ứng dụng MoMo'));
      expect(mockOpen).toHaveBeenCalledWith('https://momo.vn/pay', '_blank');
    });

    it('should prefer deeplink over payUrl', () => {
      render(<MoMoQRPayment {...defaultProps} deeplink="momo://pay" payUrl="https://momo.vn" />);
      
      fireEvent.click(screen.getByText('Mở ứng dụng MoMo'));
      expect(mockLocation.href).toBe('momo://pay');
      expect(mockOpen).not.toHaveBeenCalled();
    });
  });

  describe('Instructions', () => {
    it('should display payment instructions', () => {
      render(<MoMoQRPayment {...defaultProps} />);
      
      expect(screen.getByText('Hướng dẫn thanh toán:')).toBeInTheDocument();
    });

    it('should display all instruction steps', () => {
      render(<MoMoQRPayment {...defaultProps} />);
      
      expect(screen.getByText(/Mở ứng dụng MoMo trên điện thoại/i)).toBeInTheDocument();
      expect(screen.getByText(/Chọn "Quét mã"/i)).toBeInTheDocument();
      expect(screen.getByText(/Xác nhận thanh toán trong ứng dụng/i)).toBeInTheDocument();
      expect(screen.getByText(/Chờ hệ thống xử lý/i)).toBeInTheDocument();
    });
  });

  describe('Header', () => {
    it('should display MoMo header', () => {
      render(<MoMoQRPayment {...defaultProps} />);
      
      expect(screen.getByText('Thanh toán MoMo')).toBeInTheDocument();
    });

    it('should display MoMo logo', () => {
      render(<MoMoQRPayment {...defaultProps} />);
      
      // MoMo logo shows "M" text
      const logos = screen.getAllByText('M');
      expect(logos.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero amount', () => {
      render(<MoMoQRPayment {...defaultProps} amount={0} />);
      
      expect(screen.getByText(/0/)).toBeInTheDocument();
    });

    it('should handle very large amount', () => {
      render(<MoMoQRPayment {...defaultProps} amount={50000000} />);
      
      expect(screen.getByText(/50\.000\.000/)).toBeInTheDocument();
    });

    it('should handle all URLs being provided', () => {
      render(
        <MoMoQRPayment 
          {...defaultProps} 
          qrCodeUrl="https://example.com/qr.png"
          payUrl="https://momo.vn"
          deeplink="momo://pay"
        />
      );
      
      expect(screen.getByAltText('MoMo QR Code')).toBeInTheDocument();
      expect(screen.getByText('Mở ứng dụng MoMo')).toBeInTheDocument();
    });
  });
});
