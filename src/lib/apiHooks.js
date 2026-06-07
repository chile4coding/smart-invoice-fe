import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./api";

export const useLogin = () => {
  return useMutation({
    mutationFn: (credentials) => apiClient.post("/auth/login", credentials),
  });
};

export const useLogout = () => {
  return useMutation({
    mutationFn: () => apiClient.post("/auth/logout"),
  });
};

// ── Users ─────────────────────────────────────────────────────────────────────

export const useUsers = (page = 1, limit = 10, search = "") => {
  return useQuery({
    queryKey: ["users", { page, limit, search }],
    queryFn: async () => {
      const params = new URLSearchParams({ page, limit });
      if (search) params.set("search", search);
      const result = await apiClient.get(`/users?${params.toString()}`);
      if (!result.ok)
        throw new Error(result.data?.error?.message || "Failed to load users");
      return result.data.data;
    },
    enabled: !!localStorage.getItem("accessToken"),
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userData) => apiClient.post("/users", userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

export const useUpdateUserPassword = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, newPassword }) =>
      apiClient.patch(`/users/${id}/password`, { newPassword }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }) =>
      apiClient.patch(`/users/${id}/role`, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => apiClient.del(`/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

// ── Invoices ──────────────────────────────────────────────────────────────────

export const useInvoices = (params = {}) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    status = "",
    startDate = "",
    endDate = "",
    sortBy = "createdAt",
    order = "desc",
  } = params;

  return useQuery({
    queryKey: [
      "invoices",
      { page, limit, search, status, startDate, endDate, sortBy, order },
    ],
    queryFn: async () => {
      const sp = new URLSearchParams({ page, limit });
      sp.set("search", search);
      if (status) sp.set("status", status);
      if (startDate) sp.set("startDate", startDate);
      if (endDate) sp.set("endDate", endDate);
      if (sortBy) sp.set("sortBy", sortBy);
      if (order) sp.set("order", order);
      const result = await apiClient.get(`/invoices?${sp.toString()}`);
      if (!result.ok)
        throw new Error(
          result.data?.error?.message || "Failed to load invoices",
        );
      return result.data.data;
    },
    enabled: !!localStorage.getItem("accessToken"),
  });
};

export const useInvoice = (id) => {
  return useQuery({
    queryKey: ["invoices", id],
    queryFn: async () => {
      const result = await apiClient.get(`/invoices/${id}`);
      if (!result.ok)
        throw new Error(result.data?.error?.message || "Invoice not found");
      return result.data.data;
    },
    enabled: !!id && !!localStorage.getItem("accessToken"),
  });
};

export const useCreateInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (invoiceData) => apiClient.post("/invoices", invoiceData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
};

export const useUpdateInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => apiClient.put(`/invoices/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
};

export const useUpdateInvoiceStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) =>
      apiClient.patch(`/invoices/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
};

export const useDeleteInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => apiClient.del(`/invoices/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
};

// ── Stats ─────────────────────────────────────────────────────────────────────

export const useStats = (enabled = true) => {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const result = await apiClient.get("/users/dashboard-stats");
      if (!result.ok)
        throw new Error(result.data?.error?.message || "Failed to load stats");
      return result.data.data;
    },
    enabled: enabled && !!localStorage.getItem("accessToken"),
  });
};

export const useCreateStats = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (statsData) =>
      apiClient.post("/users/dashboard-stats", statsData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => apiClient.patch(`/users/${id}/profile`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
  });
};

export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => apiClient.patch(`/users/${id}/profile`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};
