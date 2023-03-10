const jwt = require("./jwt");
const TOKEN_EXPIRED = -3; // 토큰 만료
const TOKEN_INVALID = -4; // 유효하지 않은 토큰

/** 로그인 사용자 인증 */
const authUtil = {
    checkToken: async (req, res) => {
        // const token = req.headers.token;
        const token = req.headers.authorization?.split(' ')[1] ?? '';
        // 토큰 없음
        if(!token) {
            return res.status(401).json({ message: "EMPTY_TOKEN" });
        }
        
        // 토큰 decode
        const user = await jwt.verify(token);

        // 유효기간 만료
        if(user === TOKEN_EXPIRED) {
            // return res.json({ message: "TOKEN_EXPIRED" }); 
            return res.status(419).json({ message: 'TOKEN_EXPIRED' });
        }
        // 유효하지 않은 토큰
        if(user === TOKEN_INVALID || user.sub === undefined) {
            // return res.json({ message: "TOKEN_INVALID" });
            return res.status(401).json({ message: 'TOKEN_INVALID' });
        }
        // next();
        res.json({ user: user });
    },

    getEmpId: async (req, res) => {
        const token = req.headers.authorization?.split(' ')[1] ?? '';
        // 토큰 없음
        if(!token) {
            return { message: "EMPTY_TOKEN" };
        }
        
        // 토큰 decode
        const user = await jwt.verify(token);

        // 유효기간 만료
        if(user === TOKEN_EXPIRED) {
            return { message: 'TOKEN_EXPIRED' };
        }
        // 유효하지 않은 토큰
        if(user === TOKEN_INVALID || user.sub === undefined) {
            return { message: 'TOKEN_INVALID' };
        }
        
        return user.sub;
    }
}

module.exports = authUtil;