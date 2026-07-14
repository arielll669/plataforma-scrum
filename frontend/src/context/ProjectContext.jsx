import { createContext, useCallback, useReducer } from 'react';
import projectService from '../models/projectService';

const initialState = {
  project: null,
  status: 'idle', // idle | loading | ready | error
  error: null,
};

function projectReducer(state, action) {
  switch (action.type) {
    case 'LOAD_START':
      return { ...state, status: 'loading', error: null };
    case 'LOAD_SUCCESS':
      return { ...state, status: 'ready', project: action.project };
    case 'LOAD_ERROR':
      return { ...state, status: 'error', error: action.error };
    case 'CLEAR':
      return initialState;
    default:
      return state;
  }
}

export const ProjectContext = createContext(null);

export function ProjectProvider({ children }) {
  const [state, dispatch] = useReducer(projectReducer, initialState);

  const loadProject = useCallback(async (projectId) => {
    dispatch({ type: 'LOAD_START' });
    try {
      const project = await projectService.getById(projectId);
      dispatch({ type: 'LOAD_SUCCESS', project });
      return project;
    } catch (err) {
      dispatch({ type: 'LOAD_ERROR', error: err.response?.data?.error || 'No se pudo cargar el proyecto' });
      throw err;
    }
  }, []);

  const clearProject = useCallback(() => dispatch({ type: 'CLEAR' }), []);

  const value = { ...state, loadProject, clearProject };

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}
