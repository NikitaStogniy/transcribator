import { useQuery } from "@tanstack/react-query";

interface UserData {
  name: string;
  email: string;
  image?: string;
}

// Функция для получения данных пользователя по API
const fetchUserDetails = async (userId: string): Promise<UserData> => {
  // Здесь должен быть реальный API запрос
  // Для примера возвращаем моковые данные
  // TODO: Заменить на реальный API-запрос
  return {
    name: "John Doe",
    email: "john@example.com",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=" + userId,
  };
};

// Хук React Query для получения данных пользователя
export const useGetUserDetailsQuerySelector = (userId: string) => {
  return useQuery({
    queryKey: ["userDetails", userId],
    queryFn: () => fetchUserDetails(userId),
    enabled: !!userId,
  });
};
