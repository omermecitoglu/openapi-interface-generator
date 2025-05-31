#!/usr/bin/env node
import path from "node:path";
import { generateConfigs, generateDeclaration, generateDocumentation, generateInterface, generateSchemaCode } from "@omer-x/openapi-code-generator";
import getPackageMetadata from "@omer-x/package-metadata";
import { capitalCase, constantCase } from "change-case";
import getArgument from "./core/arguments";
import fetchOpenApiSpec from "./core/fetchOpenApiSpec";
import createFile from "./core/file";

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
  if (!spec) return;
  if (!spec.paths) throw new Error("Couldn't find any valid path");

  if (spec.components?.schemas) {
    for (const [schemaName, schema] of Object.entries(spec.components.schemas)) {
      if (!schema.type) continue;
      const content = generateSchemaCode(schemaName, schema);
      await createFile(content, `${schemaName}.ts`, outputDir, "dist/schemas");
    }
  }

  const { packageName, moduleName: appName } = getPackageMetadata();
  const serviceName = capitalCase(appName);
  const envName = `${constantCase(appName)}_BASE_URL`;

  await createFile(generateInterface(envName, spec.paths, framework), "index.js", outputDir, "dist");
  await createFile(generateDeclaration(spec.paths, framework), "index.d.ts", outputDir, "dist");
  await createFile(generateDocumentation(serviceName, packageName, envName, spec.paths), "README.md", outputDir);
  await createFile(generateConfigs("dist", []) + "\n", "package.json", outputDir);
})();
