import Decoder from '../class'

/**
 * @description Decode message from configuration
 * @param message
 * @param config
 * @param options
 * @returns {*}
 */
export function decode(message, config, options) {
    const decoder = new Decoder(message, config, options)
    return decoder.decode()
}
