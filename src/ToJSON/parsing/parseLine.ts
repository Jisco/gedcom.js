import drop from 'lodash/drop';
import join from 'lodash/join';
import trim from 'lodash/trim';
import isEmpty from 'lodash/isEmpty';

import ParsedLine from '../models/ParsedLine';

import { GetLineLevel, GetReferenceId } from './lineHelper';

/**
 * Parses a line
 *
 * @param line - The line
 * @param lineNumber - The line number
 * @param lastLevel - The level of the last parent
 * @returns The ParsedLine object if it is a correct gedcom line else undefined
 */
export function ParseLine(line: string, lineNumber: number, lastLevel: number): ParsedLine | undefined {
  // level is max + 1 of last level
  let level = GetLineLevel(line);
  if (level !== 0 && level > lastLevel + 1) {
    return undefined;
  }

  let splitWithDelimiter = line.split(' ');
  let tagOrRef = trim(splitWithDelimiter[1]);
  let valueOrTag = trim(splitWithDelimiter[2]);
  let value: string | undefined = join(drop(splitWithDelimiter, 3), ' ');

  let refId = GetReferenceId(tagOrRef);

  if (refId !== undefined) {
    if (refId.length > 23 && !refId.match(/.{8}-.{4}-.{4}-.{4}-.{12}/)) {
      return undefined;
    }

    return new ParsedLine(lineNumber, level, valueOrTag, value, refId);
  }

  let tag = tagOrRef;

  if (tag.length > 31) {
    return undefined;
  }

  value = trim(`${valueOrTag} ${value}`);

  if (trim(value) === 'undefined' || isEmpty(trim(value))) {
    value = undefined;
  }

  return new ParsedLine(lineNumber, level, tag, value);
}
