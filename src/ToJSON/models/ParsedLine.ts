/**
 * Class with informations about the parsed line
 */
export default class ParsedLine {
  /**
   * @param lineNumber line number
   * @param level level in hierarchy
   * @param tag line tag
   * @param value value = line text without level and tag\reference id
   * @param refId reference id
   * @param noValue flag to show that a placeholder has been set for the Value
   */
  constructor(lineNumber: number, level: number, tag: string, value: string = '', refId: string = '', noValue: boolean = false) {
    this.LineNumber = lineNumber;
    this.Level = level;
    this.Tag = tag;
    this.Value = value;
    this.ReferenceId = refId;
    this.NoValue = noValue;
  }

  /**
   * The reference id of the line when defined
   */
  ReferenceId: string;
  /**
   * The line number
   */
  LineNumber: number;
  /**
   * The line level
   */
  Level: number;
  /**
   * The line tag
   */
  Tag: string;
  /**
   * The line value if defined
   */
  Value: string | undefined;
  /**
   * Does the Value property contain the placeholder for a missing value that should be removed?
   */
  NoValue: boolean;
}
