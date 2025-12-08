"use client";

import { Input, Typography } from "antd";
import type { GetProps } from "antd";

type OTPProps = GetProps<typeof Input.OTP>;

const { Title } = Typography;

const InputOTP = ({ length }: { length: number }) => {
  const onChange: OTPProps["onChange"] = (text) => {

  };

  const onInput: OTPProps["onInput"] = (value) => {

  };

  const sharedProps: OTPProps = {
    onChange,
    onInput,
  };
  return (
    <div>
      <Title level={5}>With Length (8)</Title>
      <Input.OTP length={length} {...sharedProps} />
    </div>
  );
};

export default InputOTP;
