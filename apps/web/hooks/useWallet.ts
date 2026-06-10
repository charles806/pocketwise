import { useQuery } from "@tanstack/react-query";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

const fetchWallet = async (accessToken: string) => {
  const response = await fetch(`${API_BASE}/api/v1/wallets`, {
    method: "GET",
    headers: { Authorization: `Bearer ${accessToken}` },
    credentials: "include",
  });

  if (!response.ok) throw new Error("Failed to fetch wallet");

  const { data } = await response.json();
  return data;
};

export const useWallet = (accessToken: string | null) => {
  return useQuery({
    queryKey: ["wallet", accessToken],
    queryFn: () => fetchWallet(accessToken!),
    enabled: !!accessToken,
    staleTime: 1000 * 60 * 2,
    placeholderData: (prev) => prev,
  });
};
