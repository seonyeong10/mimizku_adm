import Top from 'content/include/Top';
import Left from 'content/include/Left';
import { Outlet } from 'react-router-dom';

export default function MenuHome(props) {
    return(
        <div>
            <Top />
            <Left ctg='menu'/>
            <Outlet />
        </div>
    );
}