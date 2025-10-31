"use client";

import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import { Form, FormItemProps, Input } from "antd";

const InputPassword = ({
  value,
  onChange,
  placeholderCustom,
  name,
  rules,
  style,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholderCustom?: string;
  name?: string;
  rules?: FormItemProps["rules"];
  style?: React.CSSProperties;
}) => {
  return (
    <Form.Item name={name || "password"} rules={rules}>
      <Input.Password
        placeholder={placeholderCustom || "Nhập mật khẩu"}
        iconRender={(visible) =>
          visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
        }
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          ...style,
        }}
      />
    </Form.Item>
  );
};

export default InputPassword;
