import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { GraduationCap, Menu, X, User, LogOut, BookOpen, BarChart3, ShoppingCart, Trophy } from 'lucide-react';

const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <GraduationCap className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold text-primary">EduMaster</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link 
            to="/courses" 
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Khóa học
          </Link>
          {isAuthenticated && (
            <Link 
              to="/my-courses" 
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Khóa học của tôi
            </Link>
          )}
        </nav>

        {/* Desktop Auth + Cart */}
        <div className="hidden items-center gap-3 md:flex">
          {/* Cart Icon */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative"
            onClick={() => navigate('/cart')}
          >
            <ShoppingCart className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#ae2070] text-xs font-bold text-white">
                {itemCount}
              </span>
            )}
          </Button>

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    {user?.fullName.charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[120px] truncate text-sm font-medium">
                    {user?.fullName}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-popover">
                <DropdownMenuItem onClick={() => navigate('/my-courses')}>
                  <BookOpen className="mr-2 h-4 w-4" />
                  Khóa học của tôi
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/progress')}>
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Tiến độ học tập
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/my-results')}>
                  <Trophy className="mr-2 h-4 w-4" />
                  Kết quả quiz
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/cart')}>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Giỏ hàng
                  {itemCount > 0 && (
                    <span className="ml-auto text-xs text-muted-foreground">
                      {itemCount}
                    </span>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" onClick={() => navigate('/login')}>
                Đăng nhập
              </Button>
              <Button onClick={() => navigate('/register')} className="btn-gradient">
                Đăng ký
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-2 md:hidden">
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative"
            onClick={() => navigate('/cart')}
          >
            <ShoppingCart className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#ae2070] text-xs font-bold text-white">
                {itemCount}
              </span>
            )}
          </Button>
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-border bg-background p-4 md:hidden">
          <nav className="flex flex-col gap-4">
            <Link 
              to="/courses" 
              className="text-sm font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Khóa học
            </Link>
            <Link 
              to="/cart" 
              className="flex items-center justify-between text-sm font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Giỏ hàng
              {itemCount > 0 && (
                <span className="rounded-full bg-[#ae2070] px-2 py-0.5 text-xs text-white">
                  {itemCount}
                </span>
              )}
            </Link>
            {isAuthenticated ? (
              <>
                <Link 
                  to="/my-courses" 
                  className="text-sm font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Khóa học của tôi
                </Link>
                <Link to="/progress" className="text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
                  Tiến độ học tập
                </Link>
                <Link to="/my-results" className="text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
                  Kết quả quiz
                </Link>
                <Button variant="outline" onClick={handleLogout} className="w-full">
                  Đăng xuất
                </Button>
              </>
            ) : (
              <div className="flex flex-col gap-2">
                <Button variant="outline" onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}>
                  Đăng nhập
                </Button>
                <Button onClick={() => { navigate('/register'); setMobileMenuOpen(false); }} className="btn-gradient">
                  Đăng ký
                </Button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
