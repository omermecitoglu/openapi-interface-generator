import fs from "node:fs/promises";
import path from "node:path";
import type { OpenApiDocument } from "@omer-x/openapi-types";

export default async function fetchOpenApiSpec(source: string) {
  if (source.startsWith("http://") || source.startsWith("https://")) {
    const response = await fetch(source);
    return (await response.json()) as OpenApiDocument;
  } else {
    const absolutePath = path.resolve(source);
    const fileContent = await fs.readFile(absolutePath, "utf-8");
    return JSON.parse(fileContent) as OpenApiDocument;
  }
}
