// Vercel discovers serverless functions only from the project-root /api directory.
// Keep the implementation in the automation app and expose it through this route.
export { default } from "../../quickkit-automation-agent-main/api/runs/create.js";
