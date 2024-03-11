# gedcom.json

<!-- [![Build Status](https://travis-ci.com/Jisco/gedcom.json.png?branch=master)](https://travis-ci.com/Jisco/gedcom.json) -->

[![codecov](https://codecov.io/gh/Jisco/gedcom.json/branch/master/graph/badge.svg?token=MQ5CNQYFPU)](https://codecov.io/gh/Jisco/gedcom.json) [![Known Vulnerabilities](https://snyk.io/test/github/Jisco/gedcom.json/badge.svg?targetFile=package.json)](https://snyk.io/test/github/Jisco/gedcom.json?targetFile=package.json)

Live example: [CodeSandbox](https://codesandbox.io/s/blissful-elbakyan-tofq8?file=/index.html)

## Description

This package can be used to parse a file or a string from gedcom format to an object. The object can be used for further data processing or just to create an JSON file.

:warning: **Conversion from JSON or JS to GEDCOM is currently under development** :warning:

A [predefined yaml configuration file](/options/version551.yaml) ([GEDCOM Version 5.5.1](https://edge.fscdn.org/assets/img/documents/ged551-5bac5e57fe88dd37df0e153d9c515335.pdf)) is already included for parsing the data. This is based on the original long name of the gedcom tags and should reflect the structure as best as possible. It's used by default if no other configuration is given.

So this file can be used as a template if the target object should look different.

## Why

This is just a side project to import (and later export) GEDCOM files to another project of myself [Visual Family Tree](https://github.com/Jisco/VisualFamilyTree).

I am aware that there are already several parsers for the gedcom format. However, I have found few that parse directly into an javascript object and if so, then you have to parse\search this object in order to be able to use it for your own purpose. I want to avoid this parsing and searching by parsing directly to the target format.

**Through this own definition of how the parsing should be done, it is possible to process files or lines that differ from the original GEDCOM format.**

:file_folder: There are 6 example gedcom files available which i found on the internet. I used this files to test against. All files can be found in the ["examples"](/examples) subfolder. Next to the gedcom files are the converted json files, which were created with this package.

## How-To

### Use

##### Via commandline

Just run npx ts-node src/console.ts with the wanted flags. Eg if you run "npm run demo:JSON" it will execute "ts-node src/console.ts --path 'examples/simpsons.get'" and will print out the Simpsons GEDCOM example file as JSON object in the console. With "npm run demoFile:JSON" it will do the same but prints the JSON object in a 'test.json' file.

| Flag                            | Description                                                                                  |
| ------------------------------- | -------------------------------------------------------------------------------------------- |
| --onlyStats                     | Only print the parsing statistcs to the console                                              |
| --opt _xxx.yaml_                | Set the path to the yaml [definition file](#create-your-own-defintion-file)                  |
| --conversion-options _xxx.yaml_ | Set the path to the yaml [conversion options file](#create-your-own-conversion-options-file) |
| --out _xxx.json_                | File path to print into                                                                      |
| --path _xxx.ged_                | Set the path to the GEDCOM file                                                              |
| --silent                        | Don't print anything to the console                                                          |
| --showProgress                  | Print the progress during processing the file                                                |

##### Via Node or JS

In your js\ts file you can import the parsing file via

```typescript
import { JsonParsing, ParsingOptions } from 'gedcom.json';
```

Create an new parsing options object.

```typescript
let parsingOptions = new ParsingOptions();
```

Then you have to set the path to the gedcom and the config file respectively the gedcom content and the config as string.

File content:

```typescript
parsingOptions.SetFilePath('examples/simpsons.ged');
parsingOptions.SetConfigFile('options/version551.yaml'); // optional! uses options/version551.yaml by default
```

String content:

```typescript
parsingOptions.SetText(`
0 HEAD
...
0TRLR
`);
parsingOptions.SetConfig(`
Definition:
...
`);
```

Create an new parsing object.

```typescript
let parse = new JsonParsing(parsingOptions);
```

To get the result there two methods for parsing of file or string content. One sync with callbacks and one that returns an promise.

File content:

```typescript
// async
parse.ParseFileAsync().then(result => { ... }).catch(e => {...});
// callbacks because the file is parsed line by line
parse.ParseFile(result => {...}, error => {...});
```

String content

```typescript
// async
parse.ParseTextAsync().then(result => { ... }).catch(e => {...});
// sync
parse.ParseText(); // returns also the result object
```

The **result** object has two properties: 'Object' and 'Statistics'.

The **Object** property contains the javascript object. This can be used **directly **or printed to file via

```typescript
parse.SaveAs(result.Object, 'test.json');
```

**Statistics**

| Property                            | Description                                                                                                |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| LinesCount                          | Count of all lines                                                                                         |
| ParsedLinesCount                    | Count of all lines that has been parsed                                                                    |
| NotParsedLinesCount                 | Count of all lines that has _NOT_ been parsed                                                              |
| NotParsedLinesList                  | List of all line numbers of not parsed lines                                                               |
| NotParsedLinesWithoutGEDCOMTagCount | Count of all lines that has _NOT_ been parsed because their tag is not defined in the yaml definition file |
| IncorrectLinesCount                 | Count of all incorrect lines (no tag, too long etc pp)                                                     |
| IncorrectLines                      | Array of object from incorrect lines. Properties: _LineNumber_, _Line_ and _Text_                          |

### Create your own conversion options file

#### Structure

The conversion options file starts with an **Options** property. Options available are:

```yaml
Options:
  - IgnoreMaxLineLength: true
```

This will allow lines longer that 250 characters. Normally, these would fail a validation check.

### Create your own defintion file

#### Structure

The configuration file has to begin with the **Definition** Property. Followed by multiple [**Tag**](#tag) definitions. Each Tag can have different properties including further Tags. It's possible to do a flat Tags definition list, or to do specific defintions of each Tag beneath another Tag. :laughing:

When a line with a specific tag is parsed the parser searches the matching _Tag_ defintion.

```
NAME Test /Name/
```

will search a for an matching _Tag_ defintion in the yaml definition

```yaml
- Tag: NAME
  Property: Name
```

The search will always been executed in the given context of the gedcom file.

Example:

```
0 @Abraham_Simpson@ INDI
1 NAME Abraham /Simpson/
```

Will first look for an defintion of the _NAME_ Tag beneath the _INDI_ Tag.

```yaml
- Tag: INDI
  ...
  Properties:
  - Tag: NAME
    Property: Fullname
```

If this is not defined the search continues be going higher in the defintion until it ends by the '_global_' defintion for the _NAME_ Tag.

```yaml
- Tag: NAME
  Property: Name
```

In this way it is possible to parse the _NAME_ Tag by default with a property name _Name_ but beneath the _INDI_ object it will be parsed as _Fullname_ property.

#### Tag definition

The most simple defintion of an _Tag_ looks like the following

```yaml
- Tag: NAME # Tag name matching the tag in the gedcom file
  Property: Name # Name of the target property
```

Example:

| GEDCOM Line              | JS Property               |
| ------------------------ | ------------------------- |
| 1 NAME Abraham /Simpson/ | Name: "Abraham /Simpson/" |

But mostly there is no single value (eg property) defined in the gedcom files, the common case is an object in an array of objects

This will be done via the _CollectAs_ property.

```yaml
- Tag: INDI # Tag name mathing the tag in the gedcom file
  CollectAs: Individuals # Name of the target collection property
- Tag: NAME # Tag name matching the tag in the gedcom file
  Property: Name # Name of the target property
```

Example:

| GEDCOM Lines (order matters) | JS Result                                                                      |
| ---------------------------- | ------------------------------------------------------------------------------ |
| 0 @Abraham_Simpson@ INDI     | <pre>{<br /> Individuals: []<br />}</pre>                                      |
| 1 NAME Abraham /Simpson/     | <pre>{<br /> Individuals: [<br/> Name: "Abraham /Simpson/"<br/> ]<br />}</pre> |

Extended example of the _INDI_ Tag (all properties will be explained below the example:

YAML Definition:

```yaml
- Tag: INDI
  CollectAs: Individuals
  CollectAsArray: true
  Property: Id
  Properties:
    - Tag: NAME
      Property: Fullname
      Properties:
        - Tag: GIVN
          Property: Givenname
          MergeWithLast: INDI
        - Tag: SURN
          Property: Surname
          MergeWithLast: INDI
```

GEDCOM Lines

```
0 @Abraham_Simpson@ INDI
1 NAME Abraham /Simpson/
2 GIVN Abraham
2 SURN Simpson
```

Result

```javascript
{
  Individuals: [
    {
      Id: '@Abraham_Simpson@',
      Surname: 'Simpson',
      Givenname: 'Abraham',
      Fullname: 'Abraham /Simpson/',
    },
  ];
}
```

#### Tag Properties

##### CollectAs (String)

Name of the collection for all contained sub-objects. This can be interpretated as an object path if "." are included.

##### CollectAsArray (Boolean)

Default value is false.

If set to false or not set the collection is an object if only a single item is in the collection, and an array if more than one object is collect.

If set to true, the collection will be always an array.

Example:

YAML Config:

```yaml
- Tag: INDI
  CollectAs: Individuals
  Property: Id
```

GEDCOM Lines (only one object)

```
0 @Abraham_Simpson@ INDI
```

Result

```javascript
{
  Individuals: {
    Id: '@Abraham_Simpson@';
  }
}
```

GEDCOM Lines (two objects) with same config

```
0 @Abraham_Simpson@ INDI
0 @Homer_Simpson@ INDI
```

Result

```javascript
{
  Individuals: [
    {
      Id: '@Abraham_Simpson@',
    },
    {
      Id: '@Homer_Simpson@',
    },
  ];
}
```

Set CollectAsArray to true.

YAML Config:

```yaml
- Tag: INDI
  CollectAs: Individuals
  CollectAsArray: true
  Property: Id
```

GEDCOM Lines (only one object)

```
0 @Abraham_Simpson@ INDI
```

Result

```javascript
{
  Individuals: [
    {
      Id: '@Abraham_Simpson@',
    },
  ];
}
```

##### ConvertTo

Long form of [Type](#Type) property. Allows input of conversion options.

###### Array

Optional: Delimiter (default value is ',')

```yaml
Definition:
  - Tag: NOTE
    CollectAs: Notes
    Property:
      Name: Value
      ConvertTo:
        Type: Array
        Delimiter: '#'
```

```
0 NOTE A#B#C,D
```

Result:

```javascript
{
  Notes: {
    Value: ['A', 'B', 'C,D'];
  }
}
```

###### Date

A detailed explanaition of Date\Time conversions can be found [here.](#date-and-time-parsing)

Optional:

| Property    | Default value |
| ----------- | ------------- |
| About       | About         |
| And         | And           |
| After       | After         |
| Before      | Before        |
| Between     | Between       |
| Calculated  | Calculated    |
| Calendar    | Calendar      |
| Estimated   | Estimated     |
| From        | From          |
| HasDay      | HasDay        |
| HasMonth    | HasMonth      |
| HasYear     | HasYear       |
| Interpreted | Interpreted   |
| Original    | Original      |
| To          | To            |
| Value       | Value         |

Converts a GEDCOM Date String to a date. Because there a multiple variants possible, it will parse the date into an object with the date(s) as values an different flags. So no information will be lost.

```yaml
Definition:
  - Tag: DATES
    Properties:
      - Tag: DATE
        Property: Date
        ConvertTo:
          Type: Date
          From: Start # Property will be "Start" instead the default value "From"
          To: End # Property will be "End" instead the default value "To"
          Original: Initial # Property will be "Initial" instead the default value "Original"
          Value: JSDate # Property will be "JSDate" instead the default value "Value"
```

```
0 @1@ DATES
1 DATE FROM 4 FEB 1980 TO 4 JUN 1999
```

Result:

```javascript
{
  Date:
  {
    Start:
    {
      JSDate: new Date(1980, 1, 4, 0, 0 , 0),
      HasYear: true,
      HasMonth: true,
      HasDay: true
    },
    End: {
      JSDate: new Date(1999, 5, 4, 0, 0 , 0),
      HasYear: true,
      HasMonth: true,
      HasDay: true
    },
    Initial: "FROM 4 FEB 1980 TO 4 JUN 1999",
  }
}
```

###### String

Optional:

| Property         | Default value | Description                                                 |
| ---------------- | ------------- | ----------------------------------------------------------- |
| NewLineCharacter | \n            | Defines the new line character                              |
| NewLineIfEmpty   | false         | Defines if a new line is added if the object value is empty |

```yaml
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
          NewLineIfEmpty: true # all empty CONT values will add a new line
          NewLineCharacter: ' | ' # value of new line
```

```
0 @N00010@ NOTE
1 CONC 1
1 CONT
1 CONT A
1 CONT B
1 CONT C
1 CONT
1 CONT ...
```

Result:

```javascript
{
  Notes: {
    Text: `1 | ABC | ...`;
  }
}
```

###### Time

A detailed explanaition of Date\Time conversions can be found [here.](#date-and-time-parsing)

Works only in combination with a previous defined explicit date eg **1 JAN 1999**. Will add the time to the date

```yaml
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
```

```
0 @1@ DATES
1 DATE 4 JUN 1999
2 TIME 14:35:22
```

Result:

```javascript
{
  Date:
  {
    Value: new Date(1999, 5, 4, 14, 35 , 22),	// Value is date and time combined
    HasYear: true,
    HasMonth: true,
    HasDay: true,
    Original: "4 JUN 1999",
    Time: "14:35:22"  // is own property because of TIME has a property defined
  }
}
```

Time has no own property

```yaml
Definition:
  - Tag: DATES
    Properties:
      - Tag: DATE
        Property: Date
        Type: Date
        Properties:
          - Tag: TIME
            ConvertTo:
              Type: Time
```

Result:

```javascript
{
Date:
  {
    Value: new Date(1999, 5, 4, 14, 35 , 22),	// Value is date and time combined
    HasYear: true,
    HasMonth: true,
    HasDay: true,
    Original: "4 JUN 1999 14:35:22"	// date and time combined, because the original time value will else be lost
  }
}
```

##### IsSingleValue (Boolean)

Normally if a property value is found twice or more it will be converted to an array of values. With _IsSingleValue_ it is possible to force the last found value to win.

```yaml
Definition:
  - Tag: NOTE
    Property: Note
```

```
0 NOTE Note1
0 NOTE Note2
```

Result:

```javascript
{
  Note: ['Note1', 'Note2'];
}
```

Set IsSingleValue to be 'true';

```yaml
Definition:
  - Tag: NOTE
    Property: Note
    IsSingleValue: true
```

Result (last value wins):

```javascript
{
  Note: 'Note2';
}
```

######

##### MergeWithNext (String)

It's possible to merge a value with the next object with the given Tag. If no next Tag will be found, the value will be ignored.

Example:

```yaml
Definition:
  - Tag: A
    CollectAs: A
  - Tag: B
    Property: Value_B
  - Tag: C
    Property: Value_C
  - Tag: D
    Property: Value_D
    MergeWithNext: B # merge result with next Tag B
```

```
0 A
1 D Value_Of_D
1 C Value_Of_C
1 B Value_Of_B
```

Result:

```javascript
{
  A: [
    // parsed Tag C
    {
      Value_C: 'Value_Of_C',
    },
    // parsed Tag B merged with Tag D
    {
      Value_B: 'Value_Of_B',
      Value_D: 'Value_Of_D',
    },
  ];
}
```

##### MergeWithLast (String OR Boolean)

Same as [MergeWithNext](#mergewithnext) but in the reversed direction. Can be an string to define a specific Tag or 'true' to merge with the last defined object before this object.

Example (String)

```yaml
Definition:
  - Tag: A
    CollectAs: A
  - Tag: B
    Property: Value_B
  - Tag: C
    Property: Value_C
  - Tag: D
    Property: Value_D
    MergeWithLast: B # merge result with last Tag B
```

```
0 A
1 B Value_Of_B
1 D Value_Of_D
1 C Value_Of_C
```

Result:

```javascript
{
  A: [
    // parsed Tag B merged with Tag D
    {
      Value_B: 'Value_Of_B',
      Value_D: 'Value_Of_D',
    },
    // parsed Tag C
    {
      Value_C: 'Value_Of_C',
    },
  ];
}
```

Example (Boolean)

```yaml
Definition:
  - Tag: NOTE
    Property: Id
    CollectAs: Notes
  - Tag: CONC
    MergeWithLast: true
  - Tag: CONT
    MergeWithLast: true
```

```
0 @N00010@ NOTE
1 CONC [RCKarnes.ged]
1 CONT
1 CONT In Norse mythology, the god Bor, or Borr was the father of Odin, Ve an
1 CONC d Vili by the frost giantess Bestla.  Bor was the son of the giant Buri.
1 CONT
1 CONT ...
```

Result:

```javascript
{
  Notes: {
    Id: "@N00010@",
    Text: [RCKarnes.ged]In Norse mythology, the god Bor, or Borr was the father of Odin, Ve and Vili by the frost giantess Bestla.  Bor was the son of the giant Buri....
  }
}
```

:warning: Because the object has no last property (_CONC_ has no defined property) there will be created on property with the name _Text_.

Example (Boolean) WITH defined parent property

```yaml
Definition:
  - Tag: NOTE
    Property: Id
    CollectAs: Notes
  - Tag: EVEN
    CollectAs: Events
    Property: Name
  - Tag: CONC
    MergeWithLast: true
```

```
0 @N00010@ NOTE
1 EVEN RCKarnes-RootsWeb & John D Newport-Ancestry.com (johndnewport@valornet
2 CONC .com)
```

Result:

```javascript
{
  Notes:
  {
    Id: "@N00010@",
    Events:
    {
      Name: "RCKarnes-RootsWeb & John D Newport-Ancestry.com (johndnewport@valornet.com)",
    }
  }
}
```

##### Property (String)

Property Name in the object. This can be interpretated as an object path if "." are included.

```
0 @ID@ WHAT
0 TRLR
```

```yaml
Definition:
  - Tag: WHAT
    Property: Id
```

Result:

```js
{
  Id: 'ID';
}
```

Configuration with 'path':

```yaml
Definition:
  - Tag: WHAT
    Property: What.Id
```

Result:

```js
{
  What: {
    Id: 'ID';
  }
}
```

##### Properties (Object)

Defines that a Tag definition has specific definitions for following Tags.

```yaml
- Tag: INDI
  CollectAs: Individuals
  CollectAsArray: true
  Property: Id
  Properties: # specifies the NAME Tag
    - Tag: NAME
      Property: Fullname
      Properties: # specifies the GIVN and SURN Tag
        - Tag: GIVN
          Property: Givenname
          MergeWithLast: INDI
        - Tag: SURN
          Property: Surname
          MergeWithLast: INDI
```

##### Replace (Object)

Could be used to replace substring in the property value.

| Property | Description          |
| -------- | -------------------- |
| Value    | Text to replace      |
| With     | Text to replace with |

```yaml
Definition:
  - Tag: INDI
    CollectAs: Persons
    Properties:
      - Tag: RESI
        Properties:
          - Tag: EMAIL
            Property: EMail
            Replace:
              Value: '@@' # replace '@@'
              With: '@' # with a single '@'
```

```
0 @1@ INDI
1 RESI
2 EMAIL email@@test.com
1 RESI
2 EMAIL anotherEmail@@test.com
```

Result:

```javascript
{
  Persons: {
    EMail: ['email@test.com', 'anotherEmail@test.com'];
  }
}
```

##### StartWith (String)

Adds the given string at the beginning of the value.

```yaml
Definition:
  - Tag: INDI
    CollectAs: Persons
    Properties:
      - Tag: RESI
        Properties:
          - Tag: EMAIL
            Property: EMail
            StartWith: >- # needed in yaml because the string value 'mail:' end with ':'
              mail:		    # add 'mail:' at the beginning of each EMail value
```

```
0 @1@ INDI
1 RESI
2 EMAIL email@@test.com
1 RESI
2 EMAIL anotherEmail@@test.com
```

Result:

```javascript
{
  Persons: {
    EMail: ['mail:email@@test.com', 'mail:anotherEmail@@test.com'];
  }
}
```

##### StripHtml (Boolean)

Could be used to remove html from property values.

```yaml
Definition:
  - Tag: INDI
    CollectAs: Persons
    Properties:
      - Tag: NOTE
        Property: Note
        StripHtml: true
```

```
0 @1@ INDI
1 NOTE <p>Whatever</p>
```

Result:

```javascript
{
  Persons: {
    Note: 'Whatever';
  }
}
```

##### Tag

Reference to GEDCOM format. This activates parsing of this tag. If a tag that has not been defined occurs when a GEDCOM formatted line is run through, this and all subsequent subordinate lines are ignored.

Tags must be redefined for each property within the main tag. Any tag can be used and is not tied to a defined GEDCOM tag. :rocket: If you defined it the parser can parse it.

##### Type

Short version of [ConvertTo](#convertto) without options. The default values of the options will be used.

```yaml
- Tag: CONC
  Property: Text
  Type: String
- Tag: DATE
  Property: Date
  Type: Date
- Tag: NOTE
  Property: Time
  Type: Array
- Tag: TIME
  Property: Time
  Type: Time
```

#### Date and Time Parsing

Only done if the [Type](#type) or [ConvertTo](#convertTo) property is defined. All property names of the parsed object can be changed via configuration.

Is a single date is not explicit like **1 JAN 1999** it will be interpreted as a [**between**](#between) value. For example **JAN 1999** is a value between **1 JAN 1999** and **31 JAN 1999** and **1999** is a value between **1 JAN 1999** and **31 DEC 1999**.

Also other date formats are supported.

```yaml
@#DGREGORIAN@ 4 FEB 1980	# gregorian calendar -> standard
@#DJULIAN@ 22 JAN 1980		# julian calendar
@#DHEBREW@ 17 SHV 5740		# hebrew calendar
```

###### From-To

A date string that define a ranges of dates.

```
FROM 4 FEB 1980 TO 4 JUN 1999
```

```js
{
    From: {
        Value: new Date(1980, 1, 4, 0, 0 , 0),
        HasYear: true,
        HasMonth: true,
        HasDay: true
    },
    To: {
        Value: new Date(1999, 5, 4, 0, 0 , 0),
        HasYear: true,
        HasMonth: true,
        HasDay: true
    },
    Original: "FROM 4 FEB 1980 TO 4 JUN 1999"
}
```

###### Between

A date string that define a date between a range of dates. Actually the same as with "From-To" but the property names are different.

```
BETWEEN 4 FEB 1980 AND 4 JUN 1999
```

Result:

```js
{
    Between: {
        Value: new Date(1980, 1, 4, 0, 0 , 0),
        HasYear: true,
        HasMonth: true,
        HasDay: true
    },
    And: {
        Value: new Date(1999, 5, 4, 0, 0 , 0),
        HasYear: true,
        HasMonth: true,
        HasDay: true
    },
    Original: "BETWEEN 4 FEB 1980 AND 4 JUN 1999"
}
```

Dates like **JAN 1999** will also be converted to a between value. **JAN 1999** for example is between 01.01.1999 and 01.02.1999

###### Single Dates

A single date in the GEDCOM format looks like **20 JAN 1999**.

```
20 JAN 1999
```

```js
{
    Value: new Date(1999, 0, 20, 0, 0 , 0),
    HasYear: true,
    HasMonth: true,
    HasDay: true,
    Original: "20 JAN 1999"
}
```

There are different markings for dates. These are optional. For each a new property with the value 'true' is added.

| Marker | Description                                                                                                       | Example         |
| ------ | ----------------------------------------------------------------------------------------------------------------- | --------------- |
| EST    | Estimated based on an algorithm using some other event date                                                       | EST 20 JAN 1999 |
| ABT    | About, meaning the date is not exact.                                                                             | ABT 20 JAN 1999 |
| CAL    | Calculated mathematically, for example, from an event date and age.                                               | CAL 20 JAN 1999 |
| AFT    | Event happened after the given date.                                                                              | AFT 20 JAN 1999 |
| BEF    | Event happened before the given date.                                                                             | BEF 20 JAN 1999 |
| INT    | Interpreted from knowledge about the associated date phrase included in parentheses. Returns just the text value. | INT Sometime    |

Estimated example (but it's the same for ABT, CAL, AFT and BEF).

```
EST 20 JAN 1999
```

```js
{
    Value: new Date(1999, 0, 20, 0, 0 , 0),
    HasYear: true,
    HasMonth: true,
    HasDay: true,
    Original: "20 JAN 1999",
    Estimated: true
}
```

Interpreted example

```
INT At the end of 2020
```

```js
{
    Value: "At the end of 2020",
    Original: "INT At the end of 2020",
    Interpreted: true
}
```

###### Time

It is possible that a subordinate time is specified for a date. These can be summarized.

But **ONLY** when the date is explicit. Dates with only a year or a combination of month and year, don't work.
