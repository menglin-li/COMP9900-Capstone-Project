import React, { useState, useEffect } from "react";
import {
  Card,
  Spin,
  notification,
  message,
  Layout,
  Menu,
  theme,
  Button,
  Modal,
  Select,
  Tabs,
  Tag,
} from "antd";
import { getGroupById, updateGroup } from "../api/group";
import { getProjectById, getAllProjects, updateProject } from "../api/project";
import { getStudentById } from "../api/student";
import { profile } from "../api/user";
const { Header, Sider, Content } = Layout;
import TutorGradePage from "./TeamGradePage";
import ProjectAllocateTeam from "./ProjectTeamAllocate";
const MyProject = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tags, setTags] = useState([]);
  const student = JSON.parse(localStorage.getItem("user")).user;
  const user = JSON.parse(localStorage.getItem("user")).user;
  const role = user.role_type;
  const { TabPane } = Tabs;
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  console.log(role);
  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        if (role === "student") {
          const studentDetail = await getStudentById(user.id);
          if (studentDetail.group_id) {
            const group = await getGroupById(studentDetail.group_id);
            if (group.project_id) {
              const projectDetails = await getProjectById(group.project_id);
              await addSupervisorName(projectDetails);
              setProjects([projectDetails]);
              setSelectedProject(projectDetails);
            } else {
              message.warning(
                "Your group have not been allocated for any projects."
              );
            }
          } else {
            message.warning("you dont have a group right now");
          }
        } else if (role === "tutor" || role === "coordinator") {
          const allProjects = await getAllProjects();
          const supervisorProjects = allProjects.filter(
            (project) => project.supervisor === user.id
          );
          // for (const project of supervisorProjects) {
          //   project.supervisor = user.firstName;
          // }
          setProjects(supervisorProjects);
        }
      } catch (error) {
        console.error("Error fetching project details:", error);
        notification.error({
          message: "Error",
          description: "Failed to load project details.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, []);

  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const handleMenuClick = async (projectId) => {
    setSelectedProjectId(projectId.toString());
    setLoading(true);
    try {
      const projectDetails = await getProjectById(projectId);
      setSelectedProject(projectDetails);
      setTags(projectDetails.tags);
    } catch (error) {
      console.error("Error fetching project details:", error);
      notification.error({
        message: "Error",
        description: "Failed to load project details.",
      });
    } finally {
      setLoading(false);
    }
  };
  //get names of supervisor
  const addSupervisorName = async (project) => {
    try {
      const supervisor = await profile(project.supervisor);
      project.supervisorName = `${supervisor.firstName} ${supervisor.lastName}`;
      project.supervisorEmail = `${supervisor.email}`;
    } catch (error) {
      console.error("Error fetching project supervisor:", error);
      notification.error({
        message: "Error",
        description: "Failed to load supervisor details.",
      });
    }
  };

  const handleEditTag = () => {
    setIsModalOpen(true);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };
  const handleOk = async () => {
    try {
      console.log(tags);
      await updateProject(selectedProject.number, { tags: tags });
      notification.success({ message: "Tags updated successfully" });
      setIsModalOpen(false);
      const updatedProjectDetails = await getProjectById(selectedProject._id);
      setSelectedProject(updatedProjectDetails);
      setTags(updatedProjectDetails.tags);
    } catch (error) {
      console.error("Error updating tags:", error);
      notification.error({
        message: "Error",
        description: "Failed to update tags.",
      });
    }
  };

  const handleAllocationSuccess = () => {
    setSelectedProject(null);
    setSelectedProjectId(null);
  };

  if (loading) {
    return <Spin size="large" />;
  }

  if (!projects.length && role === "student") {
    return <p>No project found for this student.</p>;
  }
  if (!projects.length && role === "tutor") {
    return <p>You are not supervisor of any group</p>;
  }
  if (!projects.length && role === "coordinator") {
    return <p>You are not supervisor of any group</p>;
  }
  const tagRender = (props) => {
    const { label, value, closable, onClose } = props;
    const color = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
    return (
      <Tag
        color={color}
        closable={closable}
        onClose={onClose}
        style={{ marginRight: 3 }}
      >
        {label}
      </Tag>
    );
  };

  console.log(selectedProject);
  return (
    <Layout className="tutor-first-layout">
      {(role === "tutor" || role === "coordinator") && (
        <Sider
          className="tutor-sider"
          width={200}
          style={{ background: colorBgContainer }}
        >
          <Menu
            mode="inline"
            style={{ height: "100%", borderRight: 0 }}
            selectedKeys={[selectedProjectId]}
          >
            {projects.map((project) => (
              <Menu.Item
                key={project._id.toString()}
                onClick={() => handleMenuClick(project._id)}
              >
                {project.title}
              </Menu.Item>
            ))}
          </Menu>
        </Sider>
      )}
      <Layout className="tutor-second-layout">
        <Content
          className="student-content"
          style={{
            padding: 24,
            margin: 0,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          {selectedProject ? (
            <Tabs defaultActiveKey="1">
              <TabPane tab="Details" key="1">
                <Card title={selectedProject.title} bordered={false}>
                  <p>
                    <strong>Tags:</strong> {selectedProject.tags.join(", ")}
                  </p>
                  <p>
                    <strong>Capacity:</strong> {selectedProject.capacity}
                  </p>
                  <p>
                    <strong>Background:</strong> {selectedProject.background}
                  </p>
                  <p>
                    <strong>Requirements:</strong>{" "}
                    {selectedProject.requirements}
                  </p>
                  <p>
                    <strong>Scope:</strong> {selectedProject.scope}
                  </p>
                  <p>
                    <strong>Required Knowledge and Skills:</strong>{" "}
                    {selectedProject.requiredKnowledgeAndSkills}
                  </p>
                  <p>
                    <strong>Expected Outcomes and Deliverables:</strong>{" "}
                    {selectedProject.expectedOutcomesDeliverables}
                  </p>
                  {selectedProject.supervisor !== user.id &&
                    selectedProject.supervisorName && (
                      <>
                        <p>
                          <strong>Supervisor:</strong>{" "}
                          {selectedProject.supervisorName}
                        </p>
                        <p>
                          <strong>Supervisor Contact Information:</strong>{" "}
                          {selectedProject.supervisorEmail}
                        </p>
                      </>
                    )}
                  {(role === "tutor" || role === "coordinator") && (
                    <p style={{ marginTop: 20 }}>
                      <Button onClick={handleEditTag}>edit tag</Button>
                    </p>
                  )}
                </Card>
              </TabPane>
              {selectedProject.supervisor === user.id && (
                <TabPane tab="Allocate" key="2">
                  <ProjectAllocateTeam
                    projectId={selectedProject._id}
                    onAllocationSuccess={handleAllocationSuccess}
                  />
                </TabPane>
              )}
              {selectedProject.supervisor === user.id && (
                <TabPane tab="Grade Teams" key="3">
                  <TutorGradePage projectId={selectedProject._id} />
                </TabPane>
              )}
            </Tabs>
          ) : (
            <p>Select a project to manage.</p>
          )}
        </Content>
      </Layout>
      <Modal
        title="Edit Tags"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Select
          mode="tags"
          style={{ width: "100%" }}
          placeholder="Enter tags"
          value={tags}
          onChange={setTags}
          tagRender={tagRender}
        />
      </Modal>
    </Layout>
  );
};

export default MyProject;
