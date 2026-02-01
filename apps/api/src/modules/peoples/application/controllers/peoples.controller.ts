import { UnauthorizedError } from "../../../../shared/errors";
import { BaseController } from "../../../../shared/infrastructure/base/controllers";
import {
  ApiResponse,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Protected,
  ValidateBody,
  ValidateParams,
  ValidateQuery,
} from "../../../../shared/infrastructure/decorators";
import {
  notFoundErrorResponseSchema,
  unauthorizedErrorResponseSchema,
} from "../../../../shared/schemas/base/error.schemas";
import { createSuccessResponseSchema } from "../../../../shared/schemas/base/response.schemas";
import { asyncHandler } from "../../../../shared/utils";
import {
  type CreatePeopleBody,
  createPeopleBodyValidator,
} from "../dto/request/create-people.body.validator";
import {
  type GetPeopleByIdParams,
  getPeopleByIdParamsValidator,
} from "../dto/request/get-people-by-id.params.validator";
// Request validators
import {
  type ListPeoplesParams,
  listPeoplesParamsValidator,
} from "../dto/request/list-peoples.params.validator";
import {
  type SearchPeopleParams,
  searchPeopleParamsValidator,
} from "../dto/request/search-people.params.validator";
import { updatePeopleBodyValidator } from "../dto/request/update-people.body.validator";
import {
  type CreatePeopleResponse,
  createPeopleResponseValidator,
} from "../dto/response/create-people.response.validator";
import {
  type GetPeopleByIdResponse,
  getPeopleByIdResponseValidator,
} from "../dto/response/get-people-by-id.response.validator";
// Response validators
import {
  type ListPeoplesResponse,
  ListPeoplesResponseValidator,
} from "../dto/response/list-peoples.response.validator";
import {
  type SearchPeopleResponse,
  searchPeopleResponseValidator,
} from "../dto/response/search-people.response.validator";
import {
  type UpdatePeopleResponse,
  updatePeopleResponseValidator,
} from "../dto/response/update-people.response.validator";
import type { CreatePeopleUseCase } from "../use-cases/create-people.use-case";
import type { DeletePeopleUseCase } from "../use-cases/delete-people.use-case";
import type { GetPeopleUseCase } from "../use-cases/get-people.use-case";
// Use cases
import type { ListPeoplesUseCase } from "../use-cases/list-peoples.use-case";
import type { SearchPeopleUseCase } from "../use-cases/search-people.use-case";
import type { UpdatePeopleUseCase } from "../use-cases/update-people.use-case";

@Controller({
  tag: "Peoples",
  prefix: "/peoples",
  description:
    "People management for actors, directors, and other film industry professionals.",
})
export class PeoplesController extends BaseController {
  constructor(
    private readonly listPeoplesUseCase: ListPeoplesUseCase,
    private readonly searchPeopleUseCase: SearchPeopleUseCase,
    private readonly getPeopleUseCase: GetPeopleUseCase,
    private readonly createPeopleUseCase: CreatePeopleUseCase,
    // @ts-expect-error
    private readonly updatePeopleUseCase: UpdatePeopleUseCase,
    // @ts-expect-error
    private readonly deletePeopleUseCase: DeletePeopleUseCase
  ) {
    super();
  }

  @Get({
    path: "/",
    description: "List people with optional filters and pagination",
    summary: "Query people with offset-based pagination",
  })
  @ValidateQuery(listPeoplesParamsValidator)
  @ApiResponse(
    200,
    "People retrieved successfully",
    ListPeoplesResponseValidator
  )
  listPeoples = asyncHandler(async (req, res): Promise<ListPeoplesResponse> => {
    const params = req.query as ListPeoplesParams;

    const response = await this.listPeoplesUseCase.execute(params);

    res.status(200).json(response);

    return response;
  });

  @Get({
    path: "/search",
    description: "Search people on TMDB and sync to database",
    summary: "Search people with pagination",
  })
  @ValidateQuery(searchPeopleParamsValidator)
  @ApiResponse(
    200,
    "People search completed successfully",
    searchPeopleResponseValidator
  )
  searchPeople = asyncHandler(
    async (req, res): Promise<SearchPeopleResponse> => {
      const params = req.query as unknown as SearchPeopleParams;

      const response = await this.searchPeopleUseCase.execute(params);

      res.status(200).json(response);

      return response;
    }
  );

  @Get({
    path: "/:id",
    description: "Get a person by ID",
  })
  @ValidateParams(getPeopleByIdParamsValidator)
  @ApiResponse(404, "Person not found", notFoundErrorResponseSchema)
  @ApiResponse(
    200,
    "Person retrieved successfully",
    createSuccessResponseSchema(getPeopleByIdResponseValidator)
  )
  getPeopleById = asyncHandler(
    async (req, res): Promise<GetPeopleByIdResponse> => {
      const { id } = req.params as GetPeopleByIdParams;

      const people = await this.getPeopleUseCase.execute(id);
      const jsonPeople = people.toJSON();

      res.status(200).json({
        success: true,
        message: "Person retrieved successfully",
        data: jsonPeople,
      });

      return jsonPeople;
    }
  );

  @Post({
    path: "/",
    description: "Create a new person",
  })
  @ValidateBody(createPeopleBodyValidator)
  @ApiResponse(
    201,
    "Person created successfully",
    createSuccessResponseSchema(createPeopleResponseValidator)
  )
  createPeople = asyncHandler(
    async (req, res): Promise<CreatePeopleResponse> => {
      const body = req.body as CreatePeopleBody;

      const people = await this.createPeopleUseCase.execute({
        ...body,
        birthDate: body.birthDate
          ? new Date(body.birthDate).toISOString()
          : undefined,
      });
      const jsonPeople = people.toJSON();

      res.status(201).json({
        success: true,
        message: "Person created successfully",
        data: jsonPeople,
      });

      return jsonPeople;
    }
  );

  @Patch({
    path: "/:id",
    description: "Update a person",
  })
  @Protected()
  @ValidateParams(getPeopleByIdParamsValidator)
  @ValidateBody(updatePeopleBodyValidator)
  @ApiResponse(404, "Person not found", notFoundErrorResponseSchema)
  @ApiResponse(401, "Unauthorized", unauthorizedErrorResponseSchema)
  @ApiResponse(
    200,
    "Person updated successfully",
    createSuccessResponseSchema(updatePeopleResponseValidator)
  )
  updatePeople = asyncHandler(
    async (_req, _res): Promise<UpdatePeopleResponse> => {
      throw new UnauthorizedError(
        "Authorisation not implemented for this route."
      );

      // const { id } = req.params as GetPeopleByIdParams;
      // const body = req.body as UpdatePeopleBody;

      // const people = await this.updatePeopleUseCase.execute(id, {
      //     ...body,
      //     birthDate: body.birthDate ? new Date(body.birthDate).toISOString() : undefined
      // });
      // const jsonPeople = people.toJSON();

      // res.status(200).json({
      //   success: true,
      //   message: "Person updated successfully",
      //   data: jsonPeople,
      // });

      // return jsonPeople;
    }
  );

  @Delete({
    path: "/:id",
    description: "Delete a person",
  })
  @Protected()
  @ValidateParams(getPeopleByIdParamsValidator)
  @ApiResponse(404, "Person not found", notFoundErrorResponseSchema)
  @ApiResponse(401, "Unauthorized", unauthorizedErrorResponseSchema)
  @ApiResponse(200, "Person deleted successfully")
  deletePeople = asyncHandler(async (_req, _res): Promise<void> => {
    throw new UnauthorizedError(
      "Authorisation not implemented for this route."
    );

    //   const { id } = req.params as GetPeopleByIdParams;

    //   await this.deletePeopleUseCase.execute(id);

    //   res.status(200).json({
    //     success: true,
    //     message: "Person deleted successfully",
    //     data: null,
    //   });
  });
}
