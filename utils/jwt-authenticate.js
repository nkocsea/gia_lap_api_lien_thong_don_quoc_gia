import jwt from 'jsonwebtoken';
import { CONFIG } from '../config.js';

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
  // console.log("nvp: i'm here", req);
  let token = '';
  if (
    req.headers.authorization &&
    req.headers.authorization.split(' ')[0] === 'Bearer'
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  console.log("nvp: isAuthenticatedDoctors > token:: " , token);
  let decoded;
  try {
    decoded = jwt.verify(token, CONFIG.accessTokenSecret);
    // if(decoded.exp)
    // console.log("nvp:decoded:: " , decoded);
    console.log("nvp:isAuthenticatedDoctors > decoded:: " , decoded);
  } catch (err) {
    console.log("nvp:isAuthenticatedDoctors > catch = err:: ", err);

    return false;
  }
  
  return decoded;
};