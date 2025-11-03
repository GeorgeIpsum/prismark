import type { DMMF } from "@prisma/generator-helper";
import { extractAnnotations, generateArktypeOptions } from "../annotations";
import type { ProcessedModel } from "../model";

export const processedRelations: ProcessedModel[] = [];
export const processedRelationsCreate: ProcessedModel[] = [];
export const processedRelationsUpdate: ProcessedModel[] = [];

export function processRelations(
  models: DMMF.Model[] | Readonly<DMMF.Model[]>,
): void {
  for (const model of models) {
    const stringified = stringifyRelations(model);
    if (stringified) {
      processedRelations.push({
        name: model.name,
        stringified,
      });
    }
  }
  Object.freeze(processedRelations);
}

function stringifyRelations(model: DMMF.Model): string | undefined {
  const { annotations: modelAnnotations, hidden } = extractAnnotations(
    model.documentation,
  );

  if (hidden) {
    return;
  }

  const fields: string[] = [];

  for (const field of model.fields) {
    const { hidden: fieldHidden } = extractAnnotations(field.documentation);

    if (fieldHidden) continue;
    if (field.kind !== "object") continue; // Only process relations

    // For relations, use "unknown" since cross-references need runtime resolution
    // The actual types will be enforced by Prisma Client
    let fieldType = `"unknown"`;

    // Apply wrappers
    if (field.isList) {
      fieldType = `"unknown[]"`;
    }
    if (!field.isRequired) {
      fieldType = `"unknown | null"`;
    }

    fields.push(`"${field.name}": ${fieldType}`);
  }

  if (fields.length === 0) {
    return;
  }

  const options = generateArktypeOptions(modelAnnotations);
  return `{\n  ${fields.join(",\n  ")}\n}${options}`;
}

export function processRelationsCreate(
  models: DMMF.Model[] | Readonly<DMMF.Model[]>,
): void {
  for (const model of models) {
    const stringified = stringifyRelationsInputCreate(model, models);
    if (stringified) {
      processedRelationsCreate.push({
        name: model.name,
        stringified,
      });
    }
  }
  Object.freeze(processedRelationsCreate);
}

function stringifyRelationsInputCreate(
  model: DMMF.Model,
  allModels: DMMF.Model[] | Readonly<DMMF.Model[]>,
): string | undefined {
  const { annotations: modelAnnotations, hidden } = extractAnnotations(
    model.documentation,
  );

  if (hidden) {
    return;
  }

  const fields: string[] = [];

  for (const field of model.fields) {
    const {
      hidden: fieldHidden,
      hiddenInput,
      hiddenInputCreate,
    } = extractAnnotations(field.documentation);

    if (fieldHidden || hiddenInput || hiddenInputCreate) continue;
    if (field.kind !== "object") continue;

    // Find the related model to get its ID type
    const relatedModel = allModels.find((m) => m.name === field.type);
    if (!relatedModel) continue;

    const idField = relatedModel.fields.find((f) => f.isId);
    let idType = '"string"';
    if (idField) {
      if (idField.type === "Int" || idField.type === "BigInt") {
        idType = '"integer"';
      }
    }

    const connectType = `{ "connect": { "id": ${idType} } }`;
    fields.push(`"${field.name}?": ${connectType}`);
  }

  if (fields.length === 0) {
    return;
  }

  const options = generateArktypeOptions(modelAnnotations);
  return `{\n  ${fields.join(",\n  ")}\n}${options}`;
}

export function processRelationsUpdate(
  models: DMMF.Model[] | Readonly<DMMF.Model[]>,
): void {
  for (const model of models) {
    const stringified = stringifyRelationsInputUpdate(model, models);
    if (stringified) {
      processedRelationsUpdate.push({
        name: model.name,
        stringified,
      });
    }
  }
  Object.freeze(processedRelationsUpdate);
}

function stringifyRelationsInputUpdate(
  model: DMMF.Model,
  allModels: DMMF.Model[] | Readonly<DMMF.Model[]>,
): string | undefined {
  const { annotations: modelAnnotations, hidden } = extractAnnotations(
    model.documentation,
  );

  if (hidden) {
    return;
  }

  const fields: string[] = [];

  for (const field of model.fields) {
    const {
      hidden: fieldHidden,
      hiddenInput,
      hiddenInputUpdate,
    } = extractAnnotations(field.documentation);

    if (fieldHidden || hiddenInput || hiddenInputUpdate) continue;
    if (field.kind !== "object") continue;

    const relatedModel = allModels.find((m) => m.name === field.type);
    if (!relatedModel) continue;

    const idField = relatedModel.fields.find((f) => f.isId);
    let idType = '"string"';
    if (idField) {
      if (idField.type === "Int" || idField.type === "BigInt") {
        idType = '"integer"';
      }
    }

    let fieldType: string;
    if (field.isList) {
      // For list relations, allow connect and disconnect
      fieldType = `{ "connect"?: { "id": ${idType} }[], "disconnect"?: { "id": ${idType} }[] }`;
    } else {
      // For single relations
      if (field.isRequired) {
        fieldType = `{ "connect": { "id": ${idType} } }`;
      } else {
        fieldType = `{ "connect"?: { "id": ${idType} }, "disconnect"?: "boolean" }`;
      }
    }

    fields.push(`"${field.name}?": ${fieldType}`);
  }

  if (fields.length === 0) {
    return;
  }

  const options = generateArktypeOptions(modelAnnotations);
  return `{\n  ${fields.join(",\n  ")}\n}${options}`;
}
