import { createContext, useContext, useEffect, useState } from "react";
import apiClient from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Get saved authentication data
  const [token, setToken] = useState(() => {
    return localStorage.getItem("token");
  });

  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      console.error("Failed to read saved user:", error);
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  /*
   * Fetch the logged-in user's profile
   */
  const fetchProfile = async (authToken) => {
    try {
      const response = await apiClient.get(
        `/auth/profile?t=${Date.now()}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        }
      );

      console.log("PROFILE RESPONSE:", response.data);

      const userData = response.data?.data?.user;

      if (userData) {
        setUser(userData);

        // Keep user information synchronized
        localStorage.setItem("user", JSON.stringify(userData));
      }

      return userData;
    } catch (error) {
      console.error(
        "PROFILE ERROR:",
        error.response?.status,
        error.response?.data || error.message
      );

      /*
       * IMPORTANT:
       * Only logout when backend says the JWT is invalid.
       *
       * 304, 500, network errors, etc. should NOT
       * immediately destroy the user's login session.
       */
      if (error.response?.status === 401) {
        logout();
      }

      return null;
    }
  };

  /*
   * Initialize authentication when app starts
   */
  useEffect(() => {
    const initializeAuth = async () => {
      if (!token) {
        delete apiClient.defaults.headers.common["Authorization"];
        setLoading(false);
        return;
      }

      // Set Authorization header
      apiClient.defaults.headers.common["Authorization"] =
        `Bearer ${token}`;

      // If user exists in localStorage, keep it immediately
      const savedUser = localStorage.getItem("user");

      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (error) {
          console.error("Invalid saved user:", error);
        }
      }

      // Verify token with backend
      await fetchProfile(token);

      setLoading(false);
    };

    initializeAuth();
  }, [token]);

  /*
   * LOGIN
   */
  const login = async (email, password) => {
    try {
      console.log("LOGIN STARTED");

      const response = await apiClient.post(
        `/auth/login`,
        {
          email: email.trim(),
          password,
        }
      );

      console.log("LOGIN RESPONSE:", response.data);

      /*
       * Check backend response
       */
      if (
        !response.data ||
        response.data.status !== "success" ||
        !response.data.data
      ) {
        throw new Error(
          response.data?.message || "Login failed"
        );
      }

      /*
       * Get token and user
       */
      const {
        token: newToken,
        user: userData,
      } = response.data.data;

      /*
       * Make sure JWT exists
       */
      if (!newToken) {
        throw new Error(
          "Authentication token was not received from server"
        );
      }

      /*
       * Save authentication data
       */
      localStorage.setItem("token", newToken);

      if (userData) {
        localStorage.setItem(
          "user",
          JSON.stringify(userData)
        );
      }

      /*
       * Update React state
       */
      setToken(newToken);
      setUser(userData || null);

      /*
       * Set Axios Authorization header immediately
       */
      apiClient.defaults.headers.common["Authorization"] =
        `Bearer ${newToken}`;

      console.log("TOKEN SAVED");
      console.log("USER SAVED:", userData);
      console.log("AUTHENTICATION SUCCESSFUL");

      return response.data;
    } catch (error) {
      console.error(
        "LOGIN ERROR:",
        error.response?.data || error.message
      );

      /*
       * Only clear authentication if backend
       * explicitly says credentials/token are invalid.
       */
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        delete apiClient.defaults.headers.common[
          "Authorization"
        ];

        setToken(null);
        setUser(null);
      }

      throw error;
    }
  };

  /*
   * REGISTER
   */
  const register = async (
    name,
    email,
    password,
    confirmPassword
  ) => {
    try {
      console.log("REGISTRATION STARTED");

      const response = await apiClient.post(
        `/auth/register`,
        {
          name: name.trim(),
          email: email.trim(),
          password,
          confirmPassword,
        }
      );

      console.log(
        "REGISTER RESPONSE:",
        response.data
      );

      if (
        !response.data ||
        response.data.status !== "success" ||
        !response.data.data
      ) {
        throw new Error(
          response.data?.message ||
            "Registration failed"
        );
      }

      const {
        token: newToken,
        user: userData,
      } = response.data.data;

      /*
       * Save token if backend returns one
       */
      if (newToken) {
        localStorage.setItem(
          "token",
          newToken
        );

        setToken(newToken);

        apiClient.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${newToken}`;
      }

      /*
       * Save user
       */
      if (userData) {
        localStorage.setItem(
          "user",
          JSON.stringify(userData)
        );

        setUser(userData);
      }

      console.log("REGISTRATION SUCCESSFUL");

      return response.data;
    } catch (error) {
      console.error(
        "REGISTER ERROR:",
        error.response?.data || error.message
      );

      throw error;
    }
  };

  /*
   * LOGOUT
   */
  const logout = () => {
    console.log("LOGOUT");

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    delete apiClient.defaults.headers.common[
      "Authorization"
    ];

    setToken(null);
    setUser(null);
  };

  /*
   * Authentication state
   *
   * IMPORTANT:
   * Use token instead of !!user.
   *
   * During profile loading, user can temporarily be null
   * even though the JWT is valid.
   */
  const isAuthenticated = Boolean(token);

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/*
 * useAuth Hook
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used within an AuthProvider"
    );
  }

  return context;
}

export default AuthContext;