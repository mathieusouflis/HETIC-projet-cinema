import { NotFoundError } from "../../../../shared/errors/not-found-error.js";
import type { ISeriesRepository } from "../../domain/interfaces/ISeriesRepository.js";
import type { GetSerieByIdResponse } from "../dto/response/get-serie-by-id-response.validator.js";

export class GetSerieByIdUseCase {
  constructor(private readonly serieRepository: ISeriesRepository) {}

  async execute(id: string): Promise<GetSerieByIdResponse> {
    const serie = await this.serieRepository.getSerieById(id);

    if (!serie) {
      throw new NotFoundError(`Serie with id ${id}`);
    }

    return serie.toJSON();
  }
}
