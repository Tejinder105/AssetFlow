// Re-export authenticate as verifyJWT for backward compatibility
// with routes that were created before the middleware consolidation.
export { authenticate as verifyJWT } from "../middleware/authenticate.js";
