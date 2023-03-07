import Left from 'content/include/Left'
import Top from 'content/include/Top';
import { useSelector } from 'react-redux';
import Component from '../Component';

export default function Home (props) {
    const authenticated = useSelector(state => state.authToken.authenticated);
    if(!authenticated) {
        window.location.replace("/login");
        return null;
    }
    return(
        <div>
            <Top />
            <Left />
            <Component />
        </div>
    );
}