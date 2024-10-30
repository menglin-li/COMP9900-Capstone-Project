import React, { useState, useEffect, useRef } from "react";
import { Modal, Form, Input, Select, Button, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { profile } from "../../api/user";

const EditProfileModal = ({ visible, onCancel, onSave, initialData }) => {
  const [form] = Form.useForm();
  const [userId, setUserId] = useState(null);
  const user = JSON.parse(localStorage.getItem("user")).user;
  const role = user.role_type;
  const [avatar, setAvatar] = useState(initialData.avatar);
  // Handle file selection, convert to Base64 encoding
  const fileInputRef = useRef(null);

  const handleButtonClick = () => {
    // Simulate clicking the hidden input when the button is clicked
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    console.log("File selected:", e.target.files); // Check if a file is selected
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        console.log("File loaded:", e.target.result); // Check if file content is correctly read
        setAvatar(e.target.result); // Update avatar state
        console.log("Avatar updated:", e.target.result); // Verify state update
        form.setFieldsValue({ avatar: e.target.result }); // Update form's avatar field
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    const userString = localStorage.getItem("user");
    if (userString) {
      const userObj = JSON.parse(userString);
      setUserId(userObj.user.id);
      fetchProfile(userObj.user.id);
    }
  }, []);

  const fetchProfile = async (id) => {
    try {
      const data = await profile(id);
      form.setFieldsValue(data);
      setAvatar(data.avatar); // Update avatar state
    } catch (error) {
      message.error("Failed to load profile data.");
    }
  };

  const handleSave = () => {
    form
      .validateFields()
      .then((values) => {
        onSave({ ...values, avatar });
        form.resetFields();
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };

  return (
    <Modal
      title="Edit Profile"
      visible={visible}
      onCancel={onCancel}
      onOk={handleSave}
      footer={[
        <Button key="back" onClick={onCancel}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={handleSave}>
          Save
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ ...initialData, avatar }}
      >
        <Form.Item name="firstName" label="First Name">
          <Input />
        </Form.Item>
        <Form.Item name="lastName" label="Last Name">
          <Input />
        </Form.Item>
        {role === "student" && (
          <Form.Item name="background" label="Current Degree Program">
            <Select>
              <Select.Option value="postgraduate">Postgraduate</Select.Option>
              <Select.Option value="undergraduate">Undergraduate</Select.Option>
            </Select>
          </Form.Item>
        )}
        <Form.Item name="resume" label="About">
          <Input.TextArea rows={4} />
        </Form.Item>
        <Form.Item name="avatar" label="Avatar">
          <div className="avatar-uploader">
            {/* File input should be self-closing and cannot contain children */}
            <input
              name="avatar"
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              style={{ display: "none" }} // Ensure the input is clickable
            />
            <Button icon={<UploadOutlined />} onClick={handleButtonClick}>
              upload
            </Button>

            {avatar && (
              <img
                src={avatar}
                alt="Avatar"
                style={{ width: "200px", height: "200px", marginTop: "10px" }}
              />
            )}
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditProfileModal;
