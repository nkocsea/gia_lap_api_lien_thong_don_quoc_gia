import jwt from 'jsonwebtoken';
import { CONFIG } from '../config.js';
import { Namespace } from 'socket.io';

export const generateAccessToken = (userId) => {
  return jwt.sign({ sub: userId }, CONFIG.accessTokenSecret, {
    expiresIn: CONFIG.accessTokenExpiresInMinutes + 'm',
  });
};

export const generateRefreshToken = (userId) => {
  return jwt.sign({ sub: userId }, CONFIG.refreshTokenSecret, {
    expiresIn: CONFIG.refreshTokenExpiresInMinutes + 'm',
  });
};

export const decodeRefreshToken = (token) => {
  return jwt.verify(token, CONFIG.refreshTokenSecret);
};

export const isAuthenticated = (req) => {
  let token = '';
  if (
    req.headers.authorization &&
    req.headers.authorization.split(' ')[0] === 'Bearer'
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  try {
    jwt.verify(token, CONFIG.accessTokenSecret);
  } catch (err) {
    return false;
  }

  return true;
};

export const isAuthenticatedFacility = (req) => {
  let token = '';
  if (
    req.headers.authorization &&
    req.headers.authorization.split(' ')[0] === 'Bearer'
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  let decoded;
  try {
    decoded = jwt.verify(token, CONFIG.accessTokenSecret);
    // if(decoded.exp)
    console.log("nvp:decoded:: " , decoded);
   
  } catch (err) {
    return false;
  }

  return decoded;
};

export const isAuthenticatedDoctors = (req) => {
  const token = req.headers.authorization?.split(' ')[1];
  const authorization = req.headers.authorization?.split(' ')[0];

  if (!authorization || authorization !== 'Bearer') {
    console.log("nvp: Authentication faild : authorization only Bearer");
    return false;
  }

  if (!token) {
    console.log("nvp: Authentication faild : token is ", token);
    return false;
  }

  try {
    const decoded = jwt.verify(token, CONFIG.accessTokenSecret);
    console.log("nvp:isAuthenticatedDoctors > decoded:: " , decoded);
    return decoded;
  } catch (err) {
    console.log("nvp:isAuthenticatedDoctors > catch = err:: ", err);
    return false;
  }
};

export const isAuthenticatedApp = (req, db) => {
  const appName = req.headers['app-name'];
  const appKey = req.headers['app-key'];
  const appDB = db.data.appData;

console.log("appname: " + appName + " appkey: "+ appKey);
console.table(appDB)
 

  if (!appName) {
    console.log("nvp: AuthenticatedApp faild : app name is ", appName);
    return false;
  }

  if (!appKey) {
    console.log("nvp: AuthenticatedApp faild : app key is ", appKey);
    return false;
  }

  try {
    const index = appDB.findIndex(
      (u) => 
      u.name === appName &&
      u.key === appKey
    );
  console.log("nvp: index =", index);
    if (index === -1 ) {
      console.log("failed: the App Name "+appName+" or App Key "+appKey+" does not exists!")
      return false;
    }
    return index;

  } catch (err) {
    console.log("nvp:isAuthenticatedDoctors > catch = err:: ", err);
    return false;
  }
};