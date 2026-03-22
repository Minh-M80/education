import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, Trash2, ArrowRight, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { items, removeFromCart, totalPrice, clearCart } = useCart();
  const { isAuthenticated } = useAuth();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(price);
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để thanh toán');
      navigate('/login', { state: { from: '/cart' } });
      return;
    }
    if (items.length === 0) {
      toast.error('Giỏ hàng trống');
      return;
    }
    navigate('/checkout');
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 bg-muted/30 py-12">
        <div className="container">
          <div className="mb-8 flex items-center gap-3">
            <ShoppingCart className="h-8 w-8 text-primary" />
            <h1 className="font-display text-3xl font-bold">Giỏ hàng</h1>
            {items.length > 0 && (
              <span className="rounded-full bg-primary px-3 py-1 text-sm font-medium text-primary-foreground">
                {items.length} khóa học
              </span>
            )}
          </div>

          {items.length === 0 ? (
            <Card className="py-16 text-center">
              <CardContent>
                <ShoppingCart className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
                <h2 className="mb-2 text-xl font-semibold">Giỏ hàng trống</h2>
                <p className="mb-6 text-muted-foreground">
                  Bạn chưa thêm khóa học nào vào giỏ hàng
                </p>
                <Button onClick={() => navigate('/courses')} className="btn-gradient">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Khám phá khóa học
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {items.map((item) => (
                  <Card key={item.course.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex gap-4 p-4">
                        <img 
                          src={item.course.thumbnail} 
                          alt={item.course.title}
                          className="h-24 w-32 rounded-lg object-cover"
                        />
                        <div className="flex flex-1 flex-col justify-between">
                          <div>
                            <h3 className="font-semibold line-clamp-1">{item.course.title}</h3>
                            <p className="text-sm text-muted-foreground">{item.course.instructor}</p>
                            <p className="text-sm text-muted-foreground">
                              {item.course.totalLessons} bài học • {item.course.duration}
                            </p>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-primary">
                              {formatPrice(item.course.price)}
                            </span>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => removeFromCart(item.course.id)}
                            >
                              <Trash2 className="mr-1 h-4 w-4" />
                              Xóa
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={clearCart}
                >
                  Xóa tất cả
                </Button>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <Card className="sticky top-24">
                  <CardContent className="p-6">
                    <h3 className="mb-4 font-display text-lg font-semibold">Tóm tắt đơn hàng</h3>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Số khóa học</span>
                        <span>{items.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Tạm tính</span>
                        <span>{formatPrice(totalPrice)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-lg font-bold">
                        <span>Tổng cộng</span>
                        <span className="text-primary">{formatPrice(totalPrice)}</span>
                      </div>
                    </div>

                    <Button 
                      className="mt-6 w-full btn-gradient"
                      onClick={handleCheckout}
                    >
                      Thanh toán
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>

                    <p className="mt-4 text-center text-xs text-muted-foreground">
                      Hỗ trợ thanh toán qua MoMo, Ngân hàng
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Cart;
