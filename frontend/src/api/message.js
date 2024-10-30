const BASE_URL = "http://127.0.0.1:4000/message";

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
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.message || "Error occurred while making a Post request"
    );
  }
  return response.json();
};

// API functions for message functionalities
export async function createMessage(chatId, senderId, content) {
  return await post(`${BASE_URL}/`, { chatId, senderId, content });
}

export async function getMessages(chatId) {
  return await get(`${BASE_URL}/${chatId}`);
}
