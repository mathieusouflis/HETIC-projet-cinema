import { camel, generateMutatorImports, getFileInfo, getOrvalGeneratedTypes, getParamsInPath, isObject, jsDoc, kebab, pascal, sanitize, upath } from "@orval/core";
import { generateZod } from "@orval/zod";
import fs from "fs-extra";

//#region src/route.ts
const hasParam = (path) => /[^{]*{[\w*_-]*}.*/.test(path);
const getRoutePath = (path) => {
	const matches = /([^{]*){?([\w*_-]*)}?(.*)/.exec(path);
	if (!matches?.length) return path;
	const prev = matches[1];
	const param = sanitize(matches[2], {
		es5keyword: true,
		underscore: true,
		dash: true,
		dot: true
	});
	const next = hasParam(matches[3]) ? getRoutePath(matches[3]) : matches[3];
	return hasParam(path) ? `${prev}:${param}${next}` : `${prev}${param}${next}`;
};
const getRoute = (route) => {
	const splittedRoute = route.split("/");
	let acc = "";
	for (const [i, path] of splittedRoute.entries()) {
		if (!path && i === 0) continue;
		acc += path.includes("{") ? `/${getRoutePath(path)}` : `/${path}`;
	}
	return acc;
};

//#endregion
//#region src/index.ts
const ZVALIDATOR_SOURCE = fs.readFileSync(upath.join(import.meta.dirname, "zValidator.ts")).toString("utf8");
const HONO_DEPENDENCIES = [{
	exports: [
		{
			name: "Hono",
			values: true
		},
		{ name: "Context" },
		{ name: "Env" }
	],
	dependency: "hono"
}];
/**
* generateModuleSpecifier generates the specifier that _from_ would use to
* import _to_. This is syntactical and does not validate the paths.
*
* @param from The filesystem path to the importer.
* @param to If a filesystem path, it and _from_ must be use the same frame of
* reference, such as process.cwd() or both be absolute. If only one is
* absolute, the other must be relative to process.cwd().
*
* Otherwise, treated as a package name and returned directly.
*
* @return A module specifier that can be used at _from_ to import _to_. It is
* extensionless to conform with the rest of orval.
*/
const generateModuleSpecifier = (from, to) => {
	if (to.startsWith(".") || upath.isAbsolute(to)) {
		let ret;
		ret = upath.relativeSafe(upath.dirname(from), to);
		ret = ret.replace(/\.ts$/, "");
		ret = ret.replaceAll(upath.separator, "/");
		return ret;
	}
	return to;
};
const getHonoDependencies = () => HONO_DEPENDENCIES;
const getHonoHeader = ({ verbOptions, output, tag, clientImplementation }) => {
	const targetInfo = getFileInfo(output.target);
	let handlers;
	const importHandlers = Object.values(verbOptions).filter((verbOption) => clientImplementation.includes(`${verbOption.operationName}Handlers`));
	if (output.override.hono.handlers) {
		const handlerFileInfo = getFileInfo(output.override.hono.handlers);
		handlers = importHandlers.map((verbOption) => {
			const isTagMode = output.mode === "tags" || output.mode === "tags-split";
			const tag$1 = kebab(verbOption.tags[0] ?? "default");
			const handlersPath = upath.relativeSafe(upath.join(targetInfo.dirname, isTagMode ? tag$1 : ""), upath.join(handlerFileInfo.dirname, `./${verbOption.operationName}`));
			return `import { ${verbOption.operationName}Handlers } from '${handlersPath}';`;
		}).join("\n");
	} else handlers = `import {\n${importHandlers.map((verbOption) => ` ${verbOption.operationName}Handlers`).join(`, \n`)}\n} from './${tag ?? targetInfo.filename}.handlers';`;
	return `${handlers}\n\n
const app = new Hono()\n\n`;
};
const getHonoFooter = () => "export default app";
const generateHonoRoute = ({ operationName, verb }, pathRoute) => {
	const path = getRoute(pathRoute);
	return `
app.${verb.toLowerCase()}('${path}',...${operationName}Handlers)`;
};
const generateHono = (verbOptions, options) => {
	if (options.override.hono.compositeRoute) return {
		implementation: "",
		imports: []
	};
	const routeImplementation = generateHonoRoute(verbOptions, options.pathRoute);
	return {
		implementation: routeImplementation ? `${routeImplementation}\n\n` : "",
		imports: [
			...verbOptions.params.flatMap((param) => param.imports),
			...verbOptions.body.imports,
			...verbOptions.queryParams ? [{ name: verbOptions.queryParams.schema.name }] : []
		]
	};
};
/**
* getHonoHandlers generates TypeScript code for the given verbs and reports
* whether the code requires zValidator.
*/
const getHonoHandlers = (...opts) => {
	let code = "";
	let hasZValidator = false;
	for (const { handlerName, contextTypeName, verbOption, validator } of opts) {
		let currentValidator = "";
		if (validator) {
			const pascalOperationName = pascal(verbOption.operationName);
			if (verbOption.headers) currentValidator += `zValidator('header', ${pascalOperationName}Header),\n`;
			if (verbOption.params.length > 0) currentValidator += `zValidator('param', ${pascalOperationName}Params),\n`;
			if (verbOption.queryParams) currentValidator += `zValidator('query', ${pascalOperationName}QueryParams),\n`;
			if (verbOption.body.definition) currentValidator += `zValidator('json', ${pascalOperationName}Body),\n`;
			if (validator !== "hono" && verbOption.response.originalSchema?.["200"]?.content?.["application/json"]) currentValidator += `zValidator('response', ${pascalOperationName}Response),\n`;
		}
		code += `
export const ${handlerName} = factory.createHandlers(
${currentValidator}async (c: ${contextTypeName}) => {

  },
);`;
		hasZValidator ||= currentValidator !== "";
	}
	return [code, hasZValidator];
};
const getZvalidatorImports = (verbOptions, importPath, isHonoValidator) => {
	const specifiers = [];
	for (const { operationName, headers, params, queryParams, body, response } of verbOptions) {
		const pascalOperationName = pascal(operationName);
		if (headers) specifiers.push(`${pascalOperationName}Header`);
		if (params.length > 0) specifiers.push(`${pascalOperationName}Params`);
		if (queryParams) specifiers.push(`${pascalOperationName}QueryParams`);
		if (body.definition) specifiers.push(`${pascalOperationName}Body`);
		if (!isHonoValidator && response.originalSchema?.["200"]?.content?.["application/json"] != void 0) specifiers.push(`${pascalOperationName}Response`);
	}
	return specifiers.length === 0 ? "" : `import {\n${specifiers.join(",\n")}\n} from '${importPath}'`;
};
const getVerbOptionGroupByTag = (verbOptions) => {
	const grouped = {};
	for (const value of Object.values(verbOptions)) {
		const tag = value.tags[0];
		if (!grouped[tag]) grouped[tag] = [];
		grouped[tag].push(value);
	}
	return grouped;
};
const generateHandlerFile = async ({ verbs, path, validatorModule, zodModule, contextModule }) => {
	const validator = validatorModule === "@hono/zod-validator" ? "hono" : validatorModule != void 0;
	if (fs.existsSync(path)) {
		const rawFile = await fs.readFile(path, "utf8");
		let content = rawFile;
		for (const verbOption of Object.values(verbs)) {
			const handlerName = `${verbOption.operationName}Handlers`;
			const contextTypeName = `${pascal(verbOption.operationName)}Context`;
			if (!rawFile.includes(handlerName)) content += getHonoHandlers({
				handlerName,
				contextTypeName,
				verbOption,
				validator
			})[0];
		}
		return content;
	}
	const [handlerCode, hasZValidator] = getHonoHandlers(...Object.values(verbs).map((verbOption) => ({
		handlerName: `${verbOption.operationName}Handlers`,
		contextTypeName: `${pascal(verbOption.operationName)}Context`,
		verbOption,
		validator
	})));
	const imports = ["import { createFactory } from 'hono/factory';"];
	if (hasZValidator && validatorModule != void 0) imports.push(`import { zValidator } from '${generateModuleSpecifier(path, validatorModule)}';`);
	imports.push(`import { ${Object.values(verbs).map((verb) => `${pascal(verb.operationName)}Context`).join(",\n")} } from '${generateModuleSpecifier(path, contextModule)}';`);
	if (hasZValidator) imports.push(getZvalidatorImports(Object.values(verbs), generateModuleSpecifier(path, zodModule), validatorModule === "@hono/zod-validator"));
	return `${imports.filter((imp) => imp !== "").join("\n")}

const factory = createFactory();${handlerCode}`;
};
const generateHandlerFiles = async (verbOptions, output, validatorModule) => {
	const { extension, dirname, filename } = getFileInfo(output.target);
	if (output.override.hono.handlers) return Promise.all(Object.values(verbOptions).map(async (verbOption) => {
		const tag = kebab(verbOption.tags[0] ?? "default");
		const path = upath.join(output.override.hono.handlers ?? "", `./${verbOption.operationName}` + extension);
		return {
			content: await generateHandlerFile({
				path,
				verbs: [verbOption],
				validatorModule,
				zodModule: output.mode === "tags" ? upath.join(dirname, `${kebab(tag)}.zod`) : upath.join(dirname, tag, tag + ".zod"),
				contextModule: output.mode === "tags" ? upath.join(dirname, `${kebab(tag)}.context`) : upath.join(dirname, tag, tag + ".context")
			}),
			path
		};
	}));
	if (output.mode === "tags" || output.mode === "tags-split") {
		const groupByTags = getVerbOptionGroupByTag(verbOptions);
		return Promise.all(Object.entries(groupByTags).map(async ([tag, verbs]) => {
			const handlerPath$1 = output.mode === "tags" ? upath.join(dirname, `${kebab(tag)}.handlers${extension}`) : upath.join(dirname, tag, tag + ".handlers" + extension);
			return {
				content: await generateHandlerFile({
					path: handlerPath$1,
					verbs,
					validatorModule,
					zodModule: output.mode === "tags" ? upath.join(dirname, `${kebab(tag)}.zod`) : upath.join(dirname, tag, tag + ".zod"),
					contextModule: output.mode === "tags" ? upath.join(dirname, `${kebab(tag)}.context`) : upath.join(dirname, tag, tag + ".context")
				}),
				path: handlerPath$1
			};
		}));
	}
	const handlerPath = upath.join(dirname, `${filename}.handlers${extension}`);
	return [{
		content: await generateHandlerFile({
			path: handlerPath,
			verbs: Object.values(verbOptions),
			validatorModule,
			zodModule: upath.join(dirname, `${filename}.zod`),
			contextModule: upath.join(dirname, `${filename}.context`)
		}),
		path: handlerPath
	}];
};
const getContext = (verbOption) => {
	let paramType = "";
	if (verbOption.params.length > 0) paramType = `param: {\n ${getParamsInPath(verbOption.pathRoute).map((name) => {
		const param = verbOption.params.find((p) => p.name === sanitize(camel(name), { es5keyword: true }));
		const definition = param?.definition.split(":")[1];
		return { definition: `${name}${param?.required ?? false ? "" : "?"}:${definition}` };
	}).map((property) => property.definition).join(",\n    ")},\n },`;
	const queryType = verbOption.queryParams ? `query: ${verbOption.queryParams.schema.name},` : "";
	const bodyType = verbOption.body.definition ? `json: ${verbOption.body.definition},` : "";
	const hasIn = !!paramType || !!queryType || !!bodyType;
	return `export type ${pascal(verbOption.operationName)}Context<E extends Env = any> = Context<E, '${getRoute(verbOption.pathRoute)}'${hasIn ? `, { in: { ${paramType}${queryType}${bodyType} }, out: { ${paramType}${queryType}${bodyType} } }` : ""}>`;
};
const getHeader = (option, info) => {
	if (!option) return "";
	const header = option(info);
	return Array.isArray(header) ? jsDoc({ description: header }) : header;
};
const generateContextFile = ({ path, verbs, schemaModule }) => {
	let content = `import type { Context, Env } from 'hono';\n\n`;
	const contexts = verbs.map((verb) => getContext(verb));
	const imps = new Set(verbs.flatMap((verb) => {
		const imports = [];
		if (verb.params.length > 0) imports.push(...verb.params.flatMap((param) => param.imports));
		if (verb.queryParams) imports.push({ name: verb.queryParams.schema.name });
		if (verb.body.definition) imports.push(...verb.body.imports);
		return imports;
	}).map((imp) => imp.name).filter((imp) => contexts.some((context) => context.includes(imp))));
	if (contexts.some((context) => context.includes("NonReadonly<"))) {
		content += getOrvalGeneratedTypes();
		content += "\n";
	}
	if (imps.size > 0) content += `import type {\n${[...imps].toSorted().join(",\n  ")}\n} from '${generateModuleSpecifier(path, schemaModule)}';\n\n`;
	content += contexts.join("\n");
	return content;
};
const generateContextFiles = (verbOptions, output, context, schemaModule) => {
	const header = getHeader(output.override.header, context.spec.info);
	const { extension, dirname, filename } = getFileInfo(output.target);
	if (output.mode === "tags" || output.mode === "tags-split") {
		const groupByTags = getVerbOptionGroupByTag(verbOptions);
		return Object.entries(groupByTags).map(([tag, verbs]) => {
			const path$1 = output.mode === "tags" ? upath.join(dirname, `${kebab(tag)}.context${extension}`) : upath.join(dirname, tag, tag + ".context" + extension);
			return {
				content: `${header}${generateContextFile({
					verbs,
					path: path$1,
					schemaModule
				})}`,
				path: path$1
			};
		});
	}
	const path = upath.join(dirname, `${filename}.context${extension}`);
	return [{
		content: `${header}${generateContextFile({
			verbs: Object.values(verbOptions),
			path,
			schemaModule
		})}`,
		path
	}];
};
const generateZodFiles = async (verbOptions, output, context) => {
	const { extension, dirname, filename } = getFileInfo(output.target);
	const header = getHeader(output.override.header, context.spec.info);
	if (output.mode === "tags" || output.mode === "tags-split") {
		const groupByTags = getVerbOptionGroupByTag(verbOptions);
		return (await Promise.all(Object.entries(groupByTags).map(async ([tag, verbs]) => {
			const zods$1 = await Promise.all(verbs.map(async (verbOption) => generateZod(verbOption, {
				route: verbOption.route,
				pathRoute: verbOption.pathRoute,
				override: output.override,
				context,
				mock: output.mock,
				output: output.target
			}, output.client)));
			if (zods$1.every((z) => z.implementation === "")) return {
				content: "",
				path: ""
			};
			let content$1 = `${header}import { z as zod } from 'zod';\n${generateMutatorImports({ mutators: new Map(zods$1.flatMap((z) => z.mutators ?? []).map((m) => [m.name, m])).values().toArray() })}\n`;
			const zodPath$1 = output.mode === "tags" ? upath.join(dirname, `${kebab(tag)}.zod${extension}`) : upath.join(dirname, tag, tag + ".zod" + extension);
			content$1 += zods$1.map((zod) => zod.implementation).join("\n");
			return {
				content: content$1,
				path: zodPath$1
			};
		}))).filter((context$1) => context$1.content !== "");
	}
	const zods = await Promise.all(Object.values(verbOptions).map(async (verbOption) => generateZod(verbOption, {
		route: verbOption.route,
		pathRoute: verbOption.pathRoute,
		override: output.override,
		context,
		mock: output.mock,
		output: output.target
	}, output.client)));
	let content = `${header}import { z as zod } from 'zod';\n${generateMutatorImports({ mutators: new Map(zods.flatMap((z) => z.mutators ?? []).map((m) => [m.name, m])).values().toArray() })}\n`;
	const zodPath = upath.join(dirname, `${filename}.zod${extension}`);
	content += zods.map((zod) => zod.implementation).join("\n");
	return [{
		content,
		path: zodPath
	}];
};
const generateZvalidator = (output, context) => {
	const header = getHeader(output.override.header, context.spec.info);
	let validatorPath = output.override.hono.validatorOutputPath;
	if (!output.override.hono.validatorOutputPath) {
		const { extension, dirname, filename } = getFileInfo(output.target);
		validatorPath = upath.join(dirname, `${filename}.validator${extension}`);
	}
	return {
		content: `${header}${ZVALIDATOR_SOURCE}`,
		path: validatorPath
	};
};
const generateCompositeRoutes = (verbOptions, output, context) => {
	const targetInfo = getFileInfo(output.target);
	const compositeRouteInfo = getFileInfo(output.override.hono.compositeRoute);
	const header = getHeader(output.override.header, context.spec.info);
	const routes = Object.values(verbOptions).map((verbOption) => {
		return generateHonoRoute(verbOption, verbOption.pathRoute);
	}).join(";");
	const importHandlers = Object.values(verbOptions);
	let ImportHandlersImplementation;
	if (output.override.hono.handlers) {
		const handlerFileInfo = getFileInfo(output.override.hono.handlers);
		ImportHandlersImplementation = importHandlers.map((verbOption) => verbOption.operationName).map((operationName) => {
			return `import { ${`${operationName}Handlers`} } from '${generateModuleSpecifier(compositeRouteInfo.path, upath.join(handlerFileInfo.dirname, `./${operationName}`))}';`;
		}).join("\n");
	} else {
		const tags = importHandlers.map((verbOption) => kebab(verbOption.tags[0] ?? "default"));
		ImportHandlersImplementation = tags.filter((t, i) => tags.indexOf(t) === i).map((tag) => {
			return `import {\n${importHandlers.filter((verbOption) => verbOption.tags[0] === tag).map((verbOption) => ` ${verbOption.operationName}Handlers`).join(`, \n`)}\n} from '${generateModuleSpecifier(compositeRouteInfo.path, upath.join(targetInfo.dirname, tag))}/${tag}.handlers';`;
		}).join("\n");
	}
	return [{
		content: `${header}import { Hono } from 'hono';
${ImportHandlersImplementation}

const app = new Hono()
${routes}

export default app
`,
		path: output.override.hono.compositeRoute || ""
	}];
};
const generateExtraFiles = async (verbOptions, output, context) => {
	const { path, pathWithoutExtension } = getFileInfo(output.target);
	const validator = generateZvalidator(output, context);
	let schemaModule;
	const isZodSchemaOutput = isObject(output.schemas) && output.schemas.type === "zod";
	if (output.schemas != void 0) {
		const basePath = getFileInfo(isObject(output.schemas) ? output.schemas.path : output.schemas).dirname;
		schemaModule = isZodSchemaOutput && output.indexFiles ? upath.joinSafe(basePath, "index.zod") : basePath;
	} else if (output.mode === "single") schemaModule = path;
	else schemaModule = `${pathWithoutExtension}.schemas`;
	const contexts = generateContextFiles(verbOptions, output, context, schemaModule);
	const compositeRoutes = output.override.hono.compositeRoute ? generateCompositeRoutes(verbOptions, output, context) : [];
	const [handlers, zods] = await Promise.all([generateHandlerFiles(verbOptions, output, validator.path), generateZodFiles(verbOptions, output, context)]);
	return [
		...handlers,
		...contexts,
		...zods,
		...output.override.hono.validator && output.override.hono.validator !== "hono" ? [validator] : [],
		...compositeRoutes
	];
};
const honoClientBuilder = {
	client: generateHono,
	dependencies: getHonoDependencies,
	header: getHonoHeader,
	footer: getHonoFooter,
	extraFiles: generateExtraFiles
};
const builder = () => () => honoClientBuilder;
var src_default = builder;

//#endregion
export { builder, src_default as default, generateExtraFiles, generateHono, getHonoDependencies, getHonoFooter, getHonoHeader };
//# sourceMappingURL=index.mjs.map