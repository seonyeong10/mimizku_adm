import axios from "axios";

const instance = axios.create({
    timeout: 2000,
    headers: { "Content-Type": "application/json" },
});

export default instance;