import React from "react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getProjectById } from "../api/project";
import { getAllGroup, assignGroupToProj } from "../api/group";

import { Table, Button, Space, Switch, message } from "antd";

const ProjectAllocateTeam = ({ projectId, onAllocationSuccess }) => {
  const navigate = useNavigate();
  const curUserInfoString = localStorage.getItem("user");
  const curUserInfo = JSON.parse(curUserInfoString).user;

  const [curProject, setCurProject] = useState(null);
  const [projCap, setProjCap] = useState(0);
  // const { projectId } = useParams();
  const [allTeams, setAllTeams] = useState([]);
  const [teamPrefList, setTeamPrefList] = useState([]);
  const [reload, setReload] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const projectData = await getProjectById(projectId);
        // console.log(projectData);
        setCurProject(projectData);
      } catch (error) {
        console.error("Failed to fetch project:", error);
      }
    };

    fetchProject();
  }, [projectId]);

  const fetchGroups = async () => {
    try {
      const fetchedGroups = await getAllGroup();
      console.log(fetchedGroups);
      setAllTeams(
        fetchedGroups.filter(
          (team) =>
            team.preferences.projectNames.length > 0 &&
            !team.hasOwnProperty("project_id")
        )
      );
    } catch (error) {
      console.error("Failed to fetch groups:", error);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [curProject]);

  const extractNumberFromProjectName = (projectName) => {
    const match = projectName.match(/P(\d+)/);
    return match ? parseInt(match[1]) : null;
  };

  useEffect(() => {
    console.log(allTeams);
    if (curProject && allTeams.length > 0) {
      console.log(curProject);
      setProjCap(curProject.capacity - curProject.groups.length);

      const list = allTeams.map((team) => {
        console.log("Processing team:", team.name);

        const targetProj = team.preferences.projectNames
          .map((projectName, index) => {
            const projNumber = extractNumberFromProjectName(projectName);
            // console.log(index, ': ', team.preferences.projectDes[index]);
            return {
              number: projNumber,
              perfIndex: index + 1,
              description: team.preferences.projectDes[index],
            };
          })
          .filter((project) => project.number === curProject.number);

        console.log("Target projects:", targetProj);
        return {
          key: team._id,
          teamName: team.name,
          programmingSkill: team.preferences.skills.Programming,
          frontendSkill: team.preferences.skills.frontend,
          databaseSkill: team.preferences.skills.database,
          cybersecuritySkill: team.preferences.skills.cybersecurity,
          AISkill: team.preferences.skills.AI,
          prefIndex: targetProj.length > 0 ? targetProj[0].perfIndex : 9,
          description:
            targetProj.length > 0 ? targetProj[0].description : "None",
        };
      });

      setTeamPrefList(list);
    }
  }, [curProject, allTeams, reload]);

  // table
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [loading, setLoading] = useState(false);
  const columns = [
    {
      title: "Team Name",
      dataIndex: "teamName",
      key: "teamName",
    },
    Table.SELECTION_COLUMN,
    {
      title: "Preference Index",
      dataIndex: "prefIndex",
      key: "prefIndex",
      defaultSortOrder: "ascend",
      sorter: (a, b) => a.prefIndex - b.prefIndex,
    },
    Table.EXPAND_COLUMN,
    {
      title: "Programming Skill",
      dataIndex: "programmingSkill",
      key: "programmingSkill",
    },
    {
      title: "Frontend Skill",
      dataIndex: "frontendSkill",
      key: "frontendSkill",
    },
    {
      title: "Database Skill",
      dataIndex: "databaseSkill",
      key: "databaseSkill",
    },
    {
      title: "Cybersecurity Skill",
      dataIndex: "cybersecuritySkill",
      key: "cybersecuritySkill",
    },
    {
      title: "AI Skill",
      dataIndex: "AISkill",
      key: "AISkill",
    },
  ];

  const handleSubmit = async (teamId) => {
    const data = { projectId: projectId };
    try {
      await assignGroupToProj(teamId, data);
    } catch (error) {
      console.log(`${teamId} failed`);
      console.log(error);
    }
  };

  const start = async () => {
    setLoading(true);

    const promises = selectedRowKeys.map((teamId) => handleSubmit(teamId));

    try {
      await Promise.all(promises);
      message.success("All teams allocated successfully.");
      if (onAllocationSuccess) {
        onAllocationSuccess();
      }
    } catch (error) {
      message.error("Some teams failed to allocate to the project.");
    } finally {
      setLoading(false);
      setReload(!reload);
    }
  };

  const onSelectChange = (newSelectedRowKeys) => {
    if (newSelectedRowKeys.length <= projCap) {
      console.log("selectedRowKeys changed: ", newSelectedRowKeys);
      setSelectedRowKeys(newSelectedRowKeys);
    }
  };
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
    getCheckboxProps: (record) => ({
      disabled:
        selectedRowKeys.length >= projCap &&
        !selectedRowKeys.includes(record.key),
    }),
  };

  const hasSelected = selectedRowKeys.length > 0;

  const [switchChecked, setSwitchChecked] = useState(false);
  const handleSwitchChange = (checked) => {
    setSwitchChecked(checked);
  };

  const [showList, setShowList] = useState(teamPrefList);
  useEffect(() => {
    if (switchChecked) {
      setShowList(teamPrefList.filter((team) => team.prefIndex !== 9));
    } else {
      setShowList(teamPrefList);
    }
  }, [switchChecked, teamPrefList]);

  return (
    <Space direction="vertical" style={{ width: "100%" }}>
      <Space>
        <Button
          type="primary"
          onClick={start}
          disabled={!hasSelected}
          loading={loading}
        >
          Submit
        </Button>
        <div>
          Selected teams {selectedRowKeys.length} / {projCap}
        </div>
        <Switch
          checked={switchChecked}
          onChange={handleSwitchChange}
          checkedChildren="Filtered"
          unCheckedChildren="All"
        />
        {/* <Button type="primary" onClick={handleBack}>
          Back
        </Button> */}
      </Space>
      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={showList}
        showSorterTooltip={{
          target: "sorter-icon",
        }}
        pagination={{
          position: ["topRight", "none"],
          pagesize: 10,
        }}
        expandable={{
          expandedRowRender: (record) => (
            <p
              style={{
                marginLeft: 20,
              }}
            >
              {"Description: " + record.description}
            </p>
          ),
          rowExpandable: (record) => record.prefIndex !== 9,
        }}
      />
    </Space>
  );
};

export default ProjectAllocateTeam;
