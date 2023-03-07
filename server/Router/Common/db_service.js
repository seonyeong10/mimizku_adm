const mariadb = require('mysql');
const db_config = require('../../db_options.json');

let pool = mariadb.createPool(db_config);

const db = {
    getConnection : (callback) => {
        pool.getConnection((err, conn) => {
            // 연결 오류 발생 시
            if(err) {
                console.log('error connecting : ' + err.stack);
                return;
            }
            callback(conn);
        });
    }
}

module.exports = db;    // db객체 반환