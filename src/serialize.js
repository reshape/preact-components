function encode (data) {
  return Buffer.from(JSON.stringify(data)).toString('base64')
}
module.exports.encode = encode

function browserEncode (data) {
  return window.btoa(JSON.stringify(data))
}
module.exports.browserEncode = browserEncode

function decode (data) {
  return JSON.parse(Buffer.from(data, 'base64'))
}
module.exports.decode = decode

function browserDecode (data) {
  return JSON.parse(window.atob(data))
}
module.exports.browserDecode = browserDecode
