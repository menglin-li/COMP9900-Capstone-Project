import React, { useState } from "react";
import { Form, Input, Button, Row, Col, Typography, message } from "antd";
import { login } from "../api/user";
import logo from "../assets/unsw.png";
import "./LoginPage.css";

const { Title } = Typography;

const Login = ({ goToHome }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const gotoForgotPassword = () => {
    window.location.href = "https://iam.unsw.edu.au/home";
  };

  const submit = async (values) => {
    setLoading(true);
    try {
      let data = await login(values);
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
          window.location.href = "/";
          break;
      }
    } catch (error) {
      message.error("Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Row className="login-container">
      <Col flex="1" className="form-container">
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <img src={logo} width="200px" alt="logo" />
        </div>
        <Title level={2} style={{ textAlign: "center", marginBottom: 24 }}>
          Login
        </Title>
        <Form form={form} onFinish={submit}>
          <Form.Item
            data-cy="user-email"
            name="email"
            rules={[{ required: true, message: "Please input your email!" }]}
          >
            <Input placeholder="Email" />
          </Form.Item>
          <Form.Item
            data-cy="user-password"
            name="password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password placeholder="Password" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Log in
            </Button>
          </Form.Item>
        </Form>
        <Row justify="center" className="forgot-password-row">
          <Col>
            <Button
              type="link"
              onClick={gotoForgotPassword}
              className="forgot-password-btn"
            >
              Forgot Password?
            </Button>
          </Col>
        </Row>
        <Row justify="center" style={{ marginTop: 20 }}>
          <Col>
            {/* <Button type="default" onClick={goToHome}>
              Back to Home
            </Button> */}
          </Col>
        </Row>
      </Col>
    </Row>
  );
};

export default Login;
