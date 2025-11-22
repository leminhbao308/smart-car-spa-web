/**
 * Error Message Helper
 * 
 * MỤC ĐÍCH:
 * - Extract error message từ API response
 * - Hiển thị đúng nội dung mà backend trả về (không dịch)
 */

/**
 * Extract error message from API error response
 * 
 * Priority order:
 * 1. error.response.data.message (message từ backend)
 * 2. error.response.data.error
 * 3. error.message
 * 4. error.response.data.errors (array, join them)
 * 5. error.response.statusText
 * 6. Default message
 * 
 * LƯU Ý: Không dịch message, hiển thị đúng nội dung backend trả về
 */
export function getErrorMessage(error: any): string {
  if (!error) {
    return "Đã xảy ra lỗi không xác định";
  }

  // Try to extract from different possible locations
  const errorData = error?.response?.data || error?.data || error;
  
  // Priority 1: message field (từ backend response)
  let message = errorData?.message;
  if (message && typeof message === 'string' && message.trim()) {
    message = message.trim();
    // Special handling for time slot conflict
    if (message.includes("Please select a different time slot.")) {
      return "Thời gian bạn chọn đã bị đặt trước. Vui lòng chọn khung giờ khác!";
    }
    return message;
  }
  
  // Priority 2: error field
  message = errorData?.error;
  if (message && typeof message === 'string' && message.trim()) {
    message = message.trim();
    // Special handling for time slot conflict
    if (message.includes("Please select a different time slot.")) {
      return "Thời gian bạn chọn đã bị đặt trước. Vui lòng chọn khung giờ khác!";
    }
    return message;
  }
  
  // Priority 3: error.message
  message = error?.message;
  if (message && typeof message === 'string' && message.trim()) {
    message = message.trim();
    // Special handling for time slot conflict
    if (message.includes("Please select a different time slot.")) {
      return "Thời gian bạn chọn đã bị đặt trước. Vui lòng chọn khung giờ khác!";
    }
    return message;
  }
  
  // Priority 4: errors array (validation errors)
  if (errorData?.errors && Array.isArray(errorData.errors)) {
    const errorMessages = errorData.errors
      .map((err: any) => {
        if (typeof err === 'string') {
          return err;
        }
        if (err?.message) {
          return err.message;
        }
        if (err?.field && err?.defaultMessage) {
          return `${err.field}: ${err.defaultMessage}`;
        }
        return null;
      })
      .filter((msg: string | null) => msg !== null);
    
    if (errorMessages.length > 0) {
      const combinedMessage = errorMessages.join('. ');
      // Special handling for time slot conflict
      if (combinedMessage.includes("Please select a different time slot.")) {
        return "Thời gian bạn chọn đã bị đặt trước. Vui lòng chọn khung giờ khác!";
      }
      return combinedMessage;
    }
  }
  
  // Priority 5: statusText
  if (error?.response?.statusText) {
    return error.response.statusText;
  }
  
  // Priority 6: Check status code and provide generic message
  const status = error?.response?.status;
  if (status) {
    switch (status) {
      case 400:
        return "Bad Request - Dữ liệu không hợp lệ";
      case 401:
        return "Unauthorized - Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn";
      case 403:
        return "Forbidden - Bạn không có quyền thực hiện thao tác này";
      case 404:
        return "Not Found - Không tìm thấy tài nguyên yêu cầu";
      case 409:
        return "Conflict - Dữ liệu bị trùng lặp hoặc xung đột";
      case 422:
        return "Unprocessable Entity - Dữ liệu không hợp lệ";
      case 500:
        return "Internal Server Error - Lỗi máy chủ, vui lòng thử lại sau";
      case 503:
        return "Service Unavailable - Dịch vụ tạm thời không khả dụng";
      default:
        return `Error ${status} - Đã xảy ra lỗi`;
    }
  }
  
  // Default fallback
  return "Đã xảy ra lỗi. Vui lòng thử lại.";
}

/**
 * Get detailed error information for debugging
 */
export function getErrorDetails(error: any): {
  message: string;
  code?: string;
  status?: number;
  details?: any;
} {
  const errorData = error?.response?.data || error?.data || error;
  
  return {
    message: getErrorMessage(error),
    code: errorData?.error_code || errorData?.errorCode,
    status: error?.response?.status,
    details: errorData,
  };
}

