const BASE_URL = "http://127.0.0.1:4000"

const get = async (url) => {
  let token = localStorage.getItem('token')
  
  let retval = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    }
  })
  let json = await retval.json()
  return json;
}

  const post = async (url, data) => {
    let token = localStorage.getItem('token')
  
    let retval = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });
    if (!retval.ok) {
      const errorData = await retval.json(); // 解析错误信息
      throw new Error(errorData.message || 'Error occurred while making a POST request');
    }
    let json = await retval.json()
    return json;
  }

  export async function getNotification(id) {
    let retval = await get(`${BASE_URL}/notification/notifications/${id}`);
    // if (!Array.isArray(retval)) {
    //   throw new Error('Fetched data is not an array');
    // }
    return retval;
  }

  export const markAllNotificationsAsRead = async (userId) => {
    return await post(`${BASE_URL}/notification/notifications/${ userId }`);
  };