# Adding an Endpoint to an Existing Module

Use this guide when a module already exists and you just need to add one new route — without changing the overall structure.

---

## The five-step process

```
1. Define or update a DTO (request and/or response Zod schema)
2. Write the use case (business logic)
3. Add the handler method to the controller
4. Inject the new use case in the module file
5. Regenerate the SDK
```

---

## Example — add `GET /reviews/:id` to the reviews module

### 1. Define the DTO (if not already there)

The response schema already exists (`reviewResponseValidator`). The params schema can be defined inline in the controller.

### 2. Write the use case

`apps/api/src/modules/reviews/application/use-cases/get-review-by-id.usecase.ts`:

```typescript
import { NotFoundError } from "../../../../../shared/errors/index.js";
import type { IReviewRepository } from "../../domain/interfaces/IReviewRepository.js";
import type { Review } from "../../domain/entities/review.entity.js";

export class GetReviewByIdUseCase {
  constructor(private readonly reviewRepository: IReviewRepository) {}

  async execute(id: string): Promise<Review> {
    const review = await this.reviewRepository.findById(id);
    if (!review) throw new NotFoundError(`Review ${id}`);
    return review;
  }
}
```

### 3. Add the repository method (if missing)

The `findById` method is already in `IReviewRepository` and `DrizzleReviewRepository` from the creation guide. Nothing to add here.

### 4. Add the handler to the controller

Open `reviews.controller.ts` and add the new method:

```typescript
// Add to constructor params:
private readonly getReviewByIdUseCase: GetReviewByIdUseCase

// Add the handler:
@Get({ path: "/:id", summary: "Get a review by ID" })
@ValidateParams(z.object({ id: z.string().uuid() }))
@ApiResponse(200, "Review found", createSuccessResponseSchema(reviewResponseValidator))
@ApiResponse(404, "Review not found", notFoundErrorResponseSchema)
getById = asyncHandler(async (req: Request, res: Response) => {
  const review = await this.getReviewByIdUseCase.execute(req.params.id);
  res.status(200).json({ success: true, data: review.toJSON() });
});
```

### 5. Inject the use case in the module

Open `reviews.module.ts` and update the constructor:

```typescript
// Add field
private readonly getByIdUseCase: GetReviewByIdUseCase;

// In constructor body, before controller instantiation:
this.getByIdUseCase = new GetReviewByIdUseCase(this.repository);

// Pass to controller:
this.controller = new ReviewsController(
  this.createUseCase,
  this.listUseCase,
  this.deleteUseCase,
  this.getByIdUseCase,  // ← new
);
```

### 6. Regenerate the SDK

```bash
pnpm generate-sdk
```

The new function `gETReviewsId` is now available in `@packages/api-sdk`.

---

## Tips

- **Route order matters.** If you add `/:id` alongside `/`, put specific static paths before dynamic ones, e.g. `/search` before `/:id`.
- **One use case per operation.** Don't put two logical operations in the same use case method.
- **Keep the controller thin.** The handler should: validate auth, call the use case, format the response. Nothing else.
- **Always add `@ApiResponse` decorators.** They are how Swagger UI and the SDK stay accurate.
