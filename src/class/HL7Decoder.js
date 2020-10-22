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
    const segmentsOfType = (segment.toUpperCase() === 'MSH')
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
    const tmpObj = {}
    for (let value of this._config.mapping[segment].values) {
      if (value.field && segmentOfType instanceof Object) {
        const index1 = value.component[0]
        const index2 = value.component[1]
        if (segmentOfType.getField(index1).includes('~')) {
          let split = segmentOfType.getField(index1).split('~')
          let array = []
          for (let v of split) {
            array.push(v.split('^'))
          }
          const output = []
          for (let v in array) {
            (array[v][value.component[1] - 1]) ? output.push(array[v][value.component[1] - 1]) : output.push('')
          }
          this._generateObject(tmpObj, value.field, output, value.table)
        } else {
          this._generateObject(tmpObj, value.field, segmentOfType.getComponent(index1, index2), value.table)
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
   * @param {object} obj
   * @param {string} property
   * @param {any} value
   * @param {string} table
   * @private
   */
  _generateObject(obj, property, value, table) {
    if (!this._shouldSkipEntry(value)) {
      const paths = property.split('.')
      let i = 0
      let tmp = obj
      for (; i < paths.length - 1; i++) {
        tmp = (tmp[paths[i]]) ? Object.assign(tmp[paths[i]], tmp[paths[i]]) : tmp[paths[i]] = {}
      }
      tmp[paths[i]] = value
      const resolvedTableIdentifier = this._resolveTableIdentifer(table, value)
      if (resolvedTableIdentifier) {
        tmp[`${paths[i]}Resolved`] = resolvedTableIdentifier
      }
    }
  }

  /**
   * @param {string} table 
   * @param {any} value 
   * @returns {any}
   */
  _resolveTableIdentifer(table, value) {
    if (
      table &&
      this._options.identifier_table && 
      this._options.identifier_table.mapping && 
      this._options.identifier_table.mapping[table] &&
      this._options.identifier_table.mapping[table][value]
    ) {
      return this._options.identifier_table.mapping[table][value];
    } else {
      return null;
    }
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
