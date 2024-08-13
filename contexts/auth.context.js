import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import * as SecureStore from "expo-secure-store";
import api from "../api/api";

const AuthContext = createContext({
  isAuthenticated: false,
  user: {},
  splashScreen: true,
  login: () => {},
  authenticate: () => {},
  logout: () => {},
  register: () => {},
});

const saveToken = async (token) => {
  try {
    await SecureStore.setItemAsync("authToken", token);
  } catch (error) {
    console.error("Failed to save the token to secure storage:", error);
  }
};

const getToken = async () => {
  try {
    const token = await SecureStore.getItemAsync("authToken");
    return token;
  } catch (error) {
    console.error("Failed to load the token from secure storage:", error);
    return null;
  }
};

const removeToken = async () => {
  try {
    await SecureStore.deleteItemAsync("authToken");
  } catch (error) {
    console.error("Failed to remove the token from secure storage:", error);
  }
};

export const AuthContextProvider = ({ children }) => {
  const [splashScreen, setSplashScreen] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = useCallback(
    async (email, password) => {
      setLoading(true);
      console.log("SENDING LOGIN REQ: ", email, " - ", password);
      const { ok, data } = await api.post(
        "auth/login",
        {},
        { email, password }
      );

      if (ok) {
        setIsAuthenticated(true);
        setUser(data);
        saveToken(data.token);
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
      setLoading(false);
    },
    [setIsAuthenticated, setUser]
  );

  const register = useCallback(
    async (email, password) => {
      setLoading(true);
      console.log("SENDING REGISTER REQ: ", email, " - ", password);
      const { ok, data } = await api.post(
        "auth/register",
        {},
        {
          email,
          password,
        }
      );
      if (ok) {
        setIsAuthenticated(true);
        setUser(data);
        saveToken(data.token);
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
      setLoading(false);
    },
    [setIsAuthenticated, setUser]
  );

  const logout = useCallback(async () => {
    setLoading(true);
    setIsAuthenticated(false);
    setUser(null);
    await removeToken();
    setLoading(false);
  }, [setIsAuthenticated]);

  const authenticate = async () => {
    setLoading(true);
    const token = await getToken();
    if (token) {
      const { ok, data } = await api.get("auth");
      if (ok) {
        setIsAuthenticated(true);
        setUser(data);
        setSplashScreen(false);
      } else {
        setIsAuthenticated(false);
        setUser(null);
        setSplashScreen(false);
      }
    } else {
      setIsAuthenticated(false);
      setUser(null);
      setSplashScreen(false);
    }

    setLoading(false);
  };

  useEffect(() => {
    authenticate();

    api.api.interceptors.response.use(
      function (response) {
        return response;
      },
      function (error) {
        if (error.response.status == "403") {
          console.log("STATUS IS 403");
          setIsAuthenticated(false);
          setUser(null);
          removeToken();
        }

        return Promise.reject(error);
      }
    );
  }, []);

  const value = useMemo(
    () => ({
      splashScreen,
      user,
      isAuthenticated,
      authenticate,
      login,
      logout,
      register,
      loading,
    }),
    [
      splashScreen,
      user,
      isAuthenticated,
      authenticate,
      login,
      logout,
      register,
      loading,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuthContext() {
  return useContext(AuthContext);
}
