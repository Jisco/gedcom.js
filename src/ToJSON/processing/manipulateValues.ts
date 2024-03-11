import isEmpty from 'lodash/isEmpty';
import trim from 'lodash/trim';
import replace from 'lodash/replace';
import split from 'lodash/split';
import map from 'lodash/map';

import ParsedLine from '../models/ParsedLine';
import TagDefinition from '../models/TagDefinition';
import ConvertToDate from '../models/converter/ConvertToDate';
import ConvertToArray from '../models/converter/ConvertToArray';

import { ConvertDateStringToObject, ConvertTimeStringToObject } from '../parsing/parseDate';
import ConvertToTime from '../models/converter/ConvertToTime';

export function ManipulateValue(definition: TagDefinition, line: ParsedLine) {
  let value: string = trim(isEmpty(line.ReferenceId) ? line.Value : line.ReferenceId);
  let convertTo = definition.PropertyType ?? definition.ConvertTo;

  if (value.match(/^(@.*@)/)) {
    if (definition.ConvertTo instanceof ConvertToArray) {
      return ConvertStringToArray(definition.ConvertTo, value);
    }

    return value;
  }

  value = AddStartWith(definition.StartWith, line);

  if (definition.Replace) {
    let pattern = definition.Replace.Value;
    let replacement = definition.Replace.With;

    if (pattern && replacement) {
      value = replace(value, pattern, replacement);
    }
  }

  if (definition.StripHtml) {
    value = value.replace(/(<([^>]+)>)/gi, '');
  }

  if (!convertTo) {
    return value;
  }

  if (convertTo instanceof ConvertToDate) {
    return ConvertDateStringToObject(convertTo, value);
  }

  if (convertTo instanceof ConvertToTime) {
    return ConvertTimeStringToObject(value, definition.Property);
  }

  if (convertTo instanceof ConvertToArray) {
    return ConvertStringToArray(convertTo, value);
  }

  return value;
}

export function AddStartWith(startWith: string | undefined, line: ParsedLine): string {
  if (!startWith) {
    if (!line.Value || line.Value === '') {
      line.NoValue = true;
      return '-';
    }
    return line.Value;
  }

  if (startWith === '\\n') {
    startWith = '\n';
  }

  if (!line.Value) {
    return startWith;
  }

  return `${startWith}${line.Value}`;
}

function ConvertStringToArray(convertOptions: ConvertToArray, value: string) {
  let arr = split(value, convertOptions.Delimiter);
  arr = map(arr, (x) => trim(x));

  return arr;
}
