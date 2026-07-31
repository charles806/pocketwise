import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";

type Direction = "sent" | "received" | "deposit";
type FilterTab = "all" | "sent" | "received" | "deposit";

export interface Transaction {
  id: string;
  type: string;
  direction: Direction;
  amount: number;
  reason: string | null;
  status: string;
  createdAt: string;
  counterpartyName: string | null;
}

interface FetchResult {
  transactions: Transaction[];
  hasMore: boolean;
}

const fetchTransactions = async (
  token: string,
  page: number,
  filter: FilterTab,
): Promise<FetchResult> => {
  const params = new URLSearchParams({ page: String(page) });
  if (filter !== "all") params.set("type", filter);

  const res = await fetch(
    `${process.env.EXPO_PUBLIC_API_URL}/api/v1/transactions?${params}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  if (!res.ok) throw new Error("Failed to fetch transactions");
  const body = await res.json();
  return {
    transactions: body.data?.transactions || [],
    hasMore: body.data?.hasMore ?? false,
  };
};

export const useTransactions = (
  filter: FilterTab,
  page: number,
  enabled: boolean,
) => {
  const { accessToken } = useAuth();

  return useQuery({
    queryKey: ["transactions", accessToken, filter, page],
    queryFn: () => fetchTransactions(accessToken!, page, filter),
    enabled: !!accessToken && enabled,
    placeholderData: (prev) => prev,
  });
};
