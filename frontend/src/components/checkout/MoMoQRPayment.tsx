import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, QrCode, Smartphone, ExternalLink } from 'lucide-react';

interface MoMoQRPaymentProps {
  qrCodeUrl?: string;
  payUrl?: string;
  deeplink?: string;
  isLoading: boolean;
  amount: number;
  onCancel: () => void;
}

const MoMoQRPayment: React.FC<MoMoQRPaymentProps> = ({
  qrCodeUrl,
  payUrl,
  deeplink,
  isLoading,
  amount,
  onCancel,
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(price);
  };

  const handleOpenMoMo = () => {
    if (deeplink) {
      window.location.href = deeplink;
    } else if (payUrl) {
      window.open(payUrl, '_blank');
    }
  };

  if (isLoading) {
    return (
      <Card className="py-12 text-center">
        <CardContent>
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center">
            <div className="relative">
              <div className="h-16 w-16 rounded-full bg-[#ae2070] flex items-center justify-center">
                <span className="text-2xl font-bold text-white">M</span>
              </div>
              <Loader2 className="absolute -inset-2 h-20 w-20 animate-spin text-[#ae2070]" />
            </div>
          </div>
          <h2 className="mb-2 font-display text-xl font-bold">
            Đang tạo mã thanh toán...
          </h2>
          <p className="text-muted-foreground">
            Vui lòng chờ trong giây lát
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="text-center border-b bg-gradient-to-r from-[#ae2070] to-[#d63384] text-white rounded-t-lg">
        <div className="flex items-center justify-center gap-2">
          <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center">
            <span className="text-xl font-bold text-[#ae2070]">M</span>
          </div>
          <CardTitle className="text-xl">Thanh toán MoMo</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Amount */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-1">Số tiền thanh toán</p>
          <p className="text-3xl font-bold text-[#ae2070]">{formatPrice(amount)}</p>
        </div>

        {/* QR Code */}
        {qrCodeUrl ? (
          <div className="flex flex-col items-center space-y-4">
            <div className="p-4 bg-white rounded-xl shadow-lg border-2 border-[#ae2070]/20">
              <img 
                src={qrCodeUrl} 
                alt="MoMo QR Code" 
                className="w-48 h-48 object-contain"
              />
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <QrCode className="h-4 w-4" />
              <span>Quét mã QR bằng ứng dụng MoMo</span>
            </div>
          </div>
        ) : payUrl ? (
          <div className="flex flex-col items-center space-y-4">
            <div className="p-8 bg-muted/50 rounded-xl border-2 border-dashed border-[#ae2070]/30">
              <Smartphone className="h-16 w-16 text-[#ae2070] mx-auto mb-4" />
              <p className="text-center text-sm text-muted-foreground">
                Nhấn nút bên dưới để mở ứng dụng MoMo
              </p>
            </div>
          </div>
        ) : null}

        {/* Action Buttons */}
        <div className="space-y-3">
          {(payUrl || deeplink) && (
            <Button 
              className="w-full bg-[#ae2070] hover:bg-[#8e1a5c] text-white"
              onClick={handleOpenMoMo}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Mở ứng dụng MoMo
            </Button>
          )}
          <Button 
            variant="outline" 
            className="w-full"
            onClick={onCancel}
          >
            Hủy thanh toán
          </Button>
        </div>

        {/* Instructions */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <h4 className="font-semibold text-sm">Hướng dẫn thanh toán:</h4>
          <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
            <li>Mở ứng dụng MoMo trên điện thoại</li>
            <li>Chọn "Quét mã" hoặc nhấn vào nút "Mở ứng dụng MoMo"</li>
            <li>Xác nhận thanh toán trong ứng dụng</li>
            <li>Chờ hệ thống xử lý và chuyển hướng tự động</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};

export default MoMoQRPayment;
