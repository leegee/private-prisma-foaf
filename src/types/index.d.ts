export { }; // Augmentations for the global scope can only be directly nested in external modules or ambient module declarations.

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeDate(expectedDate: String): R;
    }
  }
}
