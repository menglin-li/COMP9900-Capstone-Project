const BASE_URL = "http://127.0.0.1:4000/chat";

// Helper functions to handle HTTP requests
const get = async (url) => {
  let token = localStorage.getItem("token");
  let response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.message || "Error occurred while making a Get request"
    );
  }
  return response.json();
};

const post = async (url, data) => {
  let token = localStorage.getItem("token");
  let response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return response.json();
};

const del = async (url, data) => {
  let token = localStorage.getItem("token");
  let response = await fetch(url, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return response.json();
};

// API functions for chat functionalities
export async function createChat(data) {
  return await post(`${BASE_URL}/create`, data);
}

export async function getUserChats() {
  return await get(`${BASE_URL}/get-chats`);
}

export async function inviteMembersToChat(chatId, newMembers) {
  return await post(`${BASE_URL}/invite-members`, { chatId, newMembers });
}

export async function leaveChat(chatId) {
  return await post(`${BASE_URL}/leave-chat`, { chatId });
}

export async function dismissChat(chatId) {
  return await del(`${BASE_URL}/dismiss-chat`, { chatId });
}

export async function getUsersNotInChat(chatId) {
  return await get(`${BASE_URL}/${chatId}/excluded-users`);
}

export async function getChatById(chatId) {
  return await get(`${BASE_URL}/${chatId}`);
}
