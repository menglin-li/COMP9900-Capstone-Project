import React, { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { message } from "antd";
import { ConfigProvider } from "antd";

function BaseLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  window.message = messageApi;

  // let href = window.location.href
  // alert(href)

  useEffect(() => {
    auth();
  }, [location, navigate]);

  const auth = () => {
    const user = localStorage.getItem("user");
    let path = location.pathname.toLowerCase();

    if (user) {
      // 用户已登录
      if (path === "/loginpage" || path === "/reg" || path === "/home") {
        window.location.href = "/dashboard";
        // navigate("/dashboard");
        return;
      }

      let info = JSON.parse(user);
      if (
        !info.user.status &&
        (path == "/teamlistpage" || path == "/profile")
      ) {
        // window.location.href = "/dashboard";
        navigate("/dashboard");
        return;
      }
    } else {
      // 用户未登录
      if (path !== "/home") {
        window.location.href = "/Home";
        // navigate("/LoginPage");
      }
    }
  };

  auth();

  return (
    <ConfigProvider>
      {contextHolder} <Outlet />
    </ConfigProvider>
  );
}

export default BaseLayout;
