#!/usr/bin/env node
import path from "node:path";
import * as codegen from "@omer-x/openapi-code-generator";
import getPackageMetadata from "@omer-x/package-metadata";
import { capitalCase, constantCase } from "change-case";
import getArgument from "./core/arguments";
import createFile from "./core/file";
import fetchOpenApiSpec from "./core/spec";

(async () => {
  const sourceURL = await getArgument("source") ?? null;
  if (!sourceURL && !process.env.OPENAPI_SRC) {
    throw new Error("Source URL is not specified");
  }

  const outputFolder = await getArgument("output") ?? "dist";
  const outputDir = path.resolve(process.cwd(), outputFolder);

  const framework = await getArgument("framework") ?? null;

  const src = sourceURL ?? process.env.OPENAPI_SRC;
  if (!src) throw new Error("Invalid source");
  const spec = await fetchOpenApiSpec(src);
  if (!spec.paths) throw new Error("Couldn't find any valid path");

  if (spec.components?.schemas) {
    for (const [schemaName, schema] of Object.entries(spec.components.schemas)) {
      if (!schema.type) continue;
      const content = codegen.generateSchemaCode(schemaName, schema);
      await createFile(content, `${schemaName}.ts`, outputDir, "dist/schemas");
    }
  }

  const { packageName, moduleName: appName } = getPackageMetadata();
  const serviceName = capitalCase(appName);
  const envName = `${constantCase(appName)}_BASE_URL`;

  await createFile(codegen.generateInterface(envName, spec.paths, framework), "index.js", outputDir, "dist");
  await createFile(codegen.generateDeclaration(spec.paths, framework), "index.d.ts", outputDir, "dist");
  await createFile(codegen.generateDocumentation(serviceName, packageName, envName, spec.paths), "README.md", outputDir);
  await createFile(codegen.generateConfigs("dist", []) + "\n", "package.json", outputDir);
})();
