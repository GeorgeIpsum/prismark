# prisma-arktype

## 2.0.0

### Major Changes

- c4789cd: Initial release of prisma-arktype - Generate ArkType schemas from your Prisma schema.

  Features:

  - Generate plain ArkType schemas from Prisma models
  - Generate create/update input schemas
  - Generate where clause schemas
  - Generate select, include, and orderBy schemas
  - Support for Prisma relations
  - Support for Prisma enums
  - Annotation support for fine-grained control:
    - @prisma-arktype.hide - Hide models or fields from generation
    - @prisma-arktype.input.hide - Hide fields from input schemas
    - @prisma-arktype.create.input.hide - Hide fields from create schemas
    - @prisma-arktype.update.input.hide - Hide fields from update schemas
    - @prisma-arktype.typeOverwrite - Override generated types
