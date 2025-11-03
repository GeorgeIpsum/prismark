import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { getConfig } from "./config";
import type { ProcessedModel } from "./model";

export async function format(input: string): Promise<string> {
  // For now, return input as-is. Could integrate prettier later
  return input;
}

export function mapAllModelsForWrite(
  processedEnums: ProcessedModel[],
  processedPlain: ProcessedModel[],
  processedRelations: ProcessedModel[],
  processedWhere: ProcessedModel[],
  processedWhereUnique: ProcessedModel[],
  processedCreate: ProcessedModel[],
  processedUpdate: ProcessedModel[],
  processedRelationsCreate: ProcessedModel[],
  processedRelationsUpdate: ProcessedModel[],
  processedSelect: ProcessedModel[],
  processedInclude: ProcessedModel[],
  processedOrderBy: ProcessedModel[],
): Map<string, string> {
  const config = getConfig();
  const modelMap = new Map<string, string>();

  const arktypeImport = `import { type } from "${config.arktypeImportDependencyName}";\n\n`;

  // Add enums
  for (const model of processedEnums) {
    const content = `${arktypeImport}export const ${model.name} = ${model.stringified};\n`;
    modelMap.set(model.name, content);
  }

  // Add plain models
  for (const model of processedPlain) {
    const content = `${arktypeImport}export const ${model.name}Plain = type(${model.stringified});\n`;
    modelMap.set(`${model.name}Plain`, content);
  }

  // Add relations
  for (const model of processedRelations) {
    const content = `${arktypeImport}export const ${model.name}Relations = type(${model.stringified});\n`;
    modelMap.set(`${model.name}Relations`, content);
  }

  // Add combined models (Plain & Relations)
  for (const plain of processedPlain) {
    const hasRelations = processedRelations.some((r) => r.name === plain.name);
    if (hasRelations) {
      const content = `${arktypeImport}import { ${plain.name}Plain } from "./${plain.name}Plain";\nimport { ${plain.name}Relations } from "./${plain.name}Relations";\n\nexport const ${plain.name} = type(() => ${plain.name}Plain.and(${plain.name}Relations));\n`;
      modelMap.set(plain.name, content);
    } else {
      const content = `${arktypeImport}import { ${plain.name}Plain } from "./${plain.name}Plain";\n\nexport const ${plain.name} = ${plain.name}Plain;\n`;
      modelMap.set(plain.name, content);
    }
  }

  // Add where clauses
  for (const model of processedWhere) {
    const content = `${arktypeImport}export const ${model.name}Where = type(${model.stringified});\n`;
    modelMap.set(`${model.name}Where`, content);
  }

  // Add whereUnique clauses
  for (const model of processedWhereUnique) {
    const content = `${arktypeImport}export const ${model.name}WhereUnique = type(${model.stringified});\n`;
    modelMap.set(`${model.name}WhereUnique`, content);
  }

  // Add create inputs
  for (const model of processedCreate) {
    const content = `${arktypeImport}export const ${model.name}Create = type(${model.stringified});\n`;
    modelMap.set(`${model.name}Create`, content);
  }

  // Add update inputs
  for (const model of processedUpdate) {
    const content = `${arktypeImport}export const ${model.name}Update = type(${model.stringified});\n`;
    modelMap.set(`${model.name}Update`, content);
  }

  // Add relations create
  for (const model of processedRelationsCreate) {
    const content = `${arktypeImport}export const ${model.name}RelationsCreate = type(${model.stringified});\n`;
    modelMap.set(`${model.name}RelationsCreate`, content);
  }

  // Add relations update
  for (const model of processedRelationsUpdate) {
    const content = `${arktypeImport}export const ${model.name}RelationsUpdate = type(${model.stringified});\n`;
    modelMap.set(`${model.name}RelationsUpdate`, content);
  }

  // Add select
  for (const model of processedSelect) {
    const content = `${arktypeImport}export const ${model.name}Select = type(${model.stringified});\n`;
    modelMap.set(`${model.name}Select`, content);
  }

  // Add include
  for (const model of processedInclude) {
    const content = `${arktypeImport}export const ${model.name}Include = type(${model.stringified});\n`;
    modelMap.set(`${model.name}Include`, content);
  }

  // Add orderBy
  for (const model of processedOrderBy) {
    const content = `${arktypeImport}export const ${model.name}OrderBy = type(${model.stringified});\n`;
    modelMap.set(`${model.name}OrderBy`, content);
  }

  return modelMap;
}

export async function write(
  processedEnums: ProcessedModel[],
  processedPlain: ProcessedModel[],
  processedRelations: ProcessedModel[],
  processedWhere: ProcessedModel[],
  processedWhereUnique: ProcessedModel[],
  processedCreate: ProcessedModel[],
  processedUpdate: ProcessedModel[],
  processedRelationsCreate: ProcessedModel[],
  processedRelationsUpdate: ProcessedModel[],
  processedSelect: ProcessedModel[],
  processedInclude: ProcessedModel[],
  processedOrderBy: ProcessedModel[],
): Promise<void> {
  const config = getConfig();
  const modelMap = mapAllModelsForWrite(
    processedEnums,
    processedPlain,
    processedRelations,
    processedWhere,
    processedWhereUnique,
    processedCreate,
    processedUpdate,
    processedRelationsCreate,
    processedRelationsUpdate,
    processedSelect,
    processedInclude,
    processedOrderBy,
  );

  const writePromises: Promise<void>[] = [];

  for (const [name, content] of modelMap.entries()) {
    const filePath = join(config.output, `${name}.ts`);
    // biome-ignore lint/performance/noAwaitInLoops: <not a performance issue>
    writePromises.push(writeFile(filePath, await format(content)));
  }

  // Create barrel file
  const barrelExports = Array.from(modelMap.keys())
    .map((name) => `export * from "./${name}";`)
    .join("\n");
  writePromises.push(
    writeFile(join(config.output, "index.ts"), await format(barrelExports)),
  );

  await Promise.all(writePromises);
}
