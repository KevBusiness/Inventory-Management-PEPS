/**
 * Represents the errors generated from validations.
 *
 * @property {string} message - The error message describing the validation issue.
 * @property {string} path - The path or location where the validation error occurred.
 */
export type ErrorsFromValidations = {
  message: string;
  path: string;
};
