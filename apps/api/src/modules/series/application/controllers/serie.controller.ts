import { BaseController } from "../../../../shared/infrastructure/base/controllers/BaseController.js";
import { Controller } from "../../../../shared/infrastructure/decorators/controller.decorator.js";
import { ApiResponse } from "../../../../shared/infrastructure/decorators/response.decorator.js";
import { Get } from "../../../../shared/infrastructure/decorators/route.decorators.js";
import {
  ValidateParams,
  ValidateQuery,
} from "../../../../shared/infrastructure/decorators/validation.decorators.js";
import { notFoundErrorResponseSchema } from "../../../../shared/schemas/base/error.schemas.js";
import { asyncHandler } from "../../../../shared/utils/asyncHandler.js";
import {
  type GetSerieByIdValidatorParams,
  getSerieByIdValidatorParams,
} from "../dto/requests/get-serie-by-id-params.validator.js";
import {
  type QuerySerieRequest,
  querySerieRequestSchema,
} from "../dto/requests/query-serie.validator.js";
import {
  type GetSerieByIdResponse,
  getSerieByIdResponseSchema,
} from "../dto/response/get-serie-by-id-response.validator.js";
import {
  type QuerySerieResponse,
  querySerieResponseSchema,
} from "../dto/response/query-serie.validator.js";
import type { GetSerieByIdUseCase } from "../use-cases/get-serie-by-id.use-case.js";
import type { QuerySerieUseCase } from "../use-cases/query-serie.use-case.js";

@Controller({
  tag: "Series",
  prefix: "/series",
  description: "Series management.",
})
export class SeriesController extends BaseController {
  constructor(
    private readonly querySeriesUseCase: QuerySerieUseCase,
    private readonly getSerieByIdUseCase: GetSerieByIdUseCase
  ) {
    super();
  }

  @Get({
    path: "/",
    description: "List series with pagination",
    summary: "Query series",
  })
  @ValidateQuery(querySerieRequestSchema)
  @ApiResponse(200, "Series retrieved successfully", querySerieResponseSchema)
  querySeries = asyncHandler(async (req, res): Promise<QuerySerieResponse> => {
    const query = req.query as QuerySerieRequest;

    const response = await this.querySeriesUseCase.execute(query);

    res.status(200).json(response);

    return response;
  });

  @Get({
    path: "/:id",
    description: "Get serie by id",
  })
  @ValidateParams(getSerieByIdValidatorParams)
  @ApiResponse(404, "Serie not found", notFoundErrorResponseSchema)
  @ApiResponse(200, "Serie retrieved successfully", getSerieByIdResponseSchema)
  getSerieById = asyncHandler(
    async (req, res): Promise<GetSerieByIdResponse> => {
      const { id } = req.params as GetSerieByIdValidatorParams;

      const serie = await this.getSerieByIdUseCase.execute(id);

      res.status(200).json({
        success: true,
        message: "Serie retrieved successfully",
        data: serie,
      });

      return serie;
    }
  );
}
