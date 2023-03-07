const express = require('express');
const fs = require('fs');   // 파일 입출력
const mariadb = require('../Common/db_service');
const router = express.Router();

// 이미지 가져오기
router.get('/', (req, res) => {
    res.send({ test : 'img!'});
    // console.log('key >> ',req.params.key);
});

router.get('/:key', (req, res) => {
    const sql = 'SELECT CONCAT(dir, "/", sv_name) AS file FROM FILE WHERE id = ?';

    mariadb.getConnection(conn => {
        conn.query(sql, req.params.key, (err, rows) => {
            if(err) {
                console.log('file read error : ' , err);
                return;
            }
            if(rows.length > 0) {
                const path = rows[0].file;
                fs.readFile(path, function(err, data) {
                    // console.log('picture loading.....');
                    res.writeHead(200);
                    res.write(data);
                    res.end();
                });
            } else {
                res.send({message: 'no file'});
            }
            // res
        });
        conn.release();
    });
});

router.delete('/:key', (req, res) => {
    const key = req.params.key
    if(key) {
        res.send({ message : 'no-file' });
        return;
    };
    const sql = 'SELECT CONCAT(dir, "/", sv_name) AS file FROM FILE WHERE id = ?; \n DELETE FROM FILE WHERE id = ? ;';

    mariadb.getConnection(conn => {
        conn.query(sql, [req.params.key, req.params.key], (err, rows) => {
            if(err) {
                console.log('file delete error : ' , err);
                conn.release();
                return;
            }
            //delete file
            if(fs.existsSync(rows[0][0].file))
                fs.unlink(rows[0][0].file, err => {
                    if(err) {
                        console.log(err);
                        conn.release();
                        return;
                    }
                });
            res.send({ message : 'success' });
        });
        conn.release();
    });
});

module.exports = router;
