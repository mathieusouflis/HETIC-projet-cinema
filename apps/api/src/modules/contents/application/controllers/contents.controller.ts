import { BaseController } from "../../../../shared/infrastructure/base/controllers/BaseController.js";
import { Controller } from "../../../../shared/infrastructure/decorators/controller.decorator.js";
import { ApiResponse } from "../../../../shared/infrastructure/decorators/response.decorator.js";
import { Get } from "../../../../shared/infrastructure/decorators/route.decorators.js";
import { ValidateParams, ValidateQuery } from "../../../../shared/infrastructure/decorators/validation.decorators.js";
import { notFoundErrorResponseSchema } from "../../../../shared/schemas/base/error.schemas.js";
import { createSuccessResponse } from "../../../../shared/schemas/base/response.schemas.js";
import { asyncHandler } from "../../../../shared/utils/asyncHandler.js";
import { GetContentByIdValidatorParams, getContentByIdValidatorParams } from "../dto/requests/get-content-by-id-params.validator.js";
import { QueryContentRequest, queryContentRequestSchema } from "../dto/requests/query-contents.validator.js";
import { GetContentByIdResponse, getContentByIdResponseSchema } from "../dto/response/get-content-by-id-response.validator.js";
import { QueryContentResponse, queryContentResponseSchema } from "../dto/response/query-content.validator.js";
import { GetContentByIdUseCase } from "../use-cases/get-content-by-id.use-case.js";
import { QueryContentUseCase } from "../use-cases/query-content.use-case.js";

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
    description: "List contents by type",
  })
  @ValidateQuery(queryContentRequestSchema)
  @ApiResponse(200, "Contents retrieved successfully", createSuccessResponse(queryContentResponseSchema))
  queryContents = asyncHandler(async (req, res): Promise<QueryContentResponse> => {
    const query = req.query as QueryContentRequest;

    const contents = await this.queryContentsUseCase.execute(query);

    res.status(200).json({
      success: true,
      message: "Contents retrieved successfully",
      data: contents,
    });

    return contents;
  });

  @Get({
    path: "/:id",
    description: "Get content by id",
  })
  @ValidateParams(getContentByIdValidatorParams)
  @ApiResponse(404, "Content not found", notFoundErrorResponseSchema  )
  @ApiResponse(200, "Content retrieved successfully", getContentByIdResponseSchema)
  getContentById = asyncHandler(async (req, res): Promise<GetContentByIdResponse> => {
    const {id} = req.params as GetContentByIdValidatorParams;

    const content = await this.getContentByIdUseCase.execute(id);

    res.status(200).json({
      success: true,
      message: "Content retrieved successfully",
      data: content,
    });

    return content;
  });

}
