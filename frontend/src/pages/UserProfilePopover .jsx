import React from "react";
import { Avatar } from "antd";

const userProfilePopover = ({ user }) => {
  const firstName = user?.firstName || "";
  const lastName = user?.lastName || "";
  const roleType = user?.role_type || "";
  const email = user?.email || "";
  const background = user?.background || "";

  const formattedRoleType = roleType
    ? roleType.charAt(0).toUpperCase() + roleType.slice(1)
    : "N/A";

  const avatarSource = user?.avatar;
  const initials = firstName ? firstName[0].toUpperCase() : "?";

  let backgroundInfo = "";
  if (roleType.toLowerCase() === "student" && background) {
    backgroundInfo = `${
      background.charAt(0).toUpperCase() + background.slice(1)
    }`;
  }

  return (
    <div style={{ display: "flex", alignItems: "center", padding: 10 }}>
      <Avatar
        style={{
          backgroundColor: avatarSource ? undefined : "#1890ff",
          verticalAlign: "middle",
        }}
        size={64}
      >
        {avatarSource ? (
          <img src={avatarSource} alt={`${firstName} ${lastName}`} />
        ) : (
          initials
        )}
      </Avatar>
      <div style={{ marginLeft: 16 }}>
        <strong>
          {firstName} {lastName}
        </strong>
        <div>
          {backgroundInfo && <div>{backgroundInfo}</div>} {formattedRoleType}
        </div>
        {email && <div>Email: {email}</div>}
      </div>
    </div>
  );
};

export default userProfilePopover;
