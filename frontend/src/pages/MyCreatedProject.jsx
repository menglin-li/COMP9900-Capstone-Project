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
  Form,
  Input,
} from "antd";
import { getGroupById } from "../api/group";
import {
  getProjectById,
  getAllProjects,
  createProject,
  updateProject,
} from "../api/project";
import { getStudentById } from "../api/student";
import { profile } from "../api/user";
const { Header, Sider, Content } = Layout;
import ProjectAllocateTeam from "./ProjectTeamAllocate";
const MyCreatedProject = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editableProject, setEditableProject] = useState(null);
  const user = JSON.parse(localStorage.getItem("user")).user;
  const role = user.role_type;
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [newProject, setNewProject] = useState({
    title: "",
    creator: user.id,
    tags: [],
    capacity: "",
    background: "",
    requirements: "",
    scope: "",
    requiredKnowledgeAndSkills: "",
    expectedOutcomesDeliverables: "",
  });
  const student = JSON.parse(localStorage.getItem("user")).user;

  const { TabPane } = Tabs;
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  console.log(role);
  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        if (role === "coordinator" || role === "client") {
          const allProjects = await getAllProjects();
          const supervisorProjects = allProjects.filter(
            (project) => project.creator === user.id
          );
          for (const project of supervisorProjects) {
            project.supervisor = user.firstName;
          }
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
  const handleMenuClick = async (projectId) => {
    setSelectedProjectId(projectId.toString());
    setLoading(true);
    try {
      const projectDetails = await getProjectById(projectId);
      setSelectedProject(projectDetails);
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

  const handleCancel = () => {
    setIsModalOpen(false);
  };
  const handleEditProjectOk = async () => {
    try {
      await updateProject(editableProject.number, editableProject);
      notification.success({ message: "Project updated successfully" });
      setIsModalOpen(false);
      const allProjects = await getAllProjects();
      const createdProjects = allProjects.filter(
        (project) => project.creator === user.id
      );
      setProjects(createdProjects);
      setSelectedProject(editableProject);
    } catch (error) {
      console.error("Error updating project:", error);
      notification.error({
        message: "Error",
        description: "Failed to update project.",
      });
    }
  };
  const handleEdit = () => {
    setEditableProject(selectedProject);
    setIsModalOpen(true);
  };
  const handleEditableInputChange = (e) => {
    const { name, value } = e.target;
    setEditableProject({ ...editableProject, [name]: value });
  };
  const handleSupervisor = () => {};
  const handleCreateProject = () => {
    setNewProject({
      title: "",
      creator: user.id,
      tags: [],
      capacity: "",
      background: "",
      requirements: "",
      scope: "",
      requiredKnowledgeAndSkills: "",
      expectedOutcomesDeliverables: "",
    });
    setIsCreateModalOpen(true);
  };

  const handleCreateProjectOk = async () => {
    try {
      await createProject(newProject);
      notification.success({ message: "Project created successfully" });
      setIsCreateModalOpen(false);

      const allProjects = await getAllProjects();
      const createdProjects = allProjects.filter(
        (project) => project.creator === user.id
      );
      setProjects(createdProjects);
    } catch (error) {
      console.error("Error creating project:", error);
      notification.error({
        message: "Error",
        description: "Failed to create project.",
      });
    }
  };

  const handleCreateProjectCancel = () => {
    setIsCreateModalOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProject({ ...newProject, [name]: value });
  };

  if (loading) {
    return <Spin size="large" />;
  }

  return (
    <Layout className="tutor-first-layout">
      <Sider
        className="tutor-sider"
        width={200}
        style={{ background: colorBgContainer }}
      >
        <Button
          type="primary"
          onClick={handleCreateProject}
          style={{ margin: "16px" }}
        >
          Create Project
        </Button>
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
                <Card
                  title={`P${selectedProject.number}  ${selectedProject.title}`}
                  bordered={false}
                >
                  <p>
                    <strong>Status: </strong>{" "}
                    {selectedProject.status === "false" ? (
                      <>waiting for approval</>
                    ) : (
                      <>Approved</>
                    )}
                  </p>
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

                  {(role === "coordinator" || role === "client") && (
                    <p style={{ marginTop: 20 }}>
                      <Button onClick={handleEdit}>edit</Button>
                    </p>
                  )}
                </Card>
              </TabPane>
            </Tabs>
          ) : (
            <p>Select a project to manage.</p>
          )}
        </Content>
      </Layout>
      <Modal
        title="Edit Project"
        open={isModalOpen}
        onOk={handleEditProjectOk}
        onCancel={handleCancel}
      >
        {editableProject && (
          <Form layout="vertical">
            <Form.Item label="Title">
              <Input
                name="title"
                value={editableProject.title}
                onChange={handleEditableInputChange}
              />
            </Form.Item>
            <Form.Item label="Tags">
              <Select
                mode="tags"
                style={{ width: "100%" }}
                placeholder="Enter tags"
                value={editableProject.tags}
                onChange={(tags) =>
                  setEditableProject({ ...editableProject, tags })
                }
              />
            </Form.Item>
            <Form.Item label="Capacity">
              <Input
                name="capacity"
                value={editableProject.capacity}
                onChange={handleEditableInputChange}
              />
            </Form.Item>
            <Form.Item label="Background">
              <Input.TextArea
                name="background"
                value={editableProject.background}
                onChange={handleEditableInputChange}
              />
            </Form.Item>
            <Form.Item label="Requirements">
              <Input.TextArea
                name="requirements"
                value={editableProject.requirements}
                onChange={handleEditableInputChange}
              />
            </Form.Item>
            <Form.Item label="Scope">
              <Input.TextArea
                name="scope"
                value={editableProject.scope}
                onChange={handleEditableInputChange}
              />
            </Form.Item>
            <Form.Item label="Required Knowledge and Skills">
              <Input.TextArea
                name="requiredKnowledgeAndSkills"
                value={editableProject.requiredKnowledgeAndSkills}
                onChange={handleEditableInputChange}
              />
            </Form.Item>
            <Form.Item label="Expected Outcomes and Deliverables">
              <Input.TextArea
                name="expectedOutcomesDeliverables"
                value={editableProject.expectedOutcomesDeliverables}
                onChange={handleEditableInputChange}
              />
            </Form.Item>
          </Form>
        )}
      </Modal>
      <Modal
        title="Create Project"
        open={isCreateModalOpen}
        onOk={handleCreateProjectOk}
        onCancel={handleCreateProjectCancel}
      >
        <Form layout="vertical">
          <Form.Item label="Title">
            <Input
              name="title"
              value={newProject.title}
              onChange={handleInputChange}
            />
          </Form.Item>
          <Form.Item label="Tags">
            <Select
              mode="tags"
              style={{ width: "100%" }}
              placeholder="Enter tags"
              value={newProject.tags}
              onChange={(tags) => setNewProject({ ...newProject, tags })}
            />
          </Form.Item>
          <Form.Item label="Capacity">
            <Input
              name="capacity"
              value={newProject.capacity}
              onChange={handleInputChange}
            />
          </Form.Item>
          <Form.Item label="Background">
            <Input.TextArea
              name="background"
              value={newProject.background}
              onChange={handleInputChange}
            />
          </Form.Item>
          <Form.Item label="Requirements">
            <Input.TextArea
              name="requirements"
              value={newProject.requirements}
              onChange={handleInputChange}
            />
          </Form.Item>
          <Form.Item label="Scope">
            <Input.TextArea
              name="scope"
              value={newProject.scope}
              onChange={handleInputChange}
            />
          </Form.Item>
          <Form.Item label="Required Knowledge and Skills">
            <Input.TextArea
              name="requiredKnowledgeAndSkills"
              value={newProject.requiredKnowledgeAndSkills}
              onChange={handleInputChange}
            />
          </Form.Item>
          <Form.Item label="Expected Outcomes and Deliverables">
            <Input.TextArea
              name="expectedOutcomesDeliverables"
              value={newProject.expectedOutcomesDeliverables}
              onChange={handleInputChange}
            />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default MyCreatedProject;
