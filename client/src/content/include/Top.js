import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import 'scss/Top.scss';
import { useEffect } from 'react';
import api from 'content/utils/api'; // axios interceptor 호출

export default function Top(props) {
    const curr = window.location.pathname.split('/')[1];
    const navigate = useNavigate();
    const auth = useSelector(state => state.authToken);

    // how to use in service
    const getUserInfo = async () => {
        return await api.get("/api/user/loginInfo");
    }

    useEffect(() => {
        getUserInfo().catch(rej => {
            console.log(rej);
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
                <img src='/images/face.svg' alt='user'/>
                <span>ADMINISTRATOR</span>
                <Link to='/logout'><img src='/images/logout.svg' alt='logout'/></Link>
            </div>
        </div>
    );
}