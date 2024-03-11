import dropRight from 'lodash/dropRight';
import split from 'lodash/split';
import map from 'lodash/map';
import flattenDeep from 'lodash/flattenDeep';
import remove from 'lodash/remove';
import find from 'lodash/find';
import isEqual from 'lodash/isEqual';

import objectPath from 'object-path';
import fclone from 'fclone';

import TagDefinition from './TagDefinition';
import ParsedLine from './ParsedLine';
import ConvertToTime from './converter/ConvertToTime';
import ParsingObject from './ParsingObject';
import ParsingPath from './ParsingPath';

import { CreateResult } from '../processing/result';
import { IsEmpty } from '../../common';
import { AddStartWith, ManipulateValue } from '../processing/manipulateValues';
import DefinitionCache from './DefinitionCache';

export default class Store {
  constructor() {
    this.objects = [];
    this.path = [];
    this.isParsing = false;
    this.stopParsingTillLevel = undefined;
  }

  private objects: ParsingObject[];
  /*
        the actual parsed path
    */
  private path: ParsingPath[];

  /*
        if true the line will be parsed, when false all lines will be ignored until a new defined tag with level 0 is found
    */
  private isParsing: Boolean;

  private stopParsingTillLevel?: Number;

  private definitionCache: DefinitionCache[] = [];

  AddDefinitionToCache(path: string[], definition: any) {
    this.definitionCache.push(new DefinitionCache(path, definition));
  }

  GetDefinitionFromCache(path: string[]) {
    return find(this.definitionCache, (x) => isEqual(path, x.Path));
  }

  AddTempPath() {
    this.path.push(new ParsingPath('TEMP', ''));
  }

  StartParsing(definition: TagDefinition, line: ParsedLine) {
    this.isParsing = true;
    this.path.push(new ParsingPath(definition.Tag, definition.Path));

    // concat path and remove empty values
    let path = flattenDeep(map(fclone(this.path), (x) => split(x.Path, '.')));
    remove(path, (x) => IsEmpty(x));

    let obj = new ParsingObject(definition, line, path);

    // if no value is set, but the value should start with a specific value -> set the value and remove the property
    if (!(line.ReferenceId || line.Value)) {
      line.Value = AddStartWith(definition.StartWith, line);
      definition.StartWith = undefined;
    }

    if (definition.Property && (line.ReferenceId || line.Value)) {
      if (definition.CollectAs) {
        objectPath.set(obj.Object, definition.Property, ManipulateValue(definition, line));
      } else {
        obj.Object = ManipulateValue(definition, line);
      }
    } else {
      // time has no own property, but must be merged with the last date
      if (definition.ConvertTo instanceof ConvertToTime) {
        ManipulateValue(definition, line);
      }
    }

    this.objects.push(obj);
  }

  IsParsing(): Boolean {
    return this.isParsing;
  }

  DropRightPath(number?: number) {
    if (!number) {
      this.path = dropRight(this.path, number);
      return;
    }

    this.path = dropRight(this.path, this.path.length - number);
  }

  GetPath() {
    return this.path;
  }

  CreateResultObject() {
    return CreateResult(this.objects);
  }

  StopParsingUntilLevel(level: Number) {
    this.stopParsingTillLevel = level;
  }

  ShouldParseLine(level: Number): Boolean {
    if (!this.stopParsingTillLevel) {
      return true;
    }

    if (level <= this.stopParsingTillLevel) {
      this.stopParsingTillLevel = 0;
      return true;
    }

    return false;
  }

  Reset() {
    this.isParsing = false;
    this.path = [];
    this.stopParsingTillLevel = undefined;
    this.definitionCache = [];
  }

  FullReset() {
    this.Reset();
    this.objects = [];
    this.definitionCache = [];
  }
}
