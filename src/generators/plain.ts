import type { DMMF } from "@prisma/generator-helper";
import {
  extractAnnotations,
  generateArktypeOptions,
  isTypeOverwrite,
} from "../annotations";
import { getConfig } from "../config";
import {
  isPrimitivePrismaFieldType,
  stringifyPrimitiveType,
} from "../primitiveField";
import { wrapWithArray } from "../wrappers";
import { processedEnums } from "./enum";
import type { ProcessedModel } from "../model";

export const processedPlain: ProcessedModel[] = [];

export function processPlain(
  models: DMMF.Model[] | Readonly<DMMF.Model[]>,
): void {
  for (const model of models) {
    const stringified = stringifyPlain(model);
    if (stringified) {
      processedPlain.push({
        name: model.name,
        stringified,
      });
    }
  }
  Object.freeze(processedPlain);
}

const enumMatch = /type\("(.+)"\)/;

function stringifyPlain(
  model: DMMF.Model,
  isInputCreate = false,
  isInputUpdate = false,
): string | undefined {
  const config = getConfig();
  const { annotations: modelAnnotations, hidden } = extractAnnotations(
    model.documentation,
  );

  if (hidden) {
    return;
  }

  const fields: string[] = [];

  for (const field of model.fields) {
    const {
      annotations: fieldAnnotations,
      hidden: fieldHidden,
      hiddenInput,
      hiddenInputCreate,
      hiddenInputUpdate,
    } = extractAnnotations(field.documentation);

    // Skip hidden fields
    if (fieldHidden) continue;
    if (isInputCreate && (hiddenInput || hiddenInputCreate)) continue;
    if (isInputUpdate && (hiddenInput || hiddenInputUpdate)) continue;

    // Skip relations for plain model
    if (field.kind === "object") continue;

    // Skip fields based on config for input models
    if (isInputCreate || isInputUpdate) {
      if (config.ignoredKeysOnInputModels.includes(field.name)) continue;
      // Skip foreign keys ending with "Id" for input models
      if (field.name.endsWith("Id") && field.relationName) continue;
    }

    // Check for type overwrite
    const typeOverwrite = fieldAnnotations.find(isTypeOverwrite);
    let fieldType: string;
    let fieldName = field.name;

    if (typeOverwrite) {
      fieldType = typeOverwrite.value;
    } else if (isPrimitivePrismaFieldType(field.type)) {
      fieldType = stringifyPrimitiveType(field.type, fieldAnnotations);
    } else if (field.kind === "enum") {
      // For enums in object definitions, extract the union string from the type() call
      const enumDef = processedEnums.find((e) => e.name === field.type);
      if (!enumDef) continue;
      // Extract from type("'A' | 'B'") -> "'A' | 'B'" (keep the quotes)
      const match = enumDef.stringified.match(enumMatch);
      fieldType = match ? `"${match[1]}"` : `"'${field.type}'"`;
    } else {
      continue;
    }

    // Apply wrappers
    if (field.isList) {
      fieldType = `"${wrapWithArray(fieldType.slice(1, -1))}"`;
    }
    if (!field.isRequired) {
      // Remove quotes, add null, re-add quotes
      const inner = fieldType.slice(1, -1);
      fieldType = `"${inner} | null"`;
      // In ArkType, optional fields (can be missing) need ? on the key
      fieldName += "?";
    }
    // Fields with defaults are also optional in create/update
    if (field.hasDefaultValue || isInputUpdate) {
      if (!fieldName.endsWith("?")) {
        fieldName += "?";
      }
    }

    fields.push(`"${fieldName}": ${fieldType}`);
  }

  const options = generateArktypeOptions(modelAnnotations);
  return `{\n  ${fields.join(",\n  ")}\n}${options}`;
}

export function stringifyPlainInputCreate(
  model: DMMF.Model,
): string | undefined {
  return stringifyPlain(model, true, false);
}

export function stringifyPlainInputUpdate(
  model: DMMF.Model,
): string | undefined {
  return stringifyPlain(model, false, true);
}
