import React, { useRef, useState, useEffect } from "react";
import { Table, Button, Space, Input, message } from "antd";
import {
  getPendingTutors,
  approveTutor,
  deleteTutor,
} from "../api/coordinator";

import { SearchOutlined } from "@ant-design/icons";

const ApprovePendingTutors = () => {
  const [pendingTutors, setPendingTutors] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);

  const fetchPendingTutors = async () => {
    try {
      let tutors = [];
      tutors = await getPendingTutors();
      setPendingTutors(tutors);
    } catch (error) {
      console.error("Error fetching pending users:", error);
    }
  };

  useEffect(() => {
    fetchPendingTutors();
  }, []);

  const handleApprove = async (id) => {
    try {
      await approveTutor(id);
      message.success("Tutor successfully approved");
      fetchPendingTutors(); // Refresh the pending tutors list
    } catch (error) {
      message.error("Error approving tutor:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTutor(id);
      message.success("Tutor successfully deleted");
      fetchPendingTutors(); // Refresh the pending tutors list
    } catch (error) {
      message.error("Error deleting tutor:", error);
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

  // Define columns for the table
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

  return <Table dataSource={pendingTutors} columns={columns} rowKey="_id" />;
};

export default ApprovePendingTutors;
