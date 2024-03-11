import { expect } from 'chai';
import ConvertToArray from '../../src/ToJSON/models/converter/ConvertToArray';
import ParsedLine from '../../src/ToJSON/models/ParsedLine';
import TagDefinition from '../../src/ToJSON/models/TagDefinition';
import { AddStartWith, ManipulateValue } from '../../src/ToJSON/processing/manipulateValues';

describe('Mainpulate Values', () => {
  it('Value is ID as Array', () => {
    let result = ManipulateValue(
      new TagDefinition({
        ConvertTo: new ConvertToArray(','),
      }),
      new ParsedLine(0, 0, 'TAG', '', '@111@')
    );

    expect(result).to.be.deep.equal(['@111@']);
  });

  it('Value is empty', () => {
    let result = ManipulateValue(
      new TagDefinition({
        ConvertTo: new ConvertToArray(','),
      }),
      new ParsedLine(0, 0, 'TAG', undefined, undefined)
    );

    expect(result).to.be.deep.equal(['-']);
  });
});

describe('AddStartWith', () => {
  it('Start with escaped new line', () => {
    let result = AddStartWith('\\n', new ParsedLine(0, 0, 'TAG', 'Text', undefined));
    expect(result).to.be.equal('\nText');
  });

  it('No StartWith', () => {
    let result = AddStartWith(undefined, new ParsedLine(0, 0, 'TAG', 'Text', undefined));
    expect(result).to.be.equal('Text');
  });

  it('No StartWith and value', () => {
    let result = AddStartWith(undefined, new ParsedLine(0, 0, 'TAG', undefined, undefined));
    expect(result).to.be.equal('-');
  });
});
