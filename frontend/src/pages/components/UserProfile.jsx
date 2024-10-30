import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, Menu, Dropdown, Button, message } from "antd";
import {
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { profile, updateProfile } from "../../api/user";
import EditProfileModal from "./EditProfileModal";

const UserProfile = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Show the modal
  const showModal = () => {
    setIsModalVisible(true);
  };

  // Handle cancel action for the modal
  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    avatar: "",
  });
  const navigate = useNavigate();

  // Handle logout action
  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/Home");
    // Redirect to home page
  };

  // Fetch user profile data
  const fetchProfile = async () => {
    try {
      const userString = localStorage.getItem("user");
      if (!userString) {
        throw new Error("User data not found");
      }
      const userObj = JSON.parse(userString);
      const data = await profile(userObj.user.id);
      if (data) {
        setUserData((prevState) => ({
          ...prevState,
          ...data,
          email: userObj.user.email, // Assuming email is stored in the local storage user object
          id: userObj.user.id,
        }));
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Handle save action for the profile update
  const handleSave = async (formValues) => {
    try {
      const data = await updateProfile(userData.id, formValues);
      setUserData({
        ...userData,
        ...formValues,
      });
      message.success("Profile updated successfully!");
      handleCancel();
    } catch (error) {
      console.error("Failed to save changes:", error);
      message.error("Failed to save changes. Please try again.");
    }
  };

  // Get initials for the avatar
  const initials = userData.firstName[0]
    ? userData.firstName[0].toUpperCase()
    : "U";

  const menu = (
    <Menu>
      <Menu.Item>
        <div style={{ display: "flex", alignItems: "center" }}>
          <Avatar src={userData.avatar} style={{ marginRight: 8 }}>
            {userData.avatar ? "" : initials}
          </Avatar>
          <div>
            <div>
              {userData.firstName} {userData.lastName}
            </div>
            <div>{userData.email}</div>
          </div>
        </div>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item
        key="editProfile"
        data-cy="edit"
        icon={<SettingOutlined />}
        onClick={showModal}
      >
        Edit Profile
      </Menu.Item>

      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        Log Out
      </Menu.Item>
    </Menu>
  );

  return (
    <>
      <Dropdown overlay={menu} trigger={["click"]} arrow>
        <a onClick={(e) => e.preventDefault()}>
          <Avatar
            style={{
              backgroundColor: userData.avatar ? undefined : "#1890ff",
              verticalAlign: "middle",
            }}
            size="large"
          >
            {userData.avatar ? (
              <img
                src={userData.avatar}
                alt={`${userData.firstName} ${userData.lastName}`}
              />
            ) : (
              initials
            )}
          </Avatar>
        </a>
      </Dropdown>
      {isModalVisible && (
        <EditProfileModal
          visible={isModalVisible}
          onCancel={handleCancel}
          onSave={handleSave}
          initialData={userData}
        />
      )}
    </>
  );
};

export default UserProfile;
