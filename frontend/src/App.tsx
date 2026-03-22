import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { EnrollmentProvider } from "@/contexts/EnrollmentContext";
import { CartProvider } from "@/contexts/CartContext";
import { AssignmentProvider } from "@/contexts/AssignmentContext";
import Index from "./pages/Index";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import MyCourses from "./pages/MyCourses";
import Progress from "./pages/Progress";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import MoMoCallback from "./pages/MoMoCallback";
import MyResults from "./pages/MyResults";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <EnrollmentProvider>
        <CartProvider>
          <AssignmentProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/courses" element={<Courses />} />
                  <Route path="/courses/:id" element={<CourseDetail />} />
                  <Route path="/my-courses" element={<MyCourses />} />
                  <Route path="/progress" element={<Progress />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/checkout/callback" element={<MoMoCallback />} />
                  <Route path="/my-results" element={<MyResults />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </AssignmentProvider>
        </CartProvider>
      </EnrollmentProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
