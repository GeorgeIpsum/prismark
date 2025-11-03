import { access, mkdir, rm } from "node:fs/promises";
import generatorHelperPkg from "@prisma/generator-helper";

const { generatorHandler } = generatorHelperPkg;

import { getConfig, setConfig } from "./config";
import { processCreate, processedCreate } from "./generators/create";
import { processEnums, processedEnums } from "./generators/enum";
import { processedInclude, processInclude } from "./generators/include";
import { processedOrderBy, processOrderBy } from "./generators/orderBy";
import { processedPlain, processPlain } from "./generators/plain";
import {
  processedRelations,
  processedRelationsCreate,
  processedRelationsUpdate,
  processRelations,
  processRelationsCreate,
  processRelationsUpdate,
} from "./generators/relations";
import { processedSelect, processSelect } from "./generators/select";
import { processedUpdate, processUpdate } from "./generators/update";
import {
  processedWhere,
  processedWhereUnique,
  processWhere,
} from "./generators/where";
import { write } from "./writer";

generatorHandler({
  onManifest() {
    return {
      defaultOutput: "./prisma/generated/validators",
      prettyName: "prisma-arktype",
    };
  },
  async onGenerate(options) {
    setConfig({
      ...options.generator.config,
      output: options.generator.output?.value,
    });

    try {
      await access(getConfig().output);
      await rm(getConfig().output, { recursive: true });
    } catch {
      // no-op
    }

    await mkdir(getConfig().output, { recursive: true });

    processEnums(options.dmmf.datamodel.enums);
    processPlain(options.dmmf.datamodel.models);
    processWhere(options.dmmf.datamodel.models);
    processCreate(options.dmmf.datamodel.models);
    processUpdate(options.dmmf.datamodel.models);
    processSelect(options.dmmf.datamodel.models);
    processInclude(options.dmmf.datamodel.models);
    processOrderBy(options.dmmf.datamodel.models);
    processRelations(options.dmmf.datamodel.models);
    processRelationsCreate(options.dmmf.datamodel.models);
    processRelationsUpdate(options.dmmf.datamodel.models);

    await write(
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

    console.info("✅ prisma-arktype: Generated ArkType schemas successfully!");
  },
});
