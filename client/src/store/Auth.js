/** Access Token 
 *  저장소로 Redux 사용
*/
import { createSlice } from '@reduxjs/toolkit';

export const TOKEN_TIME_OUT = 600*1000;

/**
 * authenticated : 현재 로그인 여부
 * accessToken : Access Token 저장
 * expireTime : Access Token 만료 시간
 * SET_TOKEN : Access Token의 정보를 저장
 * DELETE_TOKEN : 값을 모두 초기화 함으로써 Access Token에 대한 정보도 삭제
 */
export const tokenSlice = createSlice({
    name: 'authToken',
    initialState: {
        authenticated: false,
        accessToken: null,
        expireTime: null,
    },
    reducers: {
        SET_TOKEN: (state, action) => {
            state.authenticated = true;
            state.accessToken = action.payload;
            state.expireTime = new Date().getTime() + TOKEN_TIME_OUT;
        },
        DELETE_TOKEN: (state) => {
            state.authenticated = false;
            state.accessToken = null;
            state.expireTime = null;
        },
    }
});

export const { SET_TOKEN, DELETE_TOKEN } = tokenSlice.actions;

export default tokenSlice.reducer;