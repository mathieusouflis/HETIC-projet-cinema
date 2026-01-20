import { CreateSerieProps, Serie } from "../entities/serie.entity";

export interface ISeriesRepository {
  getSerieById: (id: string) => Promise<Serie | null>;
  listSeries: (title?: string) => Promise<Serie[]>;
  createSerie: (content: CreateSerieProps) => Promise<Serie>;
}
