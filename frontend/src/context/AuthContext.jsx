import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authApi } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [student, setStudent] = useState(() => {
    const saved = localStorage.getItem("studyhub_student");
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("studyhub_token");
    if (!token) { setLoading(false); return; }
    authApi.me()
      .then((res) => { setStudent(res.data); localStorage.setItem("studyhub_student", JSON.stringify(res.data)); })
      .catch(() => { localStorage.removeItem("studyhub_token"); localStorage.removeItem("studyhub_student"); setStudent(null); })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (studentId, password) => {
    const res = await authApi.login(studentId, password);
    const { token, student } = res.data;
    localStorage.setItem("studyhub_token", token);
    localStorage.setItem("studyhub_student", JSON.stringify(student));
    setStudent(student);
    return student;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("studyhub_token");
    localStorage.removeItem("studyhub_student");
    setStudent(null);
  }, []);

  const isAdmin = student?.role === "admin";

  return (
    <AuthContext.Provider value={{ student, login, logout, loading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
