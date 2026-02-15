const API_BASE_URL = "http://localhost:5000/api";

// Store token in localStorage
const getToken = () => localStorage.getItem('placement_prep_token');

// Set token
const setToken = (token) => localStorage.setItem('placement_prep_token', token);

// Remove token
const removeToken = () => localStorage.removeItem('placement_prep_token');

// Generic fetch with auth
const fetchWithAuth = async (url, options = {}) => {
  const token = getToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });
  
  if (response.status === 401) {
    // Token expired or invalid
    removeToken();
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }
  
  return response.json();
};

// Auth API
export const authAPI = {
  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    if (data.success && data.data.token) {
      setToken(data.data.token);
    }
    return data;
  },
  
  register: async (name, email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    
    const data = await response.json();
    if (data.success && data.data.token) {
      setToken(data.data.token);
    }
    return data;
  },
  
  demoLogin: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/demo-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    const data = await response.json();
    if (data.success && data.data.token) {
      setToken(data.data.token);
    }
    return data;
  },
  
  logout: () => {
    removeToken();
  }
};

// Progress API
export const progressAPI = {
  getProgress: () => fetchWithAuth('/progress'),
  
  recordTest: (testData) => fetchWithAuth('/progress/test', {
    method: 'POST',
    body: JSON.stringify(testData)
  }),
  
  updateSkill: (skillName, proficiency) => fetchWithAuth('/progress/skill', {
    method: 'PUT',
    body: JSON.stringify({ skillName, proficiency })
  }),
  
  getAnalytics: (timeRange) => fetchWithAuth(`/progress/analytics?timeRange=${timeRange}`),
  
  getHistory: (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return fetchWithAuth(`/progress/history?${params}`);
  },
  
  getInsights: () => fetchWithAuth('/progress/insights')
};