/**
 * Input Validation Utilities
 * 
 * Provides comprehensive input validation for:
 * - API requests
 * - Form submissions
 * - User inputs
 * - Data integrity checks
 */

import { VALIDATION_CONFIG } from "@/config/constants";

/**
 * Validates email format
 * @param email - Email address to validate
 * @returns true if valid, false otherwise
 */
export const isValidEmail = (email: string): boolean => {
  return VALIDATION_CONFIG.LENGTHS.EMAIL_PATTERN.test(email);
};

/**
 * Validates string length
 * @param value - String to validate
 * @param min - Minimum length (inclusive)
 * @param max - Maximum length (inclusive)
 * @returns true if length is valid
 */
export const isValidLength = (
  value: string,
  min: number = 0,
  max: number = Infinity
): boolean => {
  const trimmed = value?.trim() ?? "";
  return trimmed.length >= min && trimmed.length <= max;
};

/**
 * Validates URL format
 * @param url - URL to validate
 * @returns true if valid URL, false otherwise
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validates numeric ID
 * @param id - ID to validate
 * @returns true if valid finite number, false otherwise
 */
export const isValidId = (id: unknown): id is number => {
  return Number.isFinite(id) && id !== null && id !== undefined;
};

/**
 * Validates required field (non-empty string after trim)
 * @param value - Value to validate
 * @returns true if non-empty after trim
 */
export const isRequired = (value: unknown): boolean => {
  return typeof value === "string" && value.trim().length > 0;
};

/**
 * Validates that value is a non-empty array
 * @param value - Array to validate
 * @returns true if non-empty array
 */
export const isNonEmptyArray = <T>(value: unknown): value is T[] => {
  return Array.isArray(value) && value.length > 0;
};

/**
 * Sanitize string by trimming and normalizing
 * @param value - String to sanitize
 * @returns Trimmed and normalized string
 */
export const sanitizeString = (value: unknown): string => {
  if (typeof value !== "string") {
    return "";
  }
  return value.trim().replace(/\s+/g, " ");
};

/**
 * Sanitize HTML by removing script tags and dangerous content
 * @param html - HTML string to sanitize
 * @returns Sanitized HTML (basic protection)
 */
export const sanitizeHtml = (html: unknown): string => {
  if (typeof html !== "string") {
    return "";
  }
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/on\w+\s*=\s*[^\s>]*/gi, "");
};

/**
 * Interface for validation result
 */
interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Validates use case creation payload
 * @param payload - Payload to validate
 * @returns Validation result with errors if any
 */
export const validateUseCasePayload = (
  payload: unknown
): ValidationResult => {
  const errors: Record<string, string> = {};
  const data = payload as Record<string, unknown>;

  // Validate required fields
  if (!isRequired(data?.title)) {
    errors.title = "Title is required";
  }

  if (!isRequired(data?.headlines)) {
    errors.headlines = "Headlines are required";
  }

  if (!isRequired(data?.opportunity)) {
    errors.opportunity = "Opportunity description is required";
  }

  if (!isRequired(data?.businessValue)) {
    errors.businessValue = "Business value is required";
  }

  if (!isRequired(data?.primaryContact)) {
    errors.primaryContact = "Primary contact is required";
  }

  if (!isRequired(data?.editorEmail)) {
    errors.editorEmail = "Editor email is required";
  } else if (!isValidEmail(data.editorEmail as string)) {
    errors.editorEmail = "Invalid email format";
  }

  // Validate IDs
  if (!isValidId(data?.businessUnitId)) {
    errors.businessUnitId = "Invalid business unit";
  }

  if (!isValidId(data?.phaseId)) {
    errors.phaseId = "Invalid phase";
  }

  if (!isValidId(data?.statusId)) {
    errors.statusId = "Invalid status";
  }

  // Validate arrays
  if (!isNonEmptyArray(data?.stakeholders)) {
    errors.stakeholders = "At least one stakeholder is required";
  }

  if (!isNonEmptyArray(data?.plan)) {
    errors.plan = "Phase plan is required";
  }

  if (!isNonEmptyArray(data?.metrics)) {
    errors.metrics = "At least one metric is required";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validates email string for API parameters
 * @param email - Email to validate
 * @returns Validation result
 */
export const validateEmail = (email: string): ValidationResult => {
  const errors: Record<string, string> = {};

  if (!email || !email.trim()) {
    errors.email = "Email is required";
  } else if (!isValidEmail(email)) {
    errors.email = "Invalid email format";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
