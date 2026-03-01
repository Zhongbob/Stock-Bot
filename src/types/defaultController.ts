import type { DefaultParsedContext } from "../middleware/defaultParser.middleware.js";

type ControllerActionMap = Record<string, (this: DefaultParsedContext) => Promise<void> | void>

export type { ControllerActionMap }