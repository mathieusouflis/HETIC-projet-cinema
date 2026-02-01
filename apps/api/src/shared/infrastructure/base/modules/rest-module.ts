import type { Router } from "express";
import { BaseModule } from "./base-module";

export interface RestModuleInterface {
  getRouter(): Router;
  getOpenAPISpec?(): any;
}

export abstract class RestModule
  extends BaseModule
  implements RestModuleInterface
{
  abstract getRouter(): Router;

  public getOpenAPISpec?(): any {
    return null;
  }
}
