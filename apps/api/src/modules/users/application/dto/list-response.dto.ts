import { UserResponseDTO } from "./user-response.dto";

export interface UserListResponseDTO {
  users: UserResponseDTO[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
