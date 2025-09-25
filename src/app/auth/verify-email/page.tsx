"use client";
import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Spin, Result, Button, message } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import CustomerHeader from '@/components/layout/Header/customer.header';
import { AuthIntegrationService } from '@/lib/firebase';

type VerificationStatus = 'verifying' | 'success' | 'error' | 'expired';

const VerifyEmailPage = () => {
  const [status, setStatus] = useState<VerificationStatus>('verifying');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        setStatus('verifying');
        
        // Verify email link
        const user = await AuthIntegrationService.verifyEmailLink();
        
        if (user) {
          setStatus('success');
          message.success('Xác thực email thành công!');
          
          // Redirect to signup step 3 after 2 seconds
          setTimeout(() => {
            router.push(`/auth/signup?step=3&email=${user.email}`);
          }, 2000);
        } else {
          setStatus('error');
          setErrorMessage('Link xác thực không hợp lệ hoặc đã hết hạn');
        }
      } catch (error: any) {
        console.error('Email verification error:', error);
        setStatus('error');
        setErrorMessage(error.message || 'Có lỗi xảy ra khi xác thực email');
      }
    };

    verifyEmail();
  }, [router]);

  const handleRetry = () => {
    if (email) {
      router.push(`/auth/signup?step=2&email=${email}`);
    } else {
      router.push('/auth/signup');
    }
  };

  const handleGoToSignup = () => {
    router.push('/auth/signup');
  };

  const renderContent = () => {
    switch (status) {
      case 'verifying':
        return (
          <Result
            icon={<LoadingOutlined style={{ fontSize: '64px', color: '#6C7BEA' }} />}
            title="Đang xác thực email..."
            subTitle="Vui lòng chờ trong giây lát"
            extra={
              <Spin size="large" />
            }
          />
        );

      case 'success':
        return (
          <Result
            icon={<CheckCircleOutlined style={{ fontSize: '64px', color: '#52c41a' }} />}
            title="Xác thực thành công!"
            subTitle="Email của bạn đã được xác thực. Đang chuyển hướng..."
            extra={
              <Button type="primary" onClick={() => router.push(`/auth/signup?step=3&email=${email}`)}>
                Tiếp tục đăng ký
              </Button>
            }
          />
        );

      case 'error':
        return (
          <Result
            icon={<CloseCircleOutlined style={{ fontSize: '64px', color: '#ff4d4f' }} />}
            title="Xác thực thất bại"
            subTitle={errorMessage}
            extra={[
              <Button type="primary" key="retry" onClick={handleRetry}>
                Thử lại
              </Button>,
              <Button key="signup" onClick={handleGoToSignup} style={{ marginLeft: '8px' }}>
                Về trang đăng ký
              </Button>
            ]}
          />
        );

      default:
        return null;
    }
  };

  return (
    <>
      <style jsx>{`
        .verify-email-container {
          padding: 40px;
          max-width: 500px;
        }

        @media (max-width: 767px) {
          .verify-email-container {
            padding: 24px;
            max-width: 400px;
            margin: 0 16px;
          }
        }

        @media (max-width: 480px) {
          .verify-email-container {
            padding: 20px;
            max-width: 350px;
            margin: 0 12px;
          }
        }
      `}</style>
      
      {/* Container */}
      <div
        style={{
          minHeight: "100vh",
          position: "relative",
          backgroundColor: "#F4F7FE",
        }}
      >
        {/* Header */}
        <CustomerHeader />

        {/* Content Container */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "calc(100vh - 80px)",
          }}
        >
          {/* Verification Container */}
          <div
            className="verify-email-container"
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "16px",
              padding: "40px",
              width: "100%",
              maxWidth: "500px",
              margin: "0 20px",
              border: "1px solid #E5E7EB",
              boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
            }}
          >
            {renderContent()}
          </div>
        </div>
      </div>
    </>
  );
};

export default VerifyEmailPage;
