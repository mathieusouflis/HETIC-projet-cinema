import { NotFoundError } from "../../../../shared/errors/NotFoundError.js";
import { IContentRepository } from "../../domain/interfaces/IContentRepository.js";
import { GetContentByIdResponse } from "../dto/response/get-content-by-id-response.validator.js";

export class GetContentByIdUseCase {
  constructor(private readonly contentRepository: IContentRepository) {}

  async execute(id: string): Promise<GetContentByIdResponse> {
    const content = await this.contentRepository.getContentById(id);

    if (!content) {
      throw new NotFoundError(`Content with id ${id}`);
    }

    return content.toJSON();
  }
}
