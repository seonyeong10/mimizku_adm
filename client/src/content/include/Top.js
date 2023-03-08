import { Link } from 'react-router-dom';
import 'scss/Top.scss';
import { useEffect } from 'react';
import api from 'content/utils/api'; // axios interceptor 호출
import { useState } from 'react';

export default function Top(props) {
    const curr = window.location.pathname.split('/')[1];
    const [userInfo, setInfo] = useState({});

    // how to use in service
    const getUserInfo = async () => {
        return await api.get("/api/user/loginInfo");
    }

    useEffect(() => {
        getUserInfo()
        .then(resolve => {
                setInfo(resolve.data.user);
            })
            .catch(reject => {
                console.log(reject);
            });
    }, []);

    return(
        <div id='top'>
            <div className='menu_wrap'>
                <div className='top_logo_wrap'>
                    <img src='/images/Logo.svg' alt='logo'/>
                </div>
                <div className='menu'>
                    <Link to={'/'} className={`title ${curr === 'dashboard' ? 'curr' : ''}`}>DASHBOARD</Link>
                    <Link to={'/menu/drink'} className={`title ${curr === 'menu' ? 'curr' : ''}`}>MENU</Link>
                    <Link to={'/sale'} className={`title ${curr === 'sale' ? 'curr' : ''}`}>SALES</Link>
                    <Link to={'/staff/employee'} className={`title ${curr === 'staff' ? 'curr' : ''}`}>STAFF</Link>
                </div>
            </div>
            <div className='user_wrap'>
                <img src={userInfo?.pic ? `/api/image/${userInfo.pic}` : '/images/face.svg'} alt='user'/>
                <span>{userInfo?.name ?? 'anonymous'}</span>
                <Link to='/logout'><img src='/images/logout.svg' alt='logout'/></Link>
            </div>
        </div>
    );
}