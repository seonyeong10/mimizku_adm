import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from 'content/utils/userLoginAction';
import { getCookieToken, removeCookieToken } from 'store/Cookie';
import { DELETE_TOKEN } from 'store/Auth';
import { useNavigate } from 'react-router-dom';

export default function Logout() {
    // store에 저장된 Access Token 정보를 받아온다
    const accessToken = useSelector(state => state.authToken.accessToken);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Cookie에 저장된 Refresh Token 정보를 받아온다
    const refreshToken = getCookieToken();

    async function logout() {
        // 백엔드로부터 받은 응답
        const data = await logoutUser({ refresh_token: refreshToken }, accessToken);

        if(data.status) {
            // store에 저장된 Access Token 정보들 삭제
            dispatch(DELETE_TOKEN());
            // Cookie에 저장된 Refresh Token 정보들 삭제
            removeCookieToken();
            alert(data.json.message);
            return navigate("/");
        } else {
            window.location.reload();
        }
    }

    // 해당 컴포넌트가 요청된 후 한 번만 실행되면 되기 때문에 useEffect 훅 사용
    useEffect(() => {
        logout();
    }, []);
    
    return (
        <div>LOG OUT</div>
    );
}