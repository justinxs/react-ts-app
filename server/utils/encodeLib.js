import crypto from 'node:crypto';

export function randomKey(bytes, output) {
  return crypto.randomBytes(bytes).toString(output || 'base64');
}

export function md5(content) {
  return crypto.createHash('md5').update(content).digest('hex');
}

/**
 * OpenSSL 加密
 * @param {string} content 明文
 * @param {string} algorithm OpenSSL加密算法
 * @param {string|Buffer} key 加密key
 * @param {string|Buffer} iv 偏移量
 * @param {string} key_iv_encoding 当key和iv是字符串的编码(base64/hex/utf8/....)，是utf8时可不传
 * @param {string} input_encoding 明文的编码
 * @param {string} output_encoding 输出密文的编码
 *
 * AES 128bit(位) => 16byte(字节) <randomKey(16)> ECB 模式不加偏移量
 *  AES-128-CBC
 *  AES-128-CBC-HMAC-SHA1
 *  AES-128-CBC-HMAC-SHA256
 *  id-aes128-CCM
 *  AES-128-CFB
 *  AES-128-CFB1
 *  AES-128-CFB8
 *  AES-128-CTR
 *  AES-128-ECB
 *  id-aes128-GCM
 *  AES-128-OCB
 *  AES-128-OFB
 *  AES-128-XTS
 *  AES-192-CBC
 *  id-aes192-CCM
 *  AES-192-CFB
 *  AES-192-CFB1
 *  AES-192-CFB8
 *  AES-192-CTR
 *  AES-192-ECB
 *  id-aes192-GCM
 *  AES-192-OCB
 *  AES-192-OFB
 *  AES-256-CBC
 *  AES-256-CBC-HMAC-SHA1
 *  AES-256-CBC-HMAC-SHA256
 *  id-aes256-CCM
 *  AES-256-CFB
 *  AES-256-CFB1
 *  AES-256-CFB8
 *  AES-256-CTR
 *  AES-256-ECB
 *  id-aes256-GCM
 *  AES-256-OCB
 *  AES-256-OFB
 *  AES-256-XTS
 *  aes128 => AES-128-CBC
 *  aes128-wrap => id-aes128-wrap
 *  aes192 => AES-192-CBC
 *  aes192-wrap => id-aes192-wrap
 *  aes256 => AES-256-CBC
 *  aes256-wrap => id-aes256-wrap
 *
 * DES 64bit => 8byte <randomKey(8)> ECB 模式不加偏移量
 *  des => DES-CBC
 *  DES-CBC
 *  DES-CFB
 *  DES-CFB1
 *  DES-CFB8
 *  DES-ECB
 *  DES-EDE
 *  DES-EDE-CBC
 *  DES-EDE-CFB
 *  des-ede-ecb => DES-EDE
 *  DES-EDE-OFB
 *  DES-EDE3
 *  DES-EDE3-CBC
 *  DES-EDE3-CFB
 *  DES-EDE3-CFB1
 *  DES-EDE3-CFB8
 *  des-ede3-ecb => DES-EDE3
 *  DES-EDE3-OFB
 *  DES-OFB
 *  des3 => DES-EDE3-CBC
 *  des3-wrap => id-smime-alg-CMS3DESwrap
 *  desx => DESX-CBC
 *  DESX-CBC
 */
export function encrypt({
  content,
  algorithm,
  key,
  iv,
  key_iv_encoding,
  input_encoding = 'utf8',
  output_encoding = 'hex'
}) {
  if (key_iv_encoding) {
    key =
      !Buffer.isBuffer(key) && key ? Buffer.from(key, key_iv_encoding) : key;
    iv = !Buffer.isBuffer(iv) && iv ? Buffer.from(iv, key_iv_encoding) : iv;
  }
  const cipher = crypto.createCipheriv(algorithm, key, iv || null);
  let ciphertext = cipher.update(content, input_encoding, output_encoding);
  ciphertext += cipher.final(output_encoding);
  return ciphertext;
}

/**
 * OpenSSL 解密
 * @param {string} content 密文
 * @param {string} algorithm OpenSSL加密算法
 * @param {string|Buffer} key 加密key
 * @param {string|Buffer} iv 偏移量
 * @param {string} key_iv_encoding 当key和iv是字符串的编码(base64/hex/utf8/....)，是utf8时可不传
 * @param {string} input_encoding 密文的编码
 * @param {string} output_encoding 输出明文的编码
 *
 */
export function decrypt({
  content,
  algorithm,
  key,
  iv,
  key_iv_encoding,
  input_encoding = 'hex',
  output_encoding = 'utf8'
}) {
  if (key_iv_encoding) {
    key =
      !Buffer.isBuffer(key) && key ? Buffer.from(key, key_iv_encoding) : key;
    iv = !Buffer.isBuffer(iv) && iv ? Buffer.from(iv, key_iv_encoding) : iv;
  }
  const decipher = crypto.createDecipheriv(algorithm, key, iv || null);
  let deciphertext = decipher.update(content, input_encoding, output_encoding);
  deciphertext += decipher.final(output_encoding);
  return deciphertext;
}

/**
 * 拉流端获取登录token
 * @param appId 即构分配的appId
 * @param appSign 即构分配的appSign
 * @param userId 这里的userID需要和websdk前端初始化时传入的userID一致，否则校验失败(因为这里的userID是为了校验和前端传进来的userID是否一致)
 * @param minute token过期时间，默认 60 分钟
 * @returns token
 */
export function zegoToken(appId, appSign, userId, minute = 60) {
  const expiredTime = (minute) =>
    Math.floor(new Date().getTime() / 1000 + minute * 60);
  let nonce = new Date().getTime().toString();
  let expired = expiredTime(minute);
  let appSign32 = appSign.replace(/0x/g, '').replace(/,/g, '').substring(0, 32);

  if (appSign32.length < 32) {
    console.error('zego private sign erro!!!!');
    return null;
  }

  let jsonStr = JSON.stringify({
    ver: 1,
    expired: expired,
    nonce: nonce,
    hash: md5(appId + appSign32 + userId + nonce + expired)
  });

  return Buffer.from(jsonStr).toString('base64');
}

// const AES_ALGORITHM = 'AES-128-CBC';
// const AES_KEY = Buffer.from('l8lGDx+jvYh7O9p1bmRb0g==', 'base64');
// const AES_IV = Buffer.from('jv8EEMff8NKyzGf2LbATZA==', 'base64');
// const DES_ALGORITHM = 'DES-CBC';
// const DES_KEY = '4FuHVNrk1rA=';
// const DES_IV = 'iaj3gecB33o=';

// let aes_en = encrypt({
//   content: JSON.stringify({ name: 'admin', pwd: '123456' }),
//   algorithm: AES_ALGORITHM,
//   key: AES_KEY,
//   iv: AES_IV
// });
// let des_en = encrypt({
//   content: JSON.stringify({ name: 'admin', pwd: '123456' }),
//   algorithm: DES_ALGORITHM,
//   key: DES_KEY,
//   iv: DES_IV,
//   key_iv_encoding: 'base64'
// });
// console.log('aes', aes_en);
// console.log('des', des_en);

// console.log(
//   'aes',
//   decrypt({
//     content: aes_en,
//     algorithm: AES_ALGORITHM,
//     key: AES_KEY,
//     iv: AES_IV
//   })
// );
// console.log(
//   'des',
//   decrypt({
//     content: des_en,
//     algorithm: DES_ALGORITHM,
//     key: DES_KEY,
//     iv: DES_IV,
//     key_iv_encoding: 'base64'
//   })
// );
