/**
 * Authentication Helper Functions
 * Các hàm tiện ích để kiểm tra quyền truy cập và role
 */

import { UserInfo } from '../types';

// Role codes
export const ROLES = {
  CUSTOMER: 'CUSTOMER',
  ADMIN: 'ADMIN',
} as const;

export type RoleCode = typeof ROLES[keyof typeof ROLES];

// Route groups
export const ROUTE_GROUPS = {
  PUBLIC: 'PUBLIC',
  CUSTOMER: 'CUSTOMER', 
  ADMIN: 'ADMIN',
} as const;

export type RouteGroup = typeof ROUTE_GROUPS[keyof typeof ROUTE_GROUPS];

/**
 * Kiểm tra xem user có role cụ thể không
 */
export function hasRole(user: UserInfo | null, role: RoleCode): boolean {
  if (!user || !user.role) return false;
  return user.role.role_code === role;
}

/**
 * Kiểm tra xem user có phải admin không
 */
export function isAdmin(user: UserInfo | null): boolean {
  return hasRole(user, ROLES.ADMIN);
}

/**
 * Kiểm tra xem user có phải customer không
 */
export function isCustomer(user: UserInfo | null): boolean {
  return hasRole(user, ROLES.CUSTOMER);
}

/**
 * Kiểm tra xem user có quyền truy cập route group không
 */
export function hasRouteAccess(user: UserInfo | null, routeGroup: RouteGroup): boolean {
  if (!user) {
    return routeGroup === ROUTE_GROUPS.PUBLIC;
  }

  // ADMIN có quyền truy cập tất cả
  if (isAdmin(user)) {
    return true;
  }

  // CUSTOMER chỉ có quyền truy cập customer routes và public routes
  if (isCustomer(user)) {
    return routeGroup === ROUTE_GROUPS.CUSTOMER || routeGroup === ROUTE_GROUPS.PUBLIC;
  }

  return false;
}

/**
 * Lấy redirect path dựa trên role
 */
export function getRedirectPathByRole(role?: string): string {
  if (role === ROLES.ADMIN) {
    return '/dashboard';
  } else if (role === ROLES.CUSTOMER) {
    return '/';
  }
  return '/auth/login';
}

/**
 * Kiểm tra xem path có thuộc route group nào không
 */
export function getRouteGroupFromPath(pathname: string): RouteGroup | null {
  // Public routes
  if (pathname.startsWith('/auth') || pathname.startsWith('/api')) {
    return ROUTE_GROUPS.PUBLIC;
  }
  
  // Customer routes
  if (pathname.startsWith('/member') || pathname.startsWith('/services')) {
    return ROUTE_GROUPS.CUSTOMER;
  }
  
  // Admin routes
  if (pathname.startsWith('/dashboard')) {
    return ROUTE_GROUPS.ADMIN;
  }
  
  // Root path
  if (pathname === '/' || pathname === '') {
    return ROUTE_GROUPS.PUBLIC;
  }
  
  return null;
}

/**
 * Kiểm tra xem user có thể truy cập path không
 */
export function canAccessPath(user: UserInfo | null, pathname: string): boolean {
  const routeGroup = getRouteGroupFromPath(pathname);
  
  if (!routeGroup) {
    return true; // Cho phép truy cập nếu không xác định được route group
  }
  
  return hasRouteAccess(user, routeGroup);
}

/**
 * Lấy thông báo lỗi dựa trên quyền truy cập
 */
export function getAccessDeniedMessage(user: UserInfo | null, pathname: string): string {
  const routeGroup = getRouteGroupFromPath(pathname);
  
  if (!user) {
    return 'Bạn cần đăng nhập để truy cập trang này';
  }
  
  if (routeGroup === ROUTE_GROUPS.ADMIN && !isAdmin(user)) {
    return 'Bạn không có quyền truy cập trang quản trị';
  }
  
  if (routeGroup === ROUTE_GROUPS.CUSTOMER && !isCustomer(user)) {
    return 'Bạn không có quyền truy cập trang khách hàng';
  }
  
  return 'Bạn không có quyền truy cập trang này';
}
