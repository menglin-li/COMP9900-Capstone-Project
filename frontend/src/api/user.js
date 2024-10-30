import {message} from "antd"
const BASE_URL = "http://127.0.0.1:4000"

const post = (url, data, flag) => {
    return http(url, data, flag, 'POST')
}
const patch = (url, data, flag) => {
    return http(url, data, flag, 'PATCH')
}
const get = (url, data, flag) => {
    return http(url, data, flag, 'GET')
}
const http = async (url, data, flag, method) => {
    let token = ""
    //判断接口是否需要 token
    if (flag) {
        let user = localStorage.getItem('user');
        if (!user) {
            // 如果没有 Token，可以选择抛出错误或重定向到登录页面
            console.log('No token found, redirecting to login...');
            // 这里可以选择抛出一个错误或者直接调用重定向逻辑
            throw new Error('No token found. Please login again.');
        }
        token = JSON.parse(user).token
    }

    let headers = {
        "Content-Type": "application/json",
    }
    if (token) {
        headers['Authorization'] = `Bearer ${token}`
    }

    let retval = await fetch(url, {
        method: method,
        headers: headers,
        body: data ? JSON.stringify(data) : null,
    });
    // if (!retval.ok) {
    //     let error = await retval.json();
    //     if (retval.status === 404) {
    //         // 特别处理404错误
    //         alert("User not Found!");
    //         throw new Error("Requested resource not found.");
    //     }
    //     alert(error.message || "An error occurred");
    //     throw new Error(error.message || "Network response was not ok");
    // }
    if (retval.status == 409) {
        message.warning("Registration failed, the email has already been used");
        throw error("Registration failed, the email has already been used");
    }
    let json = await retval.json()
    if (json.error) {
        message.warning(json.error);
        throw error(json.error);
    }
    return json;
}

export function profile(userId) {
    return get(`${BASE_URL}/user/${userId}`, null, true)
}

export function updateProfile(userId, data) {
    return patch(`${BASE_URL}/user/${userId}`, data, true);
}

export function login(data) {
    return post(`${BASE_URL}/user/login`, data, false);
}

export function getUsers() {
    return get(`${BASE_URL}/user`, null, true);
}

/**
 * 
 * 
 * @param {*} params 
 * @returns 
 */
export async function reg(data) {
    let retval = post(`${BASE_URL}/user`, data, false)
    return retval;
}

