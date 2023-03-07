const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const maria = require('mysql');
const mariadb = require('../Common/db_service');
const jwt = require("../../utils/jwt");

function dbQueryAsync(query) {
    return new Promise((resolve, reject) => {
        mariadb.getConnection(conn => {
            conn.query(query, (err, rows) => {
                if(err) reject(err);
                resolve(rows[0]);
            });
            conn.release();
        });
    });
}

router.post('/login', async (req, res) => {
    const client = req.body;

    if(client.password === "") {
        res.send({message: '-1'});
        return;
    }
    client.password = crypto.createHash('SHA256').update(client.password).digest('base64');
    let sql = "SELECT id, nm name, id_FILE pic FROM EMPLOYEE WHERE id = ? AND password = ?; ";
    sql = maria.format(sql, [client.id, client.password]);

    const user = await dbQueryAsync(sql);
    // console.log('user ',user);
    if(!user) {
        res.send({message: '-2'});
        return;
    }
    // Access Token 발급
    const jwtToken = await jwt.sign(user);
    
    res.send({
        message: 'success',
        refresh_token: jwtToken.refreshToken,
        access_token: jwtToken.token
    });
});

// 로그인 유저 정보 조회
router.get("/loginInfo", async (req, res) => {
    const accessToken = req.headers.authorization?.split(' ')[1] ?? '';
    
    // 시크릿키를 함께 넘겨 확인한다
    // const user = await jwt.verify(accessToken, secretKey.secretKey);
    const user = await jwt.verify(accessToken);
    if(user === -3) {
        res.status(419).send({ code: 419, message: '만료된 토큰입니다.' })
        return;
    }
    if(user === -4) {
        res.status(401).send({ code: 401, message: '유효하지 않은 토큰입니다.' });
        return;
    }
    res.send({ user: user });
});

// Refresh Token
router.post("/reissue", async (req, res) => {
    const refreshToken = req.headers.cookie?.split("=")[1];
    let user = await jwt.verify(refreshToken);
    
    let sql = "SELECT id, nm name, id_FILE pic FROM EMPLOYEE WHERE id = ?; ";
    sql = maria.format(sql, [user.sub]);
    
    console.log('reissue ', refreshToken);
    user = await dbQueryAsync(sql);

    const jwtToken = await jwt.sign(user);
    res.send({
        message: 'success',
        access_token: jwtToken.token,
    });
});

// 로그아웃
router.post("/logout", async (req, res) => {
    res.send({ message : '로그아웃 되었습니다.' });
});

module.exports = router;