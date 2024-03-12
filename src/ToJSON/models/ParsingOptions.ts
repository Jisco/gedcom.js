export default class ParsingOptions {
  private text?: string;
  private filePath?: string;
  private config?: string;
  private conversionOptions?: string;
  private progressFunction?: (linesCount: number, actualLine: number) => void;

  SetText(text: string) {
    this.text = text;
  }

  SetFilePath(path: string) {
    this.filePath = path;
  }

  SetConfigFile(path: string) {
    this.config = require('fs').readFileSync(path, 'utf8');
  }

  SetConfig(config: string) {
    this.config = config;
  }

  SetConversionOptionsFile(path: string) {
    this.conversionOptions = require('fs').readFileSync(path, 'utf8');
  }

  SetConversionOptions(config: string) {
    this.conversionOptions = config;
  }

  GetText() {
    return this.text;
  }

  GetFilePath() {
    return this.filePath;
  }

  GetConfig() {
    return this.config ?? require('fs').readFileSync('options/version551.yaml', 'utf8');
  }

  GetConversionOptions() {
    return this.conversionOptions ?? require('fs').readFileSync('options/conversion.yaml', 'utf8');
  }

  SetProgressFunction(func: (linesCount: number, actualLine: number) => void) {
    this.progressFunction = func;
  }

  GetProgressFunction(): ((linesCount: number, actualLine: number) => void) | undefined {
    return this.progressFunction;
  }
}
