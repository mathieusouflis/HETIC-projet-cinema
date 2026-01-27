import { NotFoundError } from "../../../../shared/errors";
import type { Friendship } from "../../domain/entities/friendship.entity";
import type { IUserRepository } from "../../domain/interfaces";
import type { IFriendshipsRepository } from "../../domain/interfaces/IFriendshipsRepository";
import type { CreateFrienshipParams } from "../dto/requests/create-friendship.params.validator";

export class CreateFriendshipUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly friendshipsRepository: IFriendshipsRepository
  ) {}

  async execute(
    userId: string,
    params: CreateFrienshipParams
  ): Promise<Friendship> {
    const user = await this.userRepository.findById(params.id);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return await this.friendshipsRepository.create(userId, params.id);
  }
}
