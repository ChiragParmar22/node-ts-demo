/**
 * Centralized Regex Patterns Utility
 * Contains all regex patterns used across the application for consistency and reusability
 */

/**
 * Common Regex Patterns
 */
export default class RegexUtil {
  /**
   * Phone number validation (10-15 digits)
   * Matches: 1234567890, 123456789012345
   * Does not match: 123, abc123, 12-34-56
   */
  static readonly PHONE_NUMBER = /^[0-9]{10,15}$/;

  /**
   * Email validation pattern (RFC 5322 simplified)
   * Matches: user@example.com, name.surname@domain.co.uk
   * Does not match: invalid@, @domain.com, user@domain
   */
  static readonly EMAIL = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  /**
   * UUID v4 validation
   * Matches: 550e8400-e29b-41d4-a716-446655440000
   * Does not match: 550e8400-e29b-41d4-a716, invalid-uuid
   */
  static readonly UUID =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  /**
   * Name validation (letters, spaces, hyphens, apostrophes)
   * Matches: John Doe, Mary-Jane, O'Brien
   * Does not match: John123, @John
   */
  static readonly NAME = /^[a-zA-Z\s\-']+$/;

  /**
   * Alphanumeric characters only (no spaces or special characters)
   * Matches: abc123, TestUser99
   * Does not match: test user, test@123
   */
  static readonly ALPHANUMERIC = /^[a-zA-Z0-9]+$/;

  /**
   * Numeric characters only
   * Matches: 123456, 0
   * Does not match: 123.45, 12a34
   */
  static readonly NUMERIC = /^[0-9]+$/;

  /**
   * ISO 8601 date format (YYYY-MM-DD)
   * Matches: 2024-01-31, 1990-12-25
   * Does not match: 01-31-2024, 2024/01/31
   */
  static readonly DATE_ISO = /^\d{4}-\d{2}-\d{2}$/;

  /**
   * Time format (HH:MM in 24-hour format)
   * Matches: 09:30, 23:59, 00:00
   * Does not match: 25:00, 9:30, 12:60
   */
  static readonly TIME_24H = /^([01]\d|2[0-3]):([0-5]\d)$/;

  /**
   * License plate (normalized uppercase alphanumeric, 5–15 chars).
   * Suitable for common regional formats after trimming; normalize in validation.
   */
  static readonly LICENSE_PLATE = /^[A-Z0-9]{5,15}$/;
}
