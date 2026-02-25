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

  patchMe: () =>
    useMutation({
      mutationFn: usersService.patchMe,
      onSuccess: async (responseData) => {
        await queryClient.invalidateQueries({ queryKey: usersKeys.me() });

        const { user, setUser } = useAuth.getState();
        if (user?.id) {
          await queryClient.invalidateQueries({
            queryKey: usersKeys.getId(user.id),
          });
        }
        if (user && responseData?.data) {
          setUser({
            ...user,
            username: responseData.data.username ?? user.username,
          });
        }
      },
    }),

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
