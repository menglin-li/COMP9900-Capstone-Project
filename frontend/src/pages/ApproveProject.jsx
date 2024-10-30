import React, { useState, useEffect } from "react";
import {
  List,
  Skeleton,
  Button,
  message,
  Modal,
  Typography,
  Pagination,
} from "antd";
import { approveProject, dismissProject } from "../api/admin";
import { getAllProjects } from "../api/project";
import { useNavigate } from "react-router-dom";
import { profile } from "../api/user";

const AdminProjectApproval = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [creator, setcreator] = useState([]);
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(5);
  const { Title, Text } = Typography;

  useEffect(() => {
    const fetchPendingProjects = async () => {
      try {
        const fetchedProjects = await getAllProjects();
        const pendingProjects = fetchedProjects.filter(
          (project) => project.status === "false"
        );
        const creatorIds = pendingProjects.map((project) => project.creator);

        const creators = await Promise.all(
          creatorIds.map((id) =>
            profile(id).catch((error) => {
              console.error(`Error fetching profile for user ${id}:`, error);
              return {
                id,
                firstName: "Unknown",
                lastName: "",
                email: "Unknown",
              };
            })
          )
        );
        const projectsWithCreatorDetails = pendingProjects.map((project) => {
          const creator = creators.find((user) => user._id === project.creator);
          return {
            ...project,
            creatorName: creator
              ? `${creator.firstName} ${creator.lastName}`
              : "Unknown",
            creatorEmail: creator ? creator.email : "Unknown",
          };
        });
        setProjects(projectsWithCreatorDetails);
      } catch (error) {
        console.error("Error retrieving projects:", error);
        message.error("Failed to load projects");
      } finally {
        setLoading(false);
      }
    };

    fetchPendingProjects();
  }, []);

  const handleApprove = async (projectId) => {
    try {
      await approveProject(projectId);
      setProjects(projects.filter((project) => project._id !== projectId));
      message.success("Project approved successfully");
    } catch (error) {
      console.error("Error approving project:", error);
      message.error("Failed to approve project");
    }
  };

  const handleDismiss = async (projectId) => {
    try {
      await dismissProject(projectId);
      setProjects(projects.filter((project) => project._id !== projectId));
      message.success("Project dismissed successfully");
    } catch (error) {
      console.error("Error dismissing project:", error);
      message.error("Failed to dismiss project");
    }
  };

  const handleView = (project) => {
    setSelectedProject(project);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedProject(null);
  };

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentProjects = projects.slice(startIndex, endIndex);

  return (
    <div className="admin-project-approval" style={{ padding: "20px" }}>
      <Title level={2}>Pending Projects for Approval</Title>
      <List
        className="demo-loadmore-list"
        loading={loading}
        itemLayout="horizontal"
        dataSource={currentProjects}
        renderItem={(project) => (
          <List.Item
            actions={[
              <Button onClick={() => handleView(project)}>View</Button>,
              <Button onClick={() => handleApprove(project._id)}>
                Accept
              </Button>,
              <Button onClick={() => handleDismiss(project._id)}>
                Dismiss
              </Button>,
            ]}
            style={{
              background: "#fff",
              padding: "20px",
              margin: "10px 0",
              borderRadius: "5px",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
            }}
          >
            <Skeleton loading={project.loading} active>
              <List.Item.Meta
                title={
                  <Text style={{ fontSize: "16px", fontWeight: "bold" }}>
                    {project.title}
                  </Text>
                }
                description={`Created by: ${project.creatorName} with email: ${project.creatorEmail}`}
              />
            </Skeleton>
          </List.Item>
        )}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginTop: "16px",
        }}
      >
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={projects.length}
          onChange={(page) => setCurrentPage(page)}
        />
      </div>
      <Modal
        title="Project Detail"
        visible={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
      >
        {selectedProject && (
          <div>
            <h2>{selectedProject.title}</h2>
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
              <strong>Requirement:</strong> {selectedProject.requirements}
            </p>
            <p>
              <strong>scope:</strong> {selectedProject.scope}
            </p>
            <p>
              <strong>requiredKnowledgeAndSkills:</strong>{" "}
              {selectedProject.requiredKnowledgeAndSkills}
            </p>
            <p>
              <strong>expectedOutcomesDeliverables:</strong>{" "}
              {selectedProject.expectedOutcomesDeliverables}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminProjectApproval;
