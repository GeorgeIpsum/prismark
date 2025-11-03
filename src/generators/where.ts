import type { DMMF } from "@prisma/generator-helper";
import {
  extractAnnotations,
  generateArktypeOptions,
  isTypeOverwrite,
} from "../annotations";
import {
  isPrimitivePrismaFieldType,
  stringifyPrimitiveType,
} from "../primitiveField";
import { wrapWithArray } from "../wrappers";
import { processedEnums } from "./enum";
import type { ProcessedModel } from "../model";

export const processedWhere: ProcessedModel[] = [];
export const processedWhereUnique: ProcessedModel[] = [];

export function processWhere(
  models: DMMF.Model[] | Readonly<DMMF.Model[]>,
): void {
  for (const model of models) {
    const stringified = stringifyWhere(model);
    if (stringified) {
      processedWhere.push({
        name: model.name,
        stringified,
      });
    }

    const stringifiedUnique = stringifyWhereUnique(model);
    if (stringifiedUnique) {
      processedWhereUnique.push({
        name: model.name,
        stringified: stringifiedUnique,
      });
    }
  }
  Object.freeze(processedWhere);
  Object.freeze(processedWhereUnique);
}

const enumMatch = /type\("(.+)"\)/;

function stringifyWhere(model: DMMF.Model): string | undefined {
  const { annotations: modelAnnotations, hidden } = extractAnnotations(
    model.documentation,
  );

  if (hidden) {
    return;
  }

  const fields: string[] = [];

  for (const field of model.fields) {
    const { annotations: fieldAnnotations, hidden: fieldHidden } =
      extractAnnotations(field.documentation);

    if (fieldHidden) continue;
    if (field.kind === "object") continue; // Skip relations

    const typeOverwrite = fieldAnnotations.find(isTypeOverwrite);
    let fieldType: string;

    if (typeOverwrite) {
      fieldType = `"${typeOverwrite.value}"`;
    } else if (isPrimitivePrismaFieldType(field.type)) {
      fieldType = stringifyPrimitiveType(field.type, fieldAnnotations);
    } else if (field.kind === "enum") {
      const enumDef = processedEnums.find((e) => e.name === field.type);
      if (!enumDef) continue;
      const match = enumDef.stringified.match(enumMatch);
      fieldType = match ? `"${match[1]}"` : `"'${field.type}'"`;
    } else {
      continue;
    }

    if (field.isList) {
      const inner = fieldType.slice(1, -1);
      fieldType = `"${wrapWithArray(inner)}"`;
    }

    // All where fields are optional
    fields.push(`"${field.name}?": ${fieldType}`);
  }

  const options = generateArktypeOptions(modelAnnotations);
  return `{\n  ${fields.join(",\n  ")}\n}${options}`;
}

function stringifyWhereUnique(model: DMMF.Model): string | undefined {
  const { annotations: modelAnnotations, hidden } = extractAnnotations(
    model.documentation,
  );

  if (hidden) {
    return;
  }

  const fields: string[] = [];

  for (const field of model.fields) {
    const { annotations: fieldAnnotations, hidden: fieldHidden } =
      extractAnnotations(field.documentation);

    if (fieldHidden) continue;
    if (field.kind === "object") continue;
    if (!(field.isId || field.isUnique)) continue;

    const typeOverwrite = fieldAnnotations.find(isTypeOverwrite);
    let fieldType: string;

    if (typeOverwrite) {
      fieldType = `"${typeOverwrite.value}"`;
    } else if (isPrimitivePrismaFieldType(field.type)) {
      fieldType = stringifyPrimitiveType(field.type, fieldAnnotations);
    } else if (field.kind === "enum") {
      const enumDef = processedEnums.find((e) => e.name === field.type);
      if (!enumDef) continue;
      const match = enumDef.stringified.match(enumMatch);
      fieldType = match ? `"${match[1]}"` : `"'${field.type}'"`;
    } else {
      continue;
    }

    // All whereUnique fields are optional
    fields.push(`"${field.name}?": ${fieldType}`);
  }

  if (fields.length === 0) {
    return;
  }

  const options = generateArktypeOptions(modelAnnotations);
  return `{\n  ${fields.join(",\n  ")}\n}${options}`;
}
