import HL7Decoder from './HL7Decoder'

export default class Decoder {

  constructor(message, config) {
    this._message = message
    this._config = config
    this._decoder = new HL7Decoder(this._message, this._config)
  }

  /**
   * @description Call process method from dynamic class
   * @return {*}
   */
  decode() {
    return this._decoder.process()
  }
}
