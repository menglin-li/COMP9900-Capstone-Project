import React, { useState, useEffect } from "react";
import { Modal, Select, Spin, notification } from "antd";
import { getUsersNotInChat, inviteMembersToChat } from "../../api/chat";

const InviteModal = ({ chatId, isVisible, setIsVisible }) => {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!isVisible) return;
      setLoading(true);
      try {
        const result = await getUsersNotInChat(chatId);
        setUsers(
          result.map((user) => ({
            label: `${user.firstName} ${user.lastName} (${user.email})`,
            value: user._id,
          }))
        );
      } catch (error) {
        notification.error({
          message: "Error fetching users",
          description: "Failed to fetch users not in chat.",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [chatId, isVisible]);

  const handleOk = async () => {
    try {
      await inviteMembersToChat(chatId, selectedUsers);
      notification.success({
        message: "Invitation Sent",
        description: "Users have been successfully invited.",
      });
      setIsVisible(false);
      setSelectedUsers([]);
    } catch (error) {
      notification.error({
        message: "Failed to Invite",
        description: error.message || "Failed to invite users.",
      });
    }
  };

  return (
    <Modal
      title="Invite Users"
      open={isVisible}
      onOk={handleOk}
      onCancel={() => {
        setIsVisible(false);
        setSelectedUsers([]);
      }}
    >
      <Spin spinning={loading}>
        <Select
          mode="multiple"
          style={{ width: "100%" }}
          placeholder="Select users to invite"
          options={users}
          value={selectedUsers}
          onChange={setSelectedUsers}
          filterOption={(input, option) =>
            option.label.toLowerCase().includes(input.toLowerCase())
          }
        />
      </Spin>
    </Modal>
  );
};

export default InviteModal;
