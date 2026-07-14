import { createContext, useEffect, useReducer } from 'react';
import authService from '../models/authService';

const TOKEN_KEY = 'scrum_token';

const initialState = {
  user: null,
  token: localStorage.getItem(TOKEN_KEY),
  // Si ya hay un token guardado, arrancamos en 'loading' para que ProtectedRoute
  // espere la verificación de sesión (GET /auth/me) en vez de redirigir a /login
  // antes de que el useEffect de restauración tenga oportunidad de correr.
  status: localStorage.getItem(TOKEN_KEY) ? 'loading' : 'idle',
  error: null,
};

function authReducer(state, action) {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, status: 'loading', error: null };
    case 'AUTH_SUCCESS':
      return { ...state, status: 'authenticated', user: action.user, token: action.token, error: null };
    case 'AUTH_ERROR':
      return { ...state, status: 'error', error: action.error };
    case 'LOGOUT':
      return { ...state, status: 'idle', user: null, token: null };
    default:
      return state;
  }
}

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    async function restoreSession() {
      if (!state.token) return;
      dispatch({ type: 'AUTH_START' });
      try {
        const user = await authService.me();
        dispatch({ type: 'AUTH_SUCCESS', user, token: state.token });
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        dispatch({ type: 'LOGOUT' });
      }
    }
    restoreSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function login(credentials) {
    dispatch({ type: 'AUTH_START' });
    try {
      const { user, token } = await authService.login(credentials);
      localStorage.setItem(TOKEN_KEY, token);
      dispatch({ type: 'AUTH_SUCCESS', user, token });
      return user;
    } catch (err) {
      dispatch({ type: 'AUTH_ERROR', error: err.response?.data?.error || 'Error al iniciar sesión' });
      throw err;
    }
  }

  async function register(payload) {
    dispatch({ type: 'AUTH_START' });
    try {
      const { user, token } = await authService.register(payload);
      localStorage.setItem(TOKEN_KEY, token);
      dispatch({ type: 'AUTH_SUCCESS', user, token });
      return user;
    } catch (err) {
      dispatch({ type: 'AUTH_ERROR', error: err.response?.data?.error || 'Error al registrarse' });
      throw err;
    }
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    dispatch({ type: 'LOGOUT' });
  }

  function setUser(user) {
    dispatch({ type: 'AUTH_SUCCESS', user, token: state.token });
  }

  const value = { ...state, login, register, logout, setUser };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
