import authMiddleware from "./auth.middleware.js";
import defaultParserMiddleware from "./defaultParser.middleware.js";

const defaultMiddleware = defaultParserMiddleware()
const useAuth = defaultMiddleware.use(authMiddleware)

export default defaultMiddleware
export { useAuth }