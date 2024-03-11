import { expect } from 'chai';
import mock from 'mock-fs';
import ParsingOptions from '../../src/ToJSON/models/ParsingOptions';
import { afterEach } from 'mocha';

describe('Parsing Options', () => {
  afterEach(() => {
    mock.restore();
  });

  it('Text', () => {
    const options = new ParsingOptions();
    options.SetText('ABC');
    expect(options.GetText()).to.equal('ABC');
  });

  it('File Path', () => {
    const options = new ParsingOptions();
    options.SetFilePath('ABC');
    expect(options.GetFilePath()).to.equal('ABC');
  });

  it('Config File', () => {
    const options = new ParsingOptions();

    mock({
      'ABC.yaml': 'ABC',
    });

    options.SetConfigFile('ABC.yaml');
    expect(options.GetConfig()).to.equal('ABC');
  });

  it('Conversion Options File', () => {
    const options = new ParsingOptions();

    mock({
      'ABC.yaml': 'ABC',
    });

    options.SetConversionOptionsFile('ABC.yaml');
    expect(options.GetConversionOptions()).to.equal('ABC');
  });

  it('Config', () => {
    const options = new ParsingOptions();
    options.SetConfig('ABC');
    expect(options.GetConfig()).to.equal('ABC');
  });

  it('Conversion Options', () => {
    const options = new ParsingOptions();
    options.SetConversionOptions('ABC');
    expect(options.GetConversionOptions()).to.equal('ABC');
  });

  it('Progress', () => {
    const options = new ParsingOptions();
    const func = (l: number, a: number) => console.log(l, a);
    options.SetProgressFunction(func);
    expect(options.GetProgressFunction()).to.equal(func);
  });
});
