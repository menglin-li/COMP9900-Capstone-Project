import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getGroupById, updateGroupPreference } from "../api/group";
import { getAllProjects } from "../api/project";
import { DownloadOutlined } from "@ant-design/icons";
// import styled from 'styled-components';
import "./ManagePreferencePage.css";
import {
  Alert,
  Button,
  Form,
  Input,
  Radio,
  Select,
  Typography,
  message,
} from "antd";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const { Option } = Select;
const { Text } = Typography;

const ManagePreferences = ({ onNavigate, teamId }) => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [size, setSize] = useState("large");
  const [teamInfo, setTeamInfo] = useState(null);
  const [isLeader, setIsLeader] = useState(false);
  const [projects, setProjects] = useState([]);
  const [programmingSkills, setProgrammingSkills] = useState(0);
  const [frontendSkills, setFrontendSkills] = useState(0);
  const [databaseSkills, setDatabaseSkills] = useState(0);
  const [cybersecuritySkills, setCybersecuritySkills] = useState(0);
  const [aiSkills, setAiSkills] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showInfoAlert, setShowInfoAlert] = useState(false);
  const [showLeaderInfoAlert, setShowLeaderInfoAlert] = useState(false);
  console.log(teamId);

  useEffect(() => {
    const fetchTeamInfo = async () => {
      try {
        const data = await getGroupById(teamId);
        console.log(data);
        setTeamInfo(data);
        const projectsData = await getAllProjects();
        setProjects(projectsData);
        const curUserInfoString = localStorage.getItem("user");
        const curUserInfo = JSON.parse(curUserInfoString).user;
        setIsLeader(curUserInfo.id === data.leader);

        if (data?.preferences?.name) {
          form.setFieldsValue({
            name: data.preferences.name,
            members: data.preferences.members,
            comments: data.preferences.comments,
            programmingSkills: data.preferences.skills.Programming,
            frontendSkills: data.preferences.skills.frontend,
            databaseSkills: data.preferences.skills.database,
            cybersecuritySkills: data.preferences.skills.cybersecurity,
            aiSkills: data.preferences.skills.AI,
            projectPreference1: data.preferences.projectNames[0],
            projectPreference2: data.preferences.projectNames[1],
            projectPreference3: data.preferences.projectNames[2],
            projectPreference4: data.preferences.projectNames[3],
            projectPreference5: data.preferences.projectNames[4],
            projectPreference6: data.preferences.projectNames[5],
            projectPreference7: data.preferences.projectNames[6],
            technicalSkills1: data.preferences.projectDes[0],
            technicalSkills2: data.preferences.projectDes[1],
            technicalSkills3: data.preferences.projectDes[2],
            technicalSkills4: data.preferences.projectDes[3],
            technicalSkills5: data.preferences.projectDes[4],
            technicalSkills6: data.preferences.projectDes[5],
            technicalSkills7: data.preferences.projectDes[6],
          });
          console.log(
            "data.preferences.skills.Programming",
            data.preferences.skills.Programming
          );
          setIsSubmitted(true);
        }
      } catch (error) {
        console.error("Error fetching team details:", error);
      }
    };
    fetchTeamInfo();
    return () => {
      setIsSubmitted(false);
      setIsLeader(false);
    };
  }, [teamId, form]);

  useEffect(() => {
    if (isSubmitted) {
      setShowInfoAlert(!isLeader);
      setShowLeaderInfoAlert(isLeader);
    } else {
      setShowInfoAlert(false);
      setShowLeaderInfoAlert(false);
    }
  }, [isSubmitted, isLeader]);

  const onFinish = async (values) => {
    if (!isLeader) {
      // alert('Only the team leader can submit changes.');
      return;
    }
    console.log("Received values of form: ", values);
    const updateData = {
      preferences: {
        name: values.name,
        members: values.members,
        comments: values.comments,
        skills: {
          Programming: values.programmingSkills,
          frontend: values.frontendSkills,
          database: values.databaseSkills,
          cybersecurity: values.cybersecuritySkills,
          AI: values.aiSkills,
        },
        projectNames: [
          values.projectPreference1,
          values.projectPreference2,
          values.projectPreference3,
          values.projectPreference4,
          values.projectPreference5,
          values.projectPreference6,
          values.projectPreference7,
        ],
        projectDes: [
          values.technicalSkills1,
          values.technicalSkills2,
          values.technicalSkills3,
          values.technicalSkills4,
          values.technicalSkills5,
          values.technicalSkills6,
          values.technicalSkills7,
        ],
      },
    };
    console.log("Received update data: ", updateData);

    try {
      await updateGroupPreference(teamId, updateData);
      // alert('Preferences updated successfully!');
      setIsSubmitted(true);
      message.success("Successfully submitted your preferences.");
    } catch (error) {
      console.error("Failed to update preferences:", error);
    }
  };

  // if (!teamInfo) return <div>Loading...</div>;
  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  const downloadPDF = () => {
    const input = document.getElementById("manage_preferences");
    if (!input) {
      console.error("No element found with the given ID");
      return;
    }

    const scale = 0.75;
    const originalStyle = input.style.transform;
    const originalWidth = input.style.width;

    input.style.transform = `scale(${scale})`;
    input.style.transformOrigin = "top left";
    input.style.width = `${100 / scale}%`;

    html2canvas(input, { scale: 1 })
      .then((canvas) => {
        input.style.transform = originalStyle;
        input.style.width = originalWidth;

        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        let imgHeight = (canvas.height * pdfWidth) / canvas.width;
        let heightLeft = imgHeight;

        let position = 0;

        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;

        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
          heightLeft -= pdfHeight;
        }

        pdf.save("preferences.pdf");
      })
      .catch((error) => {
        console.error("Error capturing the page:", error);
        input.style.transform = originalStyle;
        input.style.width = originalWidth;
      });
  };

  const [selectedProjects, setSelectedProjects] = useState({});

  const handleSelectChange = (key, value) => {
    const newSelectedProjects = { ...selectedProjects, [key]: value };
    setSelectedProjects(newSelectedProjects);
  };

  const getAvailableProjects = (currentKey) => {
    const selectedValues = Object.values(selectedProjects);
    return projects.filter(
      (project) =>
        !selectedValues.includes(`P${project.number} ${project.title}`) ||
        selectedProjects[currentKey] === `P${project.number} ${project.title}`
    );
  };

  return (
    <>
      {showLeaderInfoAlert && (
        <Alert
          message="Informational Notes"
          description="Preferences have been submitted and can no longer be edited, but you can view them anytime."
          type="info"
          showIcon
          closable
          afterClose={() => setShowInfoAlert(false)}
        />
      )}
      {showInfoAlert && (
        <Alert
          message="Informational Notes"
          description="Only the team leader can edit this form, but you can view it anytime."
          type="info"
          showIcon
          closable
          afterClose={() => setShowLeaderInfoAlert(false)}
        />
      )}
      <Form
        form={form}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        name="manage_preferences"
        initialValues={{
          comments: teamInfo?.preferences?.comments || "",
          programmingSkills: teamInfo?.preferences?.skills?.Programming || 0,
          frontendSkills: teamInfo?.preferences?.skills?.frontend || 0,
          databaseSkills: teamInfo?.preferences?.skills?.database || 0,
          cybersecuritySkills:
            teamInfo?.preferences?.skills?.cybersecurity || 0,
          aiSkills: teamInfo?.preferences?.skills?.AI || 0,
          projectPreference1: teamInfo?.preferences?.projectNames?.[0] || "",
          projectPreference2: teamInfo?.preferences?.projectNames?.[1] || "",
          projectPreference3: teamInfo?.preferences?.projectNames?.[2] || "",
          projectPreference4: teamInfo?.preferences?.projectNames?.[3] || "",
          projectPreference5: teamInfo?.preferences?.projectNames?.[4] || "",
          projectPreference6: teamInfo?.preferences?.projectNames?.[5] || "",
          projectPreference7: teamInfo?.preferences?.projectNames?.[6] || "",
          technicalSkills1: teamInfo?.preferences?.projectDes?.[0] || "",
          technicalSkills2: teamInfo?.preferences?.projectDes?.[1] || "",
          technicalSkills3: teamInfo?.preferences?.projectDes?.[2] || "",
          technicalSkills4: teamInfo?.preferences?.projectDes?.[3] || "",
          technicalSkills5: teamInfo?.preferences?.projectDes?.[4] || "",
          technicalSkills6: teamInfo?.preferences?.projectDes?.[5] || "",
          technicalSkills7: teamInfo?.preferences?.projectDes?.[6] || "",
        }}
      >
        <Form.Item
          name="name"
          label="Team Name"
          labelCol={{ span: 24 }}
          wrapperCol={{ span: 24 }}
          rules={[{ required: true, message: "Please input the team name!" }]}
        >
          <Input disabled={!isLeader || isSubmitted} />
        </Form.Item>
        <Form.Item
          name="members"
          label="Group Members"
          labelCol={{ span: 24 }}
          wrapperCol={{ span: 24 }}
          rules={[
            { required: true, message: "Please input the group members!" },
          ]}
        >
          <Input.TextArea
            disabled={!isLeader || isSubmitted}
            placeholder="z555555, John Smith&#10;z566666, Ian Liu&#10;z577777, Sajith Ramada"
            rows={6}
          />
        </Form.Item>
        <Form.Item
          key={"1"}
          name="projectPreference1"
          label="Indicate project preference 1 of your group"
          labelCol={{ span: 24 }}
          wrapperCol={{ span: 24 }}
          rules={[
            {
              required: true,
              message: "Please select your first project preference!",
            },
          ]}
        >
          <Select
            data-cy="projectPreference1"
            disabled={!isLeader || isSubmitted}
            placeholder="Select a project"
            popupMatchSelectWidth={false}
            dropdownStyle={{ minWidth: 300 }}
            value={selectedProjects["1"]}
            onChange={(value) => handleSelectChange("1", value)}
          >
            {getAvailableProjects("1").map((project) => (
              <Option
                key={project.number}
                value={`P${project.number} ${project.title}`}
              >
                {`P${project.number} ${project.title}`}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="technicalSkills1"
          label="Please provide the relevant technical skills that your team have that would make you suitable for the projects that you have chosen."
          labelCol={{ span: 24 }}
          wrapperCol={{ span: 24 }}
          rules={[
            { required: true, message: "Please input the technical skills!" },
          ]}
        >
          <Input.TextArea disabled={!isLeader || isSubmitted} rows={6} />
        </Form.Item>
        <Form.Item
          key={"2"}
          name="projectPreference2"
          label="Indicate project preference 2 of your group"
          labelCol={{ span: 24 }}
          wrapperCol={{ span: 24 }}
          rules={[
            {
              required: true,
              message: "Please select your second project preference!",
            },
          ]}
        >
          <Select
            disabled={!isLeader || isSubmitted}
            placeholder="Select a project"
            popupMatchSelectWidth={false}
            dropdownStyle={{ minWidth: 300 }}
            value={selectedProjects["2"]}
            onChange={(value) => handleSelectChange("2", value)}
          >
            {getAvailableProjects("2").map((project) => (
              <Option
                key={project.number}
                value={`P${project.number} ${project.title}`}
              >
                {`P${project.number} ${project.title}`}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="technicalSkills2"
          label="Please provide the relevant technical skills that your team have that would make you suitable for the projects that you have chosen."
          labelCol={{ span: 24 }}
          wrapperCol={{ span: 24 }}
          rules={[
            { required: true, message: "Please input the technical skills!" },
          ]}
        >
          <Input.TextArea disabled={!isLeader || isSubmitted} rows={6} />
        </Form.Item>
        <Form.Item
          key={"3"}
          name="projectPreference3"
          label="Indicate project preference 3 of your group"
          labelCol={{ span: 24 }}
          wrapperCol={{ span: 24 }}
          rules={[
            {
              required: true,
              message: "Please select your third project preference!",
            },
          ]}
        >
          <Select
            disabled={!isLeader || isSubmitted}
            placeholder="Select a project"
            popupMatchSelectWidth={false}
            dropdownStyle={{ minWidth: 300 }}
            value={selectedProjects["3"]}
            onChange={(value) => handleSelectChange("3", value)}
          >
            {getAvailableProjects("3").map((project) => (
              <Option
                key={project.number}
                value={`P${project.number} ${project.title}`}
              >
                {`P${project.number} ${project.title}`}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="technicalSkills3"
          label="Please provide the relevant technical skills that your team have that would make you suitable for the projects that you have chosen."
          labelCol={{ span: 24 }}
          wrapperCol={{ span: 24 }}
          rules={[
            { required: true, message: "Please input the technical skills!" },
          ]}
        >
          <Input.TextArea disabled={!isLeader || isSubmitted} rows={6} />
        </Form.Item>
        <Form.Item
          key={"4"}
          name="projectPreference4"
          label="Indicate project preference 4 of your group"
          labelCol={{ span: 24 }}
          wrapperCol={{ span: 24 }}
          rules={[
            {
              required: true,
              message: "Please select your fourth project preference!",
            },
          ]}
        >
          <Select
            disabled={!isLeader || isSubmitted}
            placeholder="Select a project"
            popupMatchSelectWidth={false}
            dropdownStyle={{ minWidth: 300 }}
            value={selectedProjects["4"]}
            onChange={(value) => handleSelectChange("4", value)}
          >
            {getAvailableProjects("4").map((project) => (
              <Option
                key={project.number}
                value={`P${project.number} ${project.title}`}
              >
                {`P${project.number} ${project.title}`}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="technicalSkills4"
          label="Please provide the relevant technical skills that your team have that would make you suitable for the projects that you have chosen."
          labelCol={{ span: 24 }}
          wrapperCol={{ span: 24 }}
          rules={[
            { required: true, message: "Please input the technical skills!" },
          ]}
        >
          <Input.TextArea disabled={!isLeader || isSubmitted} rows={6} />
        </Form.Item>
        <Form.Item
          key={"5"}
          name="projectPreference5"
          label="Indicate project preference 5 of your group"
          labelCol={{ span: 24 }}
          wrapperCol={{ span: 24 }}
          rules={[
            {
              required: true,
              message: "Please select your fifth project preference!",
            },
          ]}
        >
          <Select
            disabled={!isLeader || isSubmitted}
            placeholder="Select a project"
            popupMatchSelectWidth={false}
            dropdownStyle={{ minWidth: 300 }}
            value={selectedProjects["5"]}
            onChange={(value) => handleSelectChange("5", value)}
          >
            {getAvailableProjects("5").map((project) => (
              <Option
                key={project.number}
                value={`P${project.number} ${project.title}`}
              >
                {`P${project.number} ${project.title}`}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="technicalSkills5"
          label="Please provide the relevant technical skills that your team have that would make you suitable for the projects that you have chosen."
          labelCol={{ span: 24 }}
          wrapperCol={{ span: 24 }}
          rules={[
            { required: true, message: "Please input the technical skills!" },
          ]}
        >
          <Input.TextArea disabled={!isLeader || isSubmitted} rows={6} />
        </Form.Item>
        <Form.Item
          key={"6"}
          name="projectPreference6"
          label="Indicate project preference 6 of your group"
          labelCol={{ span: 24 }}
          wrapperCol={{ span: 24 }}
          rules={[
            {
              required: true,
              message: "Please select your sixth project preference!",
            },
          ]}
        >
          <Select
            disabled={!isLeader || isSubmitted}
            placeholder="Select a project"
            popupMatchSelectWidth={false}
            dropdownStyle={{ minWidth: 300 }}
            value={selectedProjects["6"]}
            onChange={(value) => handleSelectChange("6", value)}
          >
            {getAvailableProjects("6").map((project) => (
              <Option
                key={project.number}
                value={`P${project.number} ${project.title}`}
              >
                {`P${project.number} ${project.title}`}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="technicalSkills6"
          label="Please provide the relevant technical skills that your team have that would make you suitable for the projects that you have chosen."
          labelCol={{ span: 24 }}
          wrapperCol={{ span: 24 }}
          rules={[
            { required: true, message: "Please input the technical skills!" },
          ]}
        >
          <Input.TextArea disabled={!isLeader || isSubmitted} rows={6} />
        </Form.Item>
        <Form.Item
          key={"7"}
          name="projectPreference7"
          label="Indicate project preference 7 of your group"
          labelCol={{ span: 24 }}
          wrapperCol={{ span: 24 }}
          rules={[
            {
              required: true,
              message: "Please select your seventh project preference!",
            },
          ]}
        >
          <Select
            disabled={!isLeader || isSubmitted}
            placeholder="Select a project"
            popupMatchSelectWidth={false}
            dropdownStyle={{ minWidth: 300 }}
            value={selectedProjects["7"]}
            onChange={(value) => handleSelectChange("7", value)}
          >
            {getAvailableProjects("7").map((project) => (
              <Option
                key={project.number}
                value={`P${project.number} ${project.title}`}
              >
                {`P${project.number} ${project.title}`}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="technicalSkills7"
          label="Please provide the relevant technical skills that your team have that would make you suitable for the projects that you have chosen."
          labelCol={{ span: 24 }}
          wrapperCol={{ span: 24 }}
          rules={[
            { required: true, message: "Please input the technical skills!" },
          ]}
        >
          <Input.TextArea disabled={!isLeader || isSubmitted} rows={6} />
        </Form.Item>
        <Form.Item
          name="programmingSkills"
          label="For Programming prerequisites, how many of your group members have taken at least one of the following courses or have equivalent experience?"
          labelCol={{ span: 24 }}
          wrapperCol={{ span: 24 }}
          rules={[
            { required: true, message: "Please select the number of members!" },
          ]}
        >
          <Text>COMP1531</Text>
          <br />
          <Text>COMP1927</Text>
          <br />
          <Text>COMP2521</Text>
          <br />
          <Text>COMP3131</Text>
          <br />
          <Text>COMP3141</Text>
          <br />
          <Text>COMP3151</Text>
          <br />
          <Text>COMP4128</Text>
          <br />
          <Text>COMP6443</Text>
          <br />
          <Text>COMP6771</Text>
          <br />
          <Text>COMP6843</Text>
          <br />
          <Text>COMP9020</Text>
          <br />
          <Text>COMP9021</Text>
          <br />
          <Radio.Group
            disabled={!isLeader || isSubmitted}
            onChange={(e) => {
              setProgrammingSkills(e.target.value);
              form.setFieldsValue({ programmingSkills: e.target.value });
            }}
            value={form.getFieldValue("programmingSkills")}
          >
            <Radio value={0}>0</Radio>
            <Radio value={1}>1</Radio>
            <Radio value={2}>2</Radio>
            <Radio value={3}>3</Radio>
            <Radio value={4}>4</Radio>
            <Radio value={5}>5</Radio>
            <Radio value={6}>6</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item
          name="frontendSkills"
          label="For UI/Frontend prerequisites, how many of your group members have taken at least one of the following courses or have equivalent experience?"
          labelCol={{ span: 24 }}
          wrapperCol={{ span: 24 }}
          rules={[
            { required: true, message: "Please select the number of members!" },
          ]}
        >
          <Text>COMP4511</Text>
          <br />
          <Text>COMP6080</Text>
          <br />
          <Radio.Group
            disabled={!isLeader || isSubmitted}
            onChange={(e) => {
              setFrontendSkills(e.target.value);
              form.setFieldsValue({ frontendSkills: e.target.value });
            }}
            value={form.getFieldValue("frontendSkills")}
          >
            <Radio value={0}>0</Radio>
            <Radio value={1}>1</Radio>
            <Radio value={2}>2</Radio>
            <Radio value={3}>3</Radio>
            <Radio value={4}>4</Radio>
            <Radio value={5}>5</Radio>
            <Radio value={6}>6</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item
          name="databaseSkills"
          label="For Database prerequisites, how many of your group members have taken at least one of the following courses or have equivalent experience?"
          labelCol={{ span: 24 }}
          wrapperCol={{ span: 24 }}
          rules={[
            { required: true, message: "Please select the number of members!" },
          ]}
        >
          <Text>COMP3311</Text>
          <br />
          <Text>COMP9312</Text>
          <br />
          <Text>COMP9313</Text>
          <br />
          <Text>COMP9315</Text>
          <br />
          <Radio.Group
            disabled={!isLeader || isSubmitted}
            onChange={(e) => {
              setDatabaseSkills(e.target.value);
              form.setFieldsValue({ databaseSkills: e.target.value });
            }}
            value={form.getFieldValue("databaseSkills")}
          >
            <Radio value={0}>0</Radio>
            <Radio value={1}>1</Radio>
            <Radio value={2}>2</Radio>
            <Radio value={3}>3</Radio>
            <Radio value={4}>4</Radio>
            <Radio value={5}>5</Radio>
            <Radio value={6}>6</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item
          name="cybersecuritySkills"
          label="For Cybersecurity prerequisites, how many of your group members have taken at least one of the following courses or have equivalent experience?"
          labelCol={{ span: 24 }}
          wrapperCol={{ span: 24 }}
          rules={[
            { required: true, message: "Please select the number of members!" },
          ]}
        >
          <Text>COMP4337</Text>
          <br />
          <Text>COMP6443</Text>
          <br />
          <Text>COMP6447</Text>
          <br />
          <Text>COMP6448</Text>
          <br />
          <Text>COMP6843</Text>
          <br />
          <Radio.Group
            disabled={!isLeader || isSubmitted}
            onChange={(e) => {
              setCybersecuritySkills(e.target.value);
              form.setFieldsValue({ cybersecuritySkills: e.target.value });
            }}
            value={form.getFieldValue("cybersecuritySkills")}
          >
            <Radio value={0}>0</Radio>
            <Radio value={1}>1</Radio>
            <Radio value={2}>2</Radio>
            <Radio value={3}>3</Radio>
            <Radio value={4}>4</Radio>
            <Radio value={5}>5</Radio>
            <Radio value={6}>6</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item
          name="aiSkills"
          label="For AI prerequisites, how many of your group members have taken at least one of the following courses or have equivalent experience?"
          labelCol={{ span: 24 }}
          wrapperCol={{ span: 24 }}
          rules={[
            { required: true, message: "Please select the number of members!" },
          ]}
        >
          <Text>COMP3411</Text>
          <br />
          <Text>COMP6713</Text>
          <br />
          <Text>COMP9417</Text>
          <br />
          <Text>COMP9418</Text>
          <br />
          <Text>COMP9444</Text>
          <br />
          <Text>COMP9491</Text>
          <br />
          <Text>COMP9517</Text>
          <br />
          <Text>COMP9727</Text>
          <br />
          <Radio.Group
            disabled={!isLeader || isSubmitted}
            onChange={(e) => {
              setAiSkills(e.target.value);
              form.setFieldsValue({ aiSkills: e.target.value });
            }}
            value={form.getFieldValue("aiSkills")}
          >
            <Radio value={0}>0</Radio>
            <Radio value={1}>1</Radio>
            <Radio value={2}>2</Radio>
            <Radio value={3}>3</Radio>
            <Radio value={4}>4</Radio>
            <Radio value={5}>5</Radio>
            <Radio value={6}>6</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item
          name="comments"
          label="Any other group comments?"
          labelCol={{ span: 24 }}
          wrapperCol={{ span: 24 }}
          rules={[{ required: true, message: "Please add some comments!" }]}
        >
          <Input.TextArea disabled={!isLeader || isSubmitted} rows={6} />
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            disabled={!isLeader || isSubmitted}
          >
            Submit Preferences
          </Button>
        </Form.Item>

        {/* <Button onClick={handleBackToGroup} type="default">
          Back to Group
        </Button> */}
        <Form.Item>
          <Button
            type="primary"
            data-cy="downloadPDF"
            icon={<DownloadOutlined />}
            size={size}
            onClick={downloadPDF}
          >
            Download as PDF
          </Button>
        </Form.Item>
      </Form>
    </>
  );
};

export default ManagePreferences;
