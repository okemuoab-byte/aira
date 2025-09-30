import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiService, User, LoginRequest, SignupRequest } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  signup: (userData: SignupRequest) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('🔍 DEBUG: Initializing auth...');
        console.log('🔍 Is authenticated:', apiService.isAuthenticated());
        console.log('🔍 Token:', apiService.getToken() ? `${apiService.getToken()?.substring(0, 20)}...` : 'null');
        
        if (apiService.isAuthenticated()) {
          const currentUser = await apiService.getCurrentUser();
          setUser(currentUser);
          console.log('🔍 Current user loaded:', currentUser.email);
        } else {
          console.log('🔍 No authentication token found');
        }
      } catch (error) {
        console.error('🔍 Failed to initialize auth:', error);
        apiService.clearToken();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginRequest) => {
    try {
      setLoading(true);
      const response = await apiService.login(credentials);
      setUser(response.user);
      
      // Redirect to main page after successful login
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData: SignupRequest) => {
    try {
      setLoading(true);
      const response = await apiService.signup(userData);
      setUser(response.user);
      
      // Redirect to main page after successful signup
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Signup failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
  };

  // Debug logging for auth state changes
  useEffect(() => {
    console.log('🔍 Auth state changed:');
    console.log('🔍 User:', user?.email || 'null');
    console.log('🔍 Loading:', loading);
    console.log('🔍 Is authenticated:', !!user);
  }, [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};