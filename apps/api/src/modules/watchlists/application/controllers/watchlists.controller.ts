import { BaseController } from "@/shared/infrastructure/base/controllers";
import { Controller, Delete, Get, Patch, Post, Put } from "@/shared/infrastructure/decorators";
import { asyncHandler } from "@/shared/utils";

@Controller({
  tag: "Users",
  prefix: "/users",
  description: "User management and profile endpoints",
})
export class WatchlistsController extends BaseController {
  constructor(
  ) {
    super();
  }

  @Get({
    path: "/",
    summary: "Get user's watchlist "
  })
  getUserWatchlist = asyncHandler(async (req, res) => {
  });

  @Get({
    path: "/:id",
    summary: "Get user's watchlist by the content id"
  })
  getUserWatchlistByContentId = asyncHandler(async (req, res) => {
  });

  @Get({
    path: "/status/:status",
    summary: "Get user's watchlist by it's status"
  })
  getUserWatchlistByStatus = asyncHandler(async (req, res) => {
  });

  @Patch({
    path: "/:id",
    summary: "Update user's watchlist by the content id"
  })
  updateUserWatchlist = asyncHandler(async (req, res) => {
  });

  @Post({
    path: "/:id",
    summary: "Add a content to user's watchlist"
  })
  addUserContentToWatchlist = asyncHandler(async (req, res) => {
  });

  @Delete({
    path: "/:id",
    summary: "Remove a movie from user's watchlist"
  })
  removeMovieFromWatchlist = asyncHandler(async (req, res) => {
  });
}
