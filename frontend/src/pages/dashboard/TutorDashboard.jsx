import React, { useState, useEffect } from "react";
import { Layout, Menu, Button, theme, Card, Row, Col, Drawer } from "antd";
import { useNavigate } from "react-router-dom";
const { Header, Sider, Content } = Layout;
import TeamList_v2 from "../TeamListPageV2";
import MyProject from "../Myproject";
import ProjectList from "../ProjectList";
import {
  DashboardOutlined,
  TeamOutlined,
  UsergroupAddOutlined,
  UnorderedListOutlined,
  ProjectOutlined,
} from "@ant-design/icons";

import CustomHeader from "../components/CustomHeader";
import "./TutorDashboard.css";
import projectP from "../../assets/rename.jpg";
import userP from "../../assets/user.jpg";
import kunkun from "../../assets/activeProject.png";
import groupP from "../../assets/groupP.png";
import useBreakpoints from "../components/ResponsiveComponent";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState("1");
  const breakpoint = useBreakpoints();
  const [collapse, setCollapse] = useState(false);
  const [isMobile, setMobile] = useState(false);

  useEffect(() => {
    setMobile(breakpoint == "xs" || breakpoint == "sm" || breakpoint == "md");
  }, [breakpoint]);

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const handleMenuClick = (e) => {
    if (collapse) {
      setCollapse(false);
    }
    setActiveMenu(e.key);
  };

  const handleButtonClick = (key) => {
    setActiveMenu(key);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <Layout className="tutor-first-layout ">
      <CustomHeader
        userRole={"tutor"}
        collapse={collapse}
        setCollapse={setCollapse}
        onLogout={() => console.log("Logged out")}
      />
      <Layout className="tutor-second-layout relative">
        {isMobile ? (
          <>
            <Drawer
              width="50%"
              placement="left"
              closable={false}
              open={collapse}
              bodyStyle={{ padding: 0 }}
              getContainer={false}
            >
              <Menu
                className="tutor-sider-menu"
                mode="inline"
                selectedKeys={[activeMenu]}
                onClick={handleMenuClick}
                style={{
                  borderRight: 0,
                }}
              >
                <Menu.Item key="1" icon={<DashboardOutlined />}>
                  Dashboard
                </Menu.Item>
                <Menu.Item key="2" icon={<UsergroupAddOutlined />}>
                  Team List
                </Menu.Item>
                {/* <Menu.Item key="3" icon={<TeamOutlined />}>
              My Team
            </Menu.Item> */}
                <Menu.Item key="4" icon={<UnorderedListOutlined />}>
                  Project List
                </Menu.Item>
                <Menu.Item key="5" icon={<ProjectOutlined />}>
                  My Project
                </Menu.Item>
              </Menu>
            </Drawer>
          </>
        ) : (
          <Sider
            className="tutor-sider"
            width={200}
            style={{ background: colorBgContainer }}
          >
            <Menu
              className="tutor-sider-menu"
              mode="inline"
              selectedKeys={[activeMenu]}
              onClick={handleMenuClick}
              style={{
                borderRight: 0,
              }}
            >
              <Menu.Item key="1" icon={<DashboardOutlined />}>
                Dashboard
              </Menu.Item>
              <Menu.Item key="2" icon={<UsergroupAddOutlined />}>
                Team List
              </Menu.Item>
              {/* <Menu.Item key="3" icon={<TeamOutlined />}>
              My Team
            </Menu.Item> */}
              <Menu.Item key="4" icon={<UnorderedListOutlined />}>
                Project List
              </Menu.Item>
              <Menu.Item key="5" icon={<ProjectOutlined />}>
                My Project
              </Menu.Item>
            </Menu>
          </Sider>
        )}

        <Content
          className="tutor-content"
          style={{
            padding: 24,
            margin: 0,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          {activeMenu === "1" && (
            <Row gutter={[16, 24]}>
              <Col xs={24} sm={12} md={12} lg={8} xl={8}>
                <Card hoverable onClick={() => handleButtonClick("2")}>
                  <Row wrap={false} align="middle">
                    <Col flex="none">
                      <img
                        src={userP}
                        width="100px"
                        height="100px"
                        alt="userP"
                      />
                    </Col>
                    <Col
                      flex="auto"
                      style={{
                        marginLeft: 20,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <Card.Meta title="Team List" />
                    </Col>
                  </Row>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={12} lg={8} xl={8}>
                <Card hoverable onClick={() => handleButtonClick("4")}>
                  <Row wrap={false} align="middle">
                    <Col flex="none">
                      <img
                        src={projectP}
                        width="100px"
                        height="100px"
                        alt="projectP"
                      />
                    </Col>
                    <Col
                      flex="auto"
                      style={{
                        marginLeft: 20,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <Card.Meta title="Project List" />
                    </Col>
                  </Row>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={12} lg={8} xl={8}>
                <Card hoverable onClick={() => handleButtonClick("5")}>
                  <Row wrap={false} align="middle">
                    <Col flex="none">
                      <img
                        src={kunkun}
                        width="100px"
                        height="100px"
                        alt="kunkun"
                      />
                    </Col>
                    <Col
                      flex="auto"
                      style={{
                        marginLeft: 20,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <Card.Meta title="My Supervised Project" />
                    </Col>
                  </Row>
                </Card>
              </Col>
            </Row>
          )}
          {activeMenu === "2" && (
            <Card bordered={false}>
              <TeamList_v2 onNavigate={handleButtonClick} />
            </Card>
          )}
          {activeMenu === "3" && (
            <Card bordered={false}>{/*MY TEAM PAGE FUNCTION*/}</Card>
          )}
          {activeMenu === "4" && (
            <Card bordered={false}>
              <ProjectList onNavigate={handleButtonClick} />
            </Card>
          )}
          {activeMenu === "5" && (
            <Card bordered={false}>
              <MyProject />
              <Button type="link" onClick={() => handleButtonClick("1")}>
                Back to Dashboard
              </Button>
            </Card>
          )}
        </Content>
      </Layout>
    </Layout>
  );
};

export default StudentDashboard;
