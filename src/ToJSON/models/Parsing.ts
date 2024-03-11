import { ParseFile, ParseText } from '../parsing/parsing';
import ParsingOptions from './ParsingOptions';
import ParsingResult from './ParsingResult';

export default class Parsing {
  constructor(parsingOptions?: ParsingOptions) {
    this.options = parsingOptions ?? new ParsingOptions();
  }

  private options: ParsingOptions;

  SaveAs(result: Object, path: string) {
    require('fs').writeFileSync(path, JSON.stringify(result, null, 1));
  }

  ParseText(): ParsingResult {
    if (!this.options.GetText()) {
      return new ParsingResult({});
    }

    return ParseText(
      this.options.GetText(),
      this.options.GetConfig(),
      this.options.GetProgressFunction(),
      this.options.GetConversionOptions()
    );
  }

  ParseTextAsync(): Promise<ParsingResult> {
    if (!this.options.GetText()) {
      return new Promise<ParsingResult>((resolve, reject) => {
        reject('No text definied');
      });
    }

    return new Promise<ParsingResult>((resolve, reject) => {
      resolve(
        ParseText(this.options.GetText(), this.options.GetConfig(), this.options.GetProgressFunction(), this.options.GetConversionOptions())
      );
    });
  }

  ParseFile(doneCallback: (result: ParsingResult) => void, errorCallback: Function) {
    let filePath = this.options.GetFilePath();
    if (!filePath) {
      return;
    }

    ParseFile(
      filePath,
      this.options.GetConfig(),
      doneCallback,
      errorCallback,
      this.options.GetProgressFunction(),
      this.options.GetConversionOptions()
    );
  }

  ParseFileAsync(): Promise<ParsingResult> {
    if (!this.options.GetFilePath()) {
      return new Promise<ParsingResult>((resolve, reject) => {
        reject('No file path definied');
      });
    }

    return new Promise<ParsingResult>((resolve, reject) => {
      this.ParseFile(
        (r) => resolve(r),
        /* istanbul ignore next */
        (e: any) => reject(e)
      );
    });
  }
}
