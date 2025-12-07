/**
 * Protected Route Component
 * Component để bảo vệ routes ở client-side
 */

'use client';

import { useAuth } from '@/lib/api';
import { canAccessPath, getAccessDeniedMessage, getRedirectPathByRole } from '@/lib/api/utils/auth.helpers';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, ReactNode } from 'react';
import { Spin, Result, Button } from 'antd';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'ADMIN' | 'CUSTOMER';
  fallback?: ReactNode;
}

export default function ProtectedRoute({ 
  children, 
  requiredRole,
  fallback 
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Nếu đang loading, không làm gì
    if (isLoading) return;

    // Nếu chưa đăng nhập, redirect về login
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    // Kiểm tra quyền truy cập path hiện tại
    if (!canAccessPath(user, pathname)) {
      // Redirect về trang chủ nếu không có quyền
      router.push('/');
      return;
    }

    // Kiểm tra required role nếu có
    // Nếu requiredRole là CUSTOMER, cho phép ADMIN và EMPLOYEE cũng truy cập
    // (vì Admin/Employee có thể làm tất cả những gì Customer làm)
    if (requiredRole) {
      const userRole = user?.role?.role_code;
      const userType = user?.user_type;
      
      if (requiredRole === 'CUSTOMER') {
        // Cho phép CUSTOMER, ADMIN, và EMPLOYEE (user_type là EMPLOYEE hoặc ADMIN)
        const isAllowed = 
          userRole === 'CUSTOMER' || 
          userRole === 'ADMIN' || 
          userType === 'EMPLOYEE' || 
          userType === 'ADMIN';
        
        if (!isAllowed) {
          router.push('/');
          return;
        }
      } else if (requiredRole === 'ADMIN') {
        // Chỉ cho phép ADMIN
        if (userRole !== 'ADMIN') {
          router.push('/');
          return;
        }
      }
    }
  }, [isAuthenticated, isLoading, user, pathname, router, requiredRole]);

  // Hiển thị loading
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '50vh' 
      }}>
        <Spin size="large" />
      </div>
    );
  }

  // Nếu chưa đăng nhập
  if (!isAuthenticated) {
    return fallback || (
      <Result
        status="403"
        title="Yêu cầu đăng nhập"
        subTitle="Bạn cần đăng nhập để truy cập trang này"
        extra={
          <Button type="primary" onClick={() => router.push('/auth/login')}>
            Đăng nhập
          </Button>
        }
      />
    );
  }

  // Nếu không có quyền truy cập
  if (!canAccessPath(user, pathname)) {
    return fallback || (
      <Result
        status="403"
        title="Không có quyền truy cập"
        subTitle={getAccessDeniedMessage(user, pathname)}
        extra={
          <Button type="primary" onClick={() => router.push('/')}>
            Về trang chủ
          </Button>
        }
      />
    );
  }

  // Nếu có required role nhưng không đúng role
  if (requiredRole) {
    const userRole = user?.role?.role_code;
    const userType = user?.user_type;
    
    let hasAccess = false;
    
    if (requiredRole === 'CUSTOMER') {
      // Cho phép CUSTOMER, ADMIN, và EMPLOYEE
      hasAccess = 
        userRole === 'CUSTOMER' || 
        userRole === 'ADMIN' || 
        userType === 'EMPLOYEE' || 
        userType === 'ADMIN';
    } else if (requiredRole === 'ADMIN') {
      // Chỉ cho phép ADMIN
      hasAccess = userRole === 'ADMIN';
    }
    
    if (!hasAccess) {
      return fallback || (
        <Result
          status="403"
          title="Không có quyền truy cập"
          subTitle={`Trang này chỉ dành cho ${requiredRole === 'ADMIN' ? 'quản trị viên' : 'khách hàng'}`}
          extra={
            <Button type="primary" onClick={() => router.push('/')}>
              Về trang chủ
            </Button>
          }
        />
      );
    }
  }

  // Hiển thị children nếu có quyền truy cập
  return <>{children}</>;
}
