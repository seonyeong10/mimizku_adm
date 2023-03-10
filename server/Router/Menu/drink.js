const request = require("request");
const express = require("express");
const multer = require('multer');   //파일 업로드
const maria = require('mysql');
const mariadb = require('../Common/db_service');
const menuBuilder = require("../../domain/menu");
const menuOptionBuilder = require("../../domain/menuOption");
const menuDetailBuilder = require("../../domain/menuDetail");
const fileBuilder = require("../../domain/file");
const authUtil = require("../../utils/auth");
const router = express.Router();
const path = require("path");

// 파일 설정
const multerUpload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, callback) {
            callback(null, '/files/menu');
        },
        filename: function (req, file, callback) {
            callback(null, new Date().valueOf() + path.extname(file.originalname));
        }
    })
}).fields([{name:'img_hot'}, {name:'img_iced'}, {name:'img_food'}, {name:'img_goods'}]);   // 단일 파일 = single , 여러 파일 = array

// DB 연결
/*
const connection = maria.createConnection({
    host     : 'localhost',
    user     : 'fukuro',
    password : 'fukuro',
    database : 'fukuro',
    multipleStatements: true    // 여러 쿼리를 ';'를 기준으로 한번에 보낼 수 있게한다.
});
*/

// 메뉴 등록
router.post('/:category', multerUpload, async (req, res) => {
    // filename : req.file.filename
    const category = req.params.category;
    const id = 'M' + Date.now();
    const tempArr = req.body.temp?.split(',') ?? [2];
    const menuDetailList = [];
    const fileList = [];
    // let fileIds = [];

    let empId = await authUtil.getEmpId(req, res)
    .then(resolve => {
        if(resolve.message) {
            res.send(resolve);
            return;
        }
        return resolve;
    })
    .catch(reject => {
        res.send(reject);
        return;
    }); 
    // 사용자가 조회되지 않으면 더 이상 진행하지 않는다.
    if(!empId) return;

    const menu = new menuBuilder();
    menu.id = id,
    menu.main_clas = category,
    menu.sub_clas = req.body.sub_clas,
    menu.nm = req.body.nm,
    menu.nm_eng = req.body.nm_eng,
    menu.volume = req.body.volume,
    menu.temp = req.body.temp,
    menu.expl = req.body.expl,
    menu.add_expl = req.body.add_expl,
    menu.dt_end = req.body.dt_end ?? '2999-12-31',
    menu.yn_season = req.body.yn_season ?? 'N',
    menu.yn_recomm = req.body.yn_recomm ?? 'N',
    menu.allergy = req.body.allergy,
    menu.id_EMPLOYEE = empId;

    
    for(const i of tempArr) {
        const key = i == '0' ? 'hot' : i == '1' ? 'iced' : category;

        const file = new fileBuilder();
        if(req.files[`img_${key}`]) {
            file.id = 'F' + Date.now() + i,
            file.dir = '/files/menu',
            file.or_name = req.files[`img_${key}`][0].originalname,
            file.sv_name = req.files[`img_${key}`][0].filename,
            board_id = menu.id;
        }
        fileList.push(file);
        
        const menuDetail = new menuDetailBuilder();
        menuDetail.id_MENU = menu.id,
        menuDetail.temp = i,
        menuDetail.fee = req.body[`fee_${key}`],
        menuDetail.calorie = req.body[`calorie_${key}`],
        menuDetail.sugar = req.body[`sugar_${key}`],
        menuDetail.protein = req.body[`protein_${key}`],
        menuDetail.fat = req.body[`fat_${key}`],
        menuDetail.colesterol = req.body[`colesterol_${key}`],
        menuDetail.trans_fat = req.body[`trans_fat_${key}`],
        menuDetail.ploy_fat = req.body[`ploy_fat_${key}`],
        menuDetail.caffeine = req.body[`caffeine_${key}`],
        menuDetail.id_FILE = file.id ?? ''
        ;

        menuDetailList.push(menuDetail);
    }

    const menuOption = new menuOptionBuilder();
    menuOption.id_MENU = id,
    menuOption.bean = req.body.bean,
    menuOption.bean_cnt = req.body.bean_cnt
    menuOption.syrup = req.body.syrup,
    menuOption.syrup_cnt = req.body.syrup_cnt,
    menuOption.base = req.body.base,
    menuOption.milk = req.body.milk,
    menuOption.cream = req.body.cream,
    menuOption.drizz = req.body.drizz;

    /* 쿼리 생성 */
    let menuSql = 'INSERT INTO MENU SET ?; ';
    menuSql = maria.format(menuSql, menu);
    const menuDetailSql = menuDetailList.map(data => {
        const sql = 'INSERT INTO MENU_DETAIL SET ?; ';
        return maria.format(sql, data);
    });
    const fileSql = fileList.map(data => {
        const sql = 'INSERT INTO FILE SET ?; ';
        return maria.format(sql, data);
    });
    let menuOptionSql = '';
    if(category === 'drink') {
        menuOptionSql = 'INSERT INTO TYPES SET ?; ';
        menuOptionSql = maria.format(menuOptionSql, menuOption);
    }

    // console.log(menuSql);
    // console.log(menuDetailSql.join(""));
    // console.log(fileSql.join(""));
    // console.log(menuOptionSql);
    
    mariadb.getConnection((conn) => {
        conn.query(menuSql + menuDetailSql.join("") + fileSql.join("") + menuOptionSql, (err, rows) => {
            if(err) {
                console.log('error excute query : ' + err);
            }
            
            res.send({ message : 'success', rows: rows });
        });
        
        conn.release();
    });
});

// 메뉴 목록 조회
router.get('/:category', (req, res) => {
    const category = req.params.category;
    const searchWord = ['yn_season', 'yn_recomm', 'dt_start', 'dt_end'];
    const params = [];  // 파라미터
    const searchClas = []; // 카테고리 검색

    console.log(req.query);

    req.query.sub_clas?.forEach(ctg => searchClas.push(ctg));

    let sql = 'SELECT  ROW_NUMBER () OVER(ORDER BY m.id DESC) rn \n'
            + ', m.id \n'
            + ', m.sub_clas \n'
            + ', f.id  AS pic \n'
            + ", IF(md.temp = 0, 'HOT', 'ICED') temp \n"
            + ', m.nm \n'
            + ', m.nm_eng \n'
            + ", FORMAT(md.fee, N'#,0') fee \n"
            + ', DATE_FORMAT(m.dt_start, "%Y-%m-%d") dt_start \n'
            + ', DATE_FORMAT(m.dt_end, "%Y-%m-%d") dt_end \n'
            // + ', m.yn_use ' 
            + ', m.yn_season \n' 
            + ', m.yn_recomm \n' 
            + 'FROM MENU m \n'
            + 'LEFT OUTER JOIN MENU_DETAIL md ON md.id_MENU = m.id \n'
            + 'LEFT OUTER JOIN FILE f ON md.id_FILE = f.id \n'
            + "WHERE main_clas = ? \n";
            + "AND sub_clas " +( searchClas.length > 0 ? " IN ('?') \n" : " = '%%' \n");
    // if(params[1] !== '') {
    //     sql += "AND sub_clas IN ('" + searchClas.join("','") + "' ) \n";
    // } else {
    //     sql += "AND sub_clas LIKE CONCAT('%',NVL(?, ''),'%') \n";
    // }
    sql += "  AND yn_season LIKE CONCAT('%', NVL(?, ''), '%') \n"
        + "   AND yn_recomm LIKE CONCAT('%', NVL(?, ''), '%') \n"
        + "   AND dt_start LIKE CONCAT('%', NVL(?, ''), '%') \n"
        + "   AND dt_end LIKE CONCAT('%', NVL(?, ''), '%') \n"
        + "   AND yn_use = 'Y' \n"
        // + "   AND yn_use LIKE CONCAT('%', NVL(?, ''), '%') \n"
        + 'ORDER BY rn  \n'
        + 'LIMIT ?, ?   ;';

    params.push(category);
    params.push(searchClas.join("','"));
    searchWord.map(col => params.push(req.query[col] ?? ''));
    params.push(Number(req.query.page) * Number(req.query.perPage)); params.push(Number(req.query.perPage)); 

    console.log(maria.format(sql, params));
    // console.log(params);
    
    /* mariadb.getConnection(conn => {
        conn.query(sql, params, (err, rows) => {
            if(err) {
                console.log('error get menu list : ' + err);
                return;
            }
            res.send({ message: 'success', rows: rows});
        }); 
        conn.release();
    }); */
    res.send({message:'test'});
});

// 메뉴 상세 조회
router.get('/:category/:id', (req, res) => {
    console.log(req.params.category);
    console.log(req.params.id);
    const sql1 = 'SELECT m.id                         				   '
              + ' 	  ,m.sub_clas                                      '
              + ' 	  ,m.nm                                            '
              + ' 	  ,m.nm_eng                                        '
              + ' 	  ,NVL(m.volume, \'\') volume                      '
              + ' 	  ,NVL(m.temp  , \'\') temp                        '
              + ' 	  ,DATE_FORMAT(m.dt_start, "%Y-%m-%d") dt_start    '
              + ' 	  ,DATE_FORMAT(m.dt_end, "%Y-%m-%d") dt_end        '
              + ' 	  ,NVL(m.expl      , \'\') expl                    '
              + ' 	  ,NVL(m.add_expl  , \'\') add_expl                '
              + ' 	  ,NVL(m.yn_season , \'\') yn_season               '
              + ' 	  ,NVL(m.yn_recomm , \'\') yn_recomm               '
              + ' 	  ,NVL(m.allergy   , \'\') allergy                 '
              + ' 	  ,NVL(t.bean      , \'\') bean                    '
              + ' 	  ,NVL(t.bean_cnt  , \'\') bean_cnt                '
              + ' 	  ,NVL(t.syrup     , \'\') syrup                   '
              + ' 	  ,NVL(t.syrup_cnt , \'\') syrup_cnt               '
              + ' 	  ,NVL(t.milk      , \'\') milk                    '
              + ' 	  ,NVL(t.base      , \'\') base                    '
              + ' 	  ,NVL(t.cream     , \'\') cream                   '
              + ' 	  ,NVL(t.drizz     , \'\') drizz                   '
              + '  FROM MENU m                                         '
              + '  LEFT JOIN TYPES t ON m.id = t.id_MENU               '
              + ' WHERE m.id = ? ;';
    const sql2 = 'SELECT md.temp, NVL(md.calorie, 0) calorie, NVL(md.salt, 0) salt, NVL(md.protein, 0) protein,'
               + '		 NVL(md.fat, 0) fat, NVL(md.sugar, 0) sugar, NVL(md.caffeine, 0) caffeine, f.id as pic,'
               + '		 NVL(md.fee, 0) fee                             '
               + '  FROM MENU m                                         '
               + '  LEFT JOIN MENU_DETAIL md ON md.id_MENU = m.id       '
               + '  LEFT JOIN FILE f ON md.id_FILE = f.id               '
               + ' WHERE m.id = ? ;                                     ';
    
    mariadb.getConnection(conn => {
        conn.query(sql1 + sql2, [req.params.id, req.params.id], (err, rows) => {
            if(err) {
                console.log('error menu info : ' + err.stack);
            }
            res.send({
                message : 'success',
                rows : rows
            });
        });
        conn.release();
    });

});

// 메뉴 수정 file ver
router.post('/:category/:id', multerUpload, (req, res) => {
    const category = req.params.category;   // 메뉴 id
    const key = req.params.id;   // 메뉴 id
    const tempArr = req.body.temp !== '' ? req.body.temp.split(',') : [2];
    console.log(tempArr);

    const menuInfo = [
        req.body.sub_clas
        ,req.body.nm
        ,req.body.nm_eng
        ,req.body.volume
        ,req.body.temp
		,req.body.dt_start
        ,req.body.dt_end
        ,req.body.expl
        ,req.body.add_expl
        ,req.body.yn_season
        ,req.body.yn_recomm
        ,req.body.allergy
        ,'12345'
        ,req.body.id
    ];

    let menuDetail = [];
    let fileInfo = [];
    for(const i of tempArr) {
        let key = category;
        switch(i) {
            case 0 : key = 'hot'; break;
            case 1 : key = 'iced'; break;
        }
        let id_FILE = 'F' + Date.now() + i;
        if(!req.files[`img_${key}`]) id_FILE = req.body[`pic_${key}`];
        menuDetail.push({
            id_MENU : req.body.id,
            temp : i,
            fee : req.body[`fee_${key}`],
            calorie : req.body[`calorie_${key}`],
            carbon : req.body[`carbon_${key}`],
            sugar : req.body[`sugar_${key}`],
            salt : req.body[`salt_${key}`],
            protein : req.body[`protein_${key}`],
            fat : req.body[`fat_${key}`],
            colesterol : req.body[`colesterol_${key}`],
            trans_fat : req.body[`trans_fat_${key}`],
            ploy_fat : req.body[`ploy_fat_${key}`],
            caffeine : req.body[`caffeine_${key}`],
            id_FILE : id_FILE,
        });
        if(req.files[`img_${key}`]) {
            fileInfo.push({
                id : id_FILE,
                dir : '/files/menu',
                or_name : req.files[`img_${key}`][0].originalname,
                sv_name : req.files[`img_${key}`][0].filename,
                board_id : req.body.id
            });
        }
    }

    const optInfo = [
        req.body.bean
        ,req.body.bean_cnt
        ,req.body.syrup
        ,req.body.syrup_cnt
        ,req.body.base
        ,req.body.cream
        ,req.body.cream
        ,req.body.drizz
        ,req.body.id
    ];

    let sqlMenu = 'UPDATE MENU				  \n'
                + '   SET sub_clas = NVL(?, \'\')        \n'
                + '	   ,nm = NVL(?, \'\')                \n'
                + '	   ,nm_eng = NVL(?, \'\')            \n'
                + '	   ,volume = NVL(?, \'\')            \n'
                + '	   ,temp = NVL(?, \'\')              \n'
                + '	   ,dt_start = NVL(?, \'\')          \n'
                + '	   ,dt_end = NVL(?, \'\')            \n'
                + '	   ,expl = NVL(?, \'\')              \n'
                + '	   ,add_expl = NVL(?, \'\')          \n'
                + '	   ,yn_season = NVL(?, \'\')         \n'
                + '	   ,yn_recomm = NVL(?, \'\')         \n'
                + '	   ,allergy = NVL(?, \'\')           \n'
                + '	   ,dt_up = sysdate()     \n'
                + '	   ,id_EMPLOYEE = NVL(?, \'\')       \n'
                + ' WHERE id = NVL(?, \'\') ;            \n';
    let sqlDetail = 'INSERT INTO MENU_DETAIL SET ? ON DUPLICATE KEY \n'
                  + ' UPDATE calorie = VALUES(calorie)      \n'
                  + ' 	    ,salt = VALUES(salt)            \n'
                  + ' 	    ,protein = VALUES(protein)      \n'
                  + ' 	    ,fat = VALUES(fat)              \n'
                  + ' 	    ,sugar = VALUES(sugar)          \n'
                  + ' 	    ,caffeine = VALUES(caffeine)    \n'
                  + ' 	    ,fee = VALUES(fee)              \n'
                  + ' 	    ,id_FILE = VALUES(id_FILE) ;    \n'
    let sqlOption = '';
    let sqlFile = '';
    let sqlDetail2 = '';
                  
    sqlMenu = maria.format(sqlMenu, menuInfo);
    for (let i = 0; i < tempArr.length; i++) {
        sqlDetail2 += maria.format(sqlDetail, menuDetail[i]);
        if (fileInfo[i]) {
            const file = 'INSERT INTO FILE SET ? ON DUPLICATE KEY UPDATE sv_name = VALUES(sv_name), or_name = VALUES(or_name) ; ';
            sqlFile += maria.format(file, fileInfo[i]);
        }
    }
    if(category === 'drink') {
        sqlOption = ' UPDATE TYPES			\n'
                  + '    SET bean = NVL(?, \'\')       \n'
                  + '       ,bean_cnt = NVL(?, \'\')   \n'
                  + ' 	    ,syrup = NVL(?, \'\')      \n'
                  + ' 	    ,syrup_cnt = NVL(?, \'\')  \n'
                  + ' 	    ,milk = NVL(?, \'\')       \n'
                  + ' 	    ,cream = NVL(?, \'\')      \n'
                  + ' 	    ,base = NVL(?, \'\')       \n'
                  + ' 	    ,drizz = NVL(?, \'\')      \n'
                  + '  WHERE id_MENU = NVL(?, \'\');   \n';
        sqlOption = maria.format(sqlOption, optInfo);
    }

    // console.log(sqlMenu);
    // console.log(sqlDetail2);
    console.log(sqlFile);
    // console.log(sqlOption);
    
    
    mariadb.getConnection(conn => {
        conn.query(sqlMenu + sqlDetail2 + sqlOption + sqlFile, (err, rows) => {
            if(err) {
                console.log('error excute query : ' + err);
            }

            res.send({ message : 'success', rows: rows });
        });

        conn.release();
    });
    
    // res.send({ message : 'success' });
});

// 메뉴 수정 no file ver
router.put('/:category/:id', (req, res) => {
    const key = req.params.id;   // 메뉴 id
    const reqKeys = Object.keys(req.body);
    const columns = {
        menu : ['sub_clas', 'nm', 'nm_eng', 'volume', 'fee', 'temp', 'expl', 'add_expl', 'dt_start', 'dt_end', 'yn_use', 'yn_season', 'yn_recomm', 'id_EMPLOYEE'],
        file : ['or_name', 'sv_name'],
        opt : ['bean', 'bean_cnt', 'syrup', 'syrup_cnt', 'base', 'base_cnt' , 'ice_amt' , 'milk' , 'cream' , 'cream_amt' , 'drizz' , 'drizz_amt'],
        nut : ['calorie', 'salt', 'sugar', 'protein', 'fat', 'caffeine', 'allergy']
    };

    req.body.volume = req.body.volume?.join();
    req.body.temp = req.body.temp?.join();
    req.body.allergy = req.body.allergy?.join();

    let sql1 = 'UPDATE MENU SET dt_in = sysdate() ';
    let items1 = [];
    reqKeys.map(el => {
        if(columns.menu.includes(el)) {
            sql1 += `, ${el} = ? `;
            items1.push(req.body[el]);
        }
    });
    sql1 += ` WHERE id = ? ; `;
    items1.push(key);
    sql1 = maria.format(sql1, items1);

    let sql2 = '';
    let items2 = [];
    reqKeys.map((el, idx) => {
        if(columns.opt.includes(el)) {
            sql2 += items2.length == 0 ?  `UPDATE TYPES SET ${el} = ? ` : `, ${el} = ? `;
            items2.push(req.body[el]);
        }
    });
    if(sql2.length > 1) {
        sql2 += ` WHERE id_MENU = ? ; `;
        items2.push(key);
        sql2 = maria.format(sql2, items2);
    }

    let sql3 = '';
    let items3 = [];
    reqKeys.map(el => {
        if(columns.nut.includes(el)) {
            sql3 += items3.length == 0 ?  `UPDATE NUTRIENT SET ${el} = ? ` : `, ${el} = ? `;
            items3.push(req.body[el]);
        }
    });
    if(sql3.length > 1) {
        sql3 += ` WHERE id_MENU = ? ; `;
        items3.push(key);
        sql3 = maria.format(sql3, items3);
    }

    let sql4 = 'UPDATE NUTRIENT ut							'	
                + 'SET calorie = (                              '
                + '		SELECT (protein*4 + sugar*4 + fat*9)    '
                + '		FROM NUTRIENT                           '
                + '		WHERE id_MENU = ?                       '
                + '		)                                       '
                + 'WHERE id_MENU = ?;                           ';
    const items4 = [key, key];
    sql4 = maria.format(sql4, items4);

    /*
    mariadb.getConnection(conn => {
        conn.query(sql1 + sql2 + sql3 + sql4, (err, rows) => {
            if(err) {
                console.log('error excute query : ' + err);
            }

            res.send({ message : 'success', rows: rows });
        });

        conn.release();
    });
    */
});

// 삭제
router.delete('/:category/:key', (req, res) => {
    const key = req.params.key;
    const sql = 'UPDATE MENU SET yn_use = "N" WHERE id = ?; ';
    
    mariadb.getConnection(conn => {
        conn.query(sql, key, (err, rows) => {
            if(err)
                console.log('error excute query : ' + err);
            res.send({ message : 'success', rows: rows });
        });
        conn.release();
    });
})

module.exports = router;