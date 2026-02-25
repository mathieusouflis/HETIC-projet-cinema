import {
  dELETEUsersMe,
  gETUsersMe,
  type PATCHUsersMeBody,
  pATCHUsersMe,
} from "@packages/api-sdk";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/stores/auth.store";
import { queryClient } from "../../client";
import { usersKeys } from "./keys";

const patchMe = async (props: PATCHUsersMeBody) => {
  const response = await pATCHUsersMe(props);
  return response.data;
};

const getMe = async () => {
  const response = await gETUsersMe();
  return response.data;
};

const deleteMe = async () => {
  await dELETEUsersMe();
};

export const queryUserService = {
  getMe: () =>
    useQuery({
      queryKey: usersKeys.me(),
      queryFn: usersService.getMe,
    }),

  patchMe: () => {
    const { user } = useAuth();
    return useMutation({
      mutationFn: usersService.patchMe,
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: usersKeys.me() });
        if (user?.id) {
          await queryClient.invalidateQueries({
            queryKey: usersKeys.getId(user.id),
          });
        }
      },
    });
  },

  deleteMe: () =>
    useMutation({
      mutationFn: usersService.deleteMe,
    }),
};

export const usersService = {
  patchMe,
  getMe,
  deleteMe,
};
