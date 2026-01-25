import { NotFoundError } from "../../../../shared/errors/NotFoundError.js";
import { ISeriesRepository } from "../../domain/interfaces/ISeriesRepository.js";
import { GetSerieByIdResponse } from "../dto/response/get-serie-by-id-response.validator.js";

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
