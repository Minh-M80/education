import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useEnrollment } from '@/contexts/EnrollmentContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Wallet, 
  CreditCard, 
  Building2, 
  CheckCircle2,
  Loader2,
  Shield
} from 'lucide-react';
import { toast } from 'sonner';
import { useMoMoPayment } from '@/hooks/useMoMoPayment';
import MoMoQRPayment from '@/components/checkout/MoMoQRPayment';
import type { MoMoPaymentResponse } from '@/utils/momoPayment';

type PaymentMethod = 'momo' | 'bank' | 'card';
type CheckoutStep = 'payment' | 'momo-qr' | 'processing' | 'success';

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const { enrollCourse, refreshEnrollments } = useEnrollment();
  
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('momo');
  const [step, setStep] = useState<CheckoutStep>('payment');
  const [momoResponse, setMomoResponse] = useState<MoMoPaymentResponse | null>(null);

  const { initiatePayment, isLoading: isMoMoLoading } = useMoMoPayment({
    onSuccess: (response) => {
      setMomoResponse(response);
      // If there's a payUrl or qrCodeUrl, show the QR step
      // Otherwise redirect will happen automatically in the hook
      if (response.qrCodeUrl || response.payUrl) {
        setStep('momo-qr');
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Không thể tạo thanh toán MoMo');
      setStep('payment');
    },
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(price);
  };

  const handlePayment = async () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để thanh toán');
      navigate('/login');
      return;
    }

    if (paymentMethod === 'momo') {
      // Use real MoMo payment
      const courseIds = items.map(item => item.course.id);
      const orderInfo = `Thanh toán ${items.length} khóa học`;
      
      await initiatePayment({
        amount: totalPrice,
        orderInfo,
        courseIds,
        userId: user.id,
      });
    } else {
      // For other payment methods, simulate
      setStep('processing');
      await new Promise(resolve => setTimeout(resolve, 2500));

      try {
        await Promise.all(
          items.map(item => enrollCourse(user.id, item.course.id))
        );
        await refreshEnrollments(user.id);
        clearCart();
        setStep('success');
        toast.success('Thanh toán thành công!');
      } catch (error) {
        console.error('Failed to complete enrollment after payment:', error);
        clearCart();
        setStep('success');
        toast.success('Thanh toán thành công!');
      }
    }
  };

  const handleCancelMoMo = () => {
    setStep('payment');
    setMomoResponse(null);
  };

  if (items.length === 0 && step !== 'success' && step !== 'momo-qr') {
    navigate('/cart');
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 bg-muted/30 py-12">
        <div className="container max-w-4xl">
          {step === 'success' ? (
            <Card className="py-16 text-center">
              <CardContent>
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
                  <CheckCircle2 className="h-10 w-10 text-success" />
                </div>
                <h1 className="mb-2 font-display text-2xl font-bold text-success">
                  Thanh toán thành công!
                </h1>
                <p className="mb-8 text-muted-foreground">
                  Bạn đã được đăng ký vào các khóa học. Hãy bắt đầu học ngay!
                </p>
                <div className="flex justify-center gap-4">
                  <Button variant="outline" onClick={() => navigate('/courses')}>
                    Khám phá thêm
                  </Button>
                  <Button className="btn-gradient" onClick={() => navigate('/my-courses')}>
                    Khóa học của tôi
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : step === 'momo-qr' ? (
            <div className="max-w-md mx-auto">
              <Button 
                variant="ghost" 
                className="mb-6"
                onClick={handleCancelMoMo}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Quay lại chọn phương thức
              </Button>
              <MoMoQRPayment
                qrCodeUrl={momoResponse?.qrCodeUrl}
                payUrl={momoResponse?.payUrl}
                deeplink={momoResponse?.deeplink}
                isLoading={isMoMoLoading}
                amount={totalPrice}
                onCancel={handleCancelMoMo}
              />
            </div>
          ) : step === 'processing' ? (
            <Card className="py-16 text-center">
              <CardContent>
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center">
                  {paymentMethod === 'momo' ? (
                    <div className="relative">
                      <div className="h-16 w-16 rounded-full bg-[#ae2070] flex items-center justify-center">
                        <span className="text-2xl font-bold text-white">M</span>
                      </div>
                      <Loader2 className="absolute -inset-2 h-20 w-20 animate-spin text-[#ae2070]" />
                    </div>
                  ) : (
                    <Loader2 className="h-16 w-16 animate-spin text-primary" />
                  )}
                </div>
                <h2 className="mb-2 font-display text-xl font-bold">
                  Đang xử lý thanh toán...
                </h2>
                <p className="text-muted-foreground">
                  {paymentMethod === 'momo' 
                    ? 'Vui lòng xác nhận thanh toán trên ứng dụng MoMo'
                    : 'Đang kết nối với cổng thanh toán...'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <Button 
                variant="ghost" 
                className="mb-6"
                onClick={() => navigate('/cart')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Quay lại giỏ hàng
              </Button>

              <div className="grid gap-8 lg:grid-cols-5">
                {/* Payment Methods */}
                <div className="lg:col-span-3 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Wallet className="h-5 w-5" />
                        Phương thức thanh toán
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <RadioGroup 
                        value={paymentMethod} 
                        onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}
                        className="space-y-4"
                      >
                        {/* MoMo */}
                        <div className={`relative rounded-lg border-2 p-4 transition-colors ${
                          paymentMethod === 'momo' ? 'border-[#ae2070] bg-[#ae2070]/5' : 'border-border'
                        }`}>
                          <div className="flex items-center gap-4">
                            <RadioGroupItem value="momo" id="momo" className="border-[#ae2070] text-[#ae2070]" />
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#ae2070]">
                              <span className="text-xl font-bold text-white">M</span>
                            </div>
                            <div className="flex-1">
                              <Label htmlFor="momo" className="text-base font-semibold cursor-pointer">
                                Ví MoMo
                              </Label>
                              <p className="text-sm text-muted-foreground">
                                Thanh toán nhanh chóng qua ví điện tử MoMo
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Bank Transfer */}
                        <div className={`relative rounded-lg border-2 p-4 transition-colors ${
                          paymentMethod === 'bank' ? 'border-primary bg-primary/5' : 'border-border'
                        }`}>
                          <div className="flex items-center gap-4">
                            <RadioGroupItem value="bank" id="bank" />
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
                              <Building2 className="h-6 w-6 text-primary-foreground" />
                            </div>
                            <div className="flex-1">
                              <Label htmlFor="bank" className="text-base font-semibold cursor-pointer">
                                Chuyển khoản ngân hàng
                              </Label>
                              <p className="text-sm text-muted-foreground">
                                QR Code hoặc chuyển khoản trực tiếp
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Credit Card */}
                        <div className={`relative rounded-lg border-2 p-4 transition-colors ${
                          paymentMethod === 'card' ? 'border-primary bg-primary/5' : 'border-border'
                        }`}>
                          <div className="flex items-center gap-4">
                            <RadioGroupItem value="card" id="card" />
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
                              <CreditCard className="h-6 w-6 text-primary-foreground" />
                            </div>
                            <div className="flex-1">
                              <Label htmlFor="card" className="text-base font-semibold cursor-pointer">
                                Thẻ tín dụng/ghi nợ
                              </Label>
                              <p className="text-sm text-muted-foreground">
                                Visa, Mastercard, JCB
                              </p>
                            </div>
                          </div>
                        </div>
                      </RadioGroup>
                    </CardContent>
                  </Card>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Shield className="h-4 w-4" />
                    <span>Thanh toán được bảo mật bởi SSL 256-bit</span>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-2">
                  <Card className="sticky top-24">
                    <CardHeader>
                      <CardTitle>Đơn hàng của bạn</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {items.map((item) => (
                        <div key={item.course.id} className="flex gap-3">
                          <img 
                            src={item.course.thumbnail} 
                            alt={item.course.title}
                            className="h-16 w-20 rounded object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium line-clamp-2">
                              {item.course.title}
                            </h4>
                            <p className="text-sm font-semibold text-primary">
                              {formatPrice(item.course.price)}
                            </p>
                          </div>
                        </div>
                      ))}

                      <Separator />

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Tạm tính</span>
                          <span>{formatPrice(totalPrice)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Giảm giá</span>
                          <span className="text-success">-{formatPrice(0)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between text-lg font-bold">
                          <span>Tổng cộng</span>
                          <span className="text-primary">{formatPrice(totalPrice)}</span>
                        </div>
                      </div>

                      <Button 
                        className="w-full btn-gradient"
                        onClick={handlePayment}
                      >
                        {paymentMethod === 'momo' && (
                          <div className="mr-2 flex h-5 w-5 items-center justify-center rounded bg-white">
                            <span className="text-xs font-bold text-[#ae2070]">M</span>
                          </div>
                        )}
                        Thanh toán {formatPrice(totalPrice)}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Checkout;
