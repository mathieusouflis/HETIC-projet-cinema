import { BaseController } from "../../../../shared/infrastructure/base/controllers";
import {
  ApiResponse,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  ValidateBody,
  ValidateParams,
  ValidateQuery,
} from "../../../../shared/infrastructure/decorators";
import { asyncHandler } from "../../../../shared/utils";
import { notFoundErrorResponseSchema } from "../../../../shared/schemas/base/error.schemas";
import { createSuccessResponse } from "../../../../shared/schemas/base/response.schemas";

// Request validators
import { ListPeoplesParams, listPeoplesParamsValidator } from "../dto/request/list-peoples.params.validator";
import { SearchPeopleParams, searchPeopleParamsValidator } from "../dto/request/search-people.params.validator";
import { GetPeopleByIdParams, getPeopleByIdParamsValidator } from "../dto/request/get-people-by-id.params.validator";
import { CreatePeopleBody, createPeopleBodyValidator } from "../dto/request/create-people.body.validator";
import { UpdatePeopleBody, updatePeopleBodyValidator } from "../dto/request/update-people.body.validator";

// Response validators
import { ListPeoplesResponse, ListPeoplesResponseValidator } from "../dto/response/list-peoples.response.validator";
import { SearchPeopleResponse, searchPeopleResponseValidator } from "../dto/response/search-people.response.validator";
import { GetPeopleByIdResponse, getPeopleByIdResponseValidator } from "../dto/response/get-people-by-id.response.validator";
import { CreatePeopleResponse, createPeopleResponseValidator } from "../dto/response/create-people.response.validator";
import { UpdatePeopleResponse, updatePeopleResponseValidator } from "../dto/response/update-people.response.validator";

// Use cases
import { ListPeoplesUseCase } from "../use-cases/list-peoples.use-case";
import { SearchPeopleUseCase } from "../use-cases/search-people.use-case";
import { GetPeopleUseCase } from "../use-cases/get-people.use-case";
import { CreatePeopleUseCase } from "../use-cases/create-people.use-case";
import { UpdatePeopleUseCase } from "../use-cases/update-people.use-case";
import { DeletePeopleUseCase } from "../use-cases/delete-people.use-case";

@Controller({
  tag: "Peoples",
  prefix: "/peoples",
  description: "People management for actors, directors, and other film industry professionals.",
})
export class PeoplesController extends BaseController {
  constructor(
    private readonly listPeoplesUseCase: ListPeoplesUseCase,
    private readonly searchPeopleUseCase: SearchPeopleUseCase,
    private readonly getPeopleUseCase: GetPeopleUseCase,
    private readonly createPeopleUseCase: CreatePeopleUseCase,
    private readonly updatePeopleUseCase: UpdatePeopleUseCase,
    private readonly deletePeopleUseCase: DeletePeopleUseCase
  ) {
    super();
  }

  @Get({
    path: "/",
    description: "List people with optional filters and pagination",
  })
  @ValidateQuery(listPeoplesParamsValidator)
  @ApiResponse(200, "People retrieved successfully", createSuccessResponse(ListPeoplesResponseValidator))
  listPeoples = asyncHandler(async (req, res): Promise<ListPeoplesResponse> => {
    const params = req.query as ListPeoplesParams;

    const peoples = await this.listPeoplesUseCase.execute(params);
    const jsonPeoples = peoples.map((people) => people.toJSON());

    res.status(200).json({
      success: true,
      message: "People retrieved successfully",
      data: jsonPeoples,
    });

    return jsonPeoples;
  });

  @Get({
    path: "/search",
    description: "Search people on TMDB and sync to database",
  })
  @ValidateQuery(searchPeopleParamsValidator)
  @ApiResponse(200, "People search completed successfully", createSuccessResponse(searchPeopleResponseValidator))
  searchPeople = asyncHandler(async (req, res): Promise<SearchPeopleResponse> => {
    const params = req.query as unknown as SearchPeopleParams;

    const peoples = await this.searchPeopleUseCase.execute(params);
    const jsonPeoples = peoples.map((people) => people.toJSON());

    res.status(200).json({
      success: true,
      message: "People search completed successfully",
      data: jsonPeoples,
    });

    return jsonPeoples;
  });

  @Get({
    path: "/:id",
    description: "Get a person by ID",
  })
  @ValidateParams(getPeopleByIdParamsValidator)
  @ApiResponse(404, "Person not found", notFoundErrorResponseSchema)
  @ApiResponse(200, "Person retrieved successfully", createSuccessResponse(getPeopleByIdResponseValidator))
  getPeopleById = asyncHandler(async (req, res): Promise<GetPeopleByIdResponse> => {
    const { id } = req.params as GetPeopleByIdParams;

    const people = await this.getPeopleUseCase.execute(id);
    const jsonPeople = people.toJSON();

    res.status(200).json({
      success: true,
      message: "Person retrieved successfully",
      data: jsonPeople,
    });

    return jsonPeople;
  });

  @Post({
    path: "/",
    description: "Create a new person",
  })
  @ValidateBody(createPeopleBodyValidator)
  @ApiResponse(201, "Person created successfully", createSuccessResponse(createPeopleResponseValidator))
  createPeople = asyncHandler(async (req, res): Promise<CreatePeopleResponse> => {
    const body = req.body as CreatePeopleBody;

    const people = await this.createPeopleUseCase.execute({
        ...body,
        birthDate: body.birthDate ? new Date(body.birthDate).toISOString() : undefined
    });
    const jsonPeople = people.toJSON();

    res.status(201).json({
      success: true,
      message: "Person created successfully",
      data: jsonPeople,
    });

    return jsonPeople;
  });

  @Patch({
    path: "/:id",
    description: "Update a person",
  })
  @ValidateParams(getPeopleByIdParamsValidator)
  @ValidateBody(updatePeopleBodyValidator)
  @ApiResponse(404, "Person not found", notFoundErrorResponseSchema)
  @ApiResponse(200, "Person updated successfully", createSuccessResponse(updatePeopleResponseValidator))
  updatePeople = asyncHandler(async (req, res): Promise<UpdatePeopleResponse> => {
    const { id } = req.params as GetPeopleByIdParams;
    const body = req.body as UpdatePeopleBody;

    const people = await this.updatePeopleUseCase.execute(id, {
        ...body,
        birthDate: body.birthDate ? new Date(body.birthDate).toISOString() : undefined
    });
    const jsonPeople = people.toJSON();

    res.status(200).json({
      success: true,
      message: "Person updated successfully",
      data: jsonPeople,
    });

    return jsonPeople;
  });

  @Delete({
    path: "/:id",
    description: "Delete a person",
  })
  @ValidateParams(getPeopleByIdParamsValidator)
  @ApiResponse(404, "Person not found", notFoundErrorResponseSchema)
  @ApiResponse(200, "Person deleted successfully")
  deletePeople = asyncHandler(async (req, res): Promise<void> => {
    const { id } = req.params as GetPeopleByIdParams;

    await this.deletePeopleUseCase.execute(id);

    res.status(200).json({
      success: true,
      message: "Person deleted successfully",
      data: null,
    });
  });
}
