import React from "react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getGroupById,
  deleteMember,
  joinGroup,
  updateGroup,
} from "../api/group";
import { profile } from "../api/user";
import { getAllStudent, getStudentById } from "../api/student";
import { getProjectByNumber, getProjectById } from "../api/project";
import ManagePreferences from "../pages/ManagePreferencesPage";
import {
  message,
  Button,
  Select,
  Space,
  Typography,
  Spin,
  notification,
  Tabs,
  Card,
  Avatar,
  Row,
  Col,
  Tooltip,
  Modal,
  Tag,
  Flex,
  Empty,
  Descriptions,
  Collapse,
} from "antd";
import { ExclamationCircleFilled, DownOutlined } from "@ant-design/icons";

const MemberDetail = ({ memberId, teaminfo }) => {
  const userinfo = JSON.parse(localStorage.getItem("user")).user;
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

  if (!member) {
    return <p>No details found</p>;
  }
  const member_name = `${member.firstName} ${member.lastName}`;
  return (
    <Tooltip title={member.resume}>
      <Meta
        avatar={<Avatar src={memberAvatar} shape="square" size={64} />}
        title={member_name}
        description={member.email}
        style={{ width: "80%" }}
      />
    </Tooltip>
  );
};

const TeamDetail_v2 = ({ onNavigate }) => {
  const [teaminfo, setTeaminfo] = useState({});
  const [myTeamId, setMyTeamId] = useState(null);
  const [loading, setLoading] = useState(true);

  const [grade, setGrade] = useState(0);
  const [comment, setComment] = useState("");

  const [tabActiveKey, setTabActiveKey] = useState("1");
  const tabOnChange = (newActiveKey) => {
    setTabActiveKey(newActiveKey);
  };

  const userinfo = JSON.parse(localStorage.getItem("user")).user;

  const fetchStudent = async () => {
    try {
      const studentInfo = await getStudentById(userinfo.id);
      if (studentInfo.group_id) {
        console.log(studentInfo);
        setMyTeamId(studentInfo.group_id);
      } else {
        setMyTeamId(null);
      }
    } catch (error) {
      notification.error({ message: "Error", description: error.message });
      setMyTeamId(null);
    }
  };

  // Team Members
  const fetchTeaminfo = async () => {
    try {
      const team = await getGroupById(myTeamId);
      // console.log(team);
      setTeaminfo(team);
      setGrade(team.hasOwnProperty("project_grade") ? team.project_grade : ".");
      setComment(
        team.hasOwnProperty("grade_comment")
          ? team.grade_comment
          : "Your tutor has not given any feedback"
      );
    } catch (error) {
      notification.error({ message: "Error", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudent();
  }, [userinfo]);

  useEffect(() => {
    if (myTeamId) {
      setLoading(true);
      fetchTeaminfo();
    }
  }, [myTeamId]);

  if (myTeamId === null && loading === true) {
    return (
      <Empty
        description={
          <Typography.Text>
            Please create or join a team in Team List Page first.
          </Typography.Text>
        }
      >
        <Button onClick={() => onNavigate("2")}>Team List</Button>
      </Empty>
    );
  }

  if (loading) {
    return <Spin size="large" />;
  }

  const { Title } = Typography;
  const { TabPane } = Tabs;

  if (loading) {
    return <Spin size="large" />;
  }

  // Kick Member confirm Modal
  const { confirm } = Modal;

  const handleKickMember = async (memberId) => {
    try {
      await deleteMember(myTeamId, memberId);
      message.success(`You have successfully Kick This Member.`);
      fetchTeaminfo();
    } catch (error) {
      message.error(`Failed to Kick Member.`);
    }
  };

  const showKickConfirm = (memberId) => {
    confirm({
      title: "Do you want to Kick this member?",
      icon: <ExclamationCircleFilled />,
      onOk() {
        handleKickMember(memberId);
      },
      onCancel() {},
    });
  };

  // Buttons
  const ManageButtons = () => {
    const curUserId = userinfo.id;
    const teamId = teaminfo._id;

    const { confirm } = Modal;

    // Leave Team Btn
    const handleLeaveTeam = async () => {
      try {
        await deleteMember(teamId, curUserId);
        console.log(teamId, curUserId);
        message.success("You have successfully left the team.");
        onNavigate("2");
      } catch (error) {
        message.error("Failed to leave the team.");
      }
    };

    const leaveConfirm = () => {
      confirm({
        title: "Do you want to leave this team?",
        icon: <ExclamationCircleFilled />,
        onOk() {
          handleLeaveTeam();
        },
        onCancel() {},
        centered: true,
        okText: "Leave",
        okType: "danger",
      });
    };

    // Invite Modal Btn
    const [inviteOpen, setInviteOpen] = useState(false);
    const [students, setStudents] = useState([]);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [inviteLoading, setInviteLoading] = useState(true);
    const max = teaminfo.capacity - teaminfo.members.length;

    const handleInviteOpen = () => {
      setInviteOpen(true);
    };

    useEffect(() => {
      const fetchStudents = async () => {
        try {
          const fetchedStudents = await getAllStudent();
          const studentWithoutGroup = fetchedStudents.filter(
            (student) =>
              !student.hasOwnProperty("group_id") || student.group_id === null
          );
          console.log(studentWithoutGroup);
          setStudents(
            studentWithoutGroup.map((student) => ({
              label: `${student.firstName} ${student.lastName}`,
              value: student._id,
            }))
          );
          setInviteLoading(false);
        } catch (error) {
          message.error(error.message);
        }
      };

      fetchStudents();
    }, [inviteOpen]);

    const handleInviteSubmit = async () => {
      setInviteLoading(true);
      try {
        for (const id of selectedStudents) {
          await joinGroup({ groupId: teamId, studentId: id });
        }
        notification.success({
          message: "Success",
          description: "All students have been invited",
        });
        // console.log('All invitations sent successfully');

        setSelectedStudents([]);
        setInviteLoading(false);
        setInviteOpen(false);
        fetchTeaminfo();
      } catch (error) {
        message.error(error.message);
      }
    };

    const handleInviteCancel = () => {
      setSelectedStudents([]);
      setInviteOpen(false);
    };

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

    return (
      <Flex
        gap="large"
        align="start"
        justify="space-evenly"
        style={{ marginTop: "8px" }}
      >
        <Button data-cy="leaveTeam" danger onClick={leaveConfirm}>
          Leave Team
        </Button>

        <Button
          data-cy="inviteStudents"
          onClick={handleInviteOpen}
          disabled={
            !(
              curUserId === teaminfo.leader &&
              teaminfo.capacity !== teaminfo.members.length
            )
          }
        >
          Invite Students
        </Button>

        {curUserId === teaminfo.leader &&
          teaminfo.capacity !== teaminfo.members.length && (
            <Modal
              title={`Invite Student to team ${teaminfo.name}`}
              centered
              open={inviteOpen}
              onOk={handleInviteSubmit}
              onCancel={handleInviteCancel}
              confirmLoading={inviteLoading}
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
      </Flex>
    );
  };

  const MemberContent = () => {
    return (
      <Space
        direction="vertical"
        style={{ display: "flex", alignItems: "center" }}
      >
        {/* <Title level={5}>Members</Title> */}
        {teaminfo.members.map((memberId, index) => (
          <Card style={{ width: 480 }} loading={loading} key={memberId}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <MemberDetail memberId={memberId} teaminfo={teaminfo} />
              {userinfo.id === teaminfo.leader && userinfo.id !== memberId && (
                <Button
                  data-cy="kick"
                  onClick={() => showKickConfirm(memberId)}
                >
                  Kick
                </Button>
              )}
              {userinfo.id === teaminfo.leader && userinfo.id === memberId && (
                <Button disabled color="geekblue">
                  Leader
                </Button>
              )}
            </div>
          </Card>
        ))}

        <ManageButtons />
      </Space>
    );
  };

  // Preference
  const PreferenceContent = () => {
    if (teaminfo.preferences.projectNames.length === 0) {
      return (
        <Card>
          <Empty
            description={
              <Typography.Text>
                Waiting for team leader to finish preferences questionnaire
              </Typography.Text>
            }
          >
            <Button
              onClick={() => tabOnChange("2")}
              data-cy="managerPreferences"
            >
              Manage Preferences
            </Button>
          </Empty>
        </Card>
      );
    }

    const preference_proj = teaminfo.preferences.projectNames;
    const [selectedProj, setSelectedProject] = useState(null);
    const [projDetail, setProjDetail] = useState(null);
    const [supervisorDetails, setSupervisorDetails] = useState({});
    const [creatorDetails, setCreatorDetails] = useState({});
    const [openProj, setOpenProj] = useState(false);
    const [projLoading, setProjLoading] = useState(true);

    const showProj = (projName) => {
      setOpenProj(true);
      setProjLoading(true);
      setSelectedProject(projName.match(/P(\d+)/)[1]);
      console.log(selectedProj);
    };

    useEffect(() => {
      const fetchProj = async () => {
        if (!selectedProj) {
          setProjLoading(false);
          return;
        }

        try {
          const project = await getProjectByNumber(selectedProj);
          console.log(project);
          setProjDetail(project);
          if (project) {
            if (project.supervisor) {
              const supervisor = await profile(project.supervisor);
              setSupervisorDetails(supervisor);
            }
            const creator = await profile(project.creator);

            setCreatorDetails(creator);
          }
        } catch (error) {
          message.error(error.message);
        } finally {
          setProjLoading(false);
        }
      };

      fetchProj();
    }, [selectedProj]);

    return (
      <Space
        direction="vertical"
        style={{ display: "flex", alignItems: "center" }}
      >
        {/* <Title level={5}>Preferences</Title> */}
        {preference_proj.map((projName, index) => (
          <Card style={{ width: 480 }}>
            <Row align="middle" justify="space-between">
              <Col>
                <Title level={5}>{projName}</Title>
              </Col>
              <Col>
                <Button onClick={() => showProj(projName)}>View</Button>
              </Col>
            </Row>
          </Card>
        ))}

        <Modal
          title="Project Detail"
          loading={projLoading}
          open={openProj}
          onCancel={() => setOpenProj(false)}
          footer={[
            <Button key="Back" onClick={() => setOpenProj(false)}>
              Back
            </Button>,
          ]}
        >
          {projDetail && (
            <div>
              <h2>{`P${projDetail.number}: ${projDetail.title}`}</h2>
              <p>
                <strong>Tags:</strong> {projDetail.tags.join(", ")}
              </p>
              <p>
                <strong>Capacity:</strong> {projDetail.capacity}
              </p>
              <p>
                <strong>Background:</strong> {projDetail.background}
              </p>
              <p>
                <strong>Clients:</strong>{" "}
                {`${creatorDetails.firstName} ${creatorDetails.lastName}`}
              </p>
              <p>
                <strong>Requirement:</strong> {projDetail.requirements}
              </p>
              <p>
                <strong>Scope:</strong> {projDetail.scope}
              </p>
              <p>
                <strong>Required Knowledge and Skills:</strong>{" "}
                {projDetail.requiredKnowledgeAndSkills}
              </p>
              <p>
                <strong>Expected Outcomes/Deliverables:</strong>{" "}
                {projDetail.expectedOutcomesDeliverables}
              </p>
              {projDetail.supervisor && (
                <>
                  <p>
                    <strong>Supervisor name:</strong>{" "}
                    {`${supervisorDetails.firstName} ${supervisorDetails.lastName}`}
                  </p>
                  <p>
                    <strong>Supervisor email:</strong> {supervisorDetails.email}
                  </p>
                </>
              )}
              <p>
                <strong>Client email:</strong> {creatorDetails.email}
              </p>
            </div>
          )}
        </Modal>
      </Space>
    );
  };

  // Project
  const ProjectTab = () => {
    if (teaminfo.preferences.projectNames.length === 0) {
      return (
        <Card>
          <Empty
            description={
              <Typography.Text>
                Waiting for team leader to finish preferences questionnaire
              </Typography.Text>
            }
          >
            <Button
              onClick={() => tabOnChange("2")}
              data-cy="managerPreferences"
            >
              Manage Preferences
            </Button>
          </Empty>
        </Card>
      );
    }
    if (!teaminfo.hasOwnProperty("project_id")) {
      return (
        <Empty
          description={
            <Typography.Text>
              Waiting for the project supervisor to assign a project to your
              team
            </Typography.Text>
          }
        />
      );
    }

    const [myProject, setMyProject] = useState(null);

    const [myProjLoading, setMyProjLoading] = useState(true);

    useEffect(() => {
      const fetchMyProj = async () => {
        try {
          const proj = await getProjectById(teaminfo.project_id);
          console.log(proj);
          setMyProject(proj);
        } catch (error) {
          message.error(error.message);
        } finally {
          setMyProjLoading(false);
        }
      };
      fetchMyProj();
    }, [teaminfo]);

    if (myProjLoading) {
      return <Spin size="large" />;
    }

    const items = [
      {
        key: "1",
        label: "Grade",
        children: <p>{grade} / 100</p>,
        span: 3,
      },
      {
        key: "2",
        label: "Comment",
        children: <p>{comment}</p>,
        span: 3,
      },
    ];

    return (
      <Space direction="vertical">
        <Card>
          <Space size="large" align="start">
            <Title level={3}>
              P{myProject.number} - {myProject.title}
            </Title>
            <Button type="primary" onClick={() => onNavigate("5")}>
              View
            </Button>
          </Space>
        </Card>
        <Descriptions
          title="Project Feedback"
          items={items}
          style={{ marginTop: "8px" }}
        />
      </Space>
    );
  };

  return (
    <Space direction="vertical" style={{ width: "100%" }}>
      <Title level={3}>Team-{teaminfo.name}</Title>
      <Tabs
        defaultActiveKey="1"
        size={"large"}
        animated={true}
        style={{ width: "100%" }}
        onChange={tabOnChange}
        activeKey={tabActiveKey}
      >
        <TabPane tab="Team Details" key="1" style={{ width: "100%" }}>
          <Flex
            align="start"
            gap="large"
            justify="flex-start"
            wrap
            style={{ width: "100%" }}
          >
            <Card type="inner" title="Members" style={{ width: "490" }}>
              <MemberContent />
            </Card>

            <Card type="inner" title="Preference" style={{ width: "490" }}>
              <PreferenceContent />
            </Card>
          </Flex>
        </TabPane>

        <TabPane tab="Preferences" key="2" style={{ width: "100%" }}>
          <ManagePreferences onNavigate={onNavigate} teamId={myTeamId} />
        </TabPane>

        <TabPane tab="Project Outcome" key="3">
          <ProjectTab />
        </TabPane>
      </Tabs>
    </Space>
  );
};

export default TeamDetail_v2;
