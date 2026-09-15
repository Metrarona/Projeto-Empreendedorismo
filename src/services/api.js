import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://api.exemplo.com',
  timeout: 10000,
});

// Interceptador: Adiciona o Header Authorization em cada requisição
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptador: Trata respostas e expiração do Token JWT (Status 401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expirado ou inválido: limpa o storage e envia de volta ao login
      logoutUser();
    }
    return Promise.reject(error);
  }
);

// Função de Logout com revogação local
export const logoutUser = () => {
  localStorage.removeItem('token');
  window.location.href = '/';
};

export default api;