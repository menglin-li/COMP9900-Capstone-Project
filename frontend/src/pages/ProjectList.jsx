import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getAllProjects } from "../api/project";
import { profile, getUsers } from "../api/user";
import { signSupervisor } from "../api/admin";
import {
  Table,
  Input,
  Button,
  Space,
  Tag,
  message,
  Modal,
  Select,
  notification,
} from "antd";
import { SearchOutlined, DownloadOutlined } from "@ant-design/icons";
import jsPDF from "jspdf";

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [supervisorDetails, setSupervisorDetails] = useState({});
  const [creatorDetails, setCreatorDetails] = useState({});
  const [newSupervisorId, setNewSupervisorId] = useState("");
  const [supervisors, setSupervisors] = useState([]);
  const navigate = useNavigate();
  const printRef = useRef();
  const user = JSON.parse(localStorage.getItem("user")).user;
  const role = user.role_type;

  const downloadPDF = () => {
    const pdf = new jsPDF("p", "mm", "a4");

    // Set the margins
    const margin = 10;
    const pageWidth = pdf.internal.pageSize.getWidth() - 2 * margin;
    let y = margin;

    const addTextWithWrap = (
      text,
      x,
      initialY,
      maxWidth,
      fontSize = 12,
      fontWeight = "normal"
    ) => {
      pdf.setFontSize(fontSize);
      pdf.setFont(undefined, fontWeight);
      const textLines = pdf.splitTextToSize(text, maxWidth);
      let y = initialY;

      textLines.forEach((line) => {
        if (y + fontSize > pdf.internal.pageSize.getHeight() - margin) {
          pdf.addPage();
          y = margin;
        }
        pdf.text(line, x, y);
        y += fontSize * 0.5;
      });

      return y;
    };

    // Function to add hyperlinked text
    const addLink = (text, x, y, maxWidth, url) => {
      pdf.setTextColor(0, 0, 255);
      pdf.setDrawColor(0, 0, 255);
      y = addTextWithWrap(text, x, y, maxWidth, 12, "normal");
      pdf.link(x, y - 10, maxWidth, 10, { url: url });
      pdf.setTextColor(0, 0, 0); // Reset color
      return y + 5; // Additional space after the link
    };

    if (selectedProject) {
      // Title with project number
      y = addTextWithWrap(
        `P${selectedProject.number}: ${selectedProject.title}`,
        margin,
        y,
        pageWidth,
        18,
        "bold"
      );
      y += 10; // Space after title

      // Display as bullet points
      const bullet = "• ";
      y = addTextWithWrap(bullet + "Tags:", margin, y, pageWidth, 14, "bold");
      y = addTextWithWrap(
        selectedProject.tags.join(", ") || "None provided",
        margin,
        y,
        pageWidth
      );
      y += 6;

      y = addTextWithWrap(
        bullet + "Capacity:",
        margin,
        y,
        pageWidth,
        14,
        "bold"
      );
      y = addTextWithWrap(
        selectedProject.capacity.toString() || "N/A",
        margin,
        y,
        pageWidth
      );
      y += 6;

      y = addTextWithWrap(
        bullet + "Background:",
        margin,
        y,
        pageWidth,
        14,
        "bold"
      );
      y = addTextWithWrap(
        selectedProject.background || "N/A",
        margin,
        y,
        pageWidth
      );
      y += 6;

      y = addTextWithWrap(
        bullet + "Client name:",
        margin,
        y,
        pageWidth,
        14,
        "bold"
      );
      y = addTextWithWrap(
        `${creatorDetails.firstName} ${creatorDetails.lastName}` || "N/A",
        margin,
        y,
        pageWidth
      );
      y += 6;

      y = addTextWithWrap(
        bullet + "Requirement:",
        margin,
        y,
        pageWidth,
        14,
        "bold"
      );
      y = addTextWithWrap(
        selectedProject.requirements || "N/A",
        margin,
        y,
        pageWidth
      );
      y += 6;

      y = addTextWithWrap(bullet + "Scope:", margin, y, pageWidth, 14, "bold");
      y = addTextWithWrap(selectedProject.scope || "N/A", margin, y, pageWidth);
      y += 6;

      y = addTextWithWrap(
        bullet + "Required Knowledge and Skills:",
        margin,
        y,
        pageWidth,
        14,
        "bold"
      );
      y = addTextWithWrap(
        selectedProject.requiredKnowledgeAndSkills || "N/A",
        margin,
        y,
        pageWidth
      );
      y += 6;

      y = addTextWithWrap(
        bullet + "Expected Outcomes/Deliverables:",
        margin,
        y,
        pageWidth,
        14,
        "bold"
      );
      y = addTextWithWrap(
        selectedProject.expectedOutcomesDeliverables || "N/A",
        margin,
        y,
        pageWidth
      );
      y += 6;

      y = addTextWithWrap(
        bullet + "Supervisor name:",
        margin,
        y,
        pageWidth,
        14,
        "bold"
      );
      y = addTextWithWrap(
        `${supervisorDetails.firstName} ${supervisorDetails.lastName}` || "N/A",
        margin,
        y,
        pageWidth
      );
      y += 6;

      y = addTextWithWrap(
        bullet + "Supervisor email:",
        margin,
        y,
        pageWidth,
        14,
        "bold"
      );
      y = addLink(`${supervisorDetails.email}` || "N/A", margin, y, pageWidth);
      y += 6;

      y = addTextWithWrap(
        bullet + "Client email:",
        margin,
        y,
        pageWidth,
        14,
        "bold"
      );
      y = addLink(`${creatorDetails.email}` || "N/A", margin, y, pageWidth);
      y += 6;
    }

    pdf.save("project-details.pdf");
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedProject(null);
    setSupervisorDetails({});
    setCreatorDetails({});
  };

  // const colors = ['#42606B', '#6E8781', '#6E86A9', '#85A092', '#6E86A9', '#B9A9C3', '#96A38A', '#89B4C3', '#B0CFE5', 'geekblue', 'purple'];
  const colors = [
    "green",
    "blue",
    "volcano",
    "magenta",
    "gold",
    "lime",
    "cyan",
    "geekblue",
    "purple",
    "red",
    "orange",
    "volcano",
    "magenta",
    "gold",
    "lime",
    "cyan",
    "geekblue",
    "purple",
  ];

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const fetched = await getAllProjects();
        const fetchedProjects = fetched.filter(
          (project) => project.status === "true"
        );
        setProjects(
          fetchedProjects.map((project) => ({
            ...project,
            key: project._id,
          }))
        );
      } catch (error) {
        message.error("Failed to fetch projects: " + error.message);
      }
    };
    const fetchSupervisors = async () => {
      try {
        const users = await getUsers();
        const filteredSupervisors = users.filter(
          (user) =>
            (user.role_type === "tutor" || user.role_type === "coordinator") &&
            user.status === true
        );
        setSupervisors(filteredSupervisors);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    };
    fetchProjects();
    fetchSupervisors();
  }, []);

  const handleViewProjectDetail = async (projectId) => {
    const project = projects.find((p) => p._id === projectId);
    setSelectedProject(project);
    if (project) {
      if (project.supervisor) {
        const supervisor = await profile(project.supervisor);
        setSupervisorDetails(supervisor);
      }
      const creator = await profile(project.creator);

      setCreatorDetails(creator);
    }
    setIsModalVisible(true);
  };

  const handleAssignSupervisor = async (projectId) => {
    const project = projects.find((p) => p._id === projectId);
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const handleSupervisorChange = async () => {
    try {
      await signSupervisor({ id: newSupervisorId, projectId: selectedProject });
      notification.success({ message: "Supervisor assigned successfully!" });
      setIsModalOpen(false);
      setProjects((prevProjects) =>
        prevProjects.map((project) =>
          project._id === selectedProject
            ? { ...project, supervisor: newSupervisorId }
            : project
        )
      );
      const fetched = await getAllProjects();
      const fetchedProjects = fetched.filter(
        (project) => project.status === "true"
      );
      setProjects(
        fetchedProjects.map((project) => ({
          ...project,
          key: project._id,
        }))
      );
    } catch (error) {
      console.error("Failed to assign supervisor:", error);
      notification.error({
        message: "Error",
        description: "Failed to assign supervisor. Please try again.",
      });
    }
  };

  const tagColorMap = {};
  projects.forEach((project) => {
    project.tags.forEach((tag) => {
      if (!tagColorMap[tag]) {
        tagColorMap[tag] =
          colors[Object.keys(tagColorMap).length % colors.length];
      }
    });
  });

  const columns = [
    {
      title: "Project Name",
      dataIndex: "title",
      key: "title",
      render: (text, record) => `P${record.number}: ${text}`,
      sorter: (a, b) => a.number - b.number, // Sort by the project number
      sortDirections: ["ascend", "descend", "ascend"], // Default sort order
      filterIcon: () => <SearchOutlined />,
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }) => (
        <div style={{ padding: 8 }}>
          <Input
            autoFocus
            placeholder="Search project name"
            value={selectedKeys[0]}
            onChange={(e) =>
              setSelectedKeys(e.target.value ? [e.target.value] : [])
            }
            onPressEnter={() => confirm()}
            style={{ marginBottom: 8, display: "block" }}
          />
          <Space>
            <Button
              type="primary"
              onClick={() => confirm()}
              icon={<SearchOutlined />}
              size="small"
              style={{ width: 90 }}
            >
              Search
            </Button>
            <Button
              onClick={() => {
                clearFilters();
                confirm();
              }}
              size="small"
              style={{ width: 90 }}
            >
              Reset
            </Button>
          </Space>
        </div>
      ),
      onFilter: (value, record) =>
        record.title.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: "Tags",
      dataIndex: "tags",
      key: "tags",
      filters: Object.keys(tagColorMap).map((tag) => ({
        text: tag,
        value: tag,
      })),
      onFilter: (value, record) => record.tags.includes(value),
      filterMultiple: false,
      render: (tags) => (
        <>
          {tags.map((tag) => (
            <Tag color={tagColorMap[tag]} key={tag}>
              {tag}
            </Tag>
          ))}
        </>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button onClick={() => handleViewProjectDetail(record.key)}>
            View
          </Button>
          {role === "coordinator" && !record.supervisor && (
            <Button onClick={() => handleAssignSupervisor(record.key)}>
              Assign Supervisor
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Table columns={columns} dataSource={projects} />
      <Modal
        // title="Project Detail"
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={[
          <Button
            key="download"
            data-cy="downloadPDF"
            icon={<DownloadOutlined />}
            onClick={downloadPDF}
          >
            Download as PDF
          </Button>,
        ]}
      >
        {selectedProject && (
          <div ref={printRef}>
            <h2>{`P${selectedProject.number}: ${selectedProject.title}`}</h2>
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
              <strong>Clients:</strong>{" "}
              {`${creatorDetails.firstName} ${creatorDetails.lastName}`}
            </p>
            <p>
              <strong>Requirement:</strong> {selectedProject.requirements}
            </p>
            <p>
              <strong>Scope:</strong> {selectedProject.scope}
            </p>
            <p>
              <strong>Required Knowledge and Skills:</strong>{" "}
              {selectedProject.requiredKnowledgeAndSkills}
            </p>
            <p>
              <strong>Expected Outcomes/Deliverables:</strong>{" "}
              {selectedProject.expectedOutcomesDeliverables}
            </p>
            {selectedProject.supervisor && (
              <>
                <p>
                  <strong>Supervisor name:</strong>{" "}
                  {`${supervisorDetails.firstName} ${supervisorDetails.lastName}`}
                </p>
                <p>
                  <strong>Supervisor email:</strong> {supervisorDetails.email}
                </p>
              </>
            )}
            <p>
              <strong>Client email:</strong> {creatorDetails.email}
            </p>
          </div>
        )}
      </Modal>
      <Modal
        title="Assign Supervisor"
        open={isModalOpen}
        onOk={handleSupervisorChange}
        onCancel={() => setIsModalOpen(false)}
      >
        <Select
          placeholder="Select a supervisor"
          style={{ width: "100%" }}
          onChange={setNewSupervisorId}
          value={newSupervisorId}
        >
          {supervisors.map((supervisor) => (
            <Select.Option key={supervisor._id} value={supervisor._id}>
              {supervisor.firstName} {supervisor.lastName}
            </Select.Option>
          ))}
        </Select>
      </Modal>
    </div>
  );
};

export default ProjectList;
