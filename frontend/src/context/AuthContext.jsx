import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authApi } from "../lib/api";

const AuthContext = createContext(null);

// ── Use sessionStorage so login is cleared when browser tab/window closes ──────
// This means: every time you open the browser fresh, you need to log in again.
const store = {
  get:    (key)        => sessionStorage.getItem(key),
  set:    (key, val)   => sessionStorage.setItem(key, val),
  remove: (key)        => sessionStorage.removeItem(key),
};

export function AuthProvider({ children }) {
  const [student, setStudent] = useState(() => {
    const saved = store.get("studyhub_student");
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = store.get("studyhub_token");
    if (!token) { setLoading(false); return; }
    authApi.me()
      .then((res) => {
        setStudent(res.data);
        store.set("studyhub_student", JSON.stringify(res.data));
      })
      .catch(() => {
        store.remove("studyhub_token");
        store.remove("studyhub_student");
        setStudent(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (identifier, password) => {
    const res = await authApi.login(identifier, password);
    const { token, student } = res.data;
    store.set("studyhub_token", token);
    store.set("studyhub_student", JSON.stringify(student));
    setStudent(student);
    return student;
  }, []);

  const loginWithGoogle = useCallback(async (idToken) => {
    const res = await authApi.google(idToken);
    const { token, student } = res.data;
    store.set("studyhub_token", token);
    store.set("studyhub_student", JSON.stringify(student));
    setStudent(student);
    return student;
  }, []);

  const register = useCallback(async (payload) => {
    const res = await authApi.register(payload);
    const { token, student } = res.data;
    store.set("studyhub_token", token);
    store.set("studyhub_student", JSON.stringify(student));
    setStudent(student);
    return student;
  }, []);

  const logout = useCallback(() => {
    store.remove("studyhub_token");
    store.remove("studyhub_student");
    setStudent(null);
  }, []);

  const updateStudent = useCallback((updated) => {
    setStudent(updated);
    store.set("studyhub_student", JSON.stringify(updated));
  }, []);

  const isAdmin = student?.role === "admin";

  return (
    <AuthContext.Provider value={{ student, login, loginWithGoogle, register, logout, loading, isAdmin, updateStudent }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
