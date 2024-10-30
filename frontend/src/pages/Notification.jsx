import React, { useState, useEffect } from "react";
import { Button, Drawer, List, Skeleton, Badge } from "antd";
import { BellFilled } from "@ant-design/icons";
import {
  getNotification,
  markAllNotificationsAsRead,
} from "../api/notification";
const Notification = () => {
  const [visible, setVisible] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const curUserInfoString = localStorage.getItem("user");
  const curUserInfo = JSON.parse(curUserInfoString).user;
  const id = curUserInfo.id;

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await getNotification(id);
      setNotifications(data);
      const unread = data.filter((notification) => !notification.read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchNotifications();
  }, [id]);

  const showDrawer = async () => {
    setVisible(true);
    try {
      await markAllNotificationsAsRead(id);
      setNotifications((prevNotifications) =>
        prevNotifications.map((n) => ({ ...n, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark notifications as read:", error);
    }
  };

  const onClose = () => {
    setVisible(false);
  };
  return (
    <div>
      <Badge
        count={unreadCount}
        offset={[-10, 10]}
        showZero
        style={{
          fontSize: "12px",
          height: "16px",
          minWidth: "16px",
          lineHeight: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Button
          icon={
            <BellFilled
              style={{
                color: "#fff",
                background: "#333",
                fontSize: "2em",
                border: "none",
              }}
            />
          }
          onClick={showDrawer}
          data-cy="showNotify"
          style={{ background: "#333", border: "none", boxShadow: "none" }}
        />
      </Badge>
      <Drawer
        title="Notification Panel"
        placement="right"
        onClose={onClose}
        visible={visible}
        width={320}
      >
        {loading ? (
          <Skeleton active />
        ) : (
          <List
            itemLayout="horizontal"
            dataSource={notifications}
            renderItem={(notification) => (
              <List.Item>
                <List.Item.Meta
                  title={notification.title}
                  description={notification.message}
                />
                <small>
                  {new Date(notification.createdAt).toLocaleString()}
                </small>
              </List.Item>
            )}
          />
        )}
      </Drawer>
    </div>
  );
};

export default Notification;
