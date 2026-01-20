import { BaseController } from "../../../../shared/infrastructure/base/controllers/BaseController.js";
import { Controller } from "../../../../shared/infrastructure/decorators/controller.decorator.js";
import { ApiResponse } from "../../../../shared/infrastructure/decorators/response.decorator.js";
import { Get } from "../../../../shared/infrastructure/decorators/route.decorators.js";
import { ValidateQuery } from "../../../../shared/infrastructure/decorators/validation.decorators.js";
import { asyncHandler } from "../../../../shared/utils/asyncHandler.js";
import { QueryContentRequest, queryContentRequestSchema } from "../dto/requests/query-contents.validator.js";
import { QueryContentResponse, queryContentResponseSchema } from "../dto/response/query-content.validator.js";
import { QueryContentUseCase } from "../use-cases/query-content.use-case.js";

@Controller({
  tag: "Contents",
  prefix: "/contents",
  description: "Content management for movies, series and actors",
})
export class ContentsController extends BaseController {
  constructor(
    private readonly queryContentsUseCase: QueryContentUseCase,
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
  @ApiResponse(200, "Content retrieved successfully", queryContentResponseSchema)
  queryContents = asyncHandler(async (req, res): Promise<QueryContentResponse> => {
    const query = req.query as QueryContentRequest;

    const contents = await this.queryContentsUseCase.execute(query);

    res.status(200).json(contents);

    return [];
  });
}
