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

// 获取所有未批准的 Tutors
export async function getPendingTutors() {
  let retval = await get(`${BASE_URL}/coordinator/pendingTutors`);
  return retval;
}

// 批准 Tutor
export async function approveTutor(id) {
  let retval = await put(`${BASE_URL}/coordinator/approveTutor/${id}`);
  return retval;
}

// 删除未批准的 Tutor
export async function deleteTutor(id) {
  let retval = await deletemethod(`${BASE_URL}/coordinator/deleteTutor/${id}`);
  return retval;
}
