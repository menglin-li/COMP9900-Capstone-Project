import React, { useState, useEffect } from "react";
import {
  Layout,
  Menu,
  Card,
  Button,
  Row,
  Col,
  theme,
  Drawer,
  Statistic,
} from "antd";
import ApprovePendingUsers from "../ApprovePendingUsers";
import AdminProjectApproval from "../ApproveProject";
import UserProfile from "../components/UserProfile";
import ProjectList from "../ProjectList";
import AdminReports from "../Report";
const { Header, Content, Sider } = Layout;
import projectP from "../../assets/project.png";
import userP from "../../assets/newUser.png";
import kunkun from "../../assets/kunkun.jpeg";
import groupP from "../../assets/user.jpg";
import statistic from "../../assets/statistic.png";
import activePorject from "../../assets/activeProject.png";
import teamList from "../../assets/team.png";
import { getPendingUsers } from "../../api/admin";
import { getAllProjects } from "../../api/project";
import { getAllGroup } from "../../api/group";
import { getUsers } from "../../api/user";
import {
  DashboardOutlined,
  UserOutlined,
  ProjectOutlined,
  TeamOutlined,
  SolutionOutlined,
  StockOutlined,
} from "@ant-design/icons";

import "./AdminDashboard.css";
import CustomHeader from "../components/CustomHeader";
import useBreakpoints from "../components/ResponsiveComponent";

const AdminDashboard = () => {
  const [activeMenu, setActiveMenu] = useState("1");
  const [pendingUsersCount, setPendingUsersCount] = useState(0);
  const [pendingProjectsCount, setPendingProjectsCount] = useState(0);
  const [activeProjectsCount, setActiveProjectsCount] = useState(0);
  const [totalGroupsCount, setTotalGroupsCount] = useState(0);
  const [totalUsersCount, setTotalUsersCount] = useState(0);
  const breakpoint = useBreakpoints();
  const [collapse, setCollapse] = useState(false);
  const [isMobile, setMobile] = useState(false);

  useEffect(() => {
    setMobile(breakpoint == "xs" || breakpoint == "sm" || breakpoint == "md");
  }, [breakpoint]);

  const fetchPendingUsers = async () => {
    try {
      const response = await getPendingUsers();
      setPendingUsersCount(response.length);
    } catch (error) {
      console.error("Failed to fetch pending users", error);
    }
  };
  const fetchPendingProjects = async () => {
    try {
      const response = await getAllProjects();
      const pendingCount = response.filter(
        (project) => project.status === "false"
      ).length;
      setPendingProjectsCount(pendingCount);
    } catch (error) {
      console.error("Failed to fetch pending projects", error);
    }
  };
  const fetchActiveProjects = async () => {
    try {
      const response = await getAllProjects();
      const activeCount = response.filter(
        (project) => project.status === "true"
      ).length;
      setActiveProjectsCount(activeCount);
    } catch (error) {
      console.error("Failed to fetch active projects", error);
    }
  };
  const fetchTotalGroups = async () => {
    try {
      const response = await getAllGroup();
      setTotalGroupsCount(response.length);
    } catch (error) {
      console.error("Failed to fetch groups", error);
    }
  };
  const fetchTotalUsers = async () => {
    try {
      const response = await getUsers();
      setTotalUsersCount(response.length);
    } catch (error) {
      console.error("Failed to fetch users", error);
    }
  };

  useEffect(() => {
    fetchPendingUsers();
    fetchPendingProjects();
    fetchActiveProjects();
    fetchTotalGroups();
    fetchTotalUsers();
  }, [activeMenu]);

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
    // Logic to clear user data from local storage or context
    localStorage.removeItem("user");
    // Redirect to login page or handle logout
  };

  return (
    <Layout className="admin-first-layout">
      <CustomHeader
        userRole={"admin"}
        collapse={collapse}
        setCollapse={setCollapse}
        onLogout={() => console.log("Logged out")}
      />
      <Layout className="admin-second-layout relative">
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
                className="admin-sider-menu"
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
                <Menu.Item key="2" icon={<UserOutlined />}>
                  Pending User
                </Menu.Item>
                <Menu.Item key="3" icon={<ProjectOutlined />}>
                  Manage Project
                </Menu.Item>
                {/* <Menu.Item key="4" icon={<TeamOutlined />}>
                  Team Management
                </Menu.Item> */}
                {/* <Menu.Item key="5" icon={<SolutionOutlined />}>
                  Manage User Role
                </Menu.Item> */}
                <Menu.Item key="6" icon={<ProjectOutlined />}>
                  Project List
                </Menu.Item>
                <Menu.Item key="7" icon={<StockOutlined />}>
                  Reports
                </Menu.Item>
              </Menu>
            </Drawer>
          </>
        ) : (
          <Sider
            className="admin-sider"
            width={200}
            style={{ background: colorBgContainer }}
          >
            <Menu
              className="admin-sider-menu"
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
              <Menu.Item key="2" data-cy="manageUser" icon={<UserOutlined />}>
                Pending User
              </Menu.Item>
              <Menu.Item key="3" data-cy="manage" icon={<ProjectOutlined />}>
                Manage Project
              </Menu.Item>
              {/* <Menu.Item key="4" icon={<TeamOutlined />}>
                Team Management
              </Menu.Item>
              <Menu.Item key="5" icon={<SolutionOutlined />}>
                Manage User Role
              </Menu.Item> */}
              <Menu.Item key="6" icon={<ProjectOutlined />}>
                Project List
              </Menu.Item>
              <Menu.Item key="7" icon={<StockOutlined />}>
                Reports
              </Menu.Item>
            </Menu>
          </Sider>
        )}

        <Content
          className="admin-content"
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
                      {/* <Card.Meta title={`Pending user`} /> */}
                      <Statistic
                        title="Pending Users"
                        value={pendingUsersCount}
                        style={{ marginLeft: 20 }}
                        className="custom-statistic-title"
                      />
                    </Col>
                  </Row>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={12} lg={8} xl={8}>
                <Card hoverable onClick={() => handleButtonClick("3")}>
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
                      <Statistic
                        title="Pending Projects"
                        value={pendingProjectsCount}
                        className="custom-statistic-title"
                        style={{ marginLeft: 20 }}
                      />
                    </Col>
                  </Row>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={12} lg={8} xl={8}>
                <Card hoverable onClick={() => handleButtonClick("4")}>
                  <Row wrap={false} align="middle">
                    <Col flex="none">
                      <img
                        src={teamList}
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
                      {/* <Card.Meta title="Go to Team Management" /> */}
                      <Statistic
                        title="Team Statistic"
                        value={totalGroupsCount}
                        className="custom-statistic-title"
                        style={{ marginLeft: 20 }}
                      />
                    </Col>
                  </Row>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={12} lg={8} xl={8}>
                <Card hoverable onClick={() => handleButtonClick("5")}>
                  <Row wrap={false} align="middle">
                    <Col flex="none">
                      <img
                        src={groupP}
                        width="100px"
                        height="100px"
                        alt="groupP"
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
                      {/* <Card.Meta title="Go to Manage User Role" /> */}
                      <Statistic
                        title="User Statistic"
                        value={totalUsersCount}
                        className="custom-statistic-title"
                        style={{ marginLeft: 20 }}
                      />
                    </Col>
                  </Row>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={12} lg={8} xl={8}>
                <Card hoverable onClick={() => handleButtonClick("6")}>
                  <Row wrap={false} align="middle">
                    <Col flex="none">
                      <img
                        src={activePorject}
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
                      <Statistic
                        title="Active Projects"
                        value={activeProjectsCount}
                        className="custom-statistic-title"
                        style={{ marginLeft: 20 }}
                      />
                    </Col>
                  </Row>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={12} lg={8} xl={8}>
                <Card hoverable onClick={() => handleButtonClick("7")}>
                  <Row wrap={false} align="middle">
                    <Col flex="none">
                      <img
                        src={statistic}
                        width="100px"
                        height="100px"
                        alt="groupP"
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
                      {/* <Card.Meta title="Reports" /> */}
                      <Statistic
                        title="Reports"
                        value={1}
                        className="custom-statistic-title"
                        style={{ marginLeft: 20 }}
                      />
                    </Col>
                  </Row>
                </Card>
              </Col>
            </Row>
          )}
          {activeMenu === "2" && (
            <Card bordered={false}>
              {/* <Table
                  dataSource={pendingUsers}
                  columns={columns}
                  rowKey="_id"
                /> */}
              <ApprovePendingUsers />
            </Card>
          )}
          {activeMenu === "3" && (
            <Card bordered={false}>
              <AdminProjectApproval />
            </Card>
          )}
          {activeMenu === "4" && (
            <Card bordered={false}>
              <Button type="link" onClick={() => handleButtonClick("1")}>
                Back to Dashboard
              </Button>
            </Card>
          )}
          {activeMenu === "5" && (
            <Card bordered={false}>
              <Button type="link" onClick={() => handleButtonClick("1")}>
                Back to Dashboard
              </Button>
            </Card>
          )}
          {activeMenu === "6" && (
            <Card bordered={false}>
              <ProjectList onNavigate={handleButtonClick} />
            </Card>
          )}
          {activeMenu === "7" && (
            <Card bordered={false} data-cy="report">
              <AdminReports data-cy="report" />
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

export default AdminDashboard;
