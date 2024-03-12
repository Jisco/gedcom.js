import { expect } from 'chai';
import { ParseText, ProcessNewLine } from '../../src/ToJSON/parsing/parsing';

describe('Parsing text', () => {
  it('No text or no options', () => {
    expect(ParseText().Object).to.deep.equal({});
    expect(ParseText(undefined).Object).to.deep.equal({});
    expect(ParseText(undefined, '').Object).to.deep.equal({});
    expect(ParseText('', '').Object).to.deep.equal({});
    expect(ParseText('').Object).to.deep.equal({});

    // yaml parsing error
    expect(ParseText('T', '@T: A').Object).to.deep.equal({});
  });

  describe('Process line', () => {
    it('Line numbers are not successive', () => {
      ProcessNewLine(0, 0, '2 TAG Value', (l: any) => {
        expect(l).to.be.undefined;
      });
    });

    it('Parsing line with "user" defined tag', () => {
      let stats = ProcessNewLine(0, 0, '1 _TAG Value', (l: any) => {
        expect(l).to.not.be.undefined;
      });

      expect(stats.NotParsedLinesWithoutGEDCOMTag).lengthOf(1);
    });
  });

  it('Replaces GEDCOM references with UUIDs', () => {
    let testData = `
        0 INDI @I1@
        0 @M1@ OBJE
        0 TRLR
    `
      .trimStart()
      .trimEnd();

    let options = `
      Definition:
        - Tag: INDI
          CollectAs: Individuals
          Property: Id
          CollectAsArray: true
        - Tag: OBJE
          Property: Id
          CollectAs: Objects
    `;

    let conversionOptions = `
      Options:
        - ReplaceIdentifiersWithUUIDs: true
    `;

    const obj: any = ParseText(testData, options, undefined, conversionOptions).Object;
    const individual = obj.Individuals[0];
    const media = obj.Objects;
    expect(individual.Id).to.match(/.{8}-.{4}-.{4}-.{4}-.{12}/);
    expect(media.Id).to.match(/.{8}-.{4}-.{4}-.{4}-.{12}/);
  });

  it('Keeps track and maintains UUIDs if the Gedcom reference is the same', () => {
    let testData = `
        0 INDI @I1@
        0 INDI @I2@
        0 INDI @I3@
        1 FAMC @F2@
        0 @F1@ FAM
        1 HUSB @I1@
        1 WIFE @I2@
        0 @F2@ FAM
        1 CHIL @I3@
        0 TRLR
    `
      .trimStart()
      .trimEnd();

    let options = `
      Definition:
        - Tag: CHIL
          Property: Children
        - Tag: INDI
          CollectAs: Individuals
          Property: Id
          CollectAsArray: true
        - Tag: FAM
          CollectAs: Relations
          CollectAsArray: true
        - Tag: FAMC
          Property: Relations
        - Tag: HUSB
          Property: Husband
        - Tag: WIFE
          Property: Wife
    `;

    let conversionOptions = `
      Options:
        - ReplaceIdentifiersWithUUIDs: true
    `;

    const obj: any = ParseText(testData, options, undefined, conversionOptions).Object;
    const husband = obj.Individuals[0];
    const wife = obj.Individuals[1];
    const child = obj.Individuals[2];
    expect(husband.Id).to.equal(obj.Relations[0].Husband);
    expect(wife.Id).to.equal(obj.Relations[0].Wife);
    expect(child.Id).to.equal(obj.Relations[1].Children);
  });

  it('With Progress', () => {
    let testData = `
        0 @N00010@ NOTE
        0 TRLR`;

    let options = `
        Definition:
        - Tag: NOTE
          CollectAs: Notes
          Property: Id
        `;

    let allLinesCount = 0;
    let invokeCounter = 0;
    let lineNumberArray: number[] = [];
    let progressFunc = (linesCount: number, lineNumber: number) => {
      allLinesCount = linesCount;
      invokeCounter++;
      lineNumberArray.push(lineNumber);
    };

    expect(ParseText(testData, options, progressFunc).Object).to.deep.equal({
      Notes: {
        Id: '@N00010@',
      },
    });

    expect(allLinesCount).to.equal(3);
    expect(invokeCounter).to.equal(3);
    expect(lineNumberArray).to.deep.equal([0, 1, 2]);
  });

  it('Statistics Resets', () => {
    let testData = `
        0 @N00010@ NOTE
        0 TRLR`;

    let options = `
        Definition:
        - Tag: NOTE
          CollectAs: Notes
          Property: Id
        `;

    let allLinesCount = 0;
    let invokeCounter = 0;
    let lineNumberArray: number[] = [];
    let progressFunc = (linesCount: number, lineNumber: number) => {
      allLinesCount = linesCount;
      invokeCounter++;
      lineNumberArray.push(lineNumber);
    };

    var stats = ParseText(testData, options, progressFunc).Statistics;
    expect(stats.ParsedLinesCount).to.equals(2);
    stats = ParseText(testData, options, progressFunc).Statistics;
    expect(stats.ParsedLinesCount).to.equals(2);
  });
});
