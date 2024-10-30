// CustomHeader.js
import React from "react";
import { Layout, Col, Row, Button } from "antd";
import { MessageFilled } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import Notification from "../Notification";
import UserProfile from "./UserProfile";
import "./CustomHeader.css";
import Logo from "../../assets/CPMP4.svg";
import unswLogo from "../../assets/unsw-appbar.svg";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";

const { Header } = Layout;

const CustomHeader = ({ userRole, onLogout, collapse, setCollapse }) => {
  const navigate = useNavigate();

  // Determine header title based on user role
  let headerTitle;
  switch (userRole) {
    case "admin":
      headerTitle = "Admin Dashboard";
      break;
    case "student":
      headerTitle = "Student Dashboard";
      break;
    case "tutor":
      headerTitle = "Tutor Dashboard";
      break;
    case "coordinator":
      headerTitle = "Coordinator Dashboard";
      break;
    case "client":
      headerTitle = "Client Dashboard";
      break;
    case "message":
      headerTitle = "Messages";
      break;
    default:
      headerTitle = "Welcome";
      break;
  }

  // Navigate to Message Page
  const navigateToMessagePage = () => {
    navigate("/MessagePage");
  };

  // Toggle sidebar collapse
  const changeCollapse = () => {
    setCollapse(!collapse);
  };

  return (
    <Header className="custom-header">
      <div className="w-full flex justify-between">
        <Row className="flex-1">
          {/* Logo and header title for large screens */}
          <Col xs={0} sm={0} md={0} lg={13} xl={13}>
            <div className="w-full h-full flex items-center">
              <div className="header-logo">
                <img src={Logo} alt="logo" />
              </div>
              <div className="header-unsw-logo ">
                <img
                  src={unswLogo}
                  alt="unsw-logo"
                  style={{ height: "45px" }}
                />
              </div>
              <div style={{ fontSize: "24px", fontWeight: "bold" }}>
                {headerTitle}
              </div>
            </div>
          </Col>
          {/* Collapse button for small screens */}
          <Col xs={10} sm={10} md={10} lg={0} xl={0}>
            <div className="flex items-center h-full">
              {collapse ? (
                <Button
                  type="primary"
                  icon={<MenuFoldOutlined />}
                  size="large"
                  onClick={changeCollapse}
                />
              ) : (
                <Button
                  type="primary"
                  icon={<MenuUnfoldOutlined />}
                  size="large"
                  onClick={changeCollapse}
                />
              )}
            </div>
          </Col>
        </Row>
        <Row>
          {/* Message icon */}
          <Col>
            <div className="messagepage-container">
              <MessageFilled
                onClick={navigateToMessagePage}
                style={{ fontSize: "24px", color: "#fff", cursor: "pointer" }}
              />
            </div>
          </Col>
          {/* Notification component */}
          <Col>
            <div className="notification-container">
              <Notification />
            </div>
          </Col>
          {/* User profile component */}
          <Col>
            <div className="user-profile-container">
              <UserProfile onLogout={onLogout} />
            </div>
          </Col>
        </Row>
      </div>
    </Header>
  );
};

export default CustomHeader;
