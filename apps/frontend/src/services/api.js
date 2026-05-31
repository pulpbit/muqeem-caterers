const PRODUCTION_API = 'https://muqeem-caterers.pulpbit.workers.dev/api';
const DEV_API = '/api';

const isProduction = window.location.hostname !== 'localhost'
  && window.location.hostname !== '127.0.0.1'
  && !window.location.hostname.includes('.local');

const API_BASE = isProduction ? PRODUCTION_API : DEV_API;

/**
 * Base API client with error handling.
 * Sends cookies (HttpOnly session) automatically via credentials: 'include'.
 */
async function request(method, path, body = null) {
  const url = `${API_BASE}${path}`;
  const options = {
    method,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  if (body && method !== 'GET') {
    options.body = JSON.stringify(body);
  }

  try {
    const res = await fetch(url, options);
    const data = await res.json();

    if (!res.ok) {
      throw new ApiError(data.error || 'Request failed', res.status);
    }

    return data;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError('Network error. Please check your connection.', 0);
  }
}

export class ApiError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
  }
}

export const api = {
  get(path) {
    return request('GET', path);
  },
  post(path, body) {
    return request('POST', path, body);
  },
  put(path, body) {
    return request('PUT', path, body);
  },
  patch(path, body) {
    return request('PATCH', path, body);
  },
  delete(path) {
    return request('DELETE', path);
  },

  health() {
    return this.get('/health');
  }
};
