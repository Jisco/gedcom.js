import mock from 'mock-fs';
import Parsing from '../../src/ToJSON/models/Parsing';
import ParsingOptions from '../../src/ToJSON/models/ParsingOptions';
import { expect } from 'chai';
import { readFileSync } from 'fs';

import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import ParsingResult from '../../src/ToJSON/models/ParsingResult';
chai.use(chaiAsPromised);

describe('Parsing Model', () => {
  afterEach(() => {
    mock.restore();
  });

  it('SaveAs', () => {
    const options = new ParsingOptions();
    const parsing = new Parsing(options);

    mock({
      'ABC.json': '{}',
    });

    parsing.SaveAs({ Test: 'Test' }, 'ABC.json');

    const result = JSON.parse(readFileSync('ABC.json', 'utf8'));
    expect(result).to.deep.equal({ Test: 'Test' });
  });

  it('parse empty text', () => {
    const options = new ParsingOptions();
    const parsing = new Parsing(options);
    expect(parsing.ParseText().Object).to.deep.equal({});
  });

  it('async parsing without text', async () => {
    const options = new ParsingOptions();
    const parsing = new Parsing(options);

    await expect(parsing.ParseTextAsync()).to.be.rejectedWith('No text definied');
  });

  it('async parsing', async () => {
    const options = new ParsingOptions();
    options.SetText(`
      0 @I1@ INDI
      1 NAME John /Doe/
    `);
    const parsing = new Parsing(options);
    const result = await parsing.ParseTextAsync();

    expect(result.Object).to.deep.equal({
      Individuals: [
        {
          Fullname: 'John /Doe/',
          Id: '@I1@',
        },
      ],
    });
  });

  it('parse file without path', () => {
    const options = new ParsingOptions();
    const parsing = new Parsing(options);

    const doneCallback = (r: ParsingResult) => {
      // should NOT be executed, this is the test ;)
      expect(false).to.true;
    };

    const errorCallback = () => {};
    parsing.ParseFile(doneCallback, errorCallback);
  });

  it('parse file', () => {
    const options = new ParsingOptions();
    const config = options.GetConfig();
    const conversionOptions = options.GetConversionOptions();
    mock({
      'ABC.ged': `
                    0 @I1@ INDI
                    1 NAME John /Doe/
          `,
    });
    options.SetConfig(config);
    options.SetConversionOptions(conversionOptions);
    options.SetFilePath('ABC.ged');
    const parsing = new Parsing(options);
    let result = {};
    let error = '';

    const doneCallback = (r: ParsingResult) => {
      result = r.Object;

      expect(result).to.deep.equal({
        Individuals: [
          {
            Fullname: 'John /Doe/',
            Id: '@I1@',
          },
        ],
      });
    };

    const errorCallback = () => {
      error = 'ERROR';
    };

    parsing.ParseFile(doneCallback, errorCallback);
  });

  it('parse file async', async () => {
    const options = new ParsingOptions();
    const config = options.GetConfig();
    const conversionOptions = options.GetConversionOptions();
    mock({
      'ABC.ged': `
                    0 @I1@ INDI
                    1 NAME John /Doe/
          `,
    });
    options.SetConfig(config);
    options.SetConversionOptions(conversionOptions);
    options.SetFilePath('ABC.ged');
    const parsing = new Parsing(options);
    const result = await parsing.ParseFileAsync();

    expect(result.Object).to.deep.equal({
      Individuals: [
        {
          Fullname: 'John /Doe/',
          Id: '@I1@',
        },
      ],
    });
  });

  it('parse file async without path', async () => {
    const options = new ParsingOptions();
    const parsing = new Parsing(options);

    await expect(parsing.ParseFileAsync()).to.be.rejectedWith('No file path definied');
  });

  it('set no parsing options works', () => {
    const parsing = new Parsing();
    expect(parsing.ParseText().Object).to.deep.equal({});
  });
});
