import superagent from "superagent";

export { }; // Augmentations for the global scope can only be directly nested in external modules or ambient module declarations.
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeDate(expectedDate: String): R;
    }
  }
}


declare module "supertest" {
  interface Test extends superagent.SuperAgentRequest {
    validateSchema(): this;
  }
}