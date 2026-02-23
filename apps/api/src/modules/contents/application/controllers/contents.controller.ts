import { BaseController } from "../../../../shared/infrastructure/base/controllers/base-controller.js";
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
  type GetContentByIdValidatorParams,
  getContentByIdValidatorParams,
} from "../dto/requests/get-content-by-id-params.validator.js";
import {
  type GetContentByIdValidatorQuery,
  getContentByIdValidatorQuery,
} from "../dto/requests/get-content-by-id-query.validator.js";
import {
  type QueryContentRequest,
  queryContentRequestSchema,
} from "../dto/requests/query-contents.validator.js";
import {
  type GetContentByIdResponse,
  getContentByIdResponseSchema,
} from "../dto/response/get-content-by-id-response.validator.js";
import {
  type QueryContentResponse,
  queryContentResponseSchema,
} from "../dto/response/query-content.validator.js";
import type { GetContentByIdUseCase } from "../use-cases/get-content-by-id.use-case.js";
import type { QueryContentUseCase } from "../use-cases/query-content.use-case.js";

@Controller({
  tag: "Contents",
  prefix: "/contents",
  description: "Content management for movies, series and actors",
})
export class ContentsController extends BaseController {
  constructor(
    private readonly queryContentsUseCase: QueryContentUseCase,
    private readonly getContentByIdUseCase: GetContentByIdUseCase
  ) {
    super();
  }

  // @Get({
  //   path: "/:id",
  //   description: "Get content by id",
  // })
  // getContentById = asyncHandler(async (req, res) => {
  //   const { id } = req.params;
  // });

  @Get({
    path: "/",
    description: "List contents with pagination",
    summary: "Query contents",
  })
  @ValidateQuery(queryContentRequestSchema)
  @ApiResponse(
    200,
    "Contents retrieved successfully",
    queryContentResponseSchema
  )
  queryContents = asyncHandler(
    async (req, res): Promise<QueryContentResponse> => {
      const query = req.query as QueryContentRequest;

      const response = await this.queryContentsUseCase.execute(query);

      res.status(200).json(response);

      return response;
    }
  );

  @Get({
    path: "/:id",
    description: "Get content by id",
  })
  @ValidateParams(getContentByIdValidatorParams)
  @ValidateQuery(getContentByIdValidatorQuery)
  @ApiResponse(404, "Content not found", notFoundErrorResponseSchema)
  @ApiResponse(
    200,
    "Content retrieved successfully",
    getContentByIdResponseSchema
  )
  getContentById = asyncHandler(
    async (req, res): Promise<GetContentByIdResponse> => {
      const { id } = req.params as GetContentByIdValidatorParams;
      const {
        withCast,
        withCategory,
        withPlatform,
        withSeasons,
        withEpisodes,
      } = req.query as GetContentByIdValidatorQuery;

      const content = await this.getContentByIdUseCase.execute({
        id,
        withCast: withCast === "true",
        withCategory: withCategory === "true",
        withPlatform: withPlatform === "true",
        withSeasons: withSeasons === "true",
        withEpisodes: withEpisodes === "true",
      });
      const response: GetContentByIdResponse = {
        success: true,
        data: content,
      };
      res.status(200).json(response);

      return response;
    }
  );
}
