import React, { useEffect, useRef, useState } from "react";
import "./Home.css";
import {
  Carousel,
  Button,
  Row,
  Col,
  Typography,
  BackTop,
  Modal,
  Flex,
} from "antd";
import LoginPage from "./LoginPage";
import Reg from "./RegConfirmPage";
import { useSearchParams } from "react-router-dom";
import Logo from "../assets/CPMP4.svg";

const { Title, Paragraph } = Typography;

const contentStyle = {
  margin: 0,
  height: "100vh",
  textAlign: "center",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
};

const App = () => {
  const carouselRef = useRef(null);

  const goToPage = (pageIndex) => {
    console.log(`Navigating to page ${pageIndex}`);
    if (carouselRef.current) {
      carouselRef.current.goTo(pageIndex);
    }
  };

  // if already login
  const [logined, setLogined] = useState(false);
  const [userinfo, setUserinfo] = useState(null);

  const userstring = localStorage.getItem("user");

  useEffect(() => {
    setUserinfo(JSON.parse(userstring));
    if (userstring) {
      setLogined(true);
    } else {
      setLogined(false);
    }
  }, []);

  const handleDashborad = () => {
    switch (userinfo.user.role_type) {
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
  };

  const handleLogout = () => {
    // Logic to clear user data from local storage or context
    localStorage.removeItem("user");
    setLogined(false);
    // Redirect to login page or handle logout
  };

  // Login Modal
  const [openLogin, setOpenLogin] = useState(false);

  const showLogin = () => {
    setOpenLogin(true);
  };

  const handleLoginCancel = () => {
    setOpenLogin(false);
  };

  // Signup Modal
  const [openSignup, setOpenSignup] = useState(false);

  const showSignup = () => {
    setOpenSignup(true);
  };

  const handleSignupCancel = () => {
    setOpenSignup(false);
  };

  const loginSignupSwitch = () => {
    setOpenLogin(!openLogin);
    setOpenSignup(!openSignup);
  };

  return (
    <>
      <Carousel
        ref={carouselRef}
        style={{ height: "100vh" }}
        autoplay={false}
        dots={false}
        effect="fade"
      >
        <div>
          <div className="animated-background" style={{ ...contentStyle }}>
            {!(openLogin || openSignup) && (
              <>
                <img
                  src={Logo}
                  alt="logo"
                  style={{ width: "200px", height: "200px" }}
                />
                <Title
                  level={1}
                  style={{ color: "#fff", marginTop: "24px", fontSize: "45px" }}
                >
                  Capstone Projects Management Platform
                </Title>
                {!logined && (
                  <Row
                    justify="center"
                    align="middle"
                    style={{ marginTop: 40 }}
                  >
                    <Col>
                      <Button
                        data-cy="loginBtn"
                        type="primary"
                        shape="round"
                        size="large"
                        onClick={showLogin}
                      >
                        Go to Login
                      </Button>
                    </Col>
                    <Col>
                      <Button
                        data-cy="SignUpBtn"
                        type="default"
                        shape="round"
                        size="large"
                        onClick={showSignup}
                        style={{ marginLeft: 50 }}
                      >
                        Go to Signup
                      </Button>
                    </Col>
                  </Row>
                )}
                {logined && (
                  <Row
                    justify="center"
                    align="middle"
                    style={{ marginTop: 40 }}
                  >
                    <Button
                      type="primary"
                      shape="round"
                      size="large"
                      onClick={handleDashborad}
                      style={{ width: 165 }}
                    >
                      Go to Dashboard
                    </Button>
                  </Row>
                )}
                {logined && (
                  <Row
                    justify="center"
                    align="middle"
                    style={{ marginTop: 20 }}
                  >
                    <Button
                      shape="round"
                      size="large"
                      onClick={handleLogout}
                      style={{ width: 165 }}
                    >
                      Log Out
                    </Button>
                  </Row>
                )}
              </>
            )}

            <Modal
              className="login-modal"
              open={openLogin}
              onCancel={handleLoginCancel}
              footer={[]}
              mask={false}
              centered
            >
              <LoginPage goToHome={() => goToPage(0)} />
              <Flex justify="center">
                <Button data-cy="switchBtn" onClick={loginSignupSwitch}>
                  Create Account
                </Button>
              </Flex>
            </Modal>

            <Modal
              className="signup-modal"
              open={openSignup}
              onCancel={handleSignupCancel}
              footer={[]}
              mask={false}
              centered
            >
              <Reg goToHome={() => goToPage(0)} />
              <Button data-cy="switchBtn" onClick={loginSignupSwitch} block>
                Go to Login
              </Button>
            </Modal>
          </div>
        </div>
      </Carousel>
      <BackTop />
    </>
  );
};

export default App;
