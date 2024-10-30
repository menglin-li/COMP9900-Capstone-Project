import React, { useState, useEffect, useRef } from "react";
import {
  Layout,
  List,
  Avatar,
  Spin,
  Input,
  Button,
  Drawer,
  Descriptions,
  Row,
  Col,
  Popover,
  message as antdMessage,
  Result,
} from "antd";
import { MenuOutlined } from "@ant-design/icons";
import { getChatById } from "../../api/chat";
import { getMessages } from "../../api/message";
import { profile } from "../../api/user";
import "./messageArea.css";
import userProfilePopover from "../UserProfilePopover ";
const { Header, Content, Footer } = Layout;

// Websocket
import io from "socket.io-client";
const SOCKET_URL = "http://localhost:4000";

const MessageArea = ({ chatId }) => {
  const [chatDetails, setChatDetails] = useState(null);
  const [isMember, setIsMember] = useState(false);
  const [creatorProfile, setCreatorProfile] = useState(null);
  const [membersProfiles, setMembersProfiles] = useState([]);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [socket, setSocket] = useState(null);
  const user = JSON.parse(localStorage.getItem("user")).user;
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const chatData = await getChatById(chatId);
        setChatDetails(chatData);
        setIsMember(chatData.members.includes(user.id));
        if (chatData.members.includes(user.id)) {
          const messagesData = await getMessages(chatId);
          setMessages(messagesData);
        }
        const creatorData = await profile(chatData.creator);
        setCreatorProfile(creatorData);
        const memberRequests = chatData.members.map((memberId) =>
          profile(memberId)
        );
        const memberProfiles = await Promise.all(memberRequests);
        setMembersProfiles(memberProfiles);
      } catch (error) {
        console.error("Error fetching data:", error);
        antdMessage.error("Failed to load chat details");
      }
      setLoading(false);
    };
    fetchData();
  }, [chatId]);

  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Connected to WebSocket server");
    });

    newSocket.on("message", (message) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          ...message,
          sender: {
            ...message.sender,
            avatar: message.sender.avatar,
            firstName: message.sender.firstName,
            lastName: message.sender.lastName,
          },
        },
      ]);
    });

    return () => newSocket.close();
  }, [chatId]);

  const handleInputChange = (event) => {
    setInputText(event.target.value);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (inputText.trim()) {
      socket.emit("sendMessage", {
        content: inputText,
        senderId: user.id,
        chatId,
      });
      setInputText("");
    }
  };

  const showDrawer = () => {
    setDrawerVisible(true);
  };

  const onCloseDrawer = () => {
    setDrawerVisible(false);
  };

  const renderAvatar = (profile) => {
    if (!profile) {
      return <Avatar>?</Avatar>;
    }

    if (profile.avatar) {
      return <Avatar src={profile.avatar} />;
    }

    return (
      <Avatar style={{ backgroundColor: "#1890ff", verticalAlign: "middle" }}>
        {profile && profile.firstName
          ? profile.firstName[0].toUpperCase()
          : "?"}
      </Avatar>
    );
  };

  function formatCreatedAt(dateString) {
    if (!dateString) {
      return "Loading date...";
    }

    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "Invalid date";
    }

    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    };
    return new Intl.DateTimeFormat("en-US", options).format(date);
  }

  return (
    <Layout className="message-area-layout">
      <Header
        className="message-area-header"
        style={{
          background: "white",
          padding: "0 20px",
          display: "flex",
          alignItems: "center",
        }}
      >
        <h2 style={{ margin: 0, flex: 1 }}>{chatDetails?.name}</h2>
        <p style={{ margin: "0 20px 0 0" }}>
          Members: {chatDetails?.members.length}
        </p>
        <Button icon={<MenuOutlined />} onClick={showDrawer}>
          Details
        </Button>
        <Drawer
          title="Chat Details"
          placement="right"
          onClose={onCloseDrawer}
          open={drawerVisible}
          width={360}
        >
          <Descriptions title="Chat Information" layout="vertical" bordered>
            <Descriptions.Item label="Created at">
              {formatCreatedAt(chatDetails?.createdAt)}
            </Descriptions.Item>
            <Descriptions.Item label="Creator" span={3}>
              <Row>
                <Col span={6}>
                  <Popover
                    content={userProfilePopover({ user: creatorProfile })}
                  >
                    {renderAvatar(creatorProfile)}
                  </Popover>
                </Col>
              </Row>
            </Descriptions.Item>
            <Descriptions.Item label="Members" span={3}>
              <div className="members-container">
                {membersProfiles
                  .filter((mp) => mp._id !== creatorProfile._id)
                  .map((profile) => (
                    <div key={profile._id} className="member-avatar">
                      <Popover content={userProfilePopover({ user: profile })}>
                        {renderAvatar(profile)}
                      </Popover>
                    </div>
                  ))}
              </div>
            </Descriptions.Item>
          </Descriptions>
        </Drawer>
      </Header>
      <Content className="message-area-content">
        {isMember ? (
          <Spin spinning={loading} tip="Loading...">
            <List
              itemLayout="horizontal"
              dataSource={messages}
              renderItem={(item) => {
                const isOwnMessage = item.sender._id === user.id;
                return (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <Popover
                          content={userProfilePopover({ user: item.sender })}
                        >
                          {renderAvatar(item.sender)}
                        </Popover>
                      }
                      title={
                        <span>
                          {item.sender.firstName} {item.sender.lastName}
                          {isOwnMessage && <span className="me-tag">Me</span>}
                        </span>
                      }
                      description={item.content}
                    />
                  </List.Item>
                );
              }}
            />
            <div ref={messagesEndRef} />
          </Spin>
        ) : (
          <Result status="warning" title="You have not joined in this chat." />
        )}
      </Content>
      {isMember && (
        <Footer className="message-area-footer" style={{ textAlign: "center" }}>
          <Input.TextArea
            rows={4}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message..."
            style={{ marginBottom: 16 }}
          />
          <Button type="primary" onClick={handleSendMessage}>
            Send Message
          </Button>
        </Footer>
      )}
    </Layout>
  );
};

export default MessageArea;
