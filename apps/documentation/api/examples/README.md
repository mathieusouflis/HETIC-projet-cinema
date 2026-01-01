---
description: Practical code examples and implementation patterns for the Cinema API
---

# Examples

This section provides practical, real-world examples of how to use the Cinema API effectively. Whether you're building a frontend application, testing endpoints, or implementing specific features, these examples will help you get started quickly.

## 🎯 Example Categories

### Authentication & Authorization
- **[Authentication Flow](authentication-flow.md)** - Complete auth implementation
- **Token Management** - Handle JWT tokens properly
- **Protected Routes** - Secure API endpoints

### User Management
- **[User Management](user-management.md)** - CRUD operations for users
- **Profile Updates** - Handle user profile changes
- **User Search** - Implement user discovery

### Common Patterns
- **[Common Patterns](common-patterns.md)** - Reusable implementation patterns
- **Error Handling** - Robust error management
- **Pagination** - Handle large datasets
- **File Uploads** - Avatar and media handling

## 🚀 Quick Examples

### Basic Authentication
```javascript
// Register a new user
const registerUser = async (userData) => {
  const response = await fetch('/api/v1/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    throw new Error('Registration failed');
  }

  const data = await response.json();
  return data;
};

// Usage
try {
  const result = await registerUser({
    email: 'user@example.com',
    username: 'johndoe',
    password: 'SecurePass123'
  });
  
  console.log('User registered:', result.data.user);
  // Store tokens securely
  localStorage.setItem('accessToken', result.data.tokens.accessToken);
  localStorage.setItem('refreshToken', result.data.tokens.refreshToken);
} catch (error) {
  console.error('Registration error:', error.message);
}
```

### Authenticated Requests
```javascript
// Create an authenticated fetch wrapper
const authenticatedFetch = async (url, options = {}) => {
  const token = localStorage.getItem('accessToken');
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  // Handle token expiration
  if (response.status === 401) {
    const newToken = await refreshToken();
    if (newToken) {
      // Retry with new token
      return authenticatedFetch(url, options);
    } else {
      // Redirect to login
      window.location.href = '/login';
      return;
    }
  }

  return response;
};

// Get current user profile
const getCurrentUser = async () => {
  const response = await authenticatedFetch('/api/v1/users/me');
  return response.json();
};
```

### Token Refresh Implementation
```javascript
const refreshToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  
  if (!refreshToken) {
    return null;
  }

  try {
    const response = await fetch('/api/v1/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('accessToken', data.data.accessToken);
      localStorage.setItem('refreshToken', data.data.refreshToken);
      return data.data.accessToken;
    } else {
      // Refresh token expired
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      return null;
    }
  } catch (error) {
    console.error('Token refresh failed:', error);
    return null;
  }
};
```

## 📱 Frontend Integration Examples

### React Hook for Authentication
```javascript
import { useState, useEffect, createContext, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      getCurrentUser()
        .then(response => response.json())
        .then(data => {
          setUser(data.data);
        })
        .catch(() => {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    const response = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('accessToken', data.data.tokens.accessToken);
      localStorage.setItem('refreshToken', data.data.tokens.refreshToken);
      setUser(data.data.user);
      return data.data.user;
    } else {
      throw new Error('Login failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

### Vue.js Composable
```javascript
import { ref, computed } from 'vue';

const user = ref(null);
const loading = ref(false);

export const useAuth = () => {
  const isAuthenticated = computed(() => !!user.value);

  const login = async (credentials) => {
    loading.value = true;
    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('accessToken', data.data.tokens.accessToken);
        localStorage.setItem('refreshToken', data.data.tokens.refreshToken);
        user.value = data.data.user;
        return data.data.user;
      } else {
        throw new Error('Login failed');
      }
    } finally {
      loading.value = false;
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    user.value = null;
  };

  return {
    user: readonly(user),
    loading: readonly(loading),
    isAuthenticated,
    login,
    logout,
  };
};
```

## 🧪 Testing Examples

### Unit Test for API Client
```javascript
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock fetch
global.fetch = vi.fn();

const mockFetch = (data, ok = true) => {
  fetch.mockResolvedValueOnce({
    ok,
    json: async () => data,
  });
};

describe('API Client', () => {
  beforeEach(() => {
    fetch.mockClear();
    localStorage.clear();
  });

  it('should register user successfully', async () => {
    const mockResponse = {
      success: true,
      data: {
        user: { id: '1', email: 'test@example.com' },
        tokens: { accessToken: 'token123', refreshToken: 'refresh123' }
      }
    };

    mockFetch(mockResponse);

    const result = await registerUser({
      email: 'test@example.com',
      username: 'testuser',
      password: 'Password123'
    });

    expect(fetch).toHaveBeenCalledWith('/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        username: 'testuser',
        password: 'Password123'
      }),
    });

    expect(result).toEqual(mockResponse);
  });

  it('should handle authentication errors', async () => {
    const mockError = {
      success: false,
      error: 'Invalid credentials'
    };

    mockFetch(mockError, false);

    await expect(
      registerUser({
        email: 'test@example.com',
        username: 'testuser',
        password: 'wrong'
      })
    ).rejects.toThrow('Registration failed');
  });
});
```

### Integration Test
```javascript
import request from 'supertest';
import { createTestApp } from '../test-utils';

describe('Auth Integration Tests', () => {
  let app;

  beforeAll(() => {
    app = createTestApp();
  });

  describe('POST /auth/register', () => {
    it('should register a new user', async () => {
      const userData = {
        email: 'newuser@example.com',
        username: 'newuser',
        password: 'Password123'
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.tokens.accessToken).toBeDefined();
    });

    it('should reject duplicate email', async () => {
      const userData = {
        email: 'existing@example.com',
        username: 'user1',
        password: 'Password123'
      };

      // Create first user
      await request(app)
        .post('/api/v1/auth/register')
        .send(userData);

      // Try to create duplicate
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({ ...userData, username: 'user2' })
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('already exists');
    });
  });
});
```

## 🔧 Utility Functions

### API Client Class
```javascript
class CinemaAPIClient {
  constructor(baseURL = '/api/v1') {
    this.baseURL = baseURL;
    this.accessToken = localStorage.getItem('accessToken');
    this.refreshToken = localStorage.getItem('refreshToken');
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth header if token exists
    if (this.accessToken && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${this.accessToken}`;
    }

    let response = await fetch(url, config);

    // Handle token expiration
    if (response.status === 401 && this.refreshToken) {
      const newToken = await this.refreshAccessToken();
      if (newToken) {
        config.headers.Authorization = `Bearer ${newToken}`;
        response = await fetch(url, config);
      }
    }

    const data = await response.json();

    if (!response.ok) {
      throw new APIError(data.error, response.status, data.details);
    }

    return data;
  }

  async refreshAccessToken() {
    try {
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        this.accessToken = data.data.accessToken;
        this.refreshToken = data.data.refreshToken;
        localStorage.setItem('accessToken', this.accessToken);
        localStorage.setItem('refreshToken', this.refreshToken);
        return this.accessToken;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }

    this.logout();
    return null;
  }

  logout() {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  // Auth methods
  async register(userData) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    this.accessToken = data.data.tokens.accessToken;
    this.refreshToken = data.data.tokens.refreshToken;
    localStorage.setItem('accessToken', this.accessToken);
    localStorage.setItem('refreshToken', this.refreshToken);

    return data;
  }

  async login(credentials) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    this.accessToken = data.data.tokens.accessToken;
    this.refreshToken = data.data.tokens.refreshToken;
    localStorage.setItem('accessToken', this.accessToken);
    localStorage.setItem('refreshToken', this.refreshToken);

    return data;
  }

  // User methods
  async getCurrentUser() {
    return this.request('/users/me');
  }

  async updateProfile(updates) {
    return this.request('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async getUsers(page = 1, limit = 10) {
    return this.request(`/users?page=${page}&limit=${limit}`);
  }
}

class APIError extends Error {
  constructor(message, status, details) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.details = details;
  }
}

// Usage
const api = new CinemaAPIClient();

// Register
try {
  const result = await api.register({
    email: 'user@example.com',
    username: 'johndoe',
    password: 'SecurePass123'
  });
  console.log('Registered:', result.data.user);
} catch (error) {
  console.error('Registration failed:', error.message);
}
```

## 📋 Error Handling Patterns

### Centralized Error Handler
```javascript
const handleAPIError = (error) => {
  if (error instanceof APIError) {
    switch (error.status) {
      case 400:
        // Validation errors
        if (error.details) {
          const fieldErrors = error.details.reduce((acc, detail) => {
            acc[detail.field] = detail.message;
            return acc;
          }, {});
          return { type: 'validation', errors: fieldErrors };
        }
        return { type: 'bad_request', message: error.message };

      case 401:
        // Authentication required
        return { type: 'unauthorized', message: 'Please log in' };

      case 403:
        // Access denied
        return { type: 'forbidden', message: 'Access denied' };

      case 404:
        // Not found
        return { type: 'not_found', message: 'Resource not found' };

      case 409:
        // Conflict (e.g., email already exists)
        return { type: 'conflict', message: error.message };

      case 500:
        // Server error
        return { type: 'server_error', message: 'Something went wrong' };

      default:
        return { type: 'unknown', message: error.message };
    }
  }

  return { type: 'network', message: 'Network error occurred' };
};
```

## 🎯 Best Practices

### Token Storage Security
```javascript
// Secure token storage (production)
class SecureTokenStorage {
  static setTokens(accessToken, refreshToken) {
    // Use httpOnly cookies in production
    document.cookie = `accessToken=${accessToken}; HttpOnly; Secure; SameSite=Strict`;
    document.cookie = `refreshToken=${refreshToken}; HttpOnly; Secure; SameSite=Strict`;
  }

  static getAccessToken() {
    // In production, this would be handled server-side
    return getCookie('accessToken');
  }

  static clearTokens() {
    document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  }
}
```

### Request Debouncing
```javascript
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

// Debounced search function
const searchUsers = debounce(async (query) => {
  if (query.length >= 3) {
    const results = await api.request(`/users/search?q=${encodeURIComponent(query)}`);
    updateSearchResults(results.data);
  }
}, 300);
```

### Loading States
```javascript
const useAsyncOperation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = async (operation) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await operation();
      return result;
    } catch (err) {
      setError(handleAPIError(err));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, execute };
};

// Usage in component
const { loading, error, execute } = useAsyncOperation();

const handleLogin = async (credentials) => {
  try {
    await execute(() => api.login(credentials));
    // Handle success
  } catch (error) {
    // Error is already set in state
  }
};
```

## 📚 Related Documentation

- **[Authentication Flow](authentication-flow.md)** - Detailed auth examples
- **[User Management](user-management.md)** - User CRUD examples  
- **[Common Patterns](common-patterns.md)** - Reusable patterns
- **[API Reference](../reference/README.md)** - Complete endpoint docs
- **[Quick Start](../guides/quick-start.md)** - Get started guide

## 🔗 External Resources

- [Fetch API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [JWT Best Practices](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Vitest Documentation](https://vitest.dev/)