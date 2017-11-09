function encode(data) {
  return Buffer.from(prepareUnicodeEncode(JSON.stringify(data))).toString(
    'base64'
  )
}
module.exports.encode = encode

function browserEncode(data) {
  return window.btoa(prepareUnicodeEncode(JSON.stringify(data)))
}
module.exports.browserEncode = browserEncode

function decode(data) {
  return JSON.parse(prepareUnicodeDecode(String(Buffer.from(data, 'base64'))))
}
module.exports.decode = decode

function browserDecode(data) {
  return JSON.parse(prepareUnicodeDecode(window.atob(data)))
}
module.exports.browserDecode = browserDecode

// ref: https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding#The_Unicode_Problem
// encode result to b64
function prepareUnicodeEncode(str) {
  return encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => {
    return String.fromCharCode(`0x${p1}`)
  })
}

// pass in already b64 decoded
function prepareUnicodeDecode(str) {
  return decodeURIComponent(
    str
      .split('')
      .map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      })
      .join('')
  )
}
