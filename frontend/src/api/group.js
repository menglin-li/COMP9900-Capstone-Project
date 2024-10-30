const BASE_URL = "http://127.0.0.1:4000"

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

const get = async (url) => {
  let token = localStorage.getItem('token')
  
  let retval = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    }
  })
  if (!retval.ok) {
    const errorData = await retval.json(); // 解析错误信息
    throw new Error(errorData.message || 'Error occurred while making a GET request');
  }
  let json = await retval.json()
  return json;
}

const deletemethod = async (url) => {
  let token = localStorage.getItem('token')

  let retval = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    }
  })
  let json = await retval.json()
  return json;
}

const patch = async (url, data) => {
  let token = localStorage.getItem('token')

  let retval = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })
  let json = await retval.json()
  return json;
}

export async function joinGroup(data) {
  try {
    let retval = await post(`${BASE_URL}/group/join`, data);
    return retval;
  } catch (err) {
    throw err;
  }
}

export async function createGroup(data) {
  let retval = await post(`${BASE_URL}/group`, data);
  return retval;
}

export async function getAllGroup() {
  let retval = await get(`${BASE_URL}/group`);
  return retval;
}

export async function getGroupById(teamID) {
  let retval = await get(`${BASE_URL}/group/${teamID}`);
  return retval;
}

export async function deleteMember(teamId, userId) {
  let retval = await deletemethod(`${BASE_URL}/group/${teamId}/${userId}`);
  return retval;
}

export async function updateGroup(teamId, data) {
  let retval = await patch(`${BASE_URL}/group/${teamId}`, data);
  return retval;
}

export async function updateGroupPreference(teamId, data) {
  let retval = await patch(`${BASE_URL}/group/${teamId}/preferences`, data);
  return retval;
}

export async function assignGroupToProj(teamId, data) {
  let retval = await patch(`${BASE_URL}/group/${teamId}/assignGroupToProject`, data);
  return retval;
}