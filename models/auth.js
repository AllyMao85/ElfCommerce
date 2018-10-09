'user strict';

const md5 = require('md5');
const moment = require('moment');
const jwt = require('jsonwebtoken');

const { UnauthorisedError } = require('../exceptions');
const env = require('../env.json');

function OAuth2Request(username, password, grantType, scope) {
  this.username = username || '';
  this.password = password || '';
  this.grantType = grantType || '';
  this.scope = scope || '';
}

function OAuth2Response(code, accessToken, refreshToken) {
  this.userCode = code;
  this.accessToken = accessToken;
  this.refreshToken = refreshToken;
}

OAuth2Request.prototype.auth = function(db) {
  return new Promise((resolve, reject) => {
    db.connect();
    db.query(
      `select user.id, code, password, salt, token, user_refresh_token.status as tokenStatus from user left join user_refresh_token on user.id = user_refresh_token.user_id where email='${
        this.username
      }' and user.status=1 `,
      (error, results, fields) => {
        // Check if account is valid and active
        if (error || !results[0]) {
          reject(new UnauthorisedError('Not authorised.'));
        } else {
          const { id, code, password, salt, token } = results[0];

          if (password === md5(`${this.password + salt}`)) {
            // If password matched then generating new access token

            const accessToken = jwt.sign(
              {
                data: {
                  id,
                  code,
                  expiry: moment.utc().format('YYYY-MM-DD HH:mm:ss'),
                },
              },
              env.tokenSecret
            );

            db.query(
              `insert into user_access_token(token, user_id, expired_on) values('${accessToken}', ${id}, '${moment
                .utc()
                .add(1, 'hour')
                .format('YYYY-MM-DD HH:mm:ss')}')`,
              (error, results, fields) => {
                if (error) {
                  db.end();
                  reject(new UnauthorisedError('Not authorised.'));
                } else if (!token) {
                  const refreshToken = md5(
                    `${code +
                      salt +
                      moment.utc().format('YYYY-MM-DD HH:mm:ss')}`
                  );
                  db.query(
                    `insert into user_refresh_token(token, user_id) values('${refreshToken}', ${id})`,
                    (error, results, fields) => {
                      if (error) {
                        reject(new UnauthorisedError('Not authorised.'));
                      } else {
                        resolve(
                          new OAuth2Response(code, accessToken, refreshToken)
                        );
                      }
                    }
                  );
                  db.end();
                } else {
                  resolve(new OAuth2Response(code, accessToken, token));
                }
              }
            );
          } else {
            reject(new UnauthorisedError('No account found.'));
          }
        }
      }
    );
  });
};

OAuth2Request.prototype.validateToken = function(token, db) {
  return new Promise((resolve, reject) => {
    db.connect();
    db.query(
      `select * from user_access_token where token='${token}' and expired_on > '${moment
        .utc()
        .format('YYYY-MM-DD HH:mm:ss')}' order by id desc limit 1`,
      (error, results, fields) => {
        if (error || !results[0]) {
          reject(new UnauthorisedError('Unauthorised request.'));
        } else {
          resolve('Token validated.');
        }
      }
    );
    db.end();
  });
};

OAuth2Request.prototype.refreshToken = function(token, db) {
  return new Promise((resolve, reject) => {
    db.connect();
    db.query(
      `select user_id as userId from user_refresh_token where token='${token}' and status=1 order by id desc limit 1`,
      (error, results, fields) => {
        if (error) {
          db.end();
          reject(new UnauthorisedError('Unauthorised request.'));
        } else if (results.length > 0) {
          const userId = results[0].userId;
          db.query(
            `select id, code, salt from user where id='${userId}' and status=1`,
            (error, results, fields) => {
              if (error) {
                db.end();
                reject(new UnauthorisedError('Unauthorised request.'));
              } else {
                const { code, salt } = results[0];
                const accessToken = jwt.sign(
                  {
                    data: {
                      id: userId,
                      code,
                      expiry: moment.utc().format('YYYY-MM-DD HH:mm:ss'),
                    },
                  },
                  env.tokenSecret
                );
                db.query(
                  `insert into user_access_token(token, user_id, expired_on) values('${accessToken}', ${userId}, '${moment
                    .utc()
                    .add(1, 'hour')
                    .format('YYYY-MM-DD HH:mm:ss')}')`,
                  (error, results, fields) => {
                    db.end();
                    if (error) {
                      reject(new UnauthorisedError('Unauthorised request.'));
                    } else {
                      resolve(new OAuth2Response(code, accessToken, token));
                    }
                  }
                );
              }
            }
          );
        } else {
          reject(new UnauthorisedError('Refresh token expired.'));
        }
      }
    );
  });
};

module.exports = {
  OAuth2Request,
  OAuth2Response,
};