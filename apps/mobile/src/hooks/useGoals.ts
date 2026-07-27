import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const API_BASE = process.env.EXPO_PUBLIC_API_URL;

export interface Goal {
  id: string;
  title: string;
  targetAmount: string;
  currentAmount: string;
  deadline: string | null;
  status: string;
  isCompleted: boolean;
  daysRemaining: number | null;
  progress: number;
  autoContribute: boolean;
  weeklyAmount: string | null;
}

const fetchGoals = async (token: string): Promise<Goal[]> => {
  const res = await fetch(`${API_BASE}/api/v1/savings-goals`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch goals");
  const body = await res.json();
  return body.data || [];
};

const fetchUnallocated = async (token: string): Promise<number> => {
  const res = await fetch(`${API_BASE}/api/v1/savings-goals/unallocated`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return 0;
  const body = await res.json();
  return body.data?.unallocatedSavings ?? 0;
};

export const useGoals = () => {
  const { accessToken } = useAuth();

  const goalsQuery = useQuery({
    queryKey: ["goals", accessToken],
    queryFn: () => fetchGoals(accessToken!),
    enabled: !!accessToken,
  });

  const unallocatedQuery = useQuery({
    queryKey: ["unallocated", accessToken],
    queryFn: () => fetchUnallocated(accessToken!),
    enabled: !!accessToken,
  });

  return {
    goals: goalsQuery.data || [],
    unallocatedSavings: unallocatedQuery.data ?? 0,
    loading: goalsQuery.isLoading || unallocatedQuery.isLoading,
    refetch: () => {
      goalsQuery.refetch();
      unallocatedQuery.refetch();
    },
  };
};

export const useCreateGoal = () => {
  const queryClient = useQueryClient();
  const { accessToken } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: {
      title: string;
      targetAmount: number;
      deadline: string;
      autoContribute: boolean;
      weeklyAmount?: number;
    }) => {
      const res = await fetch(`${API_BASE}/api/v1/savings-goals`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(data),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.message || "Failed to create goal");
      return body;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      toast("Goal created!", { type: "info", title: "Success" });
    },
    onError: (err: Error) => {
      toast(err.message, { type: "error" });
    },
  });
};

export const useContributeToGoal = () => {
  const queryClient = useQueryClient();
  const { accessToken } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      goalId,
      amount,
    }: {
      goalId: string;
      amount: number;
    }) => {
      const res = await fetch(
        `${API_BASE}/api/v1/savings-goals/${goalId}/contribute`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ amount }),
        },
      );
      const body = await res.json();
      if (!res.ok) throw new Error(body.message || "Failed to add money");
      return { amount, title: body.data?.title || "" };
    },
    onSuccess: ({ amount, title }) => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["unallocated"] });
      toast(`₦${amount.toLocaleString()} added to ${title}`, {
        type: "info",
        title: "Success",
      });
    },
    onError: (err: Error) => {
      toast(err.message, { type: "error" });
    },
  });
};

export const useCompleteGoal = () => {
  const queryClient = useQueryClient();
  const { accessToken } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (goalId: string) => {
      const res = await fetch(
        `${API_BASE}/api/v1/savings-goals/${goalId}/complete`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );
      const body = await res.json();
      if (!res.ok) throw new Error(body.message || "Failed to complete goal");
      return body;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
      toast("Goal completed!", { type: "info", title: "Success" });
    },
    onError: (err: Error) => {
      toast(err.message, { type: "error" });
    },
  });
};

export const useAutoContributeGoal = () => {
  const queryClient = useQueryClient();
  const { accessToken } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      goalId,
      autoContribute,
      weeklyAmount,
    }: {
      goalId: string;
      autoContribute: boolean;
      weeklyAmount?: number;
    }) => {
      const res = await fetch(`${API_BASE}/api/v1/savings-goals/${goalId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          autoContribute,
          ...(autoContribute && weeklyAmount ? { weeklyAmount } : {}),
        }),
      });
      const body = await res.json();
      if (!res.ok)
        throw new Error(body.message || "Failed to update auto-save");
      return body;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      toast("Auto-save settings updated", { type: "info", title: "Success" });
    },
    onError: (err: Error) => {
      toast(err.message, { type: "error" });
    },
  });
};

export const usePauseGoal = () => {
  const queryClient = useQueryClient();
  const { accessToken } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (goalId: string) => {
      const res = await fetch(`${API_BASE}/api/v1/savings-goals/${goalId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ status: "PAUSED" }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.message || "Failed to pause goal");
      return body;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      toast("Goal paused", { type: "info" });
    },
    onError: (err: Error) => {
      toast(err.message, { type: "error" });
    },
  });
};
