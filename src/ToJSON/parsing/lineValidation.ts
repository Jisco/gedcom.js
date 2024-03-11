import isEmpty from 'lodash/isEmpty';
import { IsNumber } from '../../common';

/**
 * Tests if a line is valid
 *
 * @param line - The line text
 * @returns true if the line is valid
 */
export function IsValidLine(line: string, ignoreMaxLineLength?: boolean): Boolean {
  // empty string
  if (isEmpty(line)) {
    return false;
  }

  // max length is 255
  if (!ignoreMaxLineLength && line.length > 255) {
    return false;
  }

  // first char must be a number
  if (!IsNumber(line[0])) {
    return false;
  }

  // min length is 3
  if (line.length < 4) {
    return false;
  }

  // second must be a whitespace or a number
  if (line[1] !== ' ' && !IsNumber(line[1])) {
    return false;
  }

  // numbers with leading 0 are not allowed
  if (line[0] === '0' && IsNumber(line[1])) {
    return false;
  }

  // max is 99
  if (IsNumber(line[1]) && line[2] !== ' ') {
    return false;
  }

  return true;
}
