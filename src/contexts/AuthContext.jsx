import { useCallback, useEffect, useRef, useState } from "react";
import { getAccessProfile } from "../services/authService.js";
import { getErrorMessage } from "../lib/errors.js";
import { supabase, supabaseConfigError } from "../lib/supabase.js";
import { AuthContext } from "./authContext.js";

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(Boolean(supabase));
  const [error, setError] = useState(supabaseConfigError);
  const profileRequest = useRef(0);
  const profileCache = useRef(new Map());

  const loadProfile = useCallback(async (userId) => {
    const requestId = ++profileRequest.current;
    if (!userId) {
      setProfile(null);
      setLoading(false);
      return;
    }
    if (profileCache.current.has(userId)) {
      setProfile(profileCache.current.get(userId));
      setError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const accessProfile = await getAccessProfile(userId);
      if (requestId !== profileRequest.current) return;
      const nextProfile = { ...accessProfile, userId };
      profileCache.current.set(userId, nextProfile);
      setProfile(nextProfile);
      setError(null);
    } catch (loadError) {
      if (requestId !== profileRequest.current) return;
      setProfile({ role: null, userId });
      setError(getErrorMessage(loadError, "Não foi possível verificar as permissões da conta."));
    } finally {
      if (requestId === profileRequest.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!supabase) return undefined;
    let active = true;
    supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!active) return;
      if (sessionError) setError(getErrorMessage(sessionError));
      setSession(data.session);
      void loadProfile(data.session?.user.id);
    }).catch((sessionError) => {
      if (!active) return;
      setError(getErrorMessage(sessionError, "Não foi possível restaurar a sessão."));
      setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return;
      if (!nextSession) {
        profileCache.current.clear();
        ++profileRequest.current;
        setProfile(null);
        setLoading(false);
      }
      setSession(nextSession);
      void loadProfile(nextSession?.user.id);
    });
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [loadProfile]);

  const value = { session, profile, loading, error, setError };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
