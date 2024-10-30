import React, { useState, useEffect } from "react";
import {
  Layout,
  Menu,
  Input,
  Button,
  List,
  Avatar,
  Tooltip,
  Spin,
  theme,
  Modal,
  Form,
  Select,
  notification,
  Dropdown,
  Drawer,
} from "antd";
import {
  LockOutlined,
  StarOutlined,
  HomeOutlined,
  PlusSquareOutlined,
  EllipsisOutlined,
  UserAddOutlined,
  CloseCircleOutlined,
  UsergroupAddOutlined,
  PoweroffOutlined,
} from "@ant-design/icons";
const { Content, Sider, Footer } = Layout;
import { useNavigate } from "react-router-dom";
import InviteModal from "./messageComponents/inviteUserToChatModal";
import MessageArea from "./messageComponents/messageArea";
import "./MessagePage.css";

import CustomHeader from "./components/CustomHeader";
import useBreakpoints from "./components/ResponsiveComponent";

import {
  createChat,
  getUserChats,
  inviteMembersToChat,
  dismissChat,
  leaveChat,
} from "../api/chat";

import { createMessage, getMessage } from "../api/message";

const MessagePage = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const backToDashboard = `/${user.user.role_type}/dashboard`;
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [chats, setChats] = useState([]);
  const [selectedChatKey, setSelectedChatKey] = useState("");
  const [isInviteModalVisible, setIsInviteModalVisible] = useState(false);
  const [currentChatId, setCurrentChatId] = useState(null);
  const breakpoint = useBreakpoints();
  const [collapse, setCollapse] = useState(true);
  const [isMobile, setMobile] = useState(false);

  useEffect(() => {
    setMobile(breakpoint == "xs" || breakpoint == "sm" || breakpoint == "md");
  }, [breakpoint]);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCreateChannel = async (values) => {
    try {
      setLoading(true);
      await createChat({
        name: values.name,
        visibility: values.visibility,
      });
      notification.success({
        message: "Channel Created",
        description: `Channel '${values.name}' created successfully!`,
      });
      setIsModalVisible(false);
      await fetchChats();
      setLoading(false);
    } catch (error) {
      setLoading(false);
      notification.error({
        message: "Error",
        description: "Failed to create channel",
      });
    }
  };

  const renderCreateChannelModal = () => (
    <Modal
      title="Create New Channel"
      open={isModalVisible}
      onCancel={() => {
        setIsModalVisible(false);
        form.resetFields();
      }}
      footer={null}
    >
      <Form form={form} onFinish={handleCreateChannel} layout="vertical">
        <Form.Item
          name="name"
          label="Channel Name"
          rules={[
            { required: true, message: "Please input the channel name!" },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="visibility"
          label="Visibility"
          rules={[
            {
              required: true,
              message: "Please select the channel visibility!",
            },
          ]}
        >
          <Select placeholder="Select visibility">
            <Option value="public">Public</Option>
            <Option value="private">Private</Option>
          </Select>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Create Channel
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );

  const fetchChats = async () => {
    try {
      const data = await getUserChats();
      setChats(data.chats);
      if (data.chats.length > 0) {
        setSelectedChatKey(data.chats[0].id);
      }
    } catch (error) {
      console.error("Failed to fetch chats:", error);
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  const handleMenuClick = (item) => {
    const { key, chatId } = item;

    switch (key) {
      case "invite":
        showInviteModal(chatId);
        break;
      case "dismiss":
        confirmDismissChat(chatId);
        break;
      case "leave":
        confirmLeaveChat(chatId);
        break;
      case "join":
        confirmJoinChat(chatId);
        break;
      default:
        console.log("No action found for:", key);
    }
  };

  const chatCreatorMenuItems = (chatId) => [
    {
      key: "invite",
      icon: <UsergroupAddOutlined />,
      label: "Invite",
      onClick: () => handleMenuClick({ key: "invite", chatId }),
    },
    {
      key: "dismiss",
      icon: <CloseCircleOutlined />,
      label: "Dismiss",
      danger: true,
      onClick: () => handleMenuClick({ key: "dismiss", chatId }),
    },
  ];

  const chatInChatMenuItems = (chatId) => [
    {
      key: "leave",
      icon: <PoweroffOutlined />,
      label: "Leave",
      danger: true,
      onClick: () => handleMenuClick({ key: "leave", chatId }),
    },
  ];

  const chatOffChatMenuItems = (chatId) => [
    {
      key: "join",
      icon: <UserAddOutlined />,
      label: "Join",
      onClick: () => handleMenuClick({ key: "join", chatId }),
    },
  ];

  // Invite
  const showInviteModal = (chatId) => {
    setCurrentChatId(chatId);
    setIsInviteModalVisible(true);
  };

  // Dismiss
  const handleDismissChat = async (chatId) => {
    try {
      await dismissChat(chatId);
      notification.success({
        message: "Chat Dismissed",
        description: "The chat has been successfully dismissed.",
      });
      fetchChats();
    } catch (error) {
      notification.error({
        message: "Failed to Dismiss Chat",
        description: error.message || "Failed to dismiss the chat.",
      });
    }
  };

  const confirmDismissChat = (chatId) => {
    Modal.confirm({
      title: "Are you sure you want to dismiss this chat?",
      content:
        "All data associated with this chat will be permanently deleted.",
      okText: "Confirm",
      okType: "danger",
      cancelText: "Cancel",
      onOk() {
        handleDismissChat(chatId);
      },
    });
  };

  // Leave
  const handleLeaveChat = async (chatId) => {
    try {
      await leaveChat(chatId);
      notification.success({
        message: "Left Chat",
        description: "You have successfully left the chat.",
      });
      fetchChats();
    } catch (error) {
      notification.error({
        message: "Failed to Leave Chat",
        description: error.message || "Failed to leave the chat.",
      });
    }
  };

  const confirmLeaveChat = (chatId) => {
    Modal.confirm({
      title: "Are you sure you want to leave this chat?",
      content: "You will no longer have access to this chat once you leave.",
      okText: "Leave",
      okType: "danger",
      cancelText: "Cancel",
      onOk() {
        handleLeaveChat(chatId);
      },
    });
  };

  // Join
  const handleJoinChat = async (chatId) => {
    try {
      const userId = user.user.id;
      await inviteMembersToChat(chatId, [userId]);
      notification.success({
        message: "Joined Chat",
        description: "You have successfully joined the chat.",
      });
      fetchChats();
    } catch (error) {
      notification.error({
        message: "Failed to Join Chat",
        description: error.message || "Failed to join the chat.",
      });
    }
  };

  const confirmJoinChat = (chatId) => {
    Modal.confirm({
      title: "Are you sure you want to join this chat?",
      content: "You will be added as a participant in this chat.",
      okText: "Join",
      okType: "primary",
      cancelText: "Cancel",
      onOk() {
        handleJoinChat(chatId);
      },
    });
  };

  // Message Functions
  const [messages, setMessages] = useState([
    { id: 1, sender: "Alice", content: "Hello, how are you?", avatar: "" },
    {
      id: 2,
      sender: "Bob",
      content: "I'm great, thanks for asking!",
      avatar: "",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setInputText(e.target.value);
  };

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // Function to handle sending a message
  const handleSendMessage = async () => {
    if (!inputText.trim()) return; // Prevents sending empty messages
    setLoading(true); // Set loading state to true during the sending process
    try {
      // Send the message to the backend
      const newMessage = await createMessage(
        currentChatId,
        user.user.id,
        inputText
      );
      // Update local state to display the new message
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: newMessage._id, // Assuming the backend returns the message ID
          sender: user.user.name, // Assuming we want to display the user's name
          content: newMessage.content,
          avatar: user.user.avatar, // Assuming the user object has an avatar field
        },
      ]);
      setInputText(""); // Clear input field after sending
      notification.success({
        message: "Message Sent",
        description: "Your message was successfully sent.",
      });
    } catch (error) {
      notification.error({
        message: "Failed to Send Message",
        description:
          error.message || "An error occurred while sending the message.",
      });
    }
    setLoading(false); // Set loading state back to false
  };

  return (
    <Layout className="messagepage-first-layout">
      <CustomHeader
        userRole={"message"}
        collapse={collapse}
        setCollapse={setCollapse}
        onLogout={() => console.log("Logged out")}
      />
      <Layout className="messagepage-seconde-layout relative">
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
              <div className="messagepage-sider">
                <div className="messagepage-top-container">
                  <div className="messagepage-backdashboard-icon">
                    <Tooltip title="Back to Dashboard">
                      <HomeOutlined
                        onClick={() => navigate(backToDashboard)}
                        style={{ fontSize: "24px" }}
                      />
                    </Tooltip>
                  </div>
                  <div className="messagepage-create-channel-icon">
                    <Tooltip title="Create new channel">
                      <PlusSquareOutlined
                        onClick={showModal}
                        style={{ fontSize: "24px" }}
                      />
                    </Tooltip>
                  </div>
                  {renderCreateChannelModal()}
                </div>
                <div className="messagepage-menu-container">
                  <Menu
                    mode="inline"
                    selectedKeys={[selectedChatKey]}
                    onClick={(e) => setSelectedChatKey(e.key)}
                    style={{
                      borderRight: 0,
                    }}
                  >
                    {chats.map((chat) => (
                      <Menu.Item key={chat._id}>
                        <div>
                          {chat.name}
                          {chat.creator === user.user.id && (
                            <StarOutlined style={{ marginLeft: 10 }} />
                          )}
                          {chat.visibility === "private" && <LockOutlined />}
                        </div>
                        <Dropdown
                          menu={{
                            items:
                              chat.creator === user.user.id
                                ? chatCreatorMenuItems(chat._id)
                                : chat.members.includes(user.user.id)
                                ? chatInChatMenuItems(chat._id)
                                : chatOffChatMenuItems(chat._id),
                          }}
                          trigger={["click"]}
                          placement="bottom"
                        >
                          <div>
                            <EllipsisOutlined style={{ fontSize: "16px" }} />
                          </div>
                        </Dropdown>
                      </Menu.Item>
                    ))}
                  </Menu>
                </div>
              </div>
            </Drawer>
          </>
        ) : (
          <Sider width={300} style={{ background: colorBgContainer }}>
            <div className="messagepage-sider">
              <div className="messagepage-top-container">
                <div className="messagepage-backdashboard-icon">
                  <Tooltip title="Back to Dashboard">
                    <HomeOutlined
                      onClick={() => navigate(backToDashboard)}
                      style={{ fontSize: "24px" }}
                    />
                  </Tooltip>
                </div>
                <div className="messagepage-create-channel-icon">
                  <Tooltip title="Create new channel">
                    <PlusSquareOutlined
                      onClick={showModal}
                      style={{ fontSize: "24px" }}
                    />
                  </Tooltip>
                </div>
                {renderCreateChannelModal()}
              </div>
              <div className="messagepage-menu-container">
                <Menu
                  mode="inline"
                  selectedKeys={[selectedChatKey]}
                  onClick={(e) => setSelectedChatKey(e.key)}
                  style={{
                    borderRight: 0,
                  }}
                >
                  {chats.map((chat) => (
                    <Menu.Item key={chat._id}>
                      <div>
                        {chat.name}
                        {chat.creator === user.user.id && (
                          <StarOutlined style={{ marginLeft: 10 }} />
                        )}
                        {chat.visibility === "private" && <LockOutlined />}
                      </div>
                      <Dropdown
                        menu={{
                          items:
                            chat.creator === user.user.id
                              ? chatCreatorMenuItems(chat._id)
                              : chat.members.includes(user.user.id)
                              ? chatInChatMenuItems(chat._id)
                              : chatOffChatMenuItems(chat._id),
                        }}
                        trigger={["click"]}
                        placement="bottom"
                      >
                        <div>
                          <EllipsisOutlined style={{ fontSize: "16px" }} />
                        </div>
                      </Dropdown>
                    </Menu.Item>
                  ))}
                </Menu>
              </div>
            </div>
          </Sider>
        )}
        {selectedChatKey && <MessageArea chatId={selectedChatKey} />}
      </Layout>
      <InviteModal
        chatId={currentChatId}
        isVisible={isInviteModalVisible}
        setIsVisible={setIsInviteModalVisible}
      />
    </Layout>
  );
};

export default MessagePage;
