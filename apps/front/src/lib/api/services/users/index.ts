import { type PATCHUsersMeBody, pATCHUsersMe } from "@packages/api-sdk";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/stores/auth.store";
import { usersKeys } from "./keys";

const patchMe = async (props: PATCHUsersMeBody) => {
  const response = await pATCHUsersMe(props);
  return response.data;
};

export const usersService = {
  patchMe,
};

export const usePatchMe = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: patchMe,
    onSuccess: async () => {
      if (!user?.id) return;

      await queryClient.invalidateQueries({
        queryKey: usersKeys.getId(user.id),
      });
    },
  });
};
