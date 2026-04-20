import axios from "axios";

const authApiInstance = axios.create({
    baseURL: "/api/auth",
    withCredentials: true,
})
authApiInstance.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;

    if (
      err.response?.status === 401 &&
      err.response?.data?.message === "TOKEN_EXPIRED" &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        await axios.post("/api/auth/refresh-token", {}, {
          withCredentials: true
        });
        return authApiInstance(originalRequest);
      } catch (refreshError) {
        console.log("Refresh failed → logout");
        window.location.href = "/login";
      }
    }

    return Promise.reject(err);
  }
);

export const register = async ({ email, contact, password, fullname, isSeller  })=>{
    const res = await authApiInstance.post('/register', {email, contact, password,fullname, isSeller  })
    return res.data
}
export const login = async ({email, password,})=>{
    const res = await authApiInstance.post('/login', { email, password })
    return res.data
}

export const getMe = async () => {
    const res = await authApiInstance.get('/me'); 
    return res.data;
};

// export async function register({ email, contact, password, fullname, isSeller }) {

//     const response = await authApiInstance.post("/register", {
//         email,
//         contact,
//         password,
//         fullname,
//         isSeller
//     })
//     return response.data
// }

// export async function login({ email, password }) {
//     const response = await authApiInstance.post("/login", {
//         email, password
//     })

//     return response.data
// }