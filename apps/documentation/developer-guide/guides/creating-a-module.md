# Creating a New Module

This guide walks through adding a complete feature module to the API — from the database schema to the registered route — using a `reviews` module as a concrete example.

**Estimated time:** 45–90 minutes for a module with 4–5 endpoints.

---

## Prerequisites

- The dev environment is running (`pnpm dev:local`)
- You understand the [Clean Architecture layers](../architecture/module-pattern.md)
- You understand the [decorator system](../architecture/decorator-system.md)

---

## Module anatomy

```
apps/api/src/modules/reviews/
├── reviews.module.ts                         ← DI wiring + router generation
├── application/
│   ├── controllers/
│   │   └── reviews.controller.ts             ← HTTP handlers (decorators)
│   ├── use-cases/
│   │   ├── create-review.usecase.ts
│   │   ├── list-reviews.usecase.ts
│   │   └── delete-review.usecase.ts
│   └── dto/
│       ├── request/
│       │   └── create-review.dto.ts          ← Zod request schemas
│       └── response/
│           └── review.response.validator.ts  ← Zod response schemas
├── domain/
│   ├── entities/
│   │   └── review.entity.ts
│   └── interfaces/
│       ├── IReviewRepository.ts
│       └── review.repository.mock.ts         ← in-memory mock for tests
└── infrastructure/
    └── database/
        ├── schemas/
        │   └── reviews.schema.ts             ← Drizzle table definition
        └── repositories/
            └── drizzle-reviews.repository.ts
```

---

## Step 1 — Define the Drizzle schema

Create `apps/api/src/modules/reviews/infrastructure/database/schemas/reviews.schema.ts`:

```typescript
import { pgTable, uuid, text, varchar, boolean, timestamp, integer } from "drizzle-orm/pg-core";
import { users } from "../../../../../database/schema.js";
import { content } from "../../../../contents/infrastructure/database/schemas/content.schema.js";

export const reviews = pgTable("reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  contentId: uuid("content_id")
    .notNull()
    .references(() => content.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  body: text("body").notNull(),
  isSpoiler: boolean("is_spoiler").notNull().default(false),
  likesCount: integer("likes_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});
```

Then register it in `apps/api/src/database/schema.ts`:

```typescript
// Add to the existing exports
export { reviews } from "../modules/reviews/infrastructure/database/schemas/reviews.schema.js";
```

---

## Step 2 — Generate and apply the migration

```bash
cd apps/api
pnpm db:generate   # creates a new file in src/database/migrations/
pnpm db:migrate    # applies it to the running Postgres container
```

Verify with Drizzle Studio:
```bash
pnpm db:studio
```

---

## Step 3 — Define the domain entity

Create `apps/api/src/modules/reviews/domain/entities/review.entity.ts`:

```typescript
export interface ReviewProps {
  id: string;
  userId: string;
  contentId: string;
  title: string;
  body: string;
  isSpoiler: boolean;
  likesCount: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export class Review {
  readonly id: string;
  readonly userId: string;
  readonly contentId: string;
  readonly title: string;
  readonly body: string;
  readonly isSpoiler: boolean;
  readonly likesCount: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly deletedAt: Date | null;

  constructor(props: ReviewProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.contentId = props.contentId;
    this.title = props.title;
    this.body = props.body;
    this.isSpoiler = props.isSpoiler;
    this.likesCount = props.likesCount;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.deletedAt = props.deletedAt ?? null;
  }

  isDeleted(): boolean {
    return this.deletedAt !== null;
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      contentId: this.contentId,
      title: this.title,
      body: this.body,
      isSpoiler: this.isSpoiler,
      likesCount: this.likesCount,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
```

---

## Step 4 — Define the repository interface

Create `apps/api/src/modules/reviews/domain/interfaces/IReviewRepository.ts`:

```typescript
import type { Review } from "../entities/review.entity.js";

export interface CreateReviewInput {
  userId: string;
  contentId: string;
  title: string;
  body: string;
  isSpoiler?: boolean;
}

export interface IReviewRepository {
  findById(id: string): Promise<Review | null>;
  findByContent(contentId: string, page: number, limit: number): Promise<{ data: Review[]; total: number }>;
  create(input: CreateReviewInput): Promise<Review>;
  delete(id: string): Promise<void>;
}
```

---

## Step 5 — Implement the Drizzle repository

Create `apps/api/src/modules/reviews/infrastructure/database/repositories/drizzle-reviews.repository.ts`:

```typescript
import { and, count, eq, isNull } from "drizzle-orm";
import { db } from "../../../../../database/connection.js";
import { reviews } from "../schemas/reviews.schema.js";
import { Review } from "../../../domain/entities/review.entity.js";
import type {
  CreateReviewInput,
  IReviewRepository,
} from "../../../domain/interfaces/IReviewRepository.js";
import { NotFoundError, ServerError } from "../../../../../shared/errors/index.js";

export class DrizzleReviewRepository implements IReviewRepository {
  async findById(id: string): Promise<Review | null> {
    const rows = await db
      .select()
      .from(reviews)
      .where(and(eq(reviews.id, id), isNull(reviews.deletedAt)));
    return rows[0] ? new Review(rows[0]) : null;
  }

  async findByContent(
    contentId: string,
    page: number,
    limit: number
  ): Promise<{ data: Review[]; total: number }> {
    const offset = (page - 1) * limit;
    const [rows, totals] = await Promise.all([
      db
        .select()
        .from(reviews)
        .where(and(eq(reviews.contentId, contentId), isNull(reviews.deletedAt)))
        .limit(limit)
        .offset(offset)
        .orderBy(reviews.createdAt),
      db
        .select({ total: count() })
        .from(reviews)
        .where(and(eq(reviews.contentId, contentId), isNull(reviews.deletedAt))),
    ]);
    return { data: rows.map((r) => new Review(r)), total: totals[0]?.total ?? 0 };
  }

  async create(input: CreateReviewInput): Promise<Review> {
    const inserted = await db.insert(reviews).values(input).returning();
    if (!inserted[0]) throw new ServerError("Failed to create review");
    return new Review(inserted[0]);
  }

  async delete(id: string): Promise<void> {
    const result = await db
      .update(reviews)
      .set({ deletedAt: new Date() })
      .where(eq(reviews.id, id))
      .returning();
    if (result.length === 0) throw new NotFoundError(`Review ${id}`);
  }
}
```

---

## Step 6 — Create the mock repository (for tests)

Create `apps/api/src/modules/reviews/domain/interfaces/review.repository.mock.ts`:

```typescript
import type { IReviewRepository, CreateReviewInput } from "./IReviewRepository.js";
import { Review } from "../entities/review.entity.js";
import { NotFoundError } from "../../../../../shared/errors/index.js";

export function createMockReviewRepository(): IReviewRepository {
  const store = new Map<string, Review>();

  return {
    async findById(id) {
      return store.get(id) ?? null;
    },
    async findByContent(contentId, page, limit) {
      const all = [...store.values()].filter((r) => r.contentId === contentId && !r.isDeleted());
      const offset = (page - 1) * limit;
      return { data: all.slice(offset, offset + limit), total: all.length };
    },
    async create(input) {
      const review = new Review({
        id: crypto.randomUUID(),
        userId: input.userId,
        contentId: input.contentId,
        title: input.title,
        body: input.body,
        isSpoiler: input.isSpoiler ?? false,
        likesCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });
      store.set(review.id, review);
      return review;
    },
    async delete(id) {
      if (!store.has(id)) throw new NotFoundError(`Review ${id}`);
      store.delete(id);
    },
  };
}
```

---

## Step 7 — Define DTOs

**Request** — `apps/api/src/modules/reviews/application/dto/request/create-review.dto.ts`:

```typescript
import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const createReviewValidator = z.object({
  contentId: z.string().uuid().openapi({ description: "ID of the content being reviewed" }),
  title: z.string().min(1).max(255).openapi({ description: "Review title" }),
  body: z.string().min(10).openapi({ description: "Review body text" }),
  isSpoiler: z.boolean().optional().default(false).openapi({ description: "Mark as spoiler" }),
});

export type CreateReviewDTO = z.infer<typeof createReviewValidator>;
```

**Response** — `apps/api/src/modules/reviews/application/dto/response/review.response.validator.ts`:

```typescript
import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const reviewResponseValidator = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  contentId: z.string().uuid(),
  title: z.string(),
  body: z.string(),
  isSpoiler: z.boolean(),
  likesCount: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
```

---

## Step 8 — Write use cases

**Create** — `apps/api/src/modules/reviews/application/use-cases/create-review.usecase.ts`:

```typescript
import type { IReviewRepository } from "../../domain/interfaces/IReviewRepository.js";
import type { Review } from "../../domain/entities/review.entity.js";
import type { CreateReviewDTO } from "../dto/request/create-review.dto.js";

export class CreateReviewUseCase {
  constructor(private readonly reviewRepository: IReviewRepository) {}

  async execute(userId: string, dto: CreateReviewDTO): Promise<Review> {
    return this.reviewRepository.create({ userId, ...dto });
  }
}
```

**List** — `apps/api/src/modules/reviews/application/use-cases/list-reviews.usecase.ts`:

```typescript
import type { IReviewRepository } from "../../domain/interfaces/IReviewRepository.js";
import type { Review } from "../../domain/entities/review.entity.js";

export class ListReviewsUseCase {
  constructor(private readonly reviewRepository: IReviewRepository) {}

  async execute(
    contentId: string,
    page = 1,
    limit = 20
  ): Promise<{ data: Review[]; total: number }> {
    return this.reviewRepository.findByContent(contentId, page, limit);
  }
}
```

**Delete** — `apps/api/src/modules/reviews/application/use-cases/delete-review.usecase.ts`:

```typescript
import { ForbiddenError, NotFoundError } from "../../../../../shared/errors/index.js";
import type { IReviewRepository } from "../../domain/interfaces/IReviewRepository.js";

export class DeleteReviewUseCase {
  constructor(private readonly reviewRepository: IReviewRepository) {}

  async execute(userId: string, reviewId: string): Promise<void> {
    const review = await this.reviewRepository.findById(reviewId);
    if (!review) throw new NotFoundError(`Review ${reviewId}`);
    if (review.userId !== userId) throw new ForbiddenError("Cannot delete another user's review");
    await this.reviewRepository.delete(reviewId);
  }
}
```

---

## Step 9 — Write the controller

`apps/api/src/modules/reviews/application/controllers/reviews.controller.ts`:

```typescript
import { z } from "zod";
import type { Request, Response } from "express";
import { Controller } from "../../../../shared/infrastructure/decorators/rest/controller.decorator.js";
import { Get, Post, Delete } from "../../../../shared/infrastructure/decorators/rest/route.decorators.js";
import { Protected } from "../../../../shared/infrastructure/decorators/rest/auth.decorator.js";
import { ValidateBody, ValidateParams, ValidateQuery } from "../../../../shared/infrastructure/decorators/rest/validation.decorators.js";
import { ApiResponse } from "../../../../shared/infrastructure/decorators/rest/response.decorator.js";
import { BaseController } from "../../../../shared/infrastructure/base/controllers/base-controller.js";
import { asyncHandler } from "../../../../shared/utils/asyncHandler.js";
import { UnauthorizedError } from "../../../../shared/errors/index.js";
import {
  createSuccessResponseSchema,
  successResponseSchema,
} from "../../../../shared/schemas/base/response.schemas.js";
import {
  notFoundErrorResponseSchema,
  forbiddenErrorResponseSchema,
  validationErrorResponseSchema,
} from "../../../../shared/schemas/base/error.schemas.js";
import { createReviewValidator } from "../dto/request/create-review.dto.js";
import { reviewResponseValidator } from "../dto/response/review.response.validator.js";
import type { CreateReviewUseCase } from "../use-cases/create-review.usecase.js";
import type { ListReviewsUseCase } from "../use-cases/list-reviews.usecase.js";
import type { DeleteReviewUseCase } from "../use-cases/delete-review.usecase.js";

const listQueryValidator = z.object({
  contentId: z.string().uuid(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

@Controller({
  tag: "Reviews",
  prefix: "/reviews",
  description: "User reviews for movies and series",
})
export class ReviewsController extends BaseController {
  constructor(
    private readonly createReviewUseCase: CreateReviewUseCase,
    private readonly listReviewsUseCase: ListReviewsUseCase,
    private readonly deleteReviewUseCase: DeleteReviewUseCase
  ) {
    super();
  }

  @Get({ path: "/", summary: "List reviews for a content" })
  @ValidateQuery(listQueryValidator)
  @ApiResponse(200, "Reviews retrieved", createSuccessResponseSchema(z.array(reviewResponseValidator)))
  @ApiResponse(400, "Invalid query", validationErrorResponseSchema)
  list = asyncHandler(async (req: Request, res: Response) => {
    const { contentId, page, limit } = req.query as unknown as z.infer<typeof listQueryValidator>;
    const result = await this.listReviewsUseCase.execute(contentId, page, limit);
    res.status(200).json({ success: true, data: result.data.map((r) => r.toJSON()), total: result.total });
  });

  @Post({ path: "/", summary: "Create a review" })
  @Protected()
  @ValidateBody(createReviewValidator)
  @ApiResponse(201, "Review created", createSuccessResponseSchema(reviewResponseValidator))
  @ApiResponse(400, "Invalid body", validationErrorResponseSchema)
  create = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedError();
    const review = await this.createReviewUseCase.execute(req.user.userId, req.body);
    res.status(201).json({ success: true, data: review.toJSON() });
  });

  @Delete({ path: "/:id", summary: "Delete a review" })
  @Protected()
  @ValidateParams(z.object({ id: z.string().uuid() }))
  @ApiResponse(200, "Review deleted", successResponseSchema)
  @ApiResponse(403, "Not owner", forbiddenErrorResponseSchema)
  @ApiResponse(404, "Review not found", notFoundErrorResponseSchema)
  delete = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedError();
    await this.deleteReviewUseCase.execute(req.user.userId, req.params.id);
    res.status(200).json({ success: true, message: "Review deleted" });
  });
}
```

---

## Step 10 — Wire the module

`apps/api/src/modules/reviews/reviews.module.ts`:

```typescript
import { Router } from "express";
import { RestModule } from "../../shared/infrastructure/base/modules/rest-module.js";
import { DecoratorRouter } from "../../shared/infrastructure/decorators/rest/router-generator.js";
import { DrizzleReviewRepository } from "./infrastructure/database/repositories/drizzle-reviews.repository.js";
import { CreateReviewUseCase } from "./application/use-cases/create-review.usecase.js";
import { ListReviewsUseCase } from "./application/use-cases/list-reviews.usecase.js";
import { DeleteReviewUseCase } from "./application/use-cases/delete-review.usecase.js";
import { ReviewsController } from "./application/controllers/reviews.controller.js";

class ReviewsModule extends RestModule {
  private readonly repository: DrizzleReviewRepository;
  private readonly createUseCase: CreateReviewUseCase;
  private readonly listUseCase: ListReviewsUseCase;
  private readonly deleteUseCase: DeleteReviewUseCase;
  private readonly controller: ReviewsController;
  private readonly router: Router;

  constructor() {
    super({ name: "ReviewsModule", description: "User reviews" });

    this.repository = new DrizzleReviewRepository();

    this.createUseCase = new CreateReviewUseCase(this.repository);
    this.listUseCase = new ListReviewsUseCase(this.repository);
    this.deleteUseCase = new DeleteReviewUseCase(this.repository);

    this.controller = new ReviewsController(
      this.createUseCase,
      this.listUseCase,
      this.deleteUseCase
    );

    const decoratorRouter = new DecoratorRouter();
    this.router = decoratorRouter.generateRouter(this.controller);
  }

  public getRouter(): Router {
    return this.router;
  }
}

export const reviewsModule = new ReviewsModule();
```

---

## Step 11 — Register the module

Open `apps/api/src/modules/index.ts` and add one line:

```typescript
import { reviewsModule } from "./reviews/reviews.module.js";

function registerModules(): void {
  // ... existing modules ...
  moduleRegistry.register("reviews", reviewsModule);  // ← add this
}
```

---

## Step 12 — Regenerate the SDK

```bash
# From monorepo root
pnpm generate-sdk
```

Your new endpoints are now available in the frontend SDK as `gETReviews`, `pOSTReviews`, `dELETEReviewsId`.

---

## Step 13 — Write a use case test

`apps/api/src/modules/reviews/application/use-cases/create-review.usecase.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { CreateReviewUseCase } from "./create-review.usecase.js";
import { createMockReviewRepository } from "../../domain/interfaces/review.repository.mock.js";

describe("CreateReviewUseCase", () => {
  let useCase: CreateReviewUseCase;

  beforeEach(() => {
    useCase = new CreateReviewUseCase(createMockReviewRepository());
  });

  it("creates a review and returns it", async () => {
    const review = await useCase.execute("user-1", {
      contentId: "content-1",
      title: "Great movie",
      body: "Really enjoyed this film overall.",
      isSpoiler: false,
    });

    expect(review.userId).toBe("user-1");
    expect(review.title).toBe("Great movie");
    expect(review.likesCount).toBe(0);
    expect(review.isDeleted()).toBe(false);
  });
});
```

Run it:
```bash
cd apps/api && pnpm vitest run src/modules/reviews/application/use-cases/create-review.usecase.test.ts
```

---

## Checklist

- [ ] Drizzle schema created and exported from `schema.ts`
- [ ] Migration generated and applied
- [ ] Domain entity defined
- [ ] Repository interface defined (`IReviewRepository`)
- [ ] Drizzle repository implemented
- [ ] Mock repository created for tests
- [ ] Request and response Zod validators defined
- [ ] Use cases written (one per operation)
- [ ] Controller written with decorators
- [ ] Module file wires everything together
- [ ] Module registered in `modules/index.ts`
- [ ] `pnpm generate-sdk` run
- [ ] At least one use case test written
- [ ] `pnpm check-types`, `pnpm lint`, `pnpm test` all pass
