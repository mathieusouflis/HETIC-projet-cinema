import { NotFoundError } from "../../../../shared/errors/not-found-error";
import type { ISeriesRepository } from "../../domain/interfaces/ISeriesRepository";
import type { GetSerieByIdResponse } from "../dto/response/get-serie-by-id-response.validator";

export class GetSerieByIdUseCase {
  constructor(private readonly serieRepository: ISeriesRepository) {}

  async execute(
    id: string,
    options: { withCategories?: boolean } = {}
  ): Promise<GetSerieByIdResponse> {
    const serie = await this.serieRepository.getSerieById(id, options);

    if (!serie) {
      throw new NotFoundError(`Serie with id ${id}`);
    }

    return serie.toJSON();
  }
}
