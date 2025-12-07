import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Route groups và permissions
const ROUTE_GROUPS = {
  // Public routes - không cần authentication (ai cũng truy cập được)
  // Guest có thể xem: danh sách sản phẩm, danh sách dịch vụ, thông tin trung tâm & chi nhánh
  PUBLIC: ["/auth", "/api", "/", "/services", "/products", "/about"],
  // Customer routes - cần CUSTOMER role
  CUSTOMER: ["/member"],
  // Admin routes - cần ADMIN role
  ADMIN: ["/dashboard"],
} as const;

// Role codes
const ROLES = {
  CUSTOMER: "CUSTOMER",
  ADMIN: "ADMIN",
  EMPLOYEE: "EMPLOYEE", // Nhân viên (có thể có nhiều role_code khác nhau như MANAGER, TECHNICIAN, etc.)
} as const;

/**
 * Kiểm tra xem path có thuộc route group nào không
 */
function getRouteGroup(pathname: string): string | null {
  // Kiểm tra public routes trước
  if (ROUTE_GROUPS.PUBLIC.some((route) => pathname.startsWith(route))) {
    return "PUBLIC";
  }

  // Kiểm tra customer routes
  if (ROUTE_GROUPS.CUSTOMER.some((route) => pathname.startsWith(route))) {
    return "CUSTOMER";
  }

  // Kiểm tra admin routes
  if (ROUTE_GROUPS.ADMIN.some((route) => pathname.startsWith(route))) {
    return "ADMIN";
  }

  // Root path và các route khác được coi là public
  if (pathname === "/" || pathname === "") {
    return "PUBLIC";
  }

  return null;
}

/**
 * Lấy thông tin user từ token trong cookie hoặc header
 * Trong middleware, chúng ta không thể access localStorage
 * Nên cần sử dụng cookie hoặc header
 *
 * NOTE: Middleware chỉ kiểm tra xem token có tồn tại hay không,
 * KHÔNG kiểm tra token hết hạn. Việc xử lý token expiry và refresh
 * được thực hiện hoàn toàn ở client side (axios interceptor)
 */
function getUserFromRequest(
  request: NextRequest
): { role: string; userType: string | null; isAuthenticated: boolean; hasRefreshToken: boolean } | null {
  try {
    // Lấy token từ cookie - KHÔNG kiểm tra expiry
    const refreshToken = request.cookies.get("refresh_token")?.value;
    const userInfoCookie = request.cookies.get("user_info")?.value;

    // Nếu có refresh token, coi như user vẫn authenticated
    // (access token có thể hết hạn nhưng refresh token còn → cho phép vào để axios interceptor xử lý)
    if (!refreshToken) {
      return null;
    }

    // Nếu không có userInfo nhưng có refresh token
    // → Vẫn cho vào để client-side xử lý (có thể đang trong quá trình refresh)
    if (!userInfoCookie) {
      console.log(
        "No userInfo cookie but refresh token exists - allowing access for client-side handling"
      );
      // Trả về role mặc định để middleware cho phép vào
      // Client side sẽ xử lý việc refresh token và lấy user info
      return {
        role: "",
        userType: null,
        isAuthenticated: true, // Coi như authenticated vì có refresh token
        hasRefreshToken: true,
      };
    }

    // Parse user info từ cookie
    const userInfo = JSON.parse(userInfoCookie);

    return {
      role: userInfo?.role?.role_code || null,
      userType: userInfo?.user_type || null,
      isAuthenticated: true,
      hasRefreshToken: true,
    };
  } catch (error) {
    console.log("Error parsing user info from cookie:", error);
    return null;
  }
}

/**
 * Kiểm tra xem role có phải là employee/staff không
 * Employee có thể có nhiều role_code khác nhau (MANAGER, TECHNICIAN, CASHIER, etc.)
 * nhưng không phải là CUSTOMER
 */
function isEmployeeRole(userRole: string | null, userType: string | null): boolean {
  if (!userRole) return false;
  
  // Nếu user_type là EMPLOYEE hoặc ADMIN, coi như employee
  if (userType === "EMPLOYEE" || userType === "ADMIN") {
    return true;
  }
  
  // Nếu role_code không phải CUSTOMER và không phải ADMIN (đã xử lý ở trên)
  // thì có thể là employee với role_code khác
  // Tuy nhiên, để an toàn, chỉ xử lý khi có user_type
  return false;
}

/**
 * Kiểm tra quyền truy cập
 * NOTE: Nếu user có refresh token nhưng không có role (đang refresh),
 * middleware sẽ cho phép vào và để client-side xử lý
 */
function hasPermission(
  userRole: string | null,
  requiredGroup: string,
  hasRefreshToken: boolean,
  userType: string | null = null
): boolean {
  // Nếu không có user role, chỉ cho phép truy cập public routes
  if (!userRole) {
    // Nếu có refresh token, tạm thời cho phép vào protected routes
    // Client-side sẽ refresh token và re-validate
    if (hasRefreshToken && requiredGroup !== "PUBLIC") {
      console.log(
        "No role but has refresh token - allowing access for client-side refresh"
      );
      return true;
    }
    return requiredGroup === "PUBLIC";
  }

  // ADMIN có quyền truy cập public routes, admin routes và customer routes
  // (vì Admin/Employee có thể làm tất cả những gì Guest & Member làm)
  if (userRole === ROLES.ADMIN) {
    return (
      requiredGroup === "PUBLIC" ||
      requiredGroup === "ADMIN" ||
      requiredGroup === "CUSTOMER"
    );
  }

  // CUSTOMER có quyền truy cập public routes và customer routes
  if (userRole === ROLES.CUSTOMER) {
    return requiredGroup === "PUBLIC" || requiredGroup === "CUSTOMER";
  }

  // Employee/Staff (có user_type là STAFF hoặc role_code khác CUSTOMER/ADMIN)
  // có quyền truy cập public routes và customer routes
  // (vì Employee có thể làm tất cả những gì Guest & Member làm)
  if (isEmployeeRole(userRole, userType)) {
    return (
      requiredGroup === "PUBLIC" ||
      requiredGroup === "CUSTOMER"
    );
  }

  return false;
}

/**
 * Tạo redirect URL dựa trên role
 * Tất cả user (admin, employee, customer) đều về trang chủ sau khi đăng nhập
 */
function getRedirectUrl(userRole: string | null, currentPath: string): string {
  // Nếu đang ở trang login/signup và đã đăng nhập, redirect về trang chủ
  if (currentPath.startsWith("/auth/") && userRole) {
      return "/";
  }

  // Nếu chưa đăng nhập và cố gắng truy cập protected route
  if (!userRole) {
    return "/auth/login";
  }

  // Nếu không có quyền truy cập, redirect về trang chủ
  return "/";
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Bỏ qua static files và API routes
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/api/") ||
    pathname.includes(".") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // Xác định route group của path hiện tại
  const routeGroup = getRouteGroup(pathname);

  // Nếu không xác định được route group, cho phép truy cập
  if (!routeGroup) {
    return NextResponse.next();
  }

  // Nếu là public route, cho phép truy cập
  if (routeGroup === "PUBLIC") {
    return NextResponse.next();
  }

  // Lấy thông tin user từ request
  const userInfo = getUserFromRequest(request);

  // Kiểm tra quyền truy cập
  const hasAccess = hasPermission(
    userInfo?.role || null,
    routeGroup,
    userInfo?.hasRefreshToken || false,
    userInfo?.userType || null
  );

  if (!hasAccess) {
    // Tạo redirect URL
    const redirectUrl = getRedirectUrl(userInfo?.role || null, pathname);

    // Tạo response redirect
    const response = NextResponse.redirect(new URL(redirectUrl, request.url));

    // Nếu redirect về login, có thể thêm thông tin về trang gốc
    if (redirectUrl === "/auth/login" && pathname !== "/auth/login") {
      response.cookies.set("redirect_after_login", pathname, {
        maxAge: 60 * 10, // 10 minutes
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });
    }

    return response;
  }

  // Cho phép truy cập
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
