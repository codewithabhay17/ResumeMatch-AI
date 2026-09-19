import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/*
 * Axios API client
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
});

/*
 * Add JWT token to every request
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log(
      "API REQUEST:",
      config.method?.toUpperCase(),
      config.baseURL + config.url
    );

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/*
 * Response interceptor
 *
 * IMPORTANT:
 * Do NOT automatically redirect to /login here.
 *
 * AuthContext / ProtectedRoute is responsible
 * for authentication state.
 */
apiClient.interceptors.response.use(
  (response) => {
    console.log(
      "API RESPONSE:",
      response.status,
      response.config?.url
    );

    return response;
  },

  (error) => {
    console.error(
      "API ERROR:",
      error.response?.status,
      error.config?.url,
      error.response?.data || error.message
    );

    /*
     * Don't delete the token here.
     *
     * A 401 from a particular API request should not
     * immediately destroy the whole frontend session.
     */
    return Promise.reject(error);
  }
);


/* =========================================================
   AUTH API
========================================================= */

export const authAPI = {
  register: (
    email,
    name,
    password,
    confirmPassword
  ) =>
    apiClient.post("/auth/register", {
      email,
      name,
      password,
      confirmPassword,
    }),

  login: (email, password) =>
    apiClient.post("/auth/login", {
      email,
      password,
    }),

  getProfile: () =>
    apiClient.get("/auth/profile"),
};


/* =========================================================
   RESUME API
========================================================= */

export const resumeAPI = {

  upload: (file, onUploadProgress) => {
    const formData = new FormData();

    formData.append("resume", file);

    return apiClient.post(
      "/resumes/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },

        onUploadProgress: (event) => {
          if (
            onUploadProgress &&
            event.total
          ) {
            const progress = Math.round(
              (event.loaded * 100) /
                event.total
            );

            onUploadProgress(progress);
          }
        },
      }
    );
  },

  getAll: () =>
    apiClient.get("/resumes"),

  getById: (resumeId) =>
    apiClient.get(
      `/resumes/${resumeId}`
    ),

  delete: (resumeId) =>
    apiClient.delete(
      `/resumes/${resumeId}`
    ),

  analyzeAI: (resumeId) =>
    apiClient.post(
      `/resumes/${resumeId}/analyze-ai`
    ),

  improve: (resumeId, jobDescription) =>
    apiClient.post(
      `/resumes/${resumeId}/improve`,
      { jobDescription }
    ),

  humanize: (resumeId) =>
    apiClient.post(
      `/resumes/${resumeId}/humanize`
    ),
};


/* =========================================================
   CAREER ADVISOR API
========================================================= */

export const careerAdvisorAPI = {
  get: (resumeId) => apiClient.get(`/career-advisor/${resumeId}`),
  analyze: (resumeId) => apiClient.post(`/career-advisor/analyze/${resumeId}`),
  regenerate: (resumeId) => apiClient.post(`/career-advisor/regenerate/${resumeId}`),
};


/* =========================================================
   JOB API
========================================================= */

export const jobAPI = {

  getAll: (
    limit = 20,
    offset = 0
  ) =>
    apiClient.get("/jobs", {
      params: {
        limit,
        offset,
      },
    }),

  getById: (jobId) =>
    apiClient.get(
      `/jobs/${jobId}`
    ),

  search: (
    query,
    limit = 20,
    offset = 0
  ) =>
    apiClient.get("/jobs/search", {
      params: {
        q: query,
        limit,
        offset,
      },
    }),

  create: (jobData) =>
    apiClient.post(
      "/jobs",
      jobData
    ),
};


/* =========================================================
   MATCH API
========================================================= */

export const matchAPI = {

  getAll: (
    limit = 20,
    offset = 0
  ) =>
    apiClient.get("/matches", {
      params: {
        limit,
        offset,
      },
    }),

  getById: (matchId) =>
    apiClient.get(
      `/matches/${matchId}`
    ),

  calculate: (
    resumeId,
    jobId
  ) =>
    apiClient.post(
      "/matches/calculate",
      {
        resumeId,
        jobId,
      }
    ),

  updateStatus: (
    matchId,
    status
  ) =>
    apiClient.patch(
      `/matches/${matchId}/status`,
      {
        status,
      }
    ),

  generateAIAnalysis: (
    matchId,
    resumeId
  ) =>
    apiClient.post(
      `/matches/${matchId}/ai-analysis`,
      {
        resumeId,
      }
    ),
};
/* =========================================================
   REVIEW API
========================================================= */

export const reviewAPI = {
  getAll: () =>
    apiClient.get("/reviews"),

  create: (rating, comment, userName) =>
    apiClient.post("/reviews", {
      rating,
      comment,
      userName,
    }),

  delete: (reviewId) =>
    apiClient.delete(`/reviews/${reviewId}`),
};


export default apiClient;