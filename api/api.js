import axios from "axios";
import * as SecureStore from "expo-secure-store";

const api = axios.create({
  baseURL: "http://192.168.1.103:3000",
  validateStatus: (status) => {
    return status >= 200 && status < 300;
  },
});

api.interceptors.request.use(
  function (config) {
    config.headers["authorization"] = SecureStore.getItem("authToken");
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

async function request(endpoint, method, query, body) {
  try {
    const response = await api({
      method,
      url: endpoint,
      params: query,
      data: body,
    });
    return { ok: true, data: response.data };
  } catch (err) {
    return { ok: false, data: err.data };
  }
}

function get(endpoint, query, body) {
  return request(endpoint, "get", query, body);
}

function post(endpoint, query, body) {
  return request(endpoint, "post", query, body);
}

function del(endpoint, query, body) {
  return request(endpoint, "delete", query, body);
}

function put(endpoint, query, body) {
  return request(endpoint, "put", query, body);
}

export default { get, post, del, put, api };
