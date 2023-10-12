import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const IV_LENGTH = parseInt(process.env.IV_LENGTH, 10);

const generateIV = () => {
  const iv = CryptoJS.lib.WordArray.random(IV_LENGTH);
  return iv;
};

export const encryptData = (data) => {
  const iv = generateIV();
  const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), ENCRYPTION_KEY, {
    iv: iv,
  });
  return iv.toString() + encrypted.toString();
};
  
export const decryptData = (encryptedData) => {
  const iv = CryptoJS.enc.Hex.parse(encryptedData.slice(0, IV_LENGTH * 2));
  const encryptedText = encryptedData.slice(IV_LENGTH * 2);

  const decrypted = CryptoJS.AES.decrypt(encryptedText, ENCRYPTION_KEY, {
    iv: iv,
  });

  return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
};
  
