import { getGroupById, updateGroup } from "../api/group";
import { getProjectById } from "../api/project";
import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  InputNumber,
  Form,
  Input,
  message,
  Tooltip,
} from "antd";
import { EditOutlined } from "@ant-design/icons";

const TutorGradePage = ({ projectId }) => {
  const [groups, setGroups] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentGroup, setCurrentGroup] = useState(null);

  const fetchProjectDetails = async () => {
    try {
      const project = await getProjectById(projectId);
      const groupDetails = await Promise.all(
        project.groups.map(async (groupId) => await getGroupById(groupId))
      );
      setGroups(groupDetails);
    } catch (error) {
      message.error("Failed to fetch project details");
    }
  };

  useEffect(() => {
    fetchProjectDetails();
  }, [projectId]);

  const showModal = (group) => {
    setCurrentGroup(group);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setCurrentGroup(null);
    setIsModalVisible(false);
  };

  const handleFinish = async (values) => {
    try {
      await updateGroup(currentGroup._id, {
        project_grade: values.grade,
        grade_comment: values.comment,
      });
      message.success("Group updated successfully");
      fetchProjectDetails(); // Refresh data to show updates
      handleCancel();
    } catch (error) {
      message.error("Failed to update group");
    }
  };

  const columns = [
    {
      title: "Team Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Grade",
      dataIndex: "project_grade",
      key: "grade",
      render: (grade) => (grade ? `${grade} / 100` : "? / 100"),
    },
    {
      title: "Comment",
      dataIndex: "grade_comment",
      key: "comment",
      render: (comment) =>
        comment || "You have not yet given a grade and comment.",
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Tooltip title="Edit Grade">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => showModal(record)}
            style={{ color: "#1890ff", padding: 0 }}
          >
            Edit Grade
          </Button>
        </Tooltip>
      ),
    },
  ];

  return (
    <>
      <Table dataSource={groups} columns={columns} rowKey="_id" />
      {currentGroup && (
        <Modal
          title="Edit Group Grade"
          visible={isModalVisible}
          onCancel={handleCancel}
          footer={null}
        >
          <Form
            initialValues={{
              grade: currentGroup.project_grade,
              comment: currentGroup.grade_comment,
            }}
            onFinish={handleFinish}
          >
            <Form.Item
              name="grade"
              label="Grade"
              style={{ width: "150px" }}
              rules={[{ required: true, message: "Please input the grade!" }]}
            >
              <Input suffix=" / 100" min={0} max={100} />
            </Form.Item>
            <Form.Item
              name="comment"
              label="Comment"
              rules={[{ required: true, message: "Please input a comment!" }]}
            >
              <Input.TextArea rows={4} />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Save Changes
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      )}
    </>
  );
};

export default TutorGradePage;
