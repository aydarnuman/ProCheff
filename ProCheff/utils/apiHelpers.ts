/**
 * API istekleri için yardımcı fonksiyonlar
 */

import axios, { AxiosResponse, AxiosError } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Axios instance oluştur
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - token ekleme
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - hata yönetimi
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token süresi dolmuş, kullanıcıyı login sayfasına yönlendir
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export { apiClient };

// API yardımcı fonksiyonları
export const apiHelpers = {
  // GET request
  get: async <T>(endpoint: string): Promise<T> => {
    const response = await apiClient.get<T>(endpoint);
    return response.data;
  },

  // POST request
  post: async <T, D = any>(endpoint: string, data?: D): Promise<T> => {
    const response = await apiClient.post<T>(endpoint, data);
    return response.data;
  },

  // PUT request
  put: async <T, D = any>(endpoint: string, data?: D): Promise<T> => {
    const response = await apiClient.put<T>(endpoint, data);
    return response.data;
  },

  // DELETE request
  delete: async <T>(endpoint: string): Promise<T> => {
    const response = await apiClient.delete<T>(endpoint);
    return response.data;
  },

  // File upload
  uploadFile: async (endpoint: string, file: File, onProgress?: (progress: number) => void): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });

    return response.data;
  },
};

// Hata mesajlarını biçimlendirme
export const formatApiError = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error.message) {
    return error.message;
  }
  
  return 'Bir hata oluştu. Lütfen tekrar deneyin.';
};

// Loading state yönetimi için utility
export const createAsyncHandler = <T extends any[], R>(
  asyncFn: (...args: T) => Promise<R>
) => {
  return async (...args: T): Promise<{ data: R | null; error: string | null }> => {
    try {
      const data = await asyncFn(...args);
      return { data, error: null };
    } catch (error) {
      return { data: null, error: formatApiError(error) };
    }
  };
};