import type { Router } from 'express';


export interface IApiModule {
  getRouter(): Router;
}

export class ModuleRegistry {
  private modules: Map<string, IApiModule> = new Map();

  public register(name: string, module: IApiModule): void {
    if (this.modules.has(name)) {
      throw new Error(`Module "${name}" is already registered`);
    }
    this.modules.set(name, module);
  }

  public getModule(name: string): IApiModule | undefined {
    return this.modules.get(name);
  }

  public getAllModules(): IApiModule[] {
    return Array.from(this.modules.values());
  }

  public getModuleNames(): string[] {
    return Array.from(this.modules.keys());
  }

  public hasModule(name: string): boolean {
    return this.modules.has(name);
  }

  public getModuleCount(): number {
    return this.modules.size;
  }

  public clear(): void {
    this.modules.clear();
  }
}

export const moduleRegistry = new ModuleRegistry();
