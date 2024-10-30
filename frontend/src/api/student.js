const BASE_URL = "http://127.0.0.1:4000"


const get = async (url) => {
  let token = localStorage.getItem('token')
  console.log(token)

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

export async function getAllStudent() {
  let retval = await get(`${BASE_URL}/student`);
  return retval;
}


export async function getStudentById(userId) {
  let retval = await get(`${BASE_URL}/student/${userId}`);
  return retval;
}