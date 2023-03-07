import { Link } from 'react-router-dom';
import 'scss/Left.scss';

export default function Left (props) {
    const sub = {
        menu: [
            { name: '음료', url : '/menu/drink' },
            { name: '음식', url : '/menu/food' },
            { name: '상품', url : '/menu/goods' },
            { name: '영양정보' , url : '/menu/nutrient' },
            { name: '옵션', url : '/menu/option' },
        ],
        staff: [
            { name: '직원', url: '/staff/employee' }
        ]
    };
    return(
        <div id='left'>
            <ul>
                {
                    sub[props.ctg] && sub[props.ctg].map(el => {
                        return <li key={el.name}><Link to={el.url} onClick={() => props.refetch()}>{el.name}</Link></li>
                    })
                }
            </ul>
        </div>
    );
}