import { ZodTemplateLiteral } from 'zod';
import { MapNullableType } from '../types';
export declare class TemplateLiteralTransformer {
    transform(zodSchema: ZodTemplateLiteral, mapNullableType: MapNullableType): {
        pattern: string;
        nullable?: boolean | undefined;
        type?: ((import("openapi3-ts/oas30").SchemaObjectType | import("openapi3-ts/oas30").SchemaObjectType[]) & (import("openapi3-ts/oas31").SchemaObjectType | import("openapi3-ts/oas31").SchemaObjectType[])) | undefined;
    };
    private generatePattern;
    private escapeRegex;
}
