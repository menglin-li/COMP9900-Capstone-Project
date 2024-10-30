import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Form,
  Input,
  Button,
  Radio,
  Row,
  Col,
  Typography,
  message,
  Space,
} from "antd";
import { login, reg } from "../api/user";

const { Title } = Typography;

const Reg = ({ goToHome }) => {
  const [form] = Form.useForm();

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const register = async (values) => {
    if (
      values.role_type === "student" &&
      !values.email.endsWith("@ad.unsw.edu.au")
    ) {
      return message.warning(
        "Students must use a UNSW email address as username!"
      );
    }
    if (values.c_password !== values.password) {
      return message.warning("The two passwords are different!");
    }
    if (values.role_type !== "student" && !validateEmail(values.email)) {
      return message.warning("Invalid email format!");
    }
    await reg(values);
    message.success("Registered successfully! Automatic login");
    let data = await login({ email: values.email, password: values.password });
    localStorage.setItem("user", JSON.stringify(data));
    localStorage.setItem("token", data.token);
    try {
      let data = await login({
        email: values.email,
        password: values.password,
      });
      localStorage.setItem("user", JSON.stringify(data));
      localStorage.setItem("token", data.token);
      switch (data.user.role_type) {
        case "admin":
          window.location.href = "/admin/dashboard";
          break;
        case "student":
          window.location.href = "/student/dashboard";
          break;
        case "tutor":
          window.location.href = "/tutor/dashboard";
          break;
        case "coordinator":
          window.location.href = "/coordinator/dashboard";
          break;
        case "client":
          window.location.href = "/client/dashboard";
          break;
        default:
          window.location.href = "/dashboard";
          break;
      }
    } catch (error) {
      message.error(error.message);
    }
  };

  return (
    <Space direction="vertical" size="middle" style={{ width: "100%" }}>
      <Title level={2} style={{ textAlign: "center", marginBottom: 24 }}>
        User Registration
      </Title>
      <Form
        form={form}
        onFinish={register}
        initialValues={{
          email: "",
          firstName: "",
          lastName: "",
          password: "",
          role_type: "student",
          status: true,
        }}
        layout="vertical"
      >
        <Form.Item
          name="email"
          label="UserName"
          rules={[{ required: true, message: "Please input your email!" }]}
        >
          <Input placeholder="Enter your email" data-cy="inputEmail" />
        </Form.Item>
        <Form.Item
          name="firstName"
          label="First Name"
          rules={[{ required: true, message: "Please input your first name!" }]}
        >
          <Input placeholder="Enter your first name" data-cy="inputFirstName" />
        </Form.Item>
        <Form.Item
          name="lastName"
          label="Last Name"
          rules={[{ required: true, message: "Please input your last name!" }]}
        >
          <Input placeholder="Enter your last name" data-cy="inputLastName" />
        </Form.Item>
        <Form.Item name="role_type" label="Role">
          <Radio.Group>
            <Radio value="student">Student</Radio>
            <Radio value="tutor">Tutor</Radio>
            <Radio value="client">Project Client</Radio>
            <Radio value="coordinator">Coordinator</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item
          name="password"
          label="Password"
          rules={[{ required: true, message: "Please input your password!" }]}
        >
          <Input.Password
            data-cy="password"
            placeholder="Enter your password"
          />
        </Form.Item>
        <Form.Item
          name="c_password"
          label="Confirm Password"
          rules={[{ required: true, message: "Please confirm your password!" }]}
        >
          <Input.Password
            data-cy="c_password"
            placeholder="Confirm your password"
          />
        </Form.Item>
        <Form.Item>
          <Button data-cy="reg" type="primary" htmlType="submit" block>
            Sign Up
          </Button>
        </Form.Item>
      </Form>
    </Space>
  );
};

export default Reg;
