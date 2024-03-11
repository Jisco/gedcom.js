import { expect } from 'chai';
import { IsValidLine } from '../../src/ToJSON/parsing/lineValidation';

it('IsValidLine', () => {
  expect(IsValidLine('')).to.be.false;

  // too long max 255 chars
  expect(IsValidLine('1 TAG')).to.be.true;
  expect(IsValidLine('1 TAG' + ' '.repeat(250))).to.be.true;
  expect(IsValidLine('1 TAG' + ' '.repeat(251))).to.be.false;

  // ignore max-line-length
  expect(IsValidLine('1 TAG' + '_'.repeat(251), true)).to.be.true;

  // first char needs to be a number
  expect(IsValidLine('Q Tag')).to.be.false;
  expect(IsValidLine('A Tag')).to.be.false;

  // min length is 3
  expect(IsValidLine('1')).to.be.false;
  expect(IsValidLine('1 ')).to.be.false;
  expect(IsValidLine('1 T')).to.be.false;
  expect(IsValidLine('1 Ta')).to.be.true;

  // second must be whitespace or number
  expect(IsValidLine('1A TAG')).to.be.false;
  expect(IsValidLine('13 TAG')).to.be.true;

  // no leading 0
  expect(IsValidLine('0 TAG')).to.be.true;
  expect(IsValidLine('1 TAG')).to.be.true;
  expect(IsValidLine('01 TAG')).to.be.false;

  // max 99
  expect(IsValidLine('99 TAG')).to.be.true;
  expect(IsValidLine('100 TAG')).to.be.false;
});
