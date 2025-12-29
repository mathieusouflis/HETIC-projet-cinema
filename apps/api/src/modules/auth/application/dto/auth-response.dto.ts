import { UserResponseDTO } from "../../../users/application/dto/user-response.dto";

/**
 * Output DTO for authentication responses
 * Contains user data and token pair
 */
export interface AuthResponseDTO {
  user: UserResponseDTO;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}
