import Top from 'content/include/Top';
import Left from 'content/include/Left';
import { Outlet } from 'react-router-dom';

export default function StaffHome(props) {
    console.log('staff');
    return(
        <div>
            <Top />
            <Left ctg='staff'/>
            <Outlet />
        </div>
    );
}