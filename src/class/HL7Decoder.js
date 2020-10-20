import simpleHL7 from 'simple-hl7'

export default class HL7Decoder {

  constructor(message, config, options) {
    const hl7Parser = new simpleHL7.Parser()
    message = hl7Parser.parse(message)
    this._message = message
    this._config = config
    this._options = options
  }

  /**
   * @description Convert from config mapping file hl7 to object
   * @return {{}}
   */
  process() {
    let obj = {}
    for (let segment in this._config.mapping) {
      this._processSegment(obj, segment);
    }
    return obj
  }

  /**
   * @param {string} type 
   * @returns {}
   */
  getSegmentsByType(type) {
    return this._message.segments.filter((item) => {
      return item.name === type
    })
  }

  /**
   * @param {object} obj 
   * @param {string} segment 
   * @private
   */
  _processSegment(obj, segment) {
    let segmentType = segment.toUpperCase()
    let segmentsOfType = (segmentType === 'MSH')
      ? [this._message.header]
      : this.getSegmentsByType(segment.toUpperCase())
    obj[segment] = []
    for (let segmentOfType of segmentsOfType) {
      this._processSegmentOfType(obj, segment, segmentOfType, segmentsOfType);
    }
  }

  /**
   * @param {object} obj 
   * @param {string} segment 
   * @param {any} segmentOfType 
   * @param {string} segmentsOfType 
   * @private
   */
  _processSegmentOfType(obj, segment, segmentOfType, segmentsOfType) {
    let tmpObj = {}
    for (let value of this._config.mapping[segment].values) {
      if (value.field && segmentOfType instanceof Object) {
        let index1 = value.component[0]
        let index2 = value.component[1]
        if (segmentOfType.getField(index1).includes('~')) {
          let split = segmentOfType.getField(index1).split('~')
          let array = []
          for (let v of split) {
            array.push(v.split('^'))
          }
          let output = []
          for (let v in array) {
            (array[v][value.component[1] - 1]) ? output.push(array[v][value.component[1] - 1]) : output.push('')
          }
          if (!this._shouldSkipEntry(value)) {
            this._generateObject(tmpObj, value.field, output)
          }
        } else {
          if (!this._shouldSkipEntry(value)) {
            this._generateObject(tmpObj, value.field, segmentOfType.getComponent(index1, index2))
          }
        }
      }
    }
    if (segmentsOfType.length > 1) {
      obj[segment].push(tmpObj[segment])
    } else {
      obj[segment] = tmpObj[segment]
    }
  }

  /**
   * @description Add attribute(s) into existing object
   * @param obj
   * @param property
   * @param value
   * @private
   */
  _generateObject(obj, property, value) {
    let paths = property.split('.')
    let i = 0
    let tmp = obj
    for (; i < paths.length - 1; i++) {
      tmp = (tmp[paths[i]]) ? Object.assign(tmp[paths[i]], tmp[paths[i]]) : tmp[paths[i]] = {}
    }
    tmp[paths[i]] = value
  }

  /**
   * @param {param} value 
   * @returns {boolean}
   * @private
   */
  _shouldSkipEntry(value) {
    if (this._options.skip_empty_entries === true && !value) {
      return true;
    } else {
      return false;
    }
  }

}
