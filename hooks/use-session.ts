import { useQuery } from "@tanstack/react-query";

interface SessionData {
  authenticated: boolean;
  userId?: string;
  userName?: string;
  userEmail?: string;
}

export function useSession() {
  return useQuery<SessionData>({
    queryKey: ["session"],
    queryFn: async () => {
      const response = await fetch("/api/auth/session");
      if (!response.ok) {
        throw new Error("Failed to fetch session");
      }
      return response.json();
    },
  });
}
