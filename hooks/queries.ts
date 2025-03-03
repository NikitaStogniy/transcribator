import { useQuery } from "@tanstack/react-query";
import { get } from "@/lib/fetch-client";

interface UserData {
  name: string;
  email: string;
  image?: string;
}

// Функция для получения данных пользователя по API
const fetchUserDetails = async (userId: string): Promise<UserData> => {
  const response = await get<UserData>(`/api/users/${userId}`);
  return response;
};

// Хук React Query для получения данных пользователя
export const useGetUserDetailsQuerySelector = (userId: string) => {
  return useQuery({
    queryKey: ["userDetails", userId],
    queryFn: () => fetchUserDetails(userId),
    enabled: !!userId,
  });
};
