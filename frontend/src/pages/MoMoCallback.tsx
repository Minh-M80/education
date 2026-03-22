import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEnrollment } from '@/contexts/EnrollmentContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { isPaymentSuccessful, decodeExtraData } from '@/utils/momoPayment';

type PaymentStatus = 'loading' | 'success' | 'failed';

const MoMoCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { enrollCourse, refreshEnrollments } = useEnrollment();
  const { user } = useAuth();
  const { clearCart } = useCart();
  const [status, setStatus] = useState<PaymentStatus>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const processCallback = async () => {
      const resultCode = parseInt(searchParams.get('resultCode') || '-1', 10);
      const extraDataParam = searchParams.get('extraData') || '';
      const orderInfo = searchParams.get('orderInfo') || '';

      if (isPaymentSuccessful(resultCode)) {
        // Decode extra data to get course IDs
        try {
          const extraData = decodeExtraData(extraDataParam) as { courseIds?: string[]; userId?: string } | null;
          const courseIds: string[] = Array.isArray(extraData?.courseIds) ? extraData.courseIds : [];
          const targetUserId = user?.id || extraData?.userId;

          // Enroll user in all courses and clear cart
          if (targetUserId && courseIds.length > 0) {
            await Promise.all(
              courseIds.map((courseId) => enrollCourse(targetUserId, courseId))
            );
            await refreshEnrollments(targetUserId);
            clearCart();
          }

          setStatus('success');
          setMessage('Thanh toán thành công! Bạn đã được đăng ký vào các khóa học.');
        } catch (error) {
          console.error('Error processing callback:', error);
          setStatus('success');
          setMessage('Thanh toán thành công! Bạn vẫn có thể vào khóa học của mình từ dữ liệu cục bộ.');
        }
      } else {
        setStatus('failed');
        const momoMessage = searchParams.get('message') || 'Thanh toán không thành công';
        setMessage(momoMessage);
      }
    };

    processCallback();
  }, [searchParams, enrollCourse, refreshEnrollments, user, clearCart]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 bg-muted/30 py-12">
        <div className="container max-w-lg">
          <Card className="py-12 text-center">
            <CardContent>
              {status === 'loading' ? (
                <>
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center">
                    <Loader2 className="h-16 w-16 animate-spin text-primary" />
                  </div>
                  <h2 className="mb-2 font-display text-xl font-bold">
                    Đang xử lý kết quả thanh toán...
                  </h2>
                </>
              ) : status === 'success' ? (
                <>
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
                    <CheckCircle2 className="h-10 w-10 text-success" />
                  </div>
                  <h1 className="mb-2 font-display text-2xl font-bold text-success">
                    Thanh toán thành công!
                  </h1>
                  <p className="mb-8 text-muted-foreground">{message}</p>
                  <div className="flex justify-center gap-4">
                    <Button variant="outline" onClick={() => navigate('/courses')}>
                      Khám phá thêm
                    </Button>
                    <Button className="btn-gradient" onClick={() => navigate('/my-courses')}>
                      Khóa học của tôi
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
                    <XCircle className="h-10 w-10 text-destructive" />
                  </div>
                  <h1 className="mb-2 font-display text-2xl font-bold text-destructive">
                    Thanh toán thất bại
                  </h1>
                  <p className="mb-8 text-muted-foreground">{message}</p>
                  <div className="flex justify-center gap-4">
                    <Button variant="outline" onClick={() => navigate('/cart')}>
                      Quay lại giỏ hàng
                    </Button>
                    <Button className="btn-gradient" onClick={() => navigate('/checkout')}>
                      Thử lại
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MoMoCallback;
