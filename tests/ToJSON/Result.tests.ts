import { expect } from 'chai';
import ParsedLine from '../../src/ToJSON/models/ParsedLine';
import ParsingObject from '../../src/ToJSON/models/ParsingObject';
import TagDefinition from '../../src/ToJSON/models/TagDefinition';
import { CreateMainObject, GetMainObjectIndexes, SetObject, SetOrCreateArray } from '../../src/ToJSON/processing/result';

describe('Set property in object', () => {
  it('Property dont hast path', () => {
    let result = {};
    SetOrCreateArray(result, ['Prop', 'Prop2'], new TagDefinition({}), 'A', new ParsedLine(0, 0, 'TAG'));

    expect(result).to.deep.equal({
      Prop: {
        Prop2: 'A',
      },
    });
  });

  it('Property is String', () => {
    let result = { Prop: 'Text' };
    SetOrCreateArray(result, ['Prop', 'Prop2'], new TagDefinition({}), 'A', new ParsedLine(0, 0, 'TAG'));

    expect(result).to.deep.equal({
      Prop: {
        Value: 'Text',
        Prop2: 'A',
      },
    });
  });

  it('Set property', () => {
    let result = {};
    SetOrCreateArray(result, ['Prop'], new TagDefinition({}), 'A', new ParsedLine(0, 0, 'TAG'));

    expect(result).to.deep.equal({
      Prop: 'A',
    });
  });

  it('SingleValue -> last wins', () => {
    let result = {
      Prop: 'B',
    };
    SetOrCreateArray(result, ['Prop'], new TagDefinition({ IsSingleValue: true }), 'A', new ParsedLine(0, 0, 'TAG'));

    expect(result).to.deep.equal({
      Prop: 'A',
    });
  });

  it('SingleValue set value', () => {
    let result = {};
    SetOrCreateArray(result, ['Prop'], new TagDefinition({ IsSingleValue: true }), 'A', new ParsedLine(0, 0, 'TAG'));

    expect(result).to.deep.equal({
      Prop: 'A',
    });
  });

  it('Create array if value already exist', () => {
    let result = {
      Prop: 'B',
    };
    SetOrCreateArray(result, ['Prop'], new TagDefinition({}), 'A', new ParsedLine(0, 0, 'TAG'));

    expect(result).to.deep.equal({
      Prop: ['B', 'A'],
    });
  });

  it('Ignore empty value', () => {
    let result = {
      Prop: 'B',
    };
    SetOrCreateArray(result, ['Prop'], new TagDefinition({}), '', new ParsedLine(0, 0, 'TAG'));

    expect(result).to.deep.equal({
      Prop: 'B',
    });
  });

  it('Not ignore empty value if type of string with new line if empty', () => {
    let result = {
      Prop: 'B',
    };
    SetOrCreateArray(result, ['Prop'], new TagDefinition({ ConvertTo: { Type: 'String', NewLineIfEmpty: true } }), '', new ParsedLine(0, 0, 'TAG'));

    expect(result).to.deep.equal({
      Prop: 'B\n',
    });
  });

  it('Concat String', () => {
    let result = {
      Prop: 'B',
    };
    SetOrCreateArray(result, ['Prop'], new TagDefinition({ Type: 'String' }), 'A', new ParsedLine(0, 0, 'TAG'));

    expect(result).to.deep.equal({
      Prop: 'BA',
    });
  });

  it('Concat String with new line', () => {
    let result = {
      Prop: 'B',
    };
    SetOrCreateArray(result, ['Prop'], new TagDefinition({ ConvertTo: { Type: 'String', NewLineIfEmpty: true, NewLineCharacter: '#' } }), '', new ParsedLine(0, 0, 'TAG'));
    SetOrCreateArray(result, ['Prop'], new TagDefinition({ ConvertTo: { Type: 'String' } }), 'A', new ParsedLine(0, 0, 'TAG'));

    expect(result).to.deep.equal({
      Prop: 'B#A',
    });
  });
});

describe('Set objects in result', () => {
  it('No path', () => {
    let result = {};
    SetObject(result, [], { Id: 1 }, new TagDefinition({}));

    expect(result).to.deep.equal({
      Id: 1,
    });
  });

  it('Reduce path', () => {
    let result = {};
    SetObject(result, ['Prop'], { Prop: 1 }, new TagDefinition({}));

    expect(result).to.deep.equal({
      Prop: 1,
    });
  });

  it('Property dont exist before', () => {
    let result = {};
    SetObject(result, ['Prop'], { Id: 1 }, new TagDefinition({}));

    expect(result).to.deep.equal({
      Prop: {
        Id: 1,
      },
    });
  });

  it('Property dont exist before but should be an array', () => {
    let result = {};
    SetObject(result, ['Prop'], { Id: 1 }, new TagDefinition({ CollectAsArray: true }));

    expect(result).to.deep.equal({
      Prop: [
        {
          Id: 1,
        },
      ],
    });
  });

  it('Property exist before -> merge', () => {
    let result = {
      Prop: {
        Id: 0,
      },
    };
    SetObject(result, ['Prop'], { Id: 1 }, new TagDefinition({}));

    expect(result).to.deep.equal({
      Prop: [
        {
          Id: 0,
        },
        {
          Id: 1,
        },
      ],
    });
  });

  it('Property exist before  as array -> insert', () => {
    let result = {
      Prop: [
        {
          Id: 0,
        },
        {
          Id: 2,
        },
      ],
    };
    SetObject(result, ['Prop'], { Id: 1 }, new TagDefinition({}));

    expect(result).to.deep.equal({
      Prop: [
        {
          Id: 0,
        },
        {
          Id: 2,
        },
        {
          Id: 1,
        },
      ],
    });
  });
});

describe('Get main object indexes', () => {
  it('MergeLast without property and the object has no propperty', () => {
    let mergeWithLast = new ParsingObject(new TagDefinition({ Tag: 'D', MergeWithLast: true }), new ParsedLine(0, 2, '', 'D', undefined), []);
    mergeWithLast.Object = {};

    let result = CreateMainObject([mergeWithLast]);

    expect(result.Result).to.deep.equal({});
  });

  it('MergeLast without property and the object has no propperty', () => {
    let firstObject = new ParsingObject(new TagDefinition({ Tag: 'A' }), new ParsedLine(0, 1, '', undefined, undefined), []);

    let mergeWithLast = new ParsingObject(new TagDefinition({ Tag: 'D', MergeWithLast: true }), new ParsedLine(0, 2, '', 'D', undefined), []);
    mergeWithLast.Object = {};

    let result = CreateMainObject([firstObject, mergeWithLast]);

    expect(result.Result).to.deep.equal({});
  });

  it('MergeLast without property and the object has object propperty', () => {
    let firstObject = new ParsingObject(new TagDefinition({ Tag: 'A' }), new ParsedLine(0, 1, 'A', undefined, undefined), ['A']);
    firstObject.Object = { Note: 'Text ' };

    let mergeWithLast = new ParsingObject(new TagDefinition({ Tag: 'D', MergeWithLast: true }), new ParsedLine(0, 2, '', 'D', undefined), []);
    mergeWithLast.Object = {};

    let result = CreateMainObject([firstObject, mergeWithLast]);

    expect(result.Result).to.deep.equal({
      A: {
        Note: 'Text D',
      },
    });
  });

  it('MergeLast without property and the object has object propperty with object as value', () => {
    let firstObject = new ParsingObject(new TagDefinition({ Tag: 'A' }), new ParsedLine(0, 1, 'A', undefined, undefined), ['A']);
    firstObject.Object = { Note: {} };

    let mergeWithLast = new ParsingObject(new TagDefinition({ Tag: 'D', MergeWithLast: true }), new ParsedLine(0, 2, '', 'D', undefined), []);
    mergeWithLast.Object = {};

    let result = CreateMainObject([firstObject, mergeWithLast]);

    expect(result.Result).to.deep.equal({
      A: {
        Note: {},
        Text: 'D',
      },
    });
  });

  it('Single main object', () => {
    let firstObject = new ParsingObject(new TagDefinition({ Tag: 'A' }), new ParsedLine(0, 0, '', undefined, undefined), ['Prop']);
    let subObject = new ParsingObject(new TagDefinition({ Tag: 'B' }), new ParsedLine(0, 1, '', undefined, undefined), ['Prop', 'A']);
    firstObject.Object = { Id: 'A' };
    subObject.Object = { Id: 'B' };

    let result = GetMainObjectIndexes([firstObject, subObject]);

    expect(result.length).to.be.equal(1);
    expect(result[0]).to.deep.equal({
      StartIndex: 0,
      EndIndex: 2,
    });
  });

  it('Two main object', () => {
    let firstObject = new ParsingObject(new TagDefinition({ Tag: 'A' }), new ParsedLine(0, 0, '', undefined, undefined), ['Prop']);
    let subObject = new ParsingObject(new TagDefinition({ Tag: 'B' }), new ParsedLine(0, 1, '', undefined, undefined), ['Prop', 'A']);
    let subObject2 = new ParsingObject(new TagDefinition({ Tag: 'C' }), new ParsedLine(0, 0, '', undefined, undefined), ['Prop', 'A']);
    firstObject.Object = { Id: 'A' };
    subObject.Object = { Id: 'B' };
    subObject2.Object = { Id: 'C' };

    let result = GetMainObjectIndexes([firstObject, subObject, subObject2]);

    expect(result.length).to.be.equal(2);
    expect(result[0]).to.deep.equal({
      StartIndex: 0,
      EndIndex: 2,
    });
    expect(result[1]).to.deep.equal({
      StartIndex: 2,
      EndIndex: 3,
    });
  });
});

describe('Create main object', () => {
  it('Merge with last dont has a object to merge with', () => {
    let mergeWithNext = new ParsingObject(new TagDefinition({ Tag: 'D', MergeWithLast: true }), new ParsedLine(0, 0, '', undefined, undefined), []);

    mergeWithNext.Object = { Id: 'D' };

    let result = CreateMainObject([mergeWithNext]);
    expect(result.Result).to.be.deep.equal({});
  });

  it('Build object', () => {
    let firstObject = new ParsingObject(new TagDefinition({ Tag: 'A' }), new ParsedLine(0, 0, '', undefined, undefined), ['Prop']);
    let subObject = new ParsingObject(new TagDefinition({ Tag: 'B' }), new ParsedLine(0, 0, '', undefined, undefined), ['Prop', 'A']);
    let subObject2 = new ParsingObject(new TagDefinition({ Tag: 'C' }), new ParsedLine(0, 0, '', undefined, undefined), ['Prop', 'A']);

    firstObject.Object = { Id: 'A' };
    subObject.Object = { Id: 'B' };
    subObject2.Object = { Id: 'C' };

    let result = CreateMainObject([firstObject, subObject, subObject2]);

    expect(result.Result).to.deep.equal({
      Prop: {
        A: [
          {
            Id: 'B',
          },
          {
            Id: 'C',
          },
        ],
        Id: 'A',
      },
    });
  });

  it('Ignore empty path properties', () => {
    let emptyPath = new ParsingObject(new TagDefinition({ Tag: 'A' }), new ParsedLine(0, 0, '', undefined, undefined), ['Prop', '', 'Prop2']);
    emptyPath.Object = { Id: 'A' };

    let result = CreateMainObject([emptyPath]);
    expect(result.Result).to.deep.equal({
      Prop: {
        Prop2: {
          Id: 'A',
        },
      },
    });
  });

  it('Target property path is array', () => {
    let firstObject = new ParsingObject(new TagDefinition({ Tag: 'A' }), new ParsedLine(0, 0, '', undefined, undefined), ['Prop']);
    let subObject = new ParsingObject(new TagDefinition({ Tag: 'B' }), new ParsedLine(0, 0, '', undefined, undefined), ['Prop', 'A']);
    let subObject2 = new ParsingObject(new TagDefinition({ Tag: 'C' }), new ParsedLine(0, 0, '', undefined, undefined), ['Prop', 'A']);

    firstObject.Object = [{ Id: 'A' }];
    subObject.Object = { Id: 'B' };
    subObject2.Object = { Id: 'C' };

    let result = CreateMainObject([firstObject, subObject, subObject2]);
    expect(result.Result).to.deep.equal({
      Prop: [
        {
          A: [
            {
              Id: 'B',
            },
            {
              Id: 'C',
            },
          ],
          Id: 'A',
        },
      ],
    });
  });

  describe('MergeWithNext', () => {
    it('Not found', () => {
      let firstObject = new ParsingObject(new TagDefinition({ Tag: 'A' }), new ParsedLine(0, 0, '', undefined, undefined), ['Prop']);
      let subObject = new ParsingObject(new TagDefinition({ Tag: 'B' }), new ParsedLine(0, 0, '', undefined, undefined), ['Prop', 'A']);
      let subObject2 = new ParsingObject(new TagDefinition({ Tag: 'C' }), new ParsedLine(0, 0, '', undefined, undefined), ['Prop', 'A']);

      firstObject.Object = { Id: 'A' };
      subObject.Object = { Id: 'B' };
      subObject2.Object = { Id: 'C' };

      let mergeWithNext = new ParsingObject(
        new TagDefinition({ Tag: 'D', MergeWithNext: 'A', Property: 'Merge' }),
        new ParsedLine(0, 0, '', undefined, undefined),
        []
      );

      mergeWithNext.Object = { Id: 'D' };

      let result = CreateMainObject([firstObject, subObject, subObject2, mergeWithNext]);

      expect(result.Result).to.deep.equal({
        Prop: {
          A: [
            {
              Id: 'B',
            },
            {
              Id: 'C',
            },
          ],
          Id: 'A',
        },
      });
    });

    it('C', () => {
      let firstObject = new ParsingObject(new TagDefinition({ Tag: 'A' }), new ParsedLine(0, 0, '', undefined, undefined), ['Prop']);
      let subObject = new ParsingObject(new TagDefinition({ Tag: 'B' }), new ParsedLine(0, 0, '', undefined, undefined), ['Prop', 'A']);
      let subObject2 = new ParsingObject(new TagDefinition({ Tag: 'C' }), new ParsedLine(0, 0, '', undefined, undefined), ['Prop', 'A']);

      firstObject.Object = { Id: 'A' };
      subObject.Object = { Id: 'B' };
      subObject2.Object = { Id: 'C' };

      let mergeWithNext = new ParsingObject(
        new TagDefinition({ Tag: 'D', MergeWithNext: 'C', Property: 'Merge' }),
        new ParsedLine(0, 0, '', undefined, undefined),
        []
      );

      mergeWithNext.Object = { Id: 'D' };

      let result = CreateMainObject([firstObject, subObject, mergeWithNext, subObject2]);

      expect(result.Result).to.deep.equal({
        Prop: {
          A: [
            {
              Id: 'B',
            },
            {
              Id: 'C',
              Merge: {
                Id: 'D',
              },
            },
          ],
          Id: 'A',
        },
      });
    });

    it('Double B', () => {
      let firstObject = new ParsingObject(new TagDefinition({ Tag: 'A' }), new ParsedLine(0, 0, '', undefined, undefined), ['Prop']);
      let subObject = new ParsingObject(new TagDefinition({ Tag: 'B' }), new ParsedLine(0, 0, '', undefined, undefined), ['Prop', 'A']);
      let subObject2 = new ParsingObject(new TagDefinition({ Tag: 'C' }), new ParsedLine(0, 0, '', undefined, undefined), ['Prop', 'A']);
      let subObject3 = new ParsingObject(new TagDefinition({ Tag: 'B' }), new ParsedLine(0, 0, '', undefined, undefined), ['Prop', 'A']);

      firstObject.Object = { Id: 'A' };
      subObject.Object = { Id: 'B' };
      subObject2.Object = { Id: 'C' };
      subObject3.Object = { Id: 'B2' };

      let mergeWithNext = new ParsingObject(
        new TagDefinition({ Tag: 'D', MergeWithNext: 'B', Property: 'Merge' }),
        new ParsedLine(0, 0, '', undefined, undefined),
        []
      );

      mergeWithNext.Object = { Id: 'D' };

      let result = CreateMainObject([firstObject, mergeWithNext, subObject, subObject3, subObject2]);

      expect(result.Result).to.deep.equal({
        Prop: {
          A: [
            {
              Id: 'B',
              Merge: {
                Id: 'D',
              },
            },
            {
              Id: 'B2',
            },
            {
              Id: 'C',
            },
          ],
          Id: 'A',
        },
      });
    });

    it('B', () => {
      let firstObject = new ParsingObject(new TagDefinition({ Tag: 'A' }), new ParsedLine(0, 0, '', undefined, undefined), ['Prop']);
      let subObject = new ParsingObject(new TagDefinition({ Tag: 'B' }), new ParsedLine(0, 0, '', undefined, undefined), ['Prop', 'A']);
      let subObject2 = new ParsingObject(new TagDefinition({ Tag: 'C' }), new ParsedLine(0, 0, '', undefined, undefined), ['Prop', 'A']);

      firstObject.Object = { Id: 'A' };
      subObject.Object = { Id: 'B' };
      subObject2.Object = { Id: 'C' };

      let mergeWithNext = new ParsingObject(
        new TagDefinition({ Tag: 'D', MergeWithNext: 'B', Property: 'Merge' }),
        new ParsedLine(0, 0, '', undefined, undefined),
        []
      );

      mergeWithNext.Object = { Id: 'D' };

      let result = CreateMainObject([firstObject, mergeWithNext, subObject, subObject2]);

      expect(result.Result).to.deep.equal({
        Prop: {
          A: [
            {
              Id: 'B',
              Merge: {
                Id: 'D',
              },
            },
            {
              Id: 'C',
            },
          ],
          Id: 'A',
        },
      });
    });
  });

  describe('MergeWithLast', () => {
    it('Without specific name C in empty object', () => {
      let firstObject = new ParsingObject(new TagDefinition({ Tag: 'A' }), new ParsedLine(0, 0, '', undefined, undefined, true), ['Prop']);
      let subObject = new ParsingObject(new TagDefinition({ Tag: 'B' }), new ParsedLine(0, 0, '', undefined, undefined, true), ['Prop', 'A']);
      let subObject2 = new ParsingObject(new TagDefinition({ Tag: 'C' }), new ParsedLine(0, 0, '', undefined, undefined, true), ['Prop', 'A']);

      firstObject.Object = { Id: 'A' };
      subObject.Object = { Id: 'B' };
      subObject2.Object = { Id: 'C' };

      let mergeWithLast = new ParsingObject(
        new TagDefinition({ Tag: 'D', MergeWithLast: true, Property: 'Merge' }),
        new ParsedLine(0, 0, '', undefined, undefined, true),
        []
      );
      mergeWithLast.Object = {};

      let result = CreateMainObject([firstObject, subObject, subObject2, mergeWithLast]);
      expect(result.Result).to.deep.equal({
        Prop: {
          A: [
            {
              Id: 'B',
            },
            {
              Id: 'C',
              Text: '-',
            },
          ],
          Id: 'A',
        },
      });
    });

    it('Without specific name C in Array', () => {
      let firstObject = new ParsingObject(new TagDefinition({ Tag: 'A' }), new ParsedLine(0, 0, '', undefined, undefined), ['Prop']);
      let subObject = new ParsingObject(new TagDefinition({ Tag: 'B' }), new ParsedLine(0, 0, '', undefined, undefined), ['Prop', 'A']);
      let subObject2 = new ParsingObject(new TagDefinition({ Tag: 'C' }), new ParsedLine(0, 0, '', undefined, undefined), ['Prop', 'A']);

      firstObject.Object = { Id: 'A' };
      subObject.Object = { Id: 'B' };
      subObject2.Object = { Id: 'C' };

      let mergeWithLast = new ParsingObject(
        new TagDefinition({ Tag: 'D', MergeWithLast: true, Property: 'Merge' }),
        new ParsedLine(0, 0, '', undefined, undefined),
        []
      );
      mergeWithLast.Object = ['D'];

      let result = CreateMainObject([firstObject, subObject, subObject2, mergeWithLast]);
      expect(result.Result).to.deep.equal({
        Prop: {
          A: [
            {
              Id: 'B',
            },
            {
              Id: 'C',
              Merge: ['D'],
            },
          ],
          Id: 'A',
        },
      });
    });

    it('Without specific name C', () => {
      let firstObject = new ParsingObject(new TagDefinition({ Tag: 'A' }), new ParsedLine(0, 0, '', undefined, undefined), ['Prop']);
      let subObject = new ParsingObject(new TagDefinition({ Tag: 'B' }), new ParsedLine(0, 0, '', undefined, undefined), ['Prop', 'A']);
      let subObject2 = new ParsingObject(new TagDefinition({ Tag: 'C' }), new ParsedLine(0, 0, '', undefined, undefined), ['Prop', 'A']);

      firstObject.Object = { Id: 'A' };
      subObject.Object = { Id: 'B' };
      subObject2.Object = { Id: 'C' };

      let mergeWithLast = new ParsingObject(
        new TagDefinition({ Tag: 'D', MergeWithLast: true, Property: 'Merge' }),
        new ParsedLine(0, 0, '', undefined, undefined),
        []
      );
      mergeWithLast.Object = { Id: 'D' };

      let result = CreateMainObject([firstObject, subObject, subObject2, mergeWithLast]);
      expect(result.Result).to.deep.equal({
        Prop: {
          A: [
            {
              Id: 'B',
            },
            {
              Id: 'C',
              Merge: {
                Id: 'D',
              },
            },
          ],
          Id: 'A',
        },
      });
    });

    it('Without specific name B', () => {
      let firstObject = new ParsingObject(new TagDefinition({ Tag: 'A' }), new ParsedLine(0, 0, '', undefined, undefined), ['Prop']);
      let subObject = new ParsingObject(new TagDefinition({ Tag: 'B' }), new ParsedLine(0, 0, '', undefined, undefined), ['Prop', 'A']);
      let subObject2 = new ParsingObject(new TagDefinition({ Tag: 'C' }), new ParsedLine(0, 0, '', undefined, undefined), ['Prop', 'A']);

      firstObject.Object = { Id: 'A' };
      subObject.Object = { Id: 'B' };
      subObject2.Object = { Id: 'C' };

      let mergeWithLast = new ParsingObject(
        new TagDefinition({ Tag: 'D', MergeWithLast: true, Property: 'Merge' }),
        new ParsedLine(0, 0, '', undefined, undefined),
        []
      );
      mergeWithLast.Object = { Id: 'D' };

      let result = CreateMainObject([firstObject, subObject, mergeWithLast, subObject2]);
      expect(result.Result).to.deep.equal({
        Prop: {
          A: [
            {
              Id: 'B',
              Merge: {
                Id: 'D',
              },
            },
            {
              Id: 'C',
            },
          ],
          Id: 'A',
        },
      });
    });

    it('Without specific name without property on string', () => {
      let firstObject = new ParsingObject(new TagDefinition({ Tag: 'A' }), new ParsedLine(0, 0, '', undefined, undefined), ['Prop']);
      let subObject = new ParsingObject(new TagDefinition({ Tag: 'B' }), new ParsedLine(0, 0, '', undefined, undefined), ['Prop', 'A']);
      let subObject2 = new ParsingObject(new TagDefinition({ Tag: 'C' }), new ParsedLine(0, 0, '', undefined, undefined), ['Prop', 'A']);

      firstObject.Object = { Id: 'A' };
      subObject.Object = 'B';
      subObject2.Object = { Id: 'C' };

      let mergeWithLast = new ParsingObject(new TagDefinition({ Tag: 'D', MergeWithLast: true }), new ParsedLine(0, 0, '', 'D', undefined), []);
      mergeWithLast.Object = {};

      let result = CreateMainObject([firstObject, subObject, mergeWithLast, subObject2]);
      expect(result.Result).to.deep.equal({
        Prop: {
          A: [
            'BD',
            {
              Id: 'C',
            },
          ],
          Id: 'A',
        },
      });
    });

    it('Without specific name without property on string (multiple)', () => {
      let firstObject = new ParsingObject(new TagDefinition({ Tag: 'A' }), new ParsedLine(0, 0, '', undefined, undefined), ['Prop']);
      let subObject = new ParsingObject(new TagDefinition({ Tag: 'B' }), new ParsedLine(0, 0, '', undefined, undefined), ['Prop', 'A']);
      let subObject2 = new ParsingObject(new TagDefinition({ Tag: 'C' }), new ParsedLine(0, 0, '', undefined, undefined), ['Prop', 'A']);

      firstObject.Object = { Id: 'A' };
      subObject.Object = 'B';
      subObject2.Object = { Id: 'C' };

      let mergeWithLast = new ParsingObject(new TagDefinition({ Tag: 'D', MergeWithLast: true }), new ParsedLine(0, 0, '', 'D', undefined), []);
      mergeWithLast.Object = {};

      let mergeWithLast2 = new ParsingObject(new TagDefinition({ Tag: 'E', MergeWithLast: true }), new ParsedLine(0, 0, '', 'E', undefined), []);
      mergeWithLast2.Object = {};

      let mergeWithLast3 = new ParsingObject(new TagDefinition({ Tag: 'F', MergeWithLast: true }), new ParsedLine(0, 0, '', 'F', undefined), []);
      mergeWithLast3.Object = {};

      let result = CreateMainObject([firstObject, subObject, mergeWithLast, mergeWithLast2, mergeWithLast3, subObject2]);
      expect(result.Result).to.deep.equal({
        Prop: {
          A: [
            'BDEF',
            {
              Id: 'C',
            },
          ],
          Id: 'A',
        },
      });
    });

    it('Without specific name without property on object', () => {
      let firstObject = new ParsingObject(new TagDefinition({ Tag: 'A' }), new ParsedLine(0, 0, '', undefined, undefined), ['Prop']);
      let subObject = new ParsingObject(new TagDefinition({ Tag: 'B' }), new ParsedLine(0, 0, '', undefined, undefined), ['Prop', 'A']);
      let subObject2 = new ParsingObject(new TagDefinition({ Tag: 'C' }), new ParsedLine(0, 0, '', undefined, undefined), ['Prop', 'A']);

      firstObject.Object = { Id: 'A' };
      subObject.Object = { Id: 'B' };
      subObject2.Object = { Id: 'C' };

      let mergeWithLast = new ParsingObject(new TagDefinition({ Tag: 'D', MergeWithLast: true }), new ParsedLine(0, 0, '', 'D', undefined), []);
      mergeWithLast.Object = {};

      let result = CreateMainObject([firstObject, subObject, mergeWithLast, subObject2]);
      expect(result.Result).to.deep.equal({
        Prop: {
          A: [
            {
              Id: 'B',
              Text: 'D',
            },
            {
              Id: 'C',
            },
          ],
          Id: 'A',
        },
      });
    });

    it('C', () => {
      let firstObject = new ParsingObject(new TagDefinition({ Tag: 'A' }), new ParsedLine(0, 0, '', undefined, undefined), ['Prop']);
      let subObject = new ParsingObject(new TagDefinition({ Tag: 'B' }), new ParsedLine(0, 0, '', undefined, undefined), ['Prop', 'A']);
      let subObject2 = new ParsingObject(new TagDefinition({ Tag: 'C' }), new ParsedLine(0, 0, '', undefined, undefined), ['Prop', 'A']);

      firstObject.Object = { Id: 'A' };
      subObject.Object = { Id: 'B' };
      subObject2.Object = { Id: 'C' };

      let mergeWithLast = new ParsingObject(
        new TagDefinition({ Tag: 'D', MergeWithLast: 'C', Property: 'Merge' }),
        new ParsedLine(0, 0, '', undefined, undefined),
        []
      );

      mergeWithLast.Object = { Id: 'D' };

      let result = CreateMainObject([firstObject, subObject, subObject2, mergeWithLast]);

      expect(result.Result).to.deep.equal({
        Prop: {
          A: [
            {
              Id: 'B',
            },
            {
              Id: 'C',
              Merge: {
                Id: 'D',
              },
            },
          ],
          Id: 'A',
        },
      });
    });

    it('Double B', () => {
      let firstObject = new ParsingObject(new TagDefinition({ Tag: 'A' }), new ParsedLine(0, 0, '', undefined, undefined), ['Prop']);
      let subObject = new ParsingObject(new TagDefinition({ Tag: 'B' }), new ParsedLine(0, 0, '', undefined, undefined), ['Prop', 'A']);
      let subObject2 = new ParsingObject(new TagDefinition({ Tag: 'C' }), new ParsedLine(0, 0, '', undefined, undefined), ['Prop', 'A']);
      let subObject3 = new ParsingObject(new TagDefinition({ Tag: 'B' }), new ParsedLine(0, 0, '', undefined, undefined), ['Prop', 'A']);

      firstObject.Object = { Id: 'A' };
      subObject.Object = { Id: 'B' };
      subObject2.Object = { Id: 'C' };
      subObject3.Object = { Id: 'B2' };

      let MergeWithLast = new ParsingObject(
        new TagDefinition({ Tag: 'D', MergeWithLast: 'B', Property: 'Merge' }),
        new ParsedLine(0, 0, '', undefined, undefined),
        []
      );

      MergeWithLast.Object = { Id: 'D' };

      let result = CreateMainObject([firstObject, subObject, subObject3, subObject2, MergeWithLast]);

      expect(result.Result).to.deep.equal({
        Prop: {
          A: [
            {
              Id: 'B',
            },
            {
              Id: 'B2',
              Merge: {
                Id: 'D',
              },
            },
            {
              Id: 'C',
            },
          ],
          Id: 'A',
        },
      });
    });

    it('B', () => {
      let firstObject = new ParsingObject(new TagDefinition({ Tag: 'A' }), new ParsedLine(0, 0, '', undefined, undefined), ['Prop']);
      let subObject = new ParsingObject(new TagDefinition({ Tag: 'B' }), new ParsedLine(0, 0, '', undefined, undefined), ['Prop', 'A']);
      let subObject2 = new ParsingObject(new TagDefinition({ Tag: 'C' }), new ParsedLine(0, 0, '', undefined, undefined), ['Prop', 'A']);

      firstObject.Object = { Id: 'A' };
      subObject.Object = { Id: 'B' };
      subObject2.Object = { Id: 'C' };

      let mergeWithLast = new ParsingObject(
        new TagDefinition({ Tag: 'D', MergeWithLast: 'B', Property: 'Merge' }),
        new ParsedLine(0, 0, '', undefined, undefined),
        []
      );

      mergeWithLast.Object = { Id: 'D' };

      let result = CreateMainObject([firstObject, subObject, subObject2, mergeWithLast]);

      expect(result.Result).to.deep.equal({
        Prop: {
          A: [
            {
              Id: 'B',
              Merge: {
                Id: 'D',
              },
            },
            {
              Id: 'C',
            },
          ],
          Id: 'A',
        },
      });
    });

    it('A', () => {
      let firstObject = new ParsingObject(new TagDefinition({ Tag: 'A' }), new ParsedLine(0, 0, '', undefined, undefined), ['Prop']);
      let subObject = new ParsingObject(new TagDefinition({ Tag: 'B' }), new ParsedLine(0, 0, '', undefined, undefined), ['Prop', 'A']);
      let subObject2 = new ParsingObject(new TagDefinition({ Tag: 'C' }), new ParsedLine(0, 0, '', undefined, undefined), ['Prop', 'A']);

      firstObject.Object = { Id: 'A' };
      subObject.Object = { Id: 'B' };
      subObject2.Object = { Id: 'C' };

      let mergeWithLast = new ParsingObject(
        new TagDefinition({ Tag: 'D', MergeWithLast: 'A', Property: 'Merge' }),
        new ParsedLine(0, 0, '', undefined, undefined),
        []
      );

      mergeWithLast.Object = { Id: 'D' };

      let result = CreateMainObject([firstObject, subObject, subObject2, mergeWithLast]);

      expect(result.Result).to.deep.equal({
        Prop: {
          A: [
            {
              Id: 'B',
            },
            {
              Id: 'C',
            },
          ],
          Id: 'A',
          Merge: {
            Id: 'D',
          },
        },
      });
    });

    it('Not found', () => {
      let firstObject = new ParsingObject(new TagDefinition({ Tag: 'A' }), new ParsedLine(0, 0, '', undefined, undefined), ['Prop']);
      let subObject = new ParsingObject(new TagDefinition({ Tag: 'B' }), new ParsedLine(0, 0, '', undefined, undefined), ['Prop', 'A']);
      let subObject2 = new ParsingObject(new TagDefinition({ Tag: 'C' }), new ParsedLine(0, 0, '', undefined, undefined), ['Prop', 'A']);

      firstObject.Object = { Id: 'A' };
      subObject.Object = { Id: 'B' };
      subObject2.Object = { Id: 'C' };

      let mergeWithLast = new ParsingObject(
        new TagDefinition({ Tag: 'D', MergeWithLast: 'QQQ', Property: 'Merge' }),
        new ParsedLine(0, 0, '', undefined, undefined),
        []
      );

      mergeWithLast.Object = { Id: 'D' };

      let result = CreateMainObject([firstObject, subObject, subObject2, mergeWithLast]);

      expect(result.Result).to.deep.equal({
        Prop: {
          A: [
            {
              Id: 'B',
            },
            {
              Id: 'C',
            },
          ],
          Id: 'A',
        },
      });
    });
  });
});
