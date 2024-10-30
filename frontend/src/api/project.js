const BASE_URL = "http://127.0.0.1:4000";

// Helper function to handle GET requests
const get = async (url) => {
    console.log(url);
    let token = localStorage.getItem('token');
    console.log(token);
    let retval = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        }
    });
    if (!retval.ok) {
        const errorData = await retval.json(); // 解析错误信息
        throw new Error(errorData.message || 'Error occurred while making a Get request');
      }
    let json = await retval.json();
    console.log(json);
    return json;
};

// Helper function to handle POST requests
const post = async (url, data) => {
    let token = localStorage.getItem('token');
    let retval = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data),
    });
    let json = await retval.json();
    return json;
};

// Helper function to handle PUT requests
const put = async (url, data) => {
    let token = localStorage.getItem('token');
    let retval = await fetch(url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });
    let json = await retval.json();
    return json;
};

// Helper function to handle DELETE requests
const del = async (url) => {
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
};

// Get all projects
export async function getAllProjects() {
    let retval = await get(`${BASE_URL}/project`);
    return retval;
}

// Get a single project by ID
export async function getProjectById(id) {
    let retval = await get(`${BASE_URL}/project/${id}`);
    return retval;
}

export async function getProjectByNumber(number) {
    let retval = await get(`${BASE_URL}/project/number/${number}`);
    return retval;
}

// Create a new project
export async function createProject(data) {
    let retval = await post(`${BASE_URL}/project`, data);
    return retval;
}

// Update a project by number
export async function updateProject(number, data) {
    let retval = await put(`${BASE_URL}/project/${number}`, data);
    return retval;
}

// Delete a project by number
export async function deleteProject(number) {
    let retval = await del(`${BASE_URL}/project/${number}`);
    return retval;
}
