import axios from "axios";

/**
 * 로그인 정보 통신
 */
const TIME_OUT = 300*1000; // promise 요청 타임아웃 시간, 5분

// 에러 처리를 위한 status 선언
const statusError = {
    status: false,
    json: {
        error: ["연결이 원활하지 않습니다. 잠시 후 다시 시도해 주세요."],
    }
};

// 백엔드로 요청할 promise
const requestPromise = (url, option) => {
    // axios를 사용하면 타임아웃을 지정할 수 있으나, fetch의 경우 타임아웃 에러 처리를 별도로 해주어야 한다.
    // return fetch(url, option);
    const instance = axios.create(option);
    return instance.post(url, option);
}

// promise 타임아웃 처리, fetch 사용할 때 필요
// const timeoutPromise = () => {
//     return new Promise((_, reject)=> setTimeout(() => reject(new Error('timeout')), TIME_OUT));
// }

// promise 요청
const getPromise = async (url, option) => {
    // Promise.race()는 가장 빨리 응답받은 결과만 resolve
    // return await Promise.race([requestPromise(url, option), timeoutPromise()]);
    return await requestPromise(url, option);
};

// 백엔드로 로그인 요청
export const loginUser = async (credentials) => {
    const option = {
        headers: {
            'Content-Type' : 'application/json;charset=UTF-8'
        },
        data: JSON.stringify(credentials),
        timeout: TIME_OUT
    };

    const data = await getPromise('/api/user/login', option).catch(() => {
        return statusError;
    });

    if(parseInt(Number(data.status)/100) === 2) {
        const status = data.statusText;
        const code = data.status;
        // const text = await data.text();
        // const json = text.length ? JSON.parse(text) : "";
        const json = data.data;

        return { status, code, json };
    } else {
        return statusError;
    }
};

// 로그아웃
export const logoutUser = async (refreshToken) => {
    const option = {
        headers: {
            'Content-Type' : 'application/json;charset=UTF-8'
        },
        data: JSON.stringify({ refresh_token: refreshToken }),
        timeout: TIME_OUT
    };

    const data = await getPromise('/api/user/logout', option).catch(() => {
        return statusError;
    });

    if(parseInt(Number(data.status)/100) === 2) {
        const status = data.ok;
        const code = data.status;
        const text = await data.text();
        const json = text.length ? JSON.parse(text) : "";
        
        return { status, code, json };
    } else {
        return statusError;
    }
};