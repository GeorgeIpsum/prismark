import { access } from "node:fs/promises";
import { join } from "node:path";
import { type } from "arktype";
import { describe, expect, it } from "vitest";

const GENERATED_PATH = join(__dirname, "../prisma/generated");

describe("Annotation Support", () => {
  it("should hide models marked with @prisma-arktype.hide", async () => {
    // HiddenModel should not be generated
    const hiddenModelPath = join(GENERATED_PATH, "HiddenModel.ts");
    await expect(access(hiddenModelPath)).rejects.toThrow();
  });

  it("should generate AnnotatedModel", async () => {
    const { AnnotatedModelPlain } = await import(
      "../prisma/generated/AnnotatedModelPlain"
    );
    expect(AnnotatedModelPlain).toBeDefined();
  });

  it("should exclude hiddenField from plain model", async () => {
    const { AnnotatedModelPlain } = await import(
      "../prisma/generated/AnnotatedModelPlain"
    );

    // hiddenField should not be in the schema definition
    const validData = {
      id: "test123",
      computedField: "test",
      updateOnlyField: "test",
      createOnlyField: "test",
      email: "test@example.com",
      normalField: "test",
    };

    // The schema should validate data without hiddenField
    const result = AnnotatedModelPlain(validData);
    expect(result instanceof type.errors).toBe(false);
  });

  it("should exclude computedField from create input", async () => {
    const { AnnotatedModelCreate } = await import(
      "../prisma/generated/AnnotatedModelCreate"
    );
    expect(AnnotatedModelCreate).toBeDefined();

    // computedField and hiddenField should not be in create schema
    const validCreate = {
      createOnlyField: "test",
      email: "test@example.com",
      normalField: "test",
    };

    const result = AnnotatedModelCreate(validCreate);
    expect(result instanceof type.errors).toBe(false);
  });

  it("should exclude createOnlyField from update input", async () => {
    const { AnnotatedModelUpdate } = await import(
      "../prisma/generated/AnnotatedModelUpdate"
    );
    expect(AnnotatedModelUpdate).toBeDefined();

    // createOnlyField should not be in update schema
    const validUpdate = {
      updateOnlyField: "test",
      email: "test@example.com",
      normalField: "test",
    };

    const result = AnnotatedModelUpdate(validUpdate);
    expect(result instanceof type.errors).toBe(false);
  });

  it("should apply type overwrite for email field", async () => {
    const { AnnotatedModelPlain } = await import(
      "../prisma/generated/AnnotatedModelPlain"
    );

    // The email field should use the custom type override
    const dataWithInvalidEmail = {
      id: "test123",
      computedField: "test",
      updateOnlyField: "test",
      createOnlyField: "test",
      email: "not-an-email",
      normalField: "test",
    };

    const result = AnnotatedModelPlain(dataWithInvalidEmail);
    // This should fail because email is overridden with "string.email"
    expect(result instanceof type.errors).toBe(true);
  });
});
