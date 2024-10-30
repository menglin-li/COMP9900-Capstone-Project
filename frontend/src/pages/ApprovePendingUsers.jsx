import React, { useRef, useState, useEffect } from "react";
import { Table, Button, Space, Input, message } from "antd";
import { getPendingUsers, approveUser, deleteUser } from "../api/admin";
import { SearchOutlined } from "@ant-design/icons";

const ApprovePendingUsers = () => {
  const [roleType, setRoleType] = useState("");
  const [pendingUsers, setPendingUsers] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.user) {
      setRoleType(user.user.role_type);
    }
  }, []);
  const fetchPendingUsers = async () => {
    try {
      let users = [];
      if (roleType === "admin") {
        users = await getPendingUsers();
      }
      setPendingUsers(users);
    } catch (error) {
      console.error("Error fetching pending users:", error);
    }
  };

  useEffect(() => {
    if (roleType && roleType !== "student") {
      fetchPendingUsers();
    }
  }, [roleType]);

  const handleApprove = async (id) => {
    try {
      if (roleType === "admin") {
        await approveUser(id);
        message.success("User successfully approved");
      }
      fetchPendingUsers(); // Refresh the pending users list
    } catch (error) {
      message.error("Error approving user:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      if (roleType === "admin") {
        await deleteUser(id);
        message.success("User successfully deleted");
      }
      fetchPendingUsers(); // Refresh the pending users list
    } catch (error) {
      message.error("Error deleting user:", error);
    }
  };

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
  };
  const getColumnSearchProps = (
    dataIndex,
    getRecordValue = (record) => record[dataIndex]
  ) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
          <Button
            onClick={() => {
              confirm({ closeDropdown: false });
              setSearchText(selectedKeys[0]);
              setSearchedColumn(dataIndex);
            }}
            type="default"
            size="small"
            style={{ width: 90 }}
          >
            Filter
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
    ),
    onFilter: (value, record) =>
      getRecordValue(record)
        .toString()
        .toLowerCase()
        .includes(value.toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current.select(), 100);
      }
    },
  });

  const userNameGetRecordValue = (record) =>
    `${record.firstName} ${record.lastName}`;

  const columns = [
    {
      title: "User Name",
      render: (text, record) => `${record.firstName} ${record.lastName}`,
      key: "userName",
      ...getColumnSearchProps("userName", userNameGetRecordValue),
    },
    {
      title: "Role Type",
      render: (text, record) => record.role_type,
      key: "roleType",
      filters: [
        { text: "Coordinator", value: "coordinator" },
        { text: "Client", value: "client" },
        { text: "Tutor", value: "tutor" },
      ],
      onFilter: (value, record) => record.role_type === value,
    },
    {
      title: "Action",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Button type="primary" onClick={() => handleApprove(record._id)}>
            Accept
          </Button>
          <Button danger onClick={() => handleDelete(record._id)}>
            Delete
          </Button>
        </Space>
      ),
    },
  ];
  return <Table dataSource={pendingUsers} columns={columns} rowKey="_id" />;
};
export default ApprovePendingUsers;
