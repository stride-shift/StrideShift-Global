import { createContext, useContext, ReactNode, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

/**
 * Visual "design mode" — active when a signed-in admin opens any public page
 * with `?edit=1` (via the dashboard Design tab or the floating pencil button).
 * Must be mounted inside <BrowserRouter>.
 */

interface EditModeState {
  /** True when the current viewer is an admin AND ?edit=1 is on the URL. */
  editing: boolean;
  isAdmin: boolean;
  enterEditMode: () => void;
  exitEditMode: () => void;
}

const EditModeContext = createContext<EditModeState | null>(null);

export function EditModeProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const params = new URLSearchParams(location.search);
  const editing = isAdmin && params.get('edit') === '1';

  const enterEditMode = useCallback(() => {
    const p = new URLSearchParams(location.search);
    p.set('edit', '1');
    navigate({ pathname: location.pathname, search: `?${p.toString()}` }, { replace: true });
  }, [location.pathname, location.search, navigate]);

  const exitEditMode = useCallback(() => {
    const p = new URLSearchParams(location.search);
    p.delete('edit');
    const search = p.toString();
    navigate({ pathname: location.pathname, search: search ? `?${search}` : '' }, { replace: true });
  }, [location.pathname, location.search, navigate]);

  return (
    <EditModeContext.Provider value={{ editing, isAdmin, enterEditMode, exitEditMode }}>
      {children}
    </EditModeContext.Provider>
  );
}

export function useEditMode() {
  const ctx = useContext(EditModeContext);
  if (!ctx) throw new Error('useEditMode must be used inside <EditModeProvider>');
  return ctx;
}
