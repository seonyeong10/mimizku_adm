const express = require('express');
const router = express.Router();
const multer = require('multer');   // 파일 업로드

// 저장소 지정
const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, '/files');
    },
    filename: function (req, file, callback) {
        const extension = file.originalname.split('.')[1];
        callback(null, Date.now() + '.' + extension);
    }
});
// 업로드
const upload = multer({ storage : storage }).single('file');

// 파일 업로드
router.post('/', (req, res) => {
    upload(req, res, function (err) {
        // 에러 발생
        if(err) {
            console.log(err);
            res.send({ message : 'file upload error' });
            return
        }
        // 정상 업로드
        res.send({ message : 'success' });
    });
});

module.exports = router;