import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: response, isLoading } = useQuery({
    queryKey: ["/api/me"],
    retry: false,
  });

  const user = (response as any)?.user;

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
