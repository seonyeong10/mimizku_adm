import { useCookies } from 'react-cookie';
import axiosInstance from './api';
import { SET_TOKEN } from '../../store/Auth';

/** Access Token 만료 확인 및 Refresh Token 발급 */
const setUpInterceptor = (store) => {
    /** 토큰 만료 확인 */
    axiosInstance.interceptors.request.use(
        async (config) => {
            const authToken = store.getState().authToken;

            if(authToken.accessToken) {
                config.headers["Authorization"] = `Baere ${authToken.accessToken}`; // x-access-token
            }
            return config;
        },
        error => {
            return Promise.reject(error);
        }
    );

    const { dispatch } = store;
    /** 토큰 재발급 */
    axiosInstance.interceptors.response.use(
        // 유효한 토큰이면 사용자 정보를 return
        (res) => {
            return res;
        },
        // 유효하지 않은 토큰이면 재발급
        async (err) => {
            const originalConfig = err.config;
            // console.log(err);
            if(err.response.data.code === 401) {
                console.log('code 401');
                console.log(err.response.data.message);
            } else if(err.response.data.code === 419) {
                // 재발급
                try {
                    console.log('reissue!!');
                    const rs = await axiosInstance.post("/api/user/reissue");
                    const accessToken = rs.data.access_token;
                    console.log('accessToken >>> ', accessToken);
                    dispatch(SET_TOKEN(accessToken));
                    return axiosInstance(originalConfig);
                } catch(e) {
                    return Promise.reject(e);
                }
            }

            /*
            if(originalConfig.url !== "/login" && err.response) {
                // Access Token was expire
                if (err.response.status === 401 && !originalConfig._retry) {
                    originalConfig._retry = true;

                    try {
                        const rs = await axiosInstance.post("/api/user/reissue");

                        const { accessToken } = rs.data;

                        dispatch(SET_TOKEN(accessToken));
                        return axiosInstance(originalConfig);
                    } catch(_error) {
                        return Promise.reject(_error);
                    }
                }
            }
            */

            return Promise.reject(err);
        }
    );
}

export default setUpInterceptor;