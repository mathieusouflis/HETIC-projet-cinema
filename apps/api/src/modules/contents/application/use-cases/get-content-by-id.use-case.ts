import { NotFoundError } from "../../../../shared/errors/not-found-error.js";
import type { IContentRepository } from "../../domain/interfaces/IContentRepository.js";
import type { GetContentByIdResponse } from "../dto/response/get-content-by-id-response.validator.js";

type ParamsInterface = {
  id: string;
  withCast?: boolean;
  withCategory?: boolean;
  withPlatform?: boolean;
  withSeasons?: boolean;
  withEpisodes?: boolean;
};

export class GetContentByIdUseCase {
  constructor(private readonly contentRepository: IContentRepository) {}

  async execute(
    params: ParamsInterface
  ): Promise<GetContentByIdResponse["data"]> {
    const content = await this.contentRepository.getContentById(params);

    if (!content) {
      throw new NotFoundError(`Content with id ${params.id}`);
    }

    return content.toJSONWithRelations();
  }
}
