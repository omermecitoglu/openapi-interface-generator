import type { OpenApiDocument } from "@omer-x/openapi-types";

export default async function fetchOpenApiSpec(sourceURL: string) {
  const response = await fetch(sourceURL);
  return await response.json() as OpenApiDocument;
}
