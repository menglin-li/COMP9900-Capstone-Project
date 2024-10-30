import React from "react";
import { useNavigate } from "react-router-dom";
import { Result, Button } from "antd";

const withRoleProtection = (WrappedComponent, allowedRoles) => {
  return (props) => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user"));

    // Check if the user is logged in
    if (!user) {
      return (
        <Result
          status="warning"
          title="You need to login to access this page."
          extra={
            <Button type="primary" onClick={() => navigate("/login")}>
              Go to Login
            </Button>
          }
        />
      );
    }

    // Check if the user's role is in the allowed roles list
    if (!allowedRoles.includes(user.user.role_type)) {
      const redirectTo = `/${user.user.role_type}/dashboard`;
      return (
        <Result
          status="403"
          title="Sorry, you are not authorized to access this page."
          extra={
            <Button type="primary" onClick={() => navigate(redirectTo)}>
              Back to Dashboard
            </Button>
          }
        />
      );
    }

    // Check if specific roles' accounts are pending approval
    if (
      ["tutor", "coordinator", "client"].includes(user.user.role_type) &&
      user.user.status === false
    ) {
      return (
        <Result
          status="500"
          title="Your account is still pending approval."
          extra={
            <Button type="primary" onClick={() => navigate("/")}>
              Back to Homepage
            </Button>
          }
        />
      );
    }

    return <WrappedComponent {...props} />;
  };
};

export default withRoleProtection;
