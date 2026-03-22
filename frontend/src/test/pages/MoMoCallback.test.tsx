import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import MoMoCallback from '@/pages/MoMoCallback';
import { AuthProvider } from '@/contexts/AuthContext';
import { EnrollmentProvider } from '@/contexts/EnrollmentContext';
import { CartProvider } from '@/contexts/CartContext';
import React from 'react';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

const renderWithProviders = (searchParams: string) => {
  return render(
    <MemoryRouter initialEntries={[`/checkout/callback?${searchParams}`]}>
      <AuthProvider>
        <EnrollmentProvider>
          <CartProvider>
            <Routes>
              <Route path="/checkout/callback" element={<MoMoCallback />} />
            </Routes>
          </CartProvider>
        </EnrollmentProvider>
      </AuthProvider>
    </MemoryRouter>
  );
};

describe('MoMoCallback Page', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('Successful Payment', () => {
    it('should show success heading for resultCode=0', async () => {
      const extraData = btoa(JSON.stringify({ courseIds: ['course1'], userId: 'user1' }));
      
      renderWithProviders(`resultCode=0&extraData=${extraData}&orderInfo=Test`);
      
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Thanh toán thành công!/i })).toBeInTheDocument();
      });
    });

    it('should show success buttons after payment', async () => {
      const extraData = btoa(JSON.stringify({ courseIds: ['course1'] }));
      
      renderWithProviders(`resultCode=0&extraData=${extraData}`);
      
      await waitFor(() => {
        expect(screen.getByText(/Khám phá thêm/i)).toBeInTheDocument();
        expect(screen.getByText(/Khóa học của tôi/i)).toBeInTheDocument();
      });
    });
  });

  describe('Failed Payment', () => {
    it('should show failure heading for non-zero resultCode', async () => {
      renderWithProviders('resultCode=1001&message=Transaction%20failed');
      
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Thanh toán thất bại/i })).toBeInTheDocument();
      });
    });

    it('should show error message from MoMo', async () => {
      const errorMessage = 'Giao dịch bị hủy';
      renderWithProviders(`resultCode=1003&message=${encodeURIComponent(errorMessage)}`);
      
      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });

    it('should show retry buttons on failure', async () => {
      renderWithProviders('resultCode=1001');
      
      await waitFor(() => {
        expect(screen.getByText(/Quay lại giỏ hàng/i)).toBeInTheDocument();
        expect(screen.getByText(/Thử lại/i)).toBeInTheDocument();
      });
    });
  });

  describe('Result Code Handling', () => {
    it('should treat 0 as success', async () => {
      renderWithProviders('resultCode=0');
      
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Thanh toán thành công!/i })).toBeInTheDocument();
      });
    });

    it('should treat 1000 (pending) as failure', async () => {
      renderWithProviders('resultCode=1000');
      
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Thanh toán thất bại/i })).toBeInTheDocument();
      });
    });

    it('should treat 1001 (failed) as failure', async () => {
      renderWithProviders('resultCode=1001');
      
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Thanh toán thất bại/i })).toBeInTheDocument();
      });
    });

    it('should treat 1003 (cancelled) as failure', async () => {
      renderWithProviders('resultCode=1003');
      
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Thanh toán thất bại/i })).toBeInTheDocument();
      });
    });

    it('should handle missing resultCode', async () => {
      renderWithProviders('');
      
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Thanh toán thất bại/i })).toBeInTheDocument();
      });
    });
  });

  describe('ExtraData Handling', () => {
    it('should handle valid extraData with courseIds', async () => {
      const extraData = btoa(JSON.stringify({ courseIds: ['c1', 'c2'], userId: 'u1' }));
      
      renderWithProviders(`resultCode=0&extraData=${extraData}`);
      
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Thanh toán thành công!/i })).toBeInTheDocument();
      });
    });

    it('should handle invalid extraData gracefully', async () => {
      renderWithProviders('resultCode=0&extraData=invalid-base64!!!');
      
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Thanh toán thành công!/i })).toBeInTheDocument();
      });
    });

    it('should handle empty extraData', async () => {
      renderWithProviders('resultCode=0&extraData=');
      
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Thanh toán thành công!/i })).toBeInTheDocument();
      });
    });

    it('should handle extraData without courseIds', async () => {
      const extraData = btoa(JSON.stringify({ userId: 'u1' }));
      
      renderWithProviders(`resultCode=0&extraData=${extraData}`);
      
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Thanh toán thành công!/i })).toBeInTheDocument();
      });
    });
  });
});
