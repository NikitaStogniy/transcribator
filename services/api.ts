import { User } from "@/store/atoms";

// Simulated API endpoint base URL
const API_URL = "/api";

// Fetch user data
export const fetchUser = async (userId: string): Promise<User> => {
  const response = await fetch(`${API_URL}/users/${userId}`);

  if (!response.ok) {
    throw new Error("Failed to fetch user");
  }

  return response.json();
};

// Fetch list of users
export const fetchUsers = async (): Promise<User[]> => {
  const response = await fetch(`${API_URL}/users`);

  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }

  return response.json();
};
