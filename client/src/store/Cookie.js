/** Refresh Token 저장소 */
import { Cookies } from 'react-cookie';

const cookies = new Cookies();

// Refresh Token을 Cookie에 저장한다
export const setRefreshToken = (refreshToken) => {
    const today = new Date();
    const expireDate = today.setDate(today.getDate() + 7);

    return cookies.set('refresh_token', refreshToken, {
        sameSite: 'strict',
        path: '/',
        expires: new Date(expireDate)
    });
};

// Cookie에 저장된 Refresh Token 값을 가지고 온다
export const getCookieToken = () => {
    return cookies.get('refresh_token');
};

// Cookie를 삭제한다 (로그아웃할 때 사용)
export const removeCookieToken = () => {
    return cookies.remove('refresh_token', { sameSite: 'strict', path: '/' });
}