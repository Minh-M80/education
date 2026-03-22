import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Mail, Phone, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="border-t border-border bg-primary text-primary-foreground">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-foreground">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
              <span className="font-display text-xl font-bold">EduMaster</span>
            </Link>
            <p className="text-sm opacity-80">
              Nền tảng học trực tuyến hàng đầu Việt Nam với hơn 500+ khóa học chất lượng cao.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4 font-semibold">Khám phá</h4>
            <ul className="space-y-2 text-sm opacity-80">
              <li><Link to="/courses" className="hover:opacity-100">Tất cả khóa học</Link></li>
              <li><Link to="/courses?category=web" className="hover:opacity-100">Web Development</Link></li>
              <li><Link to="/courses?category=data" className="hover:opacity-100">Data Science</Link></li>
              <li><Link to="/courses?category=design" className="hover:opacity-100">Design</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="mb-4 font-semibold">Hỗ trợ</h4>
            <ul className="space-y-2 text-sm opacity-80">
              <li><a href="#" className="hover:opacity-100">Trung tâm trợ giúp</a></li>
              <li><a href="#" className="hover:opacity-100">Chính sách hoàn tiền</a></li>
              <li><a href="#" className="hover:opacity-100">Điều khoản sử dụng</a></li>
              <li><a href="#" className="hover:opacity-100">Chính sách bảo mật</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-4 font-semibold">Liên hệ</h4>
            <ul className="space-y-3 text-sm opacity-80">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                support@edumaster.vn
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                1900 1234
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5" />
                123 Nguyễn Huệ, Q.1, TP.HCM
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-primary-foreground/20 pt-8 text-center text-sm opacity-60">
          © 2024 EduMaster. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
