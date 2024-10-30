const BASE_URL = "http://127.0.0.1:4000"

const get = async (url) => {
  let token = localStorage.getItem('token');

  let retval = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    }
  });
  let json = await retval.json();
  return json;
}

const put = async (url) => {
  let token = localStorage.getItem('token');

  let retval = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    }
  });
  let json = await retval.json();
  return json;
}

const patch = async (url, data, flag) => {
  let token = localStorage.getItem('token');

  let retval = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: data ? JSON.stringify(data) : null,
  });

  let json = await retval.json();
  return json;
};

const deletemethod = async (url) => {
  let token = localStorage.getItem('token');

  let retval = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    }
  });
  let json = await retval.json();
  return json;
}

// 获取所有待批准的 tutors 和 coordinators
export async function getPendingUsers() {
  let retval = await get(`${BASE_URL}/admin/pendingUsers`);
  return retval;
}

// 批准 tutor 或 coordinator
export async function approveUser(id) {
  let retval = await put(`${BASE_URL}/admin/approveUser/${id}`);
  return retval;
}

// 删除用户
export async function deleteUser(id) {
  let retval = await deletemethod(`${BASE_URL}/admin/deleteUser/${id}`);
  return retval;
}

export async function approveProject(id) {
  let retval = await put(`${BASE_URL}/admin/approveProject/${id}`);
  return retval;
}

export async function dismissProject(id) {
  let retval = await put(`${BASE_URL}/admin/dismissProject/${id}`);
  return retval;
}

export async function signSupervisor(data) {
  let retval = await patch(`${BASE_URL}/admin/signSupervisor`, data, true);
  return retval;
}