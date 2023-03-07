import { useState } from 'react';
import { useDispatch } from 'react-redux';
import 'scss/Login.scss';
import { loginUser } from 'content/utils/users';
import { setRefreshToken } from 'store/Cookie';
import { SET_TOKEN } from 'store/Auth';
import { useNavigate } from 'react-router-dom';

export default function Login(props) {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [register, setValue] = useState();

    const onSubmit = async () => {
        // 백엔드로부터 받은 응답
        const response = await loginUser({ id: register.id, password: register.password });
        
        // input 값 비우기
        setValue({...register, password: ''});

        if(response.status) {
            // 쿠키에 Refresh Toke, store에 Access Token 저장
            console.log(response);
            const messgae = response.json.message;
            if(messgae === '-1') {
                alert('비밀번호를 입력해주세요.');
                return;
            } else if(messgae === '-2') {
                alert('아이디 또는 비밀번호가 일치하지 않습니다.');
                return;
            }
            setRefreshToken(response.json.refresh_token);
            dispatch(SET_TOKEN(response.json.access_token));

            return navigate("/");
        } else {
            console.log(response.json);
        }
    }

    return(
        <form id="login" onSubmit={(e) => e.preventDefault()}>
            <div className="enter_wrap">
                <div className="logo_login">
                    <img src='/images/Logo_login.svg' alt='logo'/>
                </div>
                <input type="text" name="emp_no"
                       className='in_txt_cmm'
                       placeholder='Employee number'
                       onChange={(e) => setValue({...register, id: e.target.value})}
                />
                <input type="password" name="emp_pw"
                       className='in_txt_cmm'
                       placeholder='password'
                       value={register?.password}
                       onChange={(e) => setValue({...register, password: e.target.value})}
                />
            </div>
            <div className="login_button_wrap">
                <button className='cmm_filled_button' onClick={onSubmit}>Log In</button>
            </div>
        </form>
    );
}