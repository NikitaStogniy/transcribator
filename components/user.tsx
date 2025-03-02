import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronDown } from "lucide-react";
import { useGetUserDetailsQuerySelector } from "@/hooks/queries";

interface UserComponentProps {
  userId: string;
}

const UserComponent = ({ userId }: UserComponentProps) => {
  const [isOpen, setIsOpen] = useState(false);

  // Use React Query for async data fetching
  const {
    data: userData,
    isLoading,
    error,
  } = useGetUserDetailsQuerySelector(userId);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading user</div>;

  // Получаем данные пользователя из React Query
  const name = userData?.name || "Guest";
  const email = userData?.email || "";
  const image = userData?.image || "";

  return (
    <div className="flex items-center gap-2">
      <Avatar>
        <AvatarImage src={image} alt={name} />
        <AvatarFallback>{name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <span className="font-medium">{name}</span>
        {email && <span className="text-sm text-gray-500">{email}</span>}
      </div>
      <ChevronDown
        className="cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      />
    </div>
  );
};

export default UserComponent;
