import 'scss/List.scss';
import axios from 'axios';
import { useAsyncSkip } from 'content/utils/useAsync';

export function ListFooter(props) {
    if(props.count < props.search[0].perPage) {
        return null;
    }

    const pages = [];
    const currPage = props.search[0].page;
    const perPage = props.search[0].perPage;
    const prevPage = (parseInt(currPage/5) - 1) * 5, nextPage = (parseInt(currPage/5) + 1) * 5; 

    for(let i=(nextPage-4) ; i <= nextPage ; i++) {
        pages.push(parseInt(i));
    }

    const goPage = (name, page) => {
        if(page < 0) {
            alert('첫 페이지 입니다.');
            return;
        } else if(page * perPage > props.count) {
            // alert('마지막 페이지 입니다.');
            // return;
        }
        
        let _keyword = [...props.search][0];
        _keyword[name] = page;
        props.setSearch([_keyword]);
    }

    return(
        <form className='cmm_list_footer'>
            <select name='perPage' className='cmm_outlined_dropbox' value={perPage} onChange={(e) => goPage('perPage', e.target.value)}>
                <option value='10'>10 of Total</option>
                <option value='15'>15 of Total</option>
            </select>

            <ul className='page_wrap'>
                <li onClick={() => goPage('page', prevPage)}>
                    <img src='/images/arrow_back_ios.svg' alt='prev'/>
                </li>
                {
                    pages.map((page, idx) => {
                        const isCurr = (currPage+1 === page) ? 'curr' : '';
                        return <li key={`page${page}`} className={isCurr} onClick={() => goPage('page', page-1)}>{page}</li>;
                    })
                }
                <li onClick={() => goPage('page', nextPage)}>
                    <img src='/images/arrow_forward_ios.svg' alt='next'/>
                </li>
            </ul>
        </form>
    );
}

/*
async function getList(url) {
    const response = await axios.get(url);
    return response.data;
}
*/

export function List(props) {
    const path = window.location.pathname;
    // console.log(props.search[0]);
    const getList = async () => {
        const response = await axios.get(`/api/${path}`, {
            params: props.search[0]
        });
        return response.data;
    }

    const [state, refetch] = useAsyncSkip(getList, [props.search], false);

    /*
    const [data, refetch] = useState({
        drink : [
            { id: 1, no : 1, ctg:'COFFEE', img:'/images/Logo.svg', name: '아메리카노', name_eng: 'Americano', fee: '2,500', st_dt: '2000.01.01', end_dt: '-', use_yn: 'Y', season_yn: 'N', recomm_yn: 'N' },
            { id: 2, no : 2, ctg:'COFFEE', img:'/images/Logo.svg', name: '아메리카노', name_eng: 'Americano', fee: '2,500', st_dt: '2000.01.01', end_dt: '-', use_yn: 'Y', season_yn: 'N', recomm_yn: 'N' },
            { id: 3, no : 3, ctg:'COFFEE', img:'/images/Logo.svg', name: '아메리카노', name_eng: 'Americano', fee: '2,500', st_dt: '2000.01.01', end_dt: '-', use_yn: 'Y', season_yn: 'N', recomm_yn: 'N' },
            { id: 4, no : 4, ctg:'COFFEE', img:'/images/Logo.svg', name: '아메리카노', name_eng: 'Americano', fee: '2,500', st_dt: '2000.01.01', end_dt: '-', use_yn: 'Y', season_yn: 'N', recomm_yn: 'N' },
            { id: 5, no : 5, ctg:'COFFEE', img:'/images/Logo.svg', name: '아메리카노', name_eng: 'Americano', fee: '2,500', st_dt: '2000.01.01', end_dt: '-', use_yn: 'Y', season_yn: 'N', recomm_yn: 'N' },
            { id: 6, no : 6, ctg:'COFFEE', img:'/images/Logo.svg', name: '아메리카노', name_eng: 'Americano', fee: '2,500', st_dt: '2000.01.01', end_dt: '-', use_yn: 'Y', season_yn: 'N', recomm_yn: 'N' },
            { id: 7, no : 7, ctg:'COFFEE', img:'/images/Logo.svg', name: '아메리카노', name_eng: 'Americano', fee: '2,500', st_dt: '2000.01.01', end_dt: '-', use_yn: 'Y', season_yn: 'N', recomm_yn: 'N' },
            { id: 8, no : 8, ctg:'COFFEE', img:'/images/Logo.svg', name: '아메리카노', name_eng: 'Americano', fee: '2,500', st_dt: '2000.01.01', end_dt: '-', use_yn: 'Y', season_yn: 'N', recomm_yn: 'N' },
            { id: 9, no : 9, ctg:'COFFEE', img:'/images/Logo.svg', name: '아메리카노', name_eng: 'Americano', fee: '2,500', st_dt: '2000.01.01', end_dt: '-', use_yn: 'Y', season_yn: 'N', recomm_yn: 'N' },
            { id: 10, no : 10, ctg:'COFFEE', img:'/images/Logo.svg', name: '아메리카노', name_eng: 'Americano', fee: '2,500', st_dt: '2000.01.01', end_dt: '-', use_yn: 'Y', season_yn: 'N', recomm_yn: 'N' },
        ],
        employee: [
            { id: 1, no: 1 , img: '/images/Logo.svg', nm: '권은비', dept: 'Mnet', team: 'IZone', position: '리더', location: '변동', state: '근무', enter: '1995.09.27', etc: '' },
            { id: 2, no: 2 , img: '/images/Logo.svg', nm: '미야와키 사쿠라', dept: 'Mnet', team: 'IZone', position: '서브보컬', location: '변동', state: '근무', enter: '1998.03.19', etc: '' },
            { id: 3, no: 3 , img: '/images/Logo.svg', nm: '강혜원', dept: 'Mnet', team: 'IZone', position: '리드래퍼', location: '변동', state: '근무', enter: '1999.07.05', etc: '' },
            { id: 4, no: 4 , img: '/images/Logo.svg', nm: '최예나', dept: 'Mnet', team: 'IZone', position: '래퍼', location: '변동', state: '근무', enter: '1999.09.29', etc: '' },
            { id: 5, no: 5 , img: '/images/Logo.svg', nm: '이채연', dept: 'Mnet', team: 'IZone', position: '메인댄서', location: '변동', state: '근무', enter: '2000.01.11', etc: '' },
            { id: 6, no: 6 , img: '/images/Logo.svg', nm: '김채원', dept: 'Mnet', team: 'IZone', position: '리드보컬', location: '변동', state: '근무', enter: '2000.08.01', etc: '' },
            { id: 7, no: 7 , img: '/images/Logo.svg', nm: '김민주', dept: 'Mnet', team: 'IZone', position: '서브보컬', location: '변동', state: '휴직', enter: '2001.02.05', etc: '' },
            { id: 8, no: 8 , img: '/images/Logo.svg', nm: '야부키 나코', dept: 'Mnet', team: 'IZone', position: '리더', location: '변동', state: '근무', enter: '2001.06.18', etc: '' },
            { id: 9, no: 9 , img: '/images/Logo.svg', nm: '혼다 히토미', dept: 'Mnet', team: 'IZone', position: '서브보컬', location: '변동', state: '근무', enter: '2001.10.06', etc: '' },
            { id: 10, no: 10 , img: '/images/Logo.svg', nm: '조유리', dept: 'Mnet', team: 'IZone', position: '메인보컬', location: '변동', state: '근무', enter: '2001.10.22', etc: '' },
            { id: 11, no: 11 , img: '/images/Logo.svg', nm: '안유진', dept: 'Mnet', team: 'IZone', position: '리드보컬', location: '변동', state: '근무', enter: '2003.09.01', etc: '' },
            { id: 12, no: 12 , img: '/images/Logo.svg', nm: '장원영', dept: 'Mnet', team: 'IZone', position: '센터', location: '변동', state: '근무', enter: '2004.08.31', etc: '' }
        ],
    });
    */

    const { loading, data : items, error } = state;  // state.data를 data 키워드로 조회

    if (loading) 
        return (
            <div className='cmm_list'>
                <ul>
                    <li className='list_title'>
                        { props.tit.map(tit => { return(<p key={tit}>{tit}</p> ); }) }
                    </li>
                    <li className='list_data curr_state'>로딩중...</li>
                </ul>
            </div>
        );
    if (error) 
        return (
            <div className='cmm_list'>
                <ul>
                    <li className='list_title'>
                        { props.tit.map(tit => { return(<p key={tit}>{tit}</p> ); }) }
                    </li>
                    <li className='list_data curr_state'>에러가 발생했습니다.</li>
                </ul>
            </div>
        );
    if (!items || items.rows.length < 1)
        return (
            <div className='cmm_list'>
                <ul>
                    <li className='list_title'>
                        { props.tit.map(tit => { return(<p key={tit}>{tit}</p> ); }) }
                    </li>
                    <li className='list_data curr_state'>데이터가 없습니다.</li>
                </ul>
            </div>
        );
    
    return(
        <div className='cmm_list'>
            <ul>
                <li className='list_title'>
                    { props.tit.map(tit => { return(<p key={tit}>{tit}</p> ); }) }
                </li>
                {
                    items.rows?.map((el, idx) => {     
                        const keys = Object.keys(el);

                        const pTag = keys.map((key, idx) => {
                            if(key === 'pic') {
                                const imgSrc = el.pic === (null || '') ? '/images/Logo.svg' : `/api/image/${el.pic}`;
                                return <p key={`${el.id}${idx}`}><img src={imgSrc} alt='img'/></p>;
                            } else if(key === 'nm') {
                                return <p key={`${el.id}${idx}`} className='name'>{el.nm}<span className='footnode'>{el.nm_eng}</span></p>;
                            } else if(key !== 'nm_eng' && key !== 'id') {
                                return <p key={`${el.id}${idx}`}>{el[key]}</p>;
                            }
                        });

                        // <li key={el.id} className='list_data' onClick={() => window.location.href=`${path}/${el.id}`}>
                        return(
                            <li key={el.id + idx} className='list_data' onClick={() => props.refetch('VIEW', el.id)}>
                                {pTag}
                            </li>
                        );
                    })
                }
            </ul>
            <ListFooter count={state?.data?.rows.length ?? 0} search={props.search} setSearch={props.setSearch}/>
        </div>
    );
}