const jwt = require("jsonwebtoken");
const randToken = require("rand-token");
const secretKey = require("../config/secretKey").secretKey;
const options = require("../config/secretKey").options;
const TOKEN_EXPIRED = -3; // 토큰 만료
const TOKEN_INVALID = -4; // 유효하지 않은 토큰

module.exports = {
    sign: async (user) => {
        // console.log('jwt sign ', user);
        const payload = {
            sub: user.id,
            name: user.name,
            pic: user.pic,
        };

        const result = {
            // access token 발급
            token: jwt.sign(payload, secretKey, options),
            refreshToken: jwt.sign({ sub: user.id }, secretKey, {algorithm: "HS256", expiresIn: "3d", issuer: "issuer"}),
        }
        return result;
    },
    
    verify: async (token) => {
        // console.log('jwt verify ', token);
        try {
            // return jwt.verify(token, process.env.JWT_SECRET);
            return jwt.verify(token, secretKey);
        } catch (e) {
            /**
             * 에러 처리
             * e.name, e.message
             * TokenExpiredError : 토큰 만료(-3)
             * JsonWebTokenError : 시크릿 키 없음, 서명 불일치 (-4)
             */
            const errorName = e.name;
            switch(errorName) {
                case 'TokenExpiredError' : return TOKEN_EXPIRED;
                case 'JsonWebTokenError' : return TOKEN_INVALID;
                default : return TOKEN_INVALID;
            }
        }
    }
}