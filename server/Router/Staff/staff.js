const express = require('express');
const multer = require('multer');
const crypto = require("crypto");
const path = require('path');
const maria = require('mysql');
const mariadb = require('../Common/db_service');
const router = express.Router();

// 파일 설정
const multerUpload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, callback) {
            callback(null, '/files/staff');
        },
        filename: function (req, file, callback) {
            callback(null, new Date().valueOf() + path.extname(file.originalname));
        }
    })
}).fields([{name:'img_emp'}]);


// 공통코드 조회
router.get('/common', (req, res) => {
    let query = 'SELECT CONCAT(`group`, code) value, nm text FROM COMMON_CODE WHERE `group` = ? ORDER BY CONVERT(code, signed); \n';
    const sql = maria.format(query, 'EP') // 고용형태
              + maria.format(query, 'PO'); // 직급
    const sql2 = 'SELECT FN_GETID() id FROM DUAL; \n';
    
    mariadb.getConnection(conn => {
        conn.query(sql+sql2, (err, rows) => {
            let msg = 'success';
            if(err) {
                console.log('error >> ' + err);
                msg = 'fail';
            }
            res.send({ message: msg, common: { employ: rows[0], position: rows[1] } , emp: rows[2][0]});
        });
        conn.release();
    });
});

// 직원 등록
router.post('/employee', multerUpload, (req, res) => {
    const id_FILE = 'F'+new Date().valueOf();
    const empInfo = {
        id : req.body.id,
        nm : req.body.nm,
        nm_eng : req.body.nm_eng,
        phone : req.body.phone,
        email : req.body.email,
        birth : req.body.birth,
        age : req.body.age,
        tp_employ : req.body.tp_employ,
        position : req.body.position,
        post : req.body.post,
        addr : req.body.addr,
        id_FILE : id_FILE,
    };
    const fileInfo = {
        id: id_FILE,
        dir: '/files/staff',
        or_name: req.files.img_emp[0].originalname,
        sv_name: req.files.img_emp[0].filename,
        board_id: empInfo.id
    };
    const deptInfo = [], eduInfo = [], certInfo = [];
    JSON.parse(req.body.dept).forEach(el => {
        deptInfo.push({ 
            id: el.key, 
            dt_start: el.dt_start, 
            dt_end: el.dt_end === '' ? null : el.dt_end, 
            dept: el.dept, 
            team: el.team, 
            location: el.location, 
            position: el.position,
            id_EMPLOYEE: empInfo.id
        });
    });
    JSON.parse(req.body.edu).forEach(el => {
        eduInfo.push({ 
            id: el.key, 
            dt_start: el.dt_start, 
            dt_end: el.dt_end, 
            school: el.school, 
            dept: el.dept, 
            degree: el.degree ?? '-', 
            score: el.score ?? '0',
            graduate: el.graduate,
            id_EMPLOYEE: empInfo.id
        });
    });
    JSON.parse(req.body.cert).forEach(el => {
        certInfo.push({ 
            id: el.key, 
            nm: el.nm, 
            agency: el.agency, 
            dt_in: el.dt_in, 
            level: el.level, 
            note: el.note ?? '', 
            id_EMPLOYEE: empInfo.id
        });
    });

    let sql1 = 'INSERT INTO EMPLOYEE SET ? ; ';
    let sql2 = '';
    let sql3 = '';
    let sql4 = '';
    let sql5 = 'INSERT INTO FILE SET ? ; '

    sql1 = maria.format(sql1, empInfo);
    sql5 = maria.format(sql5, fileInfo);
    for(const info of deptInfo) {
        const sql = 'INSERT INTO EMP_MOVES SET ? ; ';
        sql2 += maria.format(sql, info);
    }
    if(eduInfo.length > 0) {
        for(const info of eduInfo) {
            const sql = 'INSERT INTO EDU SET ? ; ';
            sql3 += maria.format(sql, info);
        }
    }
    if(certInfo.length > 0) {
        for(const info of certInfo) {
            const sql = 'INSERT INTO CERT SET ? ; ';
            sql4 += maria.format(sql, info);
        }
    }

    console.log(sql1);
    // console.log(sql2);
    // console.log(sql3);
    // console.log(sql4);
    // console.log(sql5);
    mariadb.getConnection(conn => {
        conn.query(sql1 + sql2 + sql3 + sql4 + sql5, (err, rows) => {
            let message = 'success';
            if(err) {
                console.log('error excute query : ' + err);
                message = 'fail';
            }
            
            res.send({ message : message, rows: rows });
        });
        conn.release();
    })
});

// 직원 조회
router.get('/employee', (req, res) => {
    const searchWord = ['dept', 'position', 'dt_start', 'dt_end'];
    const params = [];  // 파라미터

    let sql =" SELECT ROW_NUMBER () OVER (ORDER BY dt_in DESC) rn										\n"
            +" 	  ,e.id                                                                                 \n"
            +" 	  ,e.id_FILE pic                                                                        \n"
            +" 	  ,e.nm                                                                                 \n"
            +" 	  ,e.nm_eng                                                                             \n"
            +" 	  ,(SELECT nm FROM DEPT WHERE id = m.dept) dept                                         \n"
            +" 	  ,(SELECT nm FROM DEPT WHERE id = m.team) team                                         \n"
            +" 	  ,CASE m.position WHEN 0 THEN '사원' WHEN 1 THEN '주임' ELSE '직급' END position        \n"
            +" 	  ,m.location                                                                           \n"
            // +" 	  ,CASE e.dt_out WHEN NULL THEN 'N' ELSE 'Y' END use_yn                                 \n"
            +" 	  ,DATE_FORMAT(e.dt_in, '%Y-%m-%d') dt_in                                               \n"
            +" 	  ,'' note                                                                              \n"
            +"   FROM EMPLOYEE e                                                                        \n"
            +"   LEFT JOIN (                                                                            \n"
            +"   	SELECT id, dept, team, location, position, id_EMPLOYEE                              \n"
            +"   	  FROM EMP_MOVES m, (SELECT max(id) maxId FROM EMP_MOVES GROUP BY id_EMPLOYEE) s    \n"
            +"   	 WHERE m.id = s.maxId                                                               \n"
            +"   ) m ON e.id = m.id_EMPLOYEE                                                            \n"
            +"  WHERE 1=1                                                                               \n"
            +"    AND e.dt_out IS NULL                                                                  \n"
            +"  ORDER BY rn                                                                             \n"
            +"  LIMIT ?, ?                                                                              \n"
            +"  ;                                                                                       \n";
    // pagination\n
    params.push(Number(req.query.page) * Number(req.query.perPage)); params.push(Number(req.query.perPage)); 
    sql = maria.format(sql, params);

    console.log(sql);

    mariadb.getConnection(conn => {
        conn.query(sql, (err, rows) => {
            let msg = 'success';
            if(err) {
                console.log('error menu info : ' + err.stack);
                msg = 'fail';
            }
            res.send({
                message : msg,
                rows : rows
            });
        });
        conn.release();
    });
});

// 직원 상세 조회
router.get('/employee/:id', (req, res) => {
    const id = req.params.id;
    console.log('view', id);

    let sql1 = "SELECT  id , nm , nm_eng , phone , email       \n"
             + " 	    , DATE_FORMAT(birth, '%Y-%m-%d') birth \n"
             + " 	    , age , tp_employ , position , post      \n"
             + " 	    , addr , id_FILE img_emp               \n"
             + "  FROM EMPLOYEE                                \n"
             + " WHERE id = ?  ;                               \n";
    let sql2 = " SELECT id `key`									 \n"
             + " 	   ,DATE_FORMAT(dt_start, '%Y-%m-%d') dt_start   \n"
             + " 	   ,DATE_FORMAT(dt_end, '%Y-%m-%d') dt_end       \n"
             + " 	   ,dept , team , location , `position`          \n"
             + "   FROM EMP_MOVES                                    \n"
             + "  WHERE id_EMPLOYEE = ?                              \n"
             + "  ORDER BY id ;                                      \n";
    let sql3 = " SELECT id `key` , dt_start , dt_end , school \n"
             + " 	  ,`degree` , dept , score , graduate     \n"
             + "   FROM EDU                                   \n"
             + "  WHERE id_EMPLOYEE = ?                       \n"
             + "  ORDER BY id ;                               \n";
    let sql4 = " SELECT id `key` , agency , nm				    \n"
             + "	   ,DATE_FORMAT(dt_in, '%Y-%m-%d') dt_in    \n" 
             + " 	   ,`level` , note                          \n"
             + "   FROM CERT                                    \n"
             + "  WHERE id_EMPLOYEE = ?                         \n"
             + "  ORDER BY id ;                                 \n";
    sql1 = maria.format(sql1, id);
    sql2 = maria.format(sql2, id);
    sql3 = maria.format(sql3, id);
    sql4 = maria.format(sql4, id);

    let query = 'SELECT CONCAT(`group`, code) value, nm text FROM COMMON_CODE WHERE `group` = ? ORDER BY CONVERT(code, signed); \n';
    const sql5 = maria.format(query, 'EP') // 고용형태
              + maria.format(query, 'PO'); // 직급
    // console.log(sql1);
    // console.log(sql2);
    // console.log(sql3);
    // console.log(sql4);
    mariadb.getConnection(conn => {
        conn.query(sql1 + sql2 + sql3 + sql4 + sql5, (err, rows) => {
            if(err) {
                console.log('error ocurred >> ' + err);
            }
            res.send({ message: 'success', rows: rows, common : { employ: rows[4], position: rows[5] } });
        });
        conn.release();
    })
});

// 직원 수정
router.post('/employee/:id', multerUpload, (req, res) => {
    const id = req.params.id;

    const empInfo = {
        id : req.body.id,
        nm : req.body.nm,
        nm_eng : req.body.nm_eng,
        phone : req.body.phone,
        email : req.body.email,
        birth : req.body.birth,
        age : req.body.age,
        tp_employ : req.body.tp_employ,
        position : req.body.position,
        post : req.body.post,
        addr : req.body.addr,
    };
    /* 
    const fileInfo = {
        or_name: req.files.img_emp[0].originalname,
        sv_name: req.files.img_emp[0].filename,
    }; */
    const deptInfo = [], eduInfo = [], certInfo = [];
    JSON.parse(req.body.dept).forEach(el => {
        deptInfo.push({ 
            id: el.key,
            dt_start: el.dt_start, 
            dt_end: el.dt_end === '' ? null : el.dt_end, 
            dept: el.dept, 
            team: el.team, 
            location: el.location, 
            position: el.position,
            id_EMPLOYEE : req.body.id
        });
    });
    JSON.parse(req.body.edu).forEach(el => {
        eduInfo.push({ 
            id: el.key,
            dt_start: el.dt_start, 
            dt_end: el.dt_end, 
            school: el.school, 
            dept: el.dept, 
            degree: el.degree ?? '-', 
            score: el.score ?? '0',
            graduate: el.graduate,
            id_EMPLOYEE : req.body.id
        });
    });
    JSON.parse(req.body.cert).forEach(el => {
        certInfo.push({ 
            id: el.key,
            nm: el.nm, 
            agency: el.agency, 
            dt_in: el.dt_in, 
            level: el.level, 
            note: el.note ?? '', 
            id_EMPLOYEE : req.body.id
        });
    });

    let sqlemp = " UPDATE EMPLOYEE							\n"
		   + "    SET nm     = ?,                   \n"
		   + "        nm_eng = ?,           \n"
		   + " 	      phone  = ?,                \n"
		   + " 	      email  = ?,                \n"
		   + " 	      birth  = ?,                \n"
		   + " 	      age    = ?,                    \n"
		   + " 	      tp_employ = ?,        \n"
		   + " 	      position = ?,              \n"
		   + " 	      post   = ?,                  \n"
		   + " 	      addr   = ?                   \n"
		   + "  WHERE id     = ? ;                  \n";
    let sqlmove = " INSERT INTO EMP_MOVES SET ? ON DUPLICATE KEY\n"
            + "    UPDATE dt_start = VALUE(dt_start),       \n"
            + "        dt_end = VALUE(dt_end),           \n"
            + " 	   dept = VALUE(dept),                  \n"
            + " 	   team = VALUE(team),                  \n"
            + " 	   location = VALUE(location),          \n"
            + " 	   position = VALUE(position) ;         \n";
    let sqledu = " INSERT INTO EDU SET ? ON DUPLICATE KEY   \n"
            + "    UPDATE dt_start = VALUE(dt_start),       \n"
            + "        dt_end = VALUE(dt_end),           \n"
            + " 	   school = VALUE(school),              \n"
            + " 	   dept = VALUE(dept),                  \n"
            + " 	   degree = VALUE(degree),              \n"
            + " 	   graduate = VALUE(graduate),          \n"
            + " 	   score = VALUE(score) ;               \n";
    let sqlcert = " INSERT INTO CERT SET ? ON DUPLICATE KEY  \n"
            + "    UPDATE nm = VALUE(nm),                   \n"
            + "        agency = VALUE(agency),           \n"
            + " 	   dt_in = VALUE(dt_in),                \n"
            + " 	   level = VALUE(level),                \n"
            + " 	   note = VALUE(note) ;                 \n";
    
    const sql1 = maria.format(sqlemp, [empInfo.nm, empInfo.nm_eng, empInfo.phone, empInfo.email, empInfo.birth, empInfo.age, empInfo.tp_employ, empInfo.position, empInfo.post, empInfo.addr, empInfo.id]);
    let sql2 = '', sql3 = '', sql4 = '' , sql5 = '';
    for(const info of deptInfo) {
        sql2 += maria.format(sqlmove, info);
    }
    if(eduInfo.length > 0) {
        for(const info of eduInfo) {
            sql3 += maria.format(sqledu, info);
        }
    }
    if(certInfo.length > 0) {
        for(const info of certInfo) {
            sql4 += maria.format(sqlcert, info);
        }
    }

    req.body.removeDept = '1';
    if(req.body.removeDept.length > 0) {
        for(const key of req.body.removeDept.split(',')) {
            sql5 += maria.format("DELETE FROM EMP_MOVES WHERE id = ? AND id_EMPLOYEE = ? ; ", [key, req.body.id]);
        }
    }
    if(req.body.removeEdu.length > 0) {
        for(const key of req.body.removeEdu.split(',')) {
            sql5 += maria.format("DELETE FROM EDU WHERE id = ? AND id_EMPLOYEE = ? ; ", [key, req.body.id]);
        }
    }
    if(req.body.removeCert.length > 0) {
        for(const key of req.body.removeCert.split(',')) {
            sql5 += maria.format("DELETE FROM CERT WHERE id = ? AND id_EMPLOYEE = ? ; ", [key, req.body.id]);
        }
    }

    mariadb.getConnection(conn => {
        conn.query(sql1+sql2+sql3+sql4+sql5, (err, rows) => {
            if(err) {
                console.log('error ocurred >> ' + err);
            }
            res.send({ message: 'success', rows: rows });
        });
        conn.release();
    });
});

// 삭제
router.delete('/employee/:id', (req, res) => {
    const targetId = req.params.id; // 삭제 대상 사번
    
    let query1 = "UPDATE EMPLOYEE            \n"
               + "   SET dt_out = sysdate(), \n"
               + "       id_FILE = '',       \n"
               + "       nm = '',            \n"
               + "       nm_eng = '',        \n"
               + "       phone = '',         \n"
               + "       email = '',         \n"
               + "       birth = null,       \n"
               + "       age = 0,            \n"
               + "       position = '',      \n"
               + "       post = '',          \n"
               + "       addr = ''           \n"
               + " WHERE id = ? ;            \n";
    let query2 = 'DELETE FROM EMP_MOVES WHERE id_EMPLOYEE = ? ; \n';
    let query3 = 'DELETE FROM EDU WHERE id_EMPLOYEE = ? ; \n';
    let query4 = 'DELETE FROM CERT WHERE id_EMPLOYEE = ? ; \n';
    const sql1 = maria.format(query1, targetId), sql2 = maria.format(query2, targetId), 
          sql3 = maria.format(query3, targetId), sql4 = maria.format(query4, targetId);
    
    mariadb.getConnection(conn => {
        conn.query(sql1+sql2+sql3+sql4, (err, rows) => {
            let msg = 'success';
            if(err) {
                msg = 'fail';
                console.log('error occured >> ' + err);
            }
            res.send({ messgae : msg, rows: rows, relocate: '/staff/employee' });
        });
        conn.release();
    });

});

module.exports = router;