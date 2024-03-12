import { expect } from 'chai';
import { ParseText } from '../../src/ToJSON/parsing/parsing';

describe('Features', () => {
  it('Replace Text', () => {
    let testData = `
    0 @1@ INDI
    1 RESI
    2 EMAIL email@@test.com
    1 RESI
    2 EMAIL anotherEmail@@test.com
    0 TRLR`;

    let options = `
    Definition:
      - Tag: INDI
        CollectAs: Persons
        Properties:
          - Tag: RESI
            Properties:
            - Tag: EMAIL
              Property: EMail
              Replace:
                Value: "@@"
                With: "@"
    `;

    expect(ParseText(testData, options).Object).to.deep.equal({
      Persons: {
        EMail: ['email@test.com', 'anotherEmail@test.com'],
      },
    });
  });

  it('StartsWith', () => {
    let testData = `
    0 @1@ INDI
    1 RESI
    2 EMAIL email@@test.com
    1 RESI
    2 EMAIL anotherEmail@@test.com
    0 TRLR`;

    let options = `
    Definition:
      - Tag: INDI
        CollectAs: Persons
        Properties:
          - Tag: RESI
            Properties:
            - Tag: EMAIL
              Property: EMail
              StartWith: >-
                mail:
              Replace:
                Value: "@@"
    `;

    expect(ParseText(testData, options).Object).to.deep.equal({
      Persons: {
        EMail: ['mail:email@@test.com', 'mail:anotherEmail@@test.com'],
      },
    });
  });

  it('Merge texts', () => {
    let testData = `
    0 @N00010@ NOTE
    1 CONC [RCKarnes.ged]
    1 CONT
    1 CONT In Norse mythology, the god Bor, or Borr was the father of Odin, Ve an
    1 CONC d Vili by the frost giantess Bestla.  Bor was the son of the giant Bur
    1 CONC i.  In Norse mythology, Buri (also Bri, Bur) was the god formed by th
    1 CONC e cow Audumla licking the salty ice of Ginnungagap.  He was the fathe
    1 CONC r of Bor and grandfather of the Aesir.
    1 CONT
    1 CONT ...
    0 TRLR`;

    let options = `
    Definition:
    - Tag: NOTE
      Property: Id
      CollectAs: Notes
    - Tag: CONC
      MergeWithLast: true
    - Tag: CONT
      MergeWithLast: true
      StartWith: $
    `;

    expect(ParseText(testData, options).Object).to.deep.equal({
      Notes: {
        Id: '@N00010@',
        Text: '[RCKarnes.ged]$$In Norse mythology, the god Bor, or Borr was the father of Odin, Ve and Vili by the frost giantess Bestla.  Bor was the son of the giant Buri.  In Norse mythology, Buri (also Bri, Bur) was the god formed by the cow Audumla licking the salty ice of Ginnungagap.  He was the father of Bor and grandfather of the Aesir.$$...',
      },
    });
  });

  it('Merge texts over levels', () => {
    let testData = `
    0 @N00010@ NOTE
    1 EVEN RCKarnes-RootsWeb & John D Newport-Ancestry.com (johndnewport@valornet
    2 CONC .com
    0 TRLR`;

    let options = `
    Definition:
    - Tag: NOTE
      Property: Id
      CollectAs: Notes
    - Tag: EVEN
      CollectAs: Events
      Property: Name
    - Tag: CONC
      MergeWithLast: true
    `;

    expect(ParseText(testData, options).Object).to.deep.equal({
      Notes: {
        Id: '@N00010@',
        Events: {
          Name: 'RCKarnes-RootsWeb & John D Newport-Ancestry.com (johndnewport@valornet.com',
        },
      },
    });
  });

  it('Replace Text needs Value AND With', () => {
    let testData = `
    0 @1@ INDI
    1 RESI
    2 EMAIL email@@test.com
    1 RESI
    2 EMAIL anotherEmail@@test.com
    0 TRLR`;

    let options = `
    Definition:
      - Tag: INDI
        CollectAs: Persons
        Properties:
          - Tag: RESI
            Properties:
            - Tag: EMAIL
              Property: EMail
              Replace:
                Value: "@@"
    `;

    expect(ParseText(testData, options).Object).to.deep.equal({
      Persons: {
        EMail: ['email@@test.com', 'anotherEmail@@test.com'],
      },
    });
  });

  it('Strip HTML', () => {
    let testData = `
    0 @1@ INDI
    1 NOTE <p>Whatever</p>
    0 TRLR`;

    let options = (stripHtml: Boolean) => {
      return `
        Definition:
          - Tag: INDI
            CollectAs: Persons
            Properties:
              - Tag: NOTE
                Property: Note
                StripHtml: ${stripHtml}
        `;
    };

    expect(ParseText(testData, options(false)).Object).to.deep.equal({
      Persons: {
        Note: '<p>Whatever</p>',
      },
    });

    expect(ParseText(testData, options(true)).Object).to.deep.equal({
      Persons: {
        Note: 'Whatever',
      },
    });
  });

  it('Ignores empty conversion options', () => {
    let testData = `
    0 @1@ INDI
    1 NOTE abc
    0 TRLR`;

    let options = `
        Definition:
          - Tag: INDI
            CollectAs: Persons
            Properties:
              - Tag: NOTE
                Property: Note
        `;

    let conversionOptions = `
        Options:
        `;

    expect(ParseText(testData, options, undefined, conversionOptions).Object).to.deep.equal({
      Persons: {
        Note: 'abc',
      },
    });
  });
});
