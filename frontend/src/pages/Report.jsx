import React, { useState, useEffect } from "react";
import { Bar, Pie } from "react-chartjs-2";
import { notification, Spin, Table, Typography } from "antd";
import "chart.js/auto";

const AdminReports = () => {
  const [projectAllocationData, setProjectAllocationData] = useState(null);
  const [studentPreferencesData, setStudentPreferencesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { Title } = Typography;
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      try {
        const response1 = await fetch(
          "http://127.0.0.1:4000/admin/reports/project-allocation",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const projectAllocation = await response1.json();
        setProjectAllocationData(projectAllocation);

        const response2 = await fetch(
          "http://127.0.0.1:4000/admin/reports/student-preferences",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const studentPreferences = await response2.json();
        setStudentPreferencesData(studentPreferences);
      } catch (error) {
        notification.error({
          message: "Error",
          description: "Failed to load report data.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <Spin size="large" />;
  }

  const barChartData = {
    labels:
      projectAllocationData?.tagsProjectCount.map((item) => item._id) || [],
    datasets: [
      {
        label: "Project Count",
        data:
          projectAllocationData?.tagsProjectCount.map((item) => item.count) ||
          [],
        backgroundColor: "#8884d8",
      },
    ],
  };

  const pieChartData = {
    labels:
      projectAllocationData?.projectCreationComparison.map(
        (item) => item._id
      ) || [],
    datasets: [
      {
        data:
          projectAllocationData?.projectCreationComparison.map(
            (item) => item.count
          ) || [],
        backgroundColor: ["#8884d8", "#82ca9d", "#ffc658"],
      },
    ],
  };

  return (
    <div data-cy="report">
      <h2>Project Allocation Report</h2>
      <br></br>
      <br></br>
      <Title level={4}>Project counts per tag: </Title>
      {projectAllocationData &&
      projectAllocationData.tagsProjectCount &&
      projectAllocationData.tagsProjectCount.length > 0 ? (
        <div style={{ width: "100%", height: "400px" }}>
          <Bar data={barChartData} options={{ responsive: true }} />
        </div>
      ) : (
        <p>No data available for project allocation report.</p>
      )}
      <br></br>
      <br></br>
      {projectAllocationData &&
      projectAllocationData.projectCreationComparison &&
      projectAllocationData.projectCreationComparison.length > 0 ? (
        <div style={{ width: "100%", height: "400px" }}>
          <Pie data={pieChartData} options={{ responsive: true }} />
        </div>
      ) : (
        <p>No data available for project creation comparison.</p>
      )}
      <br></br>
      <br></br>
      <Title level={4}>Groups Projects Distribution: </Title>
      {projectAllocationData &&
      projectAllocationData.groupsPerProject &&
      projectAllocationData.groupsPerProject.length > 0 ? (
        <Table
          dataSource={projectAllocationData.groupsPerProject}
          columns={[
            { title: "Project", dataIndex: "title", key: "title" },
            {
              title: "Number of Groups",
              dataIndex: "numberOfGroups",
              key: "numberOfGroups",
            },
          ]}
          rowKey="_id"
        />
      ) : (
        <p>No data available for groups per project.</p>
      )}

      <h2>Student Preferences Report</h2>
      <br></br>
      <br></br>
      <Title level={4}>Groups Without Preferences: </Title>
      {studentPreferencesData &&
      studentPreferencesData.groupsWithoutPreferences &&
      studentPreferencesData.groupsWithoutPreferences.length > 0 ? (
        <Table
          dataSource={studentPreferencesData.groupsWithoutPreferences}
          columns={[
            { title: "Group Name", dataIndex: "name", key: "name" },
            {
              title: "Leader",
              dataIndex: "leader",
              key: "leader",
              render: (leader) => leader || "No Leader",
            },
            {
              title: "Members count",
              dataIndex: "members",
              key: "members",
              render: (members) => (members ? members.length : 0),
            },
            { title: "Status", dataIndex: "status", key: "status" },
          ]}
          rowKey="_id"
        />
      ) : (
        <p>All groups have submitted preferences.</p>
      )}

      <Title level={4}>Unallocated Groups</Title>
      <Table
        dataSource={projectAllocationData.unallocatedGroups}
        columns={[
          { title: "Group Name", dataIndex: "name", key: "name" },
          {
            title: "Leader",
            dataIndex: "leader",
            key: "leader",
            render: (leader) => leader || "No Leader",
          },
          {
            title: "Members Count",
            dataIndex: "members",
            key: "members",
            render: (members) => (members ? members.length : 0),
          },
          { title: "Status", dataIndex: "status", key: "status" },
        ]}
        rowKey="_id"
      />
      <Title level={4}>Skills Statistic</Title>
      {studentPreferencesData &&
      studentPreferencesData.skillsCount &&
      studentPreferencesData.skillsCount.length > 0 ? (
        <Table
          dataSource={studentPreferencesData.skillsCount}
          columns={[
            {
              title: "Programming",
              dataIndex: "programming",
              key: "programming",
            },
            { title: "Frontend", dataIndex: "frontend", key: "frontend" },
            { title: "Database", dataIndex: "database", key: "database" },
            {
              title: "Cybersecurity",
              dataIndex: "cybersecurity",
              key: "cybersecurity",
            },
            { title: "AI", dataIndex: "ai", key: "ai" },
          ]}
          rowKey="_id"
        />
      ) : (
        <p>No data available for group skills count.</p>
      )}
    </div>
  );
};

export default AdminReports;
