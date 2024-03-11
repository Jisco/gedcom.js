import { expect } from 'chai';
import { ParseLine } from '../../src/ToJSON/parsing/parseLine';

it('ParseLine', () => {
  expect(ParseLine('33 Tag', 8, 32)).to.deep.equal({
    Level: 33,
    LineNumber: 8,
    ReferenceId: '',
    Tag: 'Tag',
    Value: '',
    NoValue: false,
  });

  expect(ParseLine('2 @III@ INDI', 1, 1)).to.deep.equal({
    Level: 2,
    LineNumber: 1,
    ReferenceId: '@III@',
    Tag: 'INDI',
    Value: '',
    NoValue: false,
  });

  expect(ParseLine('2 INDI VALUE', 1, 1)).to.deep.equal({
    Level: 2,
    LineNumber: 1,
    ReferenceId: '',
    Tag: 'INDI',
    Value: 'VALUE',
    NoValue: false,
  });

  // level jump, eg here from 1 to 3
  expect(ParseLine('3 INDI VALUE', 1, 1)).to.be.undefined;

  // too long ref id -> max 21
  expect(ParseLine(`2 @${'I'.repeat(21)}@ INDI`, 1, 1)).to.deep.equal({
    Level: 2,
    LineNumber: 1,
    ReferenceId: `@${'I'.repeat(21)}@`,
    Tag: 'INDI',
    Value: '',
    NoValue: false,
  });
  expect(ParseLine(`2 @${'I'.repeat(22)}@ INDI`, 1, 1)).to.be.undefined;

  // too long tag -> max 31
  expect(ParseLine(`2 ${'I'.repeat(31)} VALUE`, 1, 1)).to.deep.equal({
    Level: 2,
    LineNumber: 1,
    ReferenceId: '',
    Tag: 'I'.repeat(31),
    Value: 'VALUE',
    NoValue: false,
  });

  expect(ParseLine(`2 ${'I'.repeat(32)} VALUE`, 1, 1)).to.be.undefined;
});
