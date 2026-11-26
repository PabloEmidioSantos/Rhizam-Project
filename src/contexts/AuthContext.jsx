import { useCallback, useEffect, useRef, useState } from "react";
import { getAccessProfile } from "../services/authService.js";
import { supabase, supabaseConfigError } from "../lib/supabase.js";
import { AuthContext } from "./authContext.js";

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(Boolean(supabase));
  const [sessionReady, setSessionReady] = useState(!supabase);
  const [error, setError] = useState(supabaseConfigError);
  const [profileRevision, setProfileRevision] = useState(0);
  const profileRequest = useRef(0);
  const authEventVersion = useRef(0);

  const applySession = useCallback((nextSession) => {
    const userId = nextSession?.user.id ?? null;
    setSession(nextSession);
    setProfile((currentProfile) => currentProfile?.userId === userId ? currentProfile : null);
    setSessionReady(true);
    setError(null);
    setLoading(Boolean(userId));
    setProfileRevision((revision) => revision + 1);
  }, []);

  useEffect(() => {
    if (!supabase) return undefined;
    let active = true;
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return;
      authEventVersion.current += 1;
      applySession(nextSession);
    });
    const versionBeforeGetSession = authEventVersion.current;

    supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!active || versionBeforeGetSession !== authEventVersion.current) return;
      if (sessionError) {
        setSession(null);
        setProfile(null);
        setSessionReady(true);
        setError("Não foi possível restaurar a sessão. Tente entrar novamente.");
        setLoading(false);
        return;
      }
      applySession(data.session);
    }).catch(() => {
      if (!active || versionBeforeGetSession !== authEventVersion.current) return;
      setSession(null);
      setProfile(null);
      setSessionReady(true);
      setError("Não foi possível restaurar a sessão. Tente entrar novamente.");
      setLoading(false);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [applySession]);

  useEffect(() => {
    const userId = session?.user.id;
    const requestId = ++profileRequest.current;
    let active = true;

    if (!userId) {
      setProfile(null);
      setLoading(!sessionReady);
      return () => {
        active = false;
      };
    }

    setLoading(true);
    setError(null);
    getAccessProfile(userId).then((accessProfile) => {
      if (!active || requestId !== profileRequest.current) return;
      setProfile({ ...accessProfile, userId });
    }).catch(() => {
      if (!active || requestId !== profileRequest.current) return;
      setProfile({ role: null, userId });
      setError("Não foi possível verificar as permissões da conta. Tente novamente.");
    }).finally(() => {
      if (active && requestId === profileRequest.current) setLoading(false);
    });

    return () => {
      active = false;
      if (requestId === profileRequest.current) profileRequest.current += 1;
    };
  }, [session?.user.id, profileRevision, sessionReady]);

  const value = { session, profile, loading, error, setError };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
