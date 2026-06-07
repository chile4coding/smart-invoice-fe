import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../lib/api";

export const useAuth = () => {
  const queryClient = useQueryClient();
  const token = localStorage.getItem("accessToken");

  const { data, isLoading, error } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const result = await apiClient.get("/auth/me");
      if (!result.ok) throw new Error(result.data?.error?.message || "Unauthorized");
      return result.data.data;
    },
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const isAuthenticated = !!token && !!data;
  const user = data;
  const role = user?.role;

  const hasRole = (requiredRole) => {
    const roleHierarchy = { SUPER_ADMIN: 3, ADMIN: 2, USER: 1 };
    const userLevel = roleHierarchy[role] || 0;
    const requiredLevel = roleHierarchy[requiredRole] || 0;
    return userLevel >= requiredLevel;
  };

  const logout = async () => {
    try {
      await apiClient.post("/auth/logout");
    } catch {
      // ignore errors
    }
    localStorage.removeItem("accessToken");
    queryClient.clear();
  };

  return {
    isAuthenticated,
    isLoading,
    user,
    role,
    hasRole,
    logout,
    error,
  };
};

export const useLogin = () => {
  const queryClient = useQueryClient();

  return (credentials) =>
    apiClient.post("/auth/login", credentials).then((result) => {
      if (result.ok && result.data?.success) {
        localStorage.setItem("accessToken", result.data.data.accessToken);
        queryClient.setQueryData(["auth", "me"], result.data.data.user);
      }
      return result;
    });
};
