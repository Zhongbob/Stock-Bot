import { use } from 'node-telegram-bot-api-middleware'
import authMiddleware from "./auth.middleware.js";
import argParserMiddleware from "./argsParser.middleware.js";

const defaultMiddleware = use(argParserMiddleware)
const useAuth = defaultMiddleware.use(authMiddleware)

export default defaultMiddleware
export { useAuth }