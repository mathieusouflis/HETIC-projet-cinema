export interface IRatingRepository {
  upsert(
    userId: string,
    contentId: string,
    rating: number
  ): Promise<{
    id: string;
    userId: string;
    contentId: string;
    rating: number;
    createdAt: string;
    updatedAt: string;
  }>;
  findByUserAndContent(
    userId: string,
    contentId: string
  ): Promise<{ rating: number } | null>;
  getAverageForContent(
    contentId: string
  ): Promise<{ average: number | null; count: number }>;
  delete(userId: string, contentId: string): Promise<void>;
}
