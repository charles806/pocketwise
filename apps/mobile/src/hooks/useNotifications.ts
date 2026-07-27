import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const API_BASE = process.env.EXPO_PUBLIC_API_URL;

export interface Notification {
  id: string;
  title: string;
  message: string;
  category: "GOAL" | "TRANSACTION" | "SECURITY" | "SYSTEM" | "PROMOTION";
  isRead: boolean;
  createdAt: string;
}

const fetchNotifications = async (token: string): Promise<Notification[]> => {
  const res = await fetch(`${API_BASE}/api/v1/notifications`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch notifications");
  const body = await res.json();
  return body.data || [];
};

export const useNotifications = () => {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const query = useQuery({
    queryKey: ["notifications", accessToken],
    queryFn: () => fetchNotifications(accessToken!),
    enabled: !!accessToken,
  });

  const markAsRead = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_BASE}/api/v1/notifications/${id}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error("Failed to mark as read");
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] });
      const prev = queryClient.getQueryData<Notification[]>([
        "notifications",
        accessToken,
      ]);
      if (prev) {
        queryClient.setQueryData<Notification[]>(
          ["notifications", accessToken],
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
        );
      }
      return { prev };
    },
    onError: (_err, _id, context) => {
      if (context?.prev) {
        queryClient.setQueryData(["notifications", accessToken], context.prev);
      }
    },
  });

  const markAllAsRead = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API_BASE}/api/v1/notifications/read-all`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error("Failed to mark all as read");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast("All marked as read", { type: "info" });
    },
    onError: (err: Error) => {
      toast(err.message, { type: "error" });
    },
  });

  return {
    notifications: query.data || [],
    loading: query.isLoading,
    refetch: query.refetch,
    unreadCount: (query.data || []).filter((n) => !n.isRead).length,
    markAsRead: (id: string) => markAsRead.mutate(id),
    markAllAsRead: () => markAllAsRead.mutate(),
    markingAll: markAllAsRead.isPending,
  };
};
