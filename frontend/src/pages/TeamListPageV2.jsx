import React from "react";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getAllGroup, createGroup, joinGroup } from "../api/group";
import { getAllStudent, getStudentById } from "../api/student";
import { profile } from "../api/user";

import {
  Select,
  Table,
  Button,
  Space,
  Switch,
  Spin,
  Modal,
  Avatar,
  Card,
  notification,
  Input,
  Tooltip,
  Form,
  Radio,
  RadioChangeEvent,
  InputNumber,
  message,
} from "antd";
import { SearchOutlined, DownOutlined, LeftOutlined } from "@ant-design/icons";

// import Highlighter from 'react-highlight-words';

// student join
// tutor ， coor invite
const MemberDetails = ({ memberId }) => {
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [memberAvatar, setMemberAvatar] = useState("");
  const { Meta } = Card;

  useEffect(() => {
    const fetchMemberDetails = async () => {
      try {
        const memberDetails = await profile(memberId);
        setMember(memberDetails);
        if (memberDetails.hasOwnProperty("avatar")) {
          setMemberAvatar(memberDetails.avatar);
        }
      } catch (error) {
        notification.error({
          message: "Error",
          description: "Failed to load member details.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMemberDetails();
  }, [memberId]);

  if (loading) {
    return <Spin size="small" />;
  }

  if (!member) {
    return <p>No details found</p>;
  }

  const member_name = `${member.firstName} ${member.lastName}`;

  return (
    <Card
      style={{
        width: 232,
      }}
    >
      <Meta
        avatar={<Avatar src={memberAvatar} />}
        title={member_name}
        // description= {member.email}
      />
    </Card>
  );
};

const TeamList_v2 = ({ onNavigate }) => {
  const [teams, setTeams] = useState([]);
  const [pubTeams, setPubTeams] = useState([]);
  //const [showTeams, setShowTeams] = useState
  const userstring = localStorage.getItem("user");
  const userinfo = JSON.parse(userstring);
  const navigate = useNavigate();
  const [myTeamId, setMyTeamId] = useState("");

  async function fetchAllGroups() {
    try {
      const groups = await getAllGroup();
      return groups;
    } catch (error) {
      console.error("Failed to fetch groups:", error);
      return [];
    }
  }

  const fetchStudent = async () => {
    try {
      const studentInfo = await getStudentById(userinfo.user.id);
      if (studentInfo.group_id) {
        setMyTeamId(studentInfo.group_id);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (userinfo.user.role_type === "student") {
      fetchStudent();
    }
  }, [userinfo]);

  const fetchGroups = async () => {
    try {
      const fetchedGroups = await fetchAllGroups();
      setTeams(
        fetchedGroups.map((team) => {
          return {
            key: team._id,
            team_name: team.name,
            capacity: `${team.members.length} / ${team.capacity}`,
            members: team.members,
            num_cap: team.capacity - team.members.length,
          };
        })
      );

      setPubTeams(
        fetchedGroups
          .filter((team) => team.visibility === "Public")
          .map((team) => {
            return {
              key: team._id,
              team_name: team.name,
              capacity: `${team.members.length} / ${team.capacity}`,
              members: team.members,
              num_cap: team.capacity - team.members.length,
            };
          })
      );
    } catch (error) {
      console.error("Error retrieving groups:", error);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  // team name search
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);
  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };
  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
  };
  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div
        style={{
          padding: 8,
        }}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{
            marginBottom: 8,
            display: "block",
          }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{
              width: 90,
            }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{
              width: 90,
            }}
          >
            Reset
          </Button>

          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined
        style={{
          color: filtered ? "#1677ff" : undefined,
        }}
      />
    ),
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) => text,
  });

  // table related
  const columns = [
    {
      title: "Team Name",
      dataIndex: "team_name",
      key: "team_name",
      ...getColumnSearchProps("team_name"),
    },
    {
      title: "Capacity",
      dataIndex: "capacity",
      key: "capacity",
      sorter: (a, b) => a.num_cap - b.num_cap,
      sortDirections: ["descend", "ascend"],
    },
    Table.EXPAND_COLUMN,

    ...(userinfo.user.role_type === "student" && myTeamId === ""
      ? [
          {
            title: "Action",
            dataIndex: "",
            key: "x",
            render: (_, record) => (
              <Button
                type="primary"
                data-cy="join"
                onClick={() => handleJoin(record)}
                disabled={record.num_cap === 0}
              >
                Join
              </Button>
            ),
          },
        ]
      : []),

    ...(userinfo.user.role_type === "tutor" ||
    userinfo.user.role_type === "coordinator"
      ? [
          {
            title: "Action",
            dataIndex: "",
            key: "x",
            render: (_, record) => (
              <Button
                type="primary"
                onClick={() => handleOpen(record)}
                disabled={record.num_cap === 0}
              >
                Invite
              </Button>
            ),
          },
        ]
      : []),
  ];

  // Student Join
  const handleJoin = async (record) => {
    const teamId = record.key;
    const joinData = {
      groupId: teamId,
      studentId: userinfo.user.id,
    };

    try {
      await joinGroup(joinData);
      message.success("You have successfully join the team.");
      // navigate to my team
      onNavigate("3");
    } catch (error) {
      message.error(error.message);
    }
  };

  // Tutor and Coor Invite Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [loading, setLoading] = useState(true);

  const [max, setMax] = useState(1);
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);

  const handleOpen = (record) => {
    setSelectedTeam(record);
    setModalOpen(true);
    setMax(record.num_cap);

    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      for (const id of selectedStudents) {
        await joinGroup({ groupId: selectedTeam.key, studentId: id });
      }
      notification.success({
        message: "Success",
        description: "All students have been invited",
      });
      // console.log('All invitations sent successfully');
      //
      await fetchGroups();
    } catch (error) {
      message.error(error.message);
    }
    setTimeout(() => {
      setSelectedStudents([]);
      setModalOpen(false);
      setLoading(false);
    }, 1000);
  };

  const handleCancel = () => {
    setSelectedStudents([]);
    setModalOpen(false);
  };

  // Select student to join
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const fetchedStudents = await getAllStudent();
        const studentWithoutGroup = fetchedStudents.filter(
          (student) =>
            !student.hasOwnProperty("group_id") || student.group_id === null
        );
        setStudents(
          studentWithoutGroup.map((student) => ({
            label: `${student.firstName} ${student.lastName}`,
            value: student._id,
          }))
        );
      } catch (error) {
        message.error(error.message);
      }
    };

    fetchStudents();
  }, [modalOpen]);

  const handleChange = (value) => {
    setSelectedStudents(value);
    console.log(`selected ${value}`);
  };

  const suffix = (
    <>
      <span>
        {selectedStudents.length} / {max}
      </span>
      <DownOutlined />
    </>
  );

  // Create Team Modal
  const [createOpen, setCreateOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const showCreate = () => {
    setCreateOpen(true);
  };

  const handleCreateOk = async () => {
    setConfirmLoading(true);
    console.log(userinfo);
    const teamData = {
      name: createTeamName,
      leaderId: userinfo.user.id,
      visibility: visibility,
      capacity: capacity,
    };
    console.log(teamData);
    try {
      const res = await createGroup(teamData);
      console.log(res);
      notification.success({
        message: "Success",
        description: `Team ${teamData.name} created successfully`,
      });
    } catch (error) {
      console.log(error);
      notification.error({ message: "Error", description: error.message });
    }
    setTimeout(() => {
      setCreateOpen(false);
      setConfirmLoading(false);
      onNavigate("3");
    }, 1000);
  };

  const handleCreateCancel = () => {
    setCreateOpen(false);
  };

  // Create Team Form
  const [createTeamName, setCreateTeamName] = useState("");
  const [capacity, setCapacity] = useState(6);
  const [visibility, setVisibility] = useState("Public");

  const onVisChange = (checked) => {
    setVisibility(checked ? "Private" : "Public");
  };

  const formItemLayout = {
    labelCol: {
      xs: { span: 24 },
      sm: { span: 6 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 14 },
    },
  };

  return (
    <Space direction="vertical" style={{ width: "100%" }}>
      <Space size={40}>
        {userinfo.user.role_type === "student" && myTeamId === "" && (
          <Button
            data-cy="createTeam"
            size="large"
            shape="round"
            onClick={showCreate}
          >
            {" "}
            Create Team{" "}
          </Button>
        )}

        {userinfo.user.role_type === "student" && myTeamId !== "" && (
          <Button size="large" shape="round" onClick={() => onNavigate("3")}>
            My Team
          </Button>
        )}
      </Space>
      <Table
        data-cy="teamListTable"
        columns={columns}
        expandable={{
          expandedRowRender: (record) => (
            <Space size={[16, 8]} wrap>
              {record.members.map((memberId) => (
                <MemberDetails key={memberId} memberId={memberId} />
              ))}
            </Space>
          ),
        }}
        dataSource={userinfo.user.role_type === "student" ? pubTeams : teams}
      />

      <Modal
        title="Create Team"
        centered
        open={createOpen}
        onOk={handleCreateOk}
        onCancel={handleCreateCancel}
        okText="Create"
        cancelText="Cancel"
        confirmLoading={confirmLoading}
      >
        <Form {...formItemLayout} variant="filled">
          <Form.Item label="Team Name">
            <Input
              data-cy="teamName"
              placeholder="Input the team name"
              value={createTeamName}
              onChange={(e) => setCreateTeamName(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="Team Capacity">
            <InputNumber
              min={5}
              max={6}
              value={capacity}
              keyboard={true}
              changeOnWheel
              onChange={(e) => setCapacity(e)}
            />
          </Form.Item>
          <Form.Item label="Team Privacy">
            <Switch
              data-cy="teamPrivacy"
              defaultChecked={false}
              onChange={onVisChange}
              checkedChildren="Private"
              unCheckedChildren="Public"
            />
          </Form.Item>
        </Form>
      </Modal>
      {selectedTeam !== null && (
        <Modal
          title={`Invite Students to team ${selectedTeam.team_name || ""}`}
          centered
          open={modalOpen}
          onOk={handleSubmit}
          onCancel={handleCancel}
          confirmLoading={loading}
          okText="Invite"
          cancelText="Cancel"
        >
          <Select
            mode="multiple"
            allowClear
            style={{ width: "100%" }}
            value={selectedStudents}
            suffixIcon={suffix}
            maxCount={max}
            placeholder="Please Select students to join"
            onChange={handleChange}
            options={students}
          />
        </Modal>
      )}
    </Space>
  );
};

export default TeamList_v2;
