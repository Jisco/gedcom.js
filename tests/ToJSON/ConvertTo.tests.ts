import { expect } from 'chai';
import { ParseText } from '../../src/ToJSON/parsing/parsing';

describe('Convert To', () => {
  describe('Array', () => {
    it('Single value as Array', () => {
      let testData = `
        0 @N00010@ NOTE
        0 TRLR`;

      let options = `
        Definition:
        - Tag: NOTE
          CollectAs: Notes
          Property: Id
        `;

      expect(ParseText(testData, options).Object).to.deep.equal({
        Notes: {
          Id: '@N00010@',
        },
      });

      options = `
        Definition:
        - Tag: NOTE
          CollectAs: Notes
          CollectAsArray: true
          Property: Id
        `;

      expect(ParseText(testData, options).Object).to.deep.equal({
        Notes: [
          {
            Id: '@N00010@',
          },
        ],
      });
    });

    describe('String value to array', () => {
      it('Type Array on main object to convert value to array', () => {
        let testData = `
          0 NOTE A,B,C,D
          0 TRLR`;

        let options = `
         Definition:
         - Tag: NOTE
           CollectAs: Notes
           CollectAsArray: true
           Property: Value
         `;

        expect(ParseText(testData, options).Object).to.deep.equal({
          Notes: [
            {
              Value: 'A,B,C,D',
            },
          ],
        });
      });

      it('Type Array on main object to convert value to array via convertTo', () => {
        let testData = `
          0 NOTE A,B,C,D
          0 TRLR`;

        let options = `
         Definition:
         - Tag: NOTE
           CollectAs: Notes
           CollectAsArray: true
           Property: Value
         `;

        expect(ParseText(testData, options).Object).to.deep.equal({
          Notes: [
            {
              Value: 'A,B,C,D',
            },
          ],
        });
      });

      it('Property with own type', () => {
        let testData = `
         0 NOTE A,B,C,D
         0 TRLR`;

        let options = `
          Definition:
          - Tag: NOTE
            CollectAs: Notes
            Property: 
              Name: Value
              Type: Array
          `;

        expect(ParseText(testData, options).Object).to.deep.equal({
          Notes: {
            Value: ['A', 'B', 'C', 'D'],
          },
        });
      });

      it('Property with own type custom delimiter', () => {
        let testData = `
         0 NOTE A#B#C,D
         0 TRLR`;

        let options = `
          Definition:
          - Tag: NOTE
            CollectAs: Notes
            Property: 
              Name: Value
              ConvertTo:
                Type: Array
                Delimiter: "#"
          `;

        expect(ParseText(testData, options).Object).to.deep.equal({
          Notes: {
            Value: ['A', 'B', 'C,D'],
          },
        });
      });

      it('Combine main property type with property with own type', () => {
        let testData = `
         0 NOTE A,B,C,D
         0 TRLR`;

        let options = `
          Definition:
          - Tag: NOTE
            CollectAs: Notes
            CollectAsArray: true
            Type: Array
            Property: 
              Name: Value
              Type: Array
          `;

        expect(ParseText(testData, options).Object).to.deep.equal({
          Notes: [
            {
              Value: ['A', 'B', 'C', 'D'],
            },
          ],
        });
      });
    });
  });

  describe('String', () => {
    it('Simple', () => {
      let testData = `
            0 @N00010@ NOTE
            1 CONC 1
            1 CONT
            1 CONT A
            1 CONT B
            1 CONT C
            1 CONT
            1 CONT ...
            0 TRLR`;

      let options = `
            Definition:
            - Tag: NOTE
              CollectAs: Notes
              Properties:
              - Tag: CONC
                Property: Text   
                Type: String 
              - Tag: CONT
                Property: Text
                Type: String
            `;

      expect(ParseText(testData, options).Object).to.deep.equal({
        Notes: {
          Text: `1ABC...`,
        },
      });
    });

    it('With newline', () => {
      let testData = `
            0 @N00010@ NOTE
            1 CONC 1
            1 CONT
            1 CONT A
            1 CONT B
            1 CONT C
            1 CONT
            1 CONT ...
            0 TRLR`;

      let options = `
            Definition:
            - Tag: NOTE
              CollectAs: Notes
              Properties:
              - Tag: CONC
                Property: Text   
                Type: String 
              - Tag: CONT
                Property: Text
                ConvertTo:
                  Type: String
                  NewLineIfEmpty: true
            `;

      expect(ParseText(testData, options).Object).to.deep.equal({
        Notes: {
          Text: `1\nABC\n...`,
        },
      });
    });

    it('With newline character', () => {
      let testData = `
            0 @N00010@ NOTE
            1 CONC 1
            1 CONT
            1 CONT A
            1 CONT B
            1 CONT C
            1 CONT
            1 CONT ...
            0 TRLR`;

      let options = `
            Definition:
            - Tag: NOTE
              CollectAs: Notes
              Properties:
              - Tag: CONC
                Property: Text   
                Type: String 
              - Tag: CONT
                Property: Text
                ConvertTo:
                  Type: String
                  NewLineIfEmpty: true
                  NewLineCharacter: " | "
            `;

      expect(ParseText(testData, options).Object).to.deep.equal({
        Notes: {
          Text: `1 | ABC | ...`,
        },
      });
    });

    it('With empty newline character', () => {
      let testData = `
            0 @N00010@ NOTE
            1 CONC 1
            1 CONT
            1 CONT A
            1 CONT B
            1 CONT C
            1 CONT
            1 CONT ...
            0 TRLR`;

      let options = `
            Definition:
            - Tag: NOTE
              CollectAs: Notes
              Properties:
              - Tag: CONC
                Property: Text   
                Type: String 
              - Tag: CONT
                Property: Text
                ConvertTo:
                  Type: String
                  NewLineIfEmpty: true
                  NewLineCharacter: ""
            `;

      expect(ParseText(testData, options).Object).to.deep.equal({
        Notes: {
          Text: `1ABC...`,
        },
      });
    });

    it('Multiproperty', () => {
      let testData = `
            0 @N00010@ NOTE
            1 EVEN abcde
            2 CONC .com
            2 TYPE Source
            0 TRLR`;

      let options = `
            Definition:
            - Tag: NOTE
              CollectAs: Notes
              Properties:
              - Tag: EVEN
                CollectAs: Events
                Property: Name
                Properties:
                - Tag: CONC
                  Property: Name
                  Type: String
                - Tag: TYPE
                  Property: Type
            `;

      expect(ParseText(testData, options).Object).to.deep.equal({
        Notes: {
          Events: {
            Name: 'abcde.com',
            Type: 'Source',
          },
        },
      });
    });
  });

  describe('Date and Time', () => {
    // Parse date tests in ParseDate.tests.ts
    it('Convert to Date Format', () => {
      let options = `
          Definition:
            - Tag: DATES
              Properties:
                - Tag: DATE
                  Property: Date
                  ConvertTo: 
                    Type: Date
          `;

      let testData = `
            0 @1@ DATES
            1 DATE FROM 4 FEB 1980 TO 4 JUN 1999
            0 TRLR`;

      expect(ParseText(testData, options).Object).to.deep.equal({
        Date: {
          From: {
            Value: new Date(1980, 1, 4, 0, 0, 0),
            HasYear: true,
            HasMonth: true,
            HasDay: true,
          },
          To: {
            Value: new Date(1999, 5, 4, 0, 0, 0),
            HasYear: true,
            HasMonth: true,
            HasDay: true,
          },
          Original: 'FROM 4 FEB 1980 TO 4 JUN 1999',
        },
      });
    });

    it('Convert to Date Format (different naming)', () => {
      let options = `
          Definition:
            - Tag: DATES
              Properties:
                - Tag: DATE
                  Property: Date
                  ConvertTo: 
                    Type: Date
                    From: Start
                    To: End
                    Original: Initial
                    Value: JSDate
          `;

      let testData = `
            0 @1@ DATES
            1 DATE FROM 4 FEB 1980 TO 4 JUN 1999
            0 TRLR`;

      expect(ParseText(testData, options).Object).to.deep.equal({
        Date: {
          Start: {
            JSDate: new Date(1980, 1, 4, 0, 0, 0),
            HasYear: true,
            HasMonth: true,
            HasDay: true,
          },
          End: {
            JSDate: new Date(1999, 5, 4, 0, 0, 0),
            HasYear: true,
            HasMonth: true,
            HasDay: true,
          },
          Initial: 'FROM 4 FEB 1980 TO 4 JUN 1999',
        },
      });
    });

    it('Type without Options', () => {
      let options = `
          Definition:
            - Tag: DATES
              Properties:
                - Tag: DATE
                  Property: Date
                  Type: Date

          `;

      let testData = `
            0 @1@ DATES
            1 DATE 4 JUN 1999
            0 TRLR`;

      expect(ParseText(testData, options).Object).to.deep.equal({
        Date: {
          Value: new Date(1999, 5, 4, 0, 0, 0),
          HasYear: true,
          HasMonth: true,
          HasDay: true,
          Original: '4 JUN 1999',
        },
      });
    });

    it('With time', () => {
      let options = `
          Definition:
            - Tag: DATES
              Properties:
                - Tag: DATE
                  Property: Date
                  Type: Date
                  Properties:
                    - Tag: TIME
                      Property: Time
                      Type: Time
          `;

      let testData = `
            0 @1@ DATES
            1 DATE 4 JUN 1999
            2 TIME 14:35:22
            0 TRLR`;

      expect(ParseText(testData, options).Object).to.deep.equal({
        Date: {
          Value: new Date(1999, 5, 4, 14, 35, 22),
          HasYear: true,
          HasMonth: true,
          HasDay: true,
          Original: '4 JUN 1999',
          Time: '14:35:22',
        },
      });
    });

    it('With time via convertTo', () => {
      let options = `
          Definition:
            - Tag: DATES
              Properties:
                - Tag: DATE
                  Property: Date
                  Type: Date
                  Properties:
                    - Tag: TIME
                      Property: Time
                      ConvertTo:
                        Type: Time
          `;

      let testData = `
            0 @1@ DATES
            1 DATE 4 JUN 1999
            2 TIME 14:35:22
            0 TRLR`;

      expect(ParseText(testData, options).Object).to.deep.equal({
        Date: {
          Value: new Date(1999, 5, 4, 14, 35, 22),
          HasYear: true,
          HasMonth: true,
          HasDay: true,
          Original: '4 JUN 1999',
          Time: '14:35:22',
        },
      });
    });

    it('With time but without merging to date', () => {
      let options = `
          Definition:
            - Tag: DATES
              Properties:
                - Tag: DATE
                  Property: Date
                  Type: Date
                  Properties:
                    - Tag: TIME
                      Property: Time
          `;

      let testData = `
            0 @1@ DATES
            1 DATE 4 JUN 1999
            2 TIME 14:35:22
            0 TRLR`;

      expect(ParseText(testData, options).Object).to.deep.equal({
        Date: {
          Value: new Date(1999, 5, 4, 0, 0, 0),
          HasYear: true,
          HasMonth: true,
          HasDay: true,
          Original: '4 JUN 1999',
          Time: '14:35:22',
        },
      });
    });

    it('Time without date', () => {
      let options = `
          Definition:
            - Tag: DATES
              Properties:
                - Tag: TIME
                  Property: Time
          `;

      let testData = `
            0 @1@ DATES
            1 TIME 14:35:22
            0 TRLR`;

      expect(ParseText(testData, options).Object).to.deep.equal({
        Time: '14:35:22',
      });
    });

    it('Multiple dates with time', () => {
      let options = `
          Definition:
            - Tag: DATES
              Properties:
                - Tag: DATE
                  Property: Dates
                  Type: Date
                  Properties:
                    - Tag: TIME
                      Type: Time
          `;

      let testData = `
            0 @1@ DATES
            1 DATE 4 JUN 1999
            2 TIME 14:35:22
            1 DATE 4 JAN 1999
            2 TIME 16:22
            0 TRLR`;

      expect(ParseText(testData, options).Object).to.deep.equal({
        Dates: [
          {
            Value: new Date(1999, 5, 4, 14, 35, 22),
            HasYear: true,
            HasMonth: true,
            HasDay: true,
            Original: '4 JUN 1999 14:35:22',
          },
          {
            Value: new Date(1999, 0, 4, 16, 22, 0),
            HasYear: true,
            HasMonth: true,
            HasDay: true,
            Original: '4 JAN 1999 16:22',
          },
        ],
      });
    });
  });
});
