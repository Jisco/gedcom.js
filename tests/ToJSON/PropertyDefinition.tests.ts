import { expect } from 'chai';
import { ParseText } from '../../src/ToJSON/parsing/parsing';

describe('Definitions', () => {
  it('Define all as main objects', () => {
    let testData = `0 @111@ INDI
    1 CHAN
    2 DATE 11 FEB 2007
    3 TIME 15:05:36
    0 TRLR`;

    let options = `
    Definition:
    - Tag: INDI
      CollectAs: Individuals
      Property: Id
    - Tag: CHAN
      Property: Changed
    - Tag: DATE
      Property: Date
      Type: Date
    - Tag: TIME
      Type: Time
    `;

    expect(ParseText(testData, options).Object).to.deep.equal({
      Individuals: {
        Id: '@111@',
        Changed: {
          Changed: '',
          Date: {
            HasDay: true,
            HasMonth: true,
            HasYear: true,
            Original: '11 FEB 2007 15:05:36',
            Value: new Date(2007, 1, 11, 15, 5, 36),
          },
        },
      },
    });
  });

  it('Define all as main but with specific overwrites', () => {
    let testData = `0 @111@ INDI
    1 CHAN
    2 DATE 11 FEB 2007
    3 TIME 15:05:36
    0 TRLR`;

    let options = `
    Definition:
    - Tag: INDI
      CollectAs: Individuals
      Property: Id
    - Tag: CHAN
      Property: Changed
      Properties:
      - Tag: DATE
        Property: ChangedDate
        Type: Date
    - Tag: DATE
      Property: Date
      Type: Date
    - Tag: TIME
      Type: Time
    `;

    expect(ParseText(testData, options).Object).to.deep.equal({
      Individuals: {
        Id: '@111@',
        Changed: {
          Changed: '',
          ChangedDate: {
            HasDay: true,
            HasMonth: true,
            HasYear: true,
            Original: '11 FEB 2007 15:05:36',
            Value: new Date(2007, 1, 11, 15, 5, 36),
          },
        },
      },
    });
  });

  it('Define all as main but with more specific overwrites', () => {
    let testData = `0 @111@ INDI
    1 CHAN
    2 DATE 11 FEB 2007
    3 TIME 15:05:36
    0 TRLR`;

    let options = `
    Definition:
    - Tag: INDI
      CollectAs: Individuals
      Property: Id
    - Tag: CHAN
      Property: Changed
      Properties:
      - Tag: DATE
        Property: ChangedDate
        Type: Date
        Properties:
        - Tag: TIME
          Property: Time
          Type: Time
    - Tag: DATE
      Property: Date
      Type: Date
    - Tag: TIME
      Type: Time
    `;

    expect(ParseText(testData, options).Object).to.deep.equal({
      Individuals: {
        Id: '@111@',
        Changed: {
          Changed: '',
          ChangedDate: {
            HasDay: true,
            HasMonth: true,
            HasYear: true,
            Original: '11 FEB 2007',
            Time: '15:05:36',
            Value: new Date(2007, 1, 11, 15, 5, 36),
          },
        },
      },
    });
  });

  it('Mix definitions', () => {
    let testData = `0 @111@ INDI
    1 CHAN
    2 DATE 11 FEB 2007
    3 TIME 15:05:36
    1 DATE 12 FEB 2007
    2 TIME 11:05:36
    0 TRLR`;

    let options = `
    Definition:
    - Tag: INDI
      CollectAs: Individuals
      Property: Id
    - Tag: CHAN
      Property: Changed
      Properties:
      - Tag: DATE
        Property: ChangedDate
        Type: Date
        Properties:
        - Tag: TIME
          Property: Time
          Type: Time
    - Tag: DATE
      Property: Date
      Type: Date
    - Tag: TIME
      Type: Time
    `;

    expect(ParseText(testData, options).Object).to.deep.equal({
      Individuals: {
        Id: '@111@',
        Changed: {
          Changed: '',
          ChangedDate: {
            HasDay: true,
            HasMonth: true,
            HasYear: true,
            Original: '11 FEB 2007',
            Time: '15:05:36',
            Value: new Date(2007, 1, 11, 15, 5, 36),
          },
        },
        Date: {
          HasDay: true,
          HasMonth: true,
          HasYear: true,
          Original: '12 FEB 2007 11:05:36',
          Value: new Date(2007, 1, 12, 11, 5, 36),
        },
      },
    });
  });
});
