const express = require("express");
const app = express();
const test = require("./Router/test");
const drink = require("./Router/Menu/drink");
const staff = require("./Router/Staff/staff");
const files = require("./Router/Common/file_service");
const users = require("./Router/User/users");

app.use(express.json());    // post 데이터
app.use("/api", test);
app.use("/api/user", users);
// app.use("/api/upload", upload); // 파일 업로드
app.use("/api/image", files);
app.use("/api/menu", drink);
app.use("/api/staff", staff);

const port = 5000;
app.listen(port, () => console.log(`${port}`));