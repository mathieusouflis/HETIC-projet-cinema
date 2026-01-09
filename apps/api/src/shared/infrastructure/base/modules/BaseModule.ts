export interface ModuleMetadata {
  name: string;
  version?: string;
  description?: string;
}

export interface BaseModuleInterface {
  getMetadata(): ModuleMetadata;
  initialize?(): Promise<void>;
  destroy?(): Promise<void>;
}

export abstract class BaseModule implements BaseModuleInterface {
  protected metadata: ModuleMetadata;

  constructor(metadata: ModuleMetadata) {
    this.metadata = metadata;
  }

  public getMetadata(): ModuleMetadata {
    return this.metadata;
  }

  public async initialize(): Promise<void> {
    // Override in subclasses if needed
  }

  public async destroy(): Promise<void> {
    // Override in subclasses if needed
  }
}
