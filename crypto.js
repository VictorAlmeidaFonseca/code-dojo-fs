const crypto = require('crypto');

module.exports = (data, key) => {
  const md5Key = crypto.createHash('md5').update(key).digest('hex').substr(0, 24);
  const cipher = crypto.createCipheriv('des-ede3', md5Key, '');

  let encrypted = cipher.update(data, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  return encrypted;
};
