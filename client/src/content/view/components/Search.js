import 'scss/Search.scss';
import { ACTION } from 'content/common/action';

function search(state, setState, e, isArr = false) {
    const checked = ['checkbox', 'radio'].includes(e.target.type) ? e.target.checked : true;
    const name = e.target.name, word = e.target.value;
    let _keyword = [...state][0];

    if (isArr) { // 배열일 때
        let arr = _keyword[name] ?? [];
        if (checked) arr.push(word);
        else arr = arr.filter(el => el !== word);

        _keyword[name] = arr;
    } else {
        _keyword[name] = word;
        if (!checked) delete _keyword[name];
    }

    setState([_keyword]);
}

export function EmpSearch(props) {
    return(
        <form className="search_wrap">
            <div className="keyword_wrap">
                <span className="headline">SEARCH</span>
                <label htmlFor="keyword" className="in_txt_cmm keyword">
                    <input id="keyword" type="text" placeholder='write keyword'/>
                    <img src="/images/search.svg" alt="search"/>
                </label>
            </div>
            <div className="select_wrap">
                <span>부서</span>
                <div className='bundle'>
                    <input id="dept1" type="checkbox"/>
                    <label htmlFor="dept1">
                        dept #01
                    </label>
                    <input id="dept2" type="checkbox"/>
                    <label htmlFor="dept2">
                        dept #02
                    </label>
                    <input id="dept3" type="checkbox"/>
                    <label htmlFor="dept3">
                        dept #03
                    </label>
                    <input id="dept4" type="checkbox"/>
                    <label htmlFor="dept4">
                        dept #04
                    </label>
                    <input id="dept5" type="checkbox"/>
                    <label htmlFor="dept5">
                        dept #05
                    </label>
                    <input id="dept6" type="checkbox"/>
                    <label htmlFor="dept6">
                        dept #06
                    </label>
                </div>
            </div>
            <div className="select_wrap">
                <span>직급</span>
                <div className='bundle'>
                    <input id="pos1" type="checkbox"/>
                    <label htmlFor="pos1">
                        position #01
                    </label>
                    <input id="pos2" type="checkbox"/>
                    <label htmlFor="pos2">
                        position #02
                    </label>
                    <input id="pos3" type="checkbox"/>
                    <label htmlFor="pos3">
                        position #03
                    </label>
                </div>
            </div>
            <div className="select_wrap">
                <span>기간</span>
                <div className='bundle'>
                    <label htmlFor="opt_season">
                        <input type="date" name="start" />
                    </label>
                    ~
                    <label htmlFor="opt_MD">
                        <input type="date" name="end" />
                    </label>
                </div>
            </div>
        </form>
    );
}

export function MenuSearch(props) {
    return(
        <form className="search_wrap">
            <div className="keyword_wrap">
                <span className="headline">SEARCH</span>
                <label htmlFor="keyword" className="in_txt_cmm keyword">
                    <input id="keyword" type="text" placeholder='write keyword'/>
                    <img src="/images/search.svg" alt="search"/>
                </label>
            </div>
            <div className="select_wrap">
                <span>Category</span>
                <div className='bundle'>
                    {
                        props.ctg.map(el => {
                            return(
                                <span>
                                    <input id={`ctg_${el}`} type="checkbox" name='sub_clas' value={el} onChange={e => props.search(ACTION.APPEND, e)}/>
                                    <label htmlFor={`ctg_${el}`}>{el}</label>
                                </span>
                            )
                        })
                    }
                </div>
            </div>
            <div className="select_wrap">
                <span>Options</span>
                <div className='bundle'>
                    <input id="opt_season" type="checkbox" name='yn_season' value='Y' onChange={e => props.search(ACTION.WRITE, e)}/>
                    <label htmlFor="opt_season">
                        SEASON
                    </label>
                    <input id="opt_MD" type="checkbox" name='yn_recomm' value='Y' onChange={e => props.search(ACTION.WRITE, e)}/>
                    <label htmlFor="opt_MD">
                        MD pick
                    </label>
                </div>
            </div>
            <div className="select_wrap">
                <span>기간</span>
                <div className='bundle'>
                    <label htmlFor="opt_season">
                        <input type="date" name="dt_start" onChange={e => props.search(ACTION.WRITE, e)}/>
                    </label>
                    ~
                    <label htmlFor="opt_MD">
                        <input type="date" name="dt_end" onChange={e => props.search(ACTION.WRITE, e)} />
                    </label>
                </div>
            </div>
        </form>
    );
}