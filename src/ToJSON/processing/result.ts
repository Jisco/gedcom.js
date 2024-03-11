import forEachRight from 'lodash/forEachRight';
import filter from 'lodash/filter';
import find from 'lodash/find';
import findLast from 'lodash/findLast';
import remove from 'lodash/remove';
import isEqual from 'lodash/isEqual';
import split from 'lodash/split';
import forEach from 'lodash/forEach';
import isObject from 'lodash/isObject';
import isArray from 'lodash/isArray';
import dropRight from 'lodash/dropRight';
import indexOf from 'lodash/indexOf';
import take from 'lodash/take';
import slice from 'lodash/slice';
import assignIn from 'lodash/assignIn';
import isEmpty from 'lodash/isEmpty';
import last from 'lodash/last';
import keys from 'lodash/keys';
import first from 'lodash/first';

import objectPath from 'object-path';

import ParsedLine from '../models/ParsedLine';
import ParsingObject from '../models/ParsingObject';
import TagDefinition from '../models/TagDefinition';
import ConvertToString from '../models/converter/ConvertToString';

import { IsEmpty } from '../../common';
import { isString, merge } from 'lodash';
import fclone from 'fclone';
import { AddStartWith } from './manipulateValues';

export function CreateResult(objects: ParsingObject[]) {
  for (const obj of objects.filter((x) => x.Line.NoValue)) {
    obj.Line.Value = '';
    obj.Object = { [obj.Definition.Property ?? 'Value']: '' };
  }

  // collect all main objects
  let mainObjectIndexes = GetMainObjectIndexes(objects);
  let mainObjects: MainObject[] = [];

  // create all main objects
  forEach(mainObjectIndexes, (mainObjectIndex) => {
    let mainObjectSubObjects = take(slice(objects, mainObjectIndex.StartIndex), mainObjectIndex.EndIndex - mainObjectIndex.StartIndex);
    mainObjects.push(CreateMainObject(mainObjectSubObjects));
  });

  // merge all main objects together
  let result = {};
  forEach(mainObjects, (mainObject) => {
    SetObject(result, mainObject.Informations.PropertyPath, mainObject.Result, mainObject.Informations.Definition);
  });

  return result;
}

export function CreateMainObject(objects: ParsingObject[]): MainObject {
  let result = {};

  // concat objects
  let mergeWithLastValue = filter(objects, (x) => x.Definition.MergeWithLast === 'true') as ParsingObject[];
  let mergeValue = '';

  forEachRight(mergeWithLastValue, (obj) => {
    let index = indexOf(objects, obj);
    let objectsToSearch = take(objects, index);
    let mergeObject = last(objectsToSearch);

    let val = obj.Line.Value;
    val = AddStartWith(obj.Definition.StartWith, obj.Line);
    if (!mergeObject) {
      mergeValue = val;
      return;
    }

    if (!isEmpty(obj.Object) && (isArray(obj.Object) || isObject(obj.Object))) {
      SetOrCreateArray(mergeObject.Object, split(obj.Definition.Path, '.'), obj.Definition, obj.Object, obj.Line);
      remove(objects, (x) => isEqual(x, obj));
      return;
    }

    if (mergeObject.Definition.MergeWithLast === 'true') {
      mergeValue = `${val}${mergeValue}`;
      remove(objects, (x) => isEqual(x, obj));
      return;
    }

    mergeValue = `${val}${mergeValue}`;

    if (isString(mergeObject.Object)) {
      mergeObject.Object += mergeValue;
      mergeValue = '';
      remove(objects, (x) => isEqual(x, obj));
      return;
    }

    /*
            startlevel to has greater than null, because

            1 EVEN RCKarnes-RootsWeb & John D Newport-Ancestry.com (johndnewport@valornet
            2 CONC .com
            ...

            should be merged, but

            0 @N00009@ NOTE
            1 CONC [RCKarnes.ged]
            1 CONT
            ...

            NOT!

         */
    if (mergeObject.StartLevel > 0 && isObject(mergeObject.Object)) {
      let key = last(keys(mergeObject.Object));

      if (!key) {
        return;
      }

      let value = objectPath.get(mergeObject.Object, key);

      if (!isString(value)) {
        return;
      }

      objectPath.set(mergeObject.Object, key, `${value}${mergeValue}`);
      mergeValue = '';
      remove(objects, (x) => isEqual(x, obj));
      return;
    }
  });

  if (!isEmpty(mergeValue)) {
    let index = indexOf(objects, first(mergeWithLastValue));
    let objectsToSearch = take(objects, index);
    let mergeObject = last(objectsToSearch);

    if (mergeObject) {
      objectPath.set(mergeObject.Object, 'Text', mergeValue);
      mergeValue = '';
    }
  }

  // move objects to other objects
  let mergeWithLast = filter(objects, (x) => x.Definition.MergeWithLast) as ParsingObject[];

  forEachRight(mergeWithLast, (obj) => {
    let index = indexOf(objects, obj);
    let objectsToSearch = take(objects, index);

    let mergeObject = findLast(objectsToSearch, (x) => x.Definition.Tag === obj.Definition.MergeWithLast);

    if (mergeObject) {
      SetOrCreateArray(mergeObject.Object, split(obj.Definition.Path, '.'), obj.Definition, obj.Object, obj.Line);
      remove(objects, (x) => isEqual(x, obj));
    }
  });

  let mergeWithNext = filter(objects, (x) => x.Definition.MergeWithNext) as ParsingObject[];

  forEachRight(mergeWithNext, (obj) => {
    let index = indexOf(objects, obj);
    let objectsToSearch = slice(objects, index);
    let mergeObject = find(objectsToSearch, (x) => x.Definition.Tag === obj.Definition.MergeWithNext);

    if (mergeObject) {
      SetOrCreateArray(mergeObject.Object, split(obj.Definition.Path, '.'), obj.Definition, obj.Object, obj.Line);
      remove(objects, (x) => isEqual(x, obj));
    }
  });

  // set all sub objects in object
  forEach(objects, (o) => {
    let obj = o as ParsingObject;
    let partPath: string[] = [];

    forEach(dropRight(obj.PropertyPath), (property: any) => {
      if (IsEmpty(property)) {
        return;
      }

      partPath.push(property);

      const parentPath = dropRight(partPath);
      const parentObj = objectPath.get(result, parentPath);

      if (parentPath.length > 0 && objectPath.has(result, parentPath) && isArray(parentObj)) {
        partPath = parentPath;
        partPath.push(`${parentObj.length - 1}`);
        partPath.push(property);
      }

      if (!objectPath.has(result, partPath)) {
        objectPath.set(result, partPath, {});
        return;
      }

      let value = objectPath.get(result, partPath);

      // If path value is an array, add position in array to path
      if (isArray(value)) {
        obj.PropertyPath.splice(indexOf(obj.PropertyPath, property) + 1, 0, `${value.length - 1}`);
      } else if (!isObject(value) && !isArray(value)) {
        let convertedValue = {};
        objectPath.set(convertedValue, 'Value', value);
        objectPath.set(result, partPath, convertedValue);
      }
    });

    remove(obj.PropertyPath, (x) => isEmpty(x));
    SetOrCreateArray(result, obj.PropertyPath, obj.Definition, obj.Object, obj.Line);
  });

  return new MainObject(objects[0], result);
}

class MainObject {
  constructor(informations: ParsingObject, obj: Object) {
    this.Informations = informations;
    this.Result = obj;
  }

  Informations: ParsingObject;
  Result: Object;
}

export function GetMainObjectIndexes(objects: ParsingObject[]) {
  // get all objects with level 0
  let mainObjects = filter(objects, (x) => x.StartLevel === 0);
  let mainObjectIndexes: number[] = [];

  forEach(mainObjects, (mainObject) => {
    mainObjectIndexes.push(indexOf(objects, mainObject));
  });

  let mainObjectIndexObject = [];

  for (let i = 0; i < mainObjects.length; i++) {
    let startIndex = mainObjectIndexes[i];
    let endIndex = 0;

    if (i === mainObjects.length - 1) {
      endIndex = objects.length;
    } else {
      endIndex = mainObjectIndexes[i + 1];
    }

    mainObjectIndexObject.push({
      StartIndex: startIndex,
      EndIndex: endIndex,
    });
  }

  return mainObjectIndexObject;
}

export function SetObject(mainObject: Object, path: string[], value: Object, definition: TagDefinition) {
  if (path.length === 0) {
    assignIn(mainObject, value);
    return;
  }

  if (objectPath.has(value, path)) {
    value = objectPath.get(value, path);
  }

  if (!objectPath.has(mainObject, path)) {
    // should be array
    if (definition.CollectAsArray) {
      objectPath.set(mainObject, path, [value]);
      return;
    }

    objectPath.set(mainObject, path, value);
    return;
  }

  let oldValue = objectPath.get(mainObject, path);

  if (isArray(oldValue)) {
    objectPath.insert(mainObject, path, value, oldValue.length);
    return;
  }

  objectPath.set(mainObject, path, [oldValue, value]);
}

export function SetOrCreateArray(obj: any, path: string[], definition: TagDefinition, value: any, line: ParsedLine) {
  // should be a single value -> last wins
  if (definition.IsSingleValue) {
    if (objectPath.has(obj, path)) {
      objectPath.del(obj, path);
    }
  }

  // if empty AND NOT type of string, ignore value
  if (IsEmpty(value) && !(definition.ConvertTo instanceof ConvertToString)) {
    return;
  }

  if (!objectPath.has(obj, path)) {
    // parent object could be a string or array, check this an create object if needed
    let parentPath = dropRight(fclone(path));
    if (objectPath.has(obj, parentPath)) {
      let parentValue = objectPath.get(obj, parentPath);

      if (!isObject(parentValue)) {
        let convertedValue = {};
        objectPath.set(convertedValue, 'Value', parentValue);
        objectPath.set(obj, parentPath, convertedValue);
      }
    }

    objectPath.set(obj, path, value);
    return;
  }

  let oldValue = objectPath.get(obj, path);

  if (definition.ConvertTo instanceof ConvertToString) {
    let newLineCharacter = definition.ConvertTo.NewLineCharacter;

    if (definition.ConvertTo.NewLineIfEmpty && (IsEmpty(value) || line.NoValue)) {
      value = newLineCharacter;
    }

    if (!definition.ConvertTo.NewLineIfEmpty && (IsEmpty(value) || line.NoValue)) {
      return;
    }

    // ignore empty value
    if (IsEmpty(value)) {
      return;
    }

    // concat
    objectPath.set(obj, path, `${oldValue}${value}`);
    return;
  }

  if (isArray(oldValue)) {
    objectPath.insert(obj, path, value, oldValue.length);
    return;
  }

  objectPath.set(obj, path, [oldValue, value]);
}
