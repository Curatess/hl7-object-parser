import HL7Decoder from './HL7Decoder'

export default class Decoder {

  constructor(message, config, options) {
    this._message = message
    this._config = config
    this._options = this.generateOptions(options)
    this._decoder = new HL7Decoder(this._message, this._config, this._options)
  }

  /**
   * @description Call process method from dynamic class
   * @return {*}
   */
  decode() {
    return this._decoder.process()
  }

  /**
   * @param {object} options 
   * @return {object}
   */
  generateOptions(options) {
    const defaultOptions = {
      skip_empty_entries: false,
    }
    return {
      ...defaultOptions,
      ...options,
    }
  }
}
