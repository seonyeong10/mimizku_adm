import Title from 'content/view/components/Title';
import { EmpSearch } from 'content/view/components/Search';
import { List } from 'content/view/List';
import { preview } from 'content/utils/form';
import { InfoButton, UpdateButton } from 'content/view/components/Buttons';
import { useEffect, useReducer, useRef, useState } from 'react';
import Grid from '@toast-ui/react-grid';
import 'tui-grid/dist/tui-grid.css';
import 'tui-date-picker/dist/tui-date-picker.css';
import { createFile, formatter, erase, multiErase } from 'content/utils/form';
import axios from 'axios';

function reducer(state, action) {
    const name = action.item?.name;
    const value = action.item?.value;
    let count = 0;

    switch(action.type) {
        case 'WRITE'  : return { ...state, [name] : value };
        case 'APPEND' : 
            let arr = state[name] ?? [];
            arr = arr.filter(el => el !== value);
            if(action.item.checked) arr.push(value);
            return { ...state, [name] : arr };
        case 'INCREASE' : 
            count = state[name] ?? 0;
            return { ...state, [name] : count+1 };
        case 'DECREASE' :
            count = (state[name] ?? 0) - 1; 
            if(count < 0) count = 0;
            return { ...state, [name] : count };
        case 'FILE' : return { ...state, [name] : action.item.files[0] }
        case 'FETCH' : return action.item;
        case 'CLEAR' : return {};
        default : return state;
    }
}

function gridReducer(state, action) {
    const _state = [...state];
    const name = action.data?.columnName;
    const value = action.data?.value;

    switch(action.type) {
        case 'WRITE' : 
            _state[action.data.rowKey][name] = value;
            return _state;
        case 'APPEND' : 
            _state.push({ key : _state.length });
            return _state;
        case 'FETCH' : return action.item;
        case 'REMOVE' : 
            _state.splice(_state.length - 1, 1); 
            return _state;
        case 'CLEAR' : return [];
        default : return state;
    }
}

// formData
function saveInFd(data, formData) {
    const keys = Object.keys(data);
    for(const key of keys) {
        formData.append(key, data[key]);
    }
}

export function EmpForm(props) {
    const param = props.state.data;
    const [item, dispatch] = useReducer(reducer, {});
    const [dept, setDept] = useReducer(gridReducer, []);
    const [edu, setEdu] = useReducer(gridReducer, []);
    const [cert, setCert] = useReducer(gridReducer, []);
    const [cCode, getCode] = useReducer(reducer, {});
    const gridRef = useRef([]);
    const [remove, setRemove] = useState({removeDept: [], removeEdu: [], removeCert: []});
    let title = '', button = <div></div>;
    const fileStyle = item.img_emp ? {background: `url(http://localhost:3000/api/image/${item.img_emp}) center/cover no-repeat`} : {};

    useEffect(() => {
        if(param) 
            axios.get(`/api/staff/employee/${param}`)
                .then(res => {
                    console.log(res.data);
                    getCode({ type: 'FETCH', item: res.data.common }); 
                    dispatch({ type : 'FETCH', item : res.data.rows[0][0]});
                    setDept({ type : 'FETCH', item : res.data.rows[1] });
                    setEdu({ type : 'FETCH', item : res.data.rows[2] });
                    setCert({ type : 'FETCH', item : res.data.rows[3] });
                })
                .catch(err => console.log(err));
        else 
            axios.get('/api/staff/common')
                 .then(res => {
                    getCode({ type: 'FETCH', item: res.data.common }); 
                    dispatch({ type : 'WRITE' , item: {name: 'id', value: res.data.emp.id} });
                 });
    }, [param]);

    console.log(cCode);

    const afterChange = (e) => {
        const section = e.instance.el.parentElement.className.split(' ')[1];
        // setDept({ type: 'WRITE', data: e.changes[0] });
        switch(section) {
            case 'dept' : setDept({ type: 'WRITE', data: e.changes[0] }); break; 
            case 'edu' : setEdu({ type: 'WRITE', data: e.changes[0] }); break; 
            case 'cert' : setCert({ type: 'WRITE', data: e.changes[0] }); break;
            default : return; 
        }
    }

    const columns = {
        dept : [
            { header: '시작일', name: 'dt_start', editor: 'datePicker' },
            { header: '종료일', name: 'dt_end', editor: 'datePicker' },
            { header: '부서', name: 'dept', formatter: 'listItemText',
              editor: {
                type: 'select',
                options: {
                    listItems: [
                        {text:'인사총무', value:'100'},
                        {text:'인재개발', value:'200'},
                        {text:'사업기획', value:'300'},
                        {text:'사업지원', value:'400'},
                        {text:'사업수행', value:'500'},
                        {text:'IT', value:'600'},
                    ]
                }
              },
              relations: [
                {
                    targetNames: ['team'],
                    listItems({ value }) {
                        let items;
                        if(value === '100') {
                            items = [{text:'인사팀', value:'001'},{text:'재무팀', value:'002'}];
                        } else if(value === '300') {
                            items = [{text:'신규사업', value:'301'},{text:'기획', value:'302'},{text:'마케팅', value:'303'}];
                        } else if(value === '400') {
                            items = [{text:'구매', value:'401'},{text:'물류', value:'402'}];
                        } else if(value === '500') {
                            items = [{text:'1사업장', value:'501'},{text:'2사업장', value:'502'},{text:'3사업장', value:'503'}];
                        } else if(value === '600') {
                            items = [{text:'개발', value:'601'},{text:'유지보수', value:'602'},{text:'보안', value:'603'}];
                        }
                        return items;
                    }
                }
              ],
            },
            { header: '팀', name: 'team', formatter: 'listItemText',
              editor: {
                type: 'select',
                options: {listItems:[]}
              }
            },
            { header: '근무지', name: 'location', editor: 'text' },
            { header: '직급', name: 'position', formatter: 'listItemText',
              editor: { 
                type: 'select', 
                options: { 
                    listItems: cCode?.length > 0 ? cCode.position : []
                } 
              } 
            },
        ],
        edu : [
            { header: '시작일', name: 'dt_start', 
              editor: { type: 'datePicker', options: { format: 'yyyy-MM', type:'month' } }, 
            },
            { header: '종료일', name: 'dt_end', 
              editor: { type: 'datePicker', options: { format: 'yyyy-MM', type:'month' } }, 
            },
            { header: '학교명', name: 'school', editor: 'text' },
            { header: '학과', name: 'dept', editor: 'text' },
            { header: '학력', name: 'degree', editor: 'text' },
            { header: '학점', name: 'score', editor: 'text' },
            { header: '졸업', name: 'graduate', formatter: 'listItemText',
              editor: { type: 'radio', options: { listItems: [{ text:'졸업', value: '0' }, { text:'재학', value: '1' }] } } 
            },
        ],
        cert : [
            { header: '자격이름', name: 'nm', editor: 'text' },
            { header: '발행기관', name: 'agency', editor: 'text' },
            { header: '취득일', name: 'dt_in', editor: 'datePicker' },
            { header: '등급', name: 'level', editor: 'text' },
            { header: '비고', name: 'note', editor: 'text' },
        ],
    };

    const appendRow = ({target = 'dept'}) => {
        console.log('append row');
        switch(target) {
            case 'dept' : setDept({ type: 'APPEND' }); break;
            case 'edu' : setEdu({ type: 'APPEND' }); break;
            case 'cert' : setCert({ type: 'APPEND' }); break;
            default : return;
        }
    }

    const removeRow = ({target = ''}) => {
        console.log('remove row');
        let arr, value;
        const _remove = {...remove};
        switch(target) {
            case 'dept' : 
                arr = [..._remove.removeDept];
                value = dept[dept.length-1].key;
                arr = arr.filter(el => el !== value);
                arr.push(value);
                setRemove({..._remove, removeDept : arr});
                setDept({ type: 'REMOVE' }); 
                break;
            case 'edu' : 
                arr = [..._remove.removeEdu];
                value = edu[edu.length-1].key;
                arr = arr.filter(el => el !== value);
                arr.push(value);
                setRemove({..._remove, removeDept : arr});
                setEdu({ type: 'REMOVE' }); 
                break;
            case 'cert' :
                arr = [..._remove.removeCert];
                value = cert[cert.length-1].key;
                arr = arr.filter(el => el !== value);
                arr.push(value);
                setRemove({..._remove, removeDept : arr});
                setCert({ type: 'REMOVE' }); 
                break;
            default : return _remove;
        }
    }

    const onSubmit = (e) => {
        console.log('submit');
        const fd = new FormData();
        saveInFd(item, fd);
        fd.append('dept', JSON.stringify(dept))
        fd.append('edu', JSON.stringify(edu));
        fd.append('cert', JSON.stringify(cert));

        createFile(fd, '/api/staff/employee');
    }
    const onUpdate = () => {
        console.log('update');
        const fd = new FormData();
        saveInFd(item, fd);
        saveInFd(remove, fd);
        fd.append('dept', JSON.stringify(dept))
        fd.append('edu', JSON.stringify(edu));
        fd.append('cert', JSON.stringify(cert));

        const entries = fd.entries();
        for(const pair of entries) {
            console.log(pair[0], pair[1]);
        }
        createFile(fd, `/api/staff/employee/${param}`);
    }
    const onDelete = () => {
        console.log('delete');
        multiErase({ file: item.img_emp }, `/api/staff/employee/${param}`);
        // erase(`/api/staff/employee/${param}`, '/staff/employee');
    }

    if(!param) {
        title = '등록';
        button = <InfoButton onSubmit={e => onSubmit(e)} replace={`/menu/goods/add`}  refetch={props.refetch}/>
    } else {
        title = '상세';
        button = <UpdateButton onSubmit={() => onUpdate()} onDelete={() => onDelete()} replace={`/staff/employee/${param.id}`} refetch={props.refetch}/>;
    }
    return(
        <div id="body">
            <Title bigTit={`직원 ${title}`} button={props.state} refetch={props.refetch}/>
            <form className='cmm_info_wrap' encType='multipart/form-data' onSubmit={e => e.preventDefault()}>
                <div className='cmm_info_container'>
                    <h3 className='headline'>기본정보 <img src='/images/info.svg' alt='info' style={{ verticalAlign: 'middle' }} /></h3>
                    <div className='flex_item' style={{borderBottom: '1px solid #2B2B2B', borderTop: '1px solid #2B2B2B'}}>
                        <div className='file_item'>
                            <input id='img_emp' type='file' name='img_emp' onChange={e => preview(e, (type, item) => dispatch({ type: type, item: item }))}/>
                            <label htmlFor='img_emp' id='preview_img_emp' style={fileStyle}></label>
                        </div>
                        <ul className='info_item'>
                            <li className='info_columns opt'>
                                <div>
                                    <span>이름</span>
                                    <input type='text' name='nm' className='in_txt_small' value={item?.nm ?? ''} onChange={(e) => dispatch({ type : 'WRITE' , item: e.target })}/>
                                </div>
                                <div>
                                    <span>영문이름</span>
                                    <input type='text' name='nm_eng' className='in_txt_small' value={item?.nm_eng ?? ''} onChange={(e) => dispatch({ type : 'WRITE' , item: e.target })}/>
                                </div>
                            </li>
                            <li className='info_columns opt'>
                                <div>
                                    <span>연락처</span>
                                    <input type='text' name='phone' className='in_txt_small' 
                                           value={item?.phone ?? ''} onChange={(e) => formatter({type: 'PHONE', target: e.target, reducer: dispatch})}/>
                                </div>
                                <div>
                                    <span>이메일</span>
                                    <input type='text' name='email' className='in_txt_small' value={item?.email ?? ''} onChange={(e) => dispatch({ type : 'WRITE' , item: e.target })}/>
                                </div>
                            </li>
                            <li className='info_columns opt'>
                                <div>
                                    <span>생년월일</span>
                                    <input type='date' name='birth' className='in_txt_small' value={item?.birth ?? ''} onChange={(e) => dispatch({ type : 'WRITE' , item: e.target })}/>
                                </div>
                                <div>
                                    <span>(만)나이</span>
                                    <div className='number'>
                                    <input type='number' name='age' className='in_txt_small' pattern='\\d*' value={item?.age ?? 0} onChange={(e) => dispatch({ type : 'WRITE' , item: e.target })} />
                                    <div className='icon_wrap'>
                                        <button className='add'  onClick={() => dispatch({ type : 'INCREASE', item: {name: 'age'} })}></button>
                                        <button className='diff' onClick={() => dispatch({ type : 'DECREASE', item: {name: 'age'} })}></button>
                                    </div>
                            </div>
                                </div>
                            </li>
                            <li className='info_columns opt'>
                                <div>
                                    <span>고용형태</span>
                                    <select className='cmm_minimal_dropbox' name='tp_employ' value={item?.tp_employ ?? ''} onChange={(e) => dispatch({ type : 'WRITE' , item: e.target })}>
                                        <option value=''>고용형태</option> 
                                        { cCode?.employ?.map(el => <option key={el.value} value={el.value}>{el.text}</option>) }
                                    </select>   
                                </div>
                                <div>
                                    <span>직급</span>
                                    <select className='cmm_minimal_dropbox' name='position' value={item?.position ?? ''} onChange={(e) => dispatch({ type : 'WRITE' , item: e.target })}>
                                        <option value=''>직급</option>
                                        { cCode?.position?.map(el => <option key={el.value} value={el.value}>{el.text}</option>) }
                                    </select>
                                </div>
                            </li>
                            <li className='info_columns' style={{gap : 0}}>
                                <span>우편번호</span>
                                <input type='text' name='post' className='in_txt_small' value={item?.post  ?? ''} onChange={(e) => dispatch({ type : 'WRITE' , item: e.target })}/>
                            </li>
                            <li className='info_columns' style={{gap : 0}}>
                                <span>주소</span>
                                <textarea name='addr' className='textarea' value={item?.addr ?? ''} onChange={(e) => dispatch({ type : 'WRITE' , item: e.target })}></textarea>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className='cmm_info_container'>
                    <h3 className='headline'>소속부서 <img src='/images/info.svg' alt='info' style={{ verticalAlign: 'middle' }} /></h3>
                    <div className='cmm_button_area'>
                        <button className="cmm_outlined_button grid" onClick={() => appendRow({target: 'dept'})} ><img src='/images/add_black.svg' alt='add'/>추가</button>
                        <button className="cmm_outlined_button grid" onClick={() => removeRow({target: 'dept'})} ><img src='/images/remove.svg' alt='add'/>삭제</button>
                    </div>
                    <div className='grid_item dept' style={{borderBottom: '1px solid #2B2B2B', borderTop: '1px solid #2B2B2B'}}>
                        <Grid ref={el => gridRef.current[0] = el} columns={columns.dept} data={dept} usageStatistics={false} onAfterChange={afterChange}
                            //   rowHeaders={['checkbox']} onCheck={(ev) => onGrid('dept', ev)}
                        />
                    </div>
                </div>
                <div className='cmm_info_container'>
                    <div className='flex_item'>
                        <div className='info_item'>
                            <h3 className='headline'>학력사항 <img src='/images/info.svg' alt='info' style={{ verticalAlign: 'middle' }} /></h3>
                            <div className='cmm_button_area'>
                                <button className="cmm_outlined_button grid" onClick={() => appendRow({target: 'edu'})} ><img src='/images/add_black.svg' alt='add'/>추가</button>
                                <button className="cmm_outlined_button grid" onClick={() => setEdu({type: 'REMOVE'})} ><img src='/images/remove.svg' alt='add'/>삭제</button>
                            </div>
                            <div className='grid_item edu' style={{borderBottom: '1px solid #2B2B2B', borderTop: '1px solid #2B2B2B'}}>
                                <Grid ref={el => gridRef.current[1] = el} columns={columns.edu} data={edu} usageStatistics={false} onAfterChange={afterChange}/>
                            </div>
                        </div>
                        <div className='info_item'>
                            <h3 className='headline'>자격사항 <img src='/images/info.svg' alt='info' style={{ verticalAlign: 'middle' }} /></h3>
                            <div className='cmm_button_area'>
                                <button className="cmm_outlined_button grid" onClick={() => appendRow({target: 'cert'})} ><img src='/images/add_black.svg' alt='add'/>추가</button>
                                <button className="cmm_outlined_button grid" onClick={() => setCert({type: 'REMOVE'})} ><img src='/images/remove.svg' alt='add'/>삭제</button>
                            </div>
                            <div className='grid_item cert' style={{borderBottom: '1px solid #2B2B2B', borderTop: '1px solid #2B2B2B'}}>
                                <Grid ref={el => gridRef.current[2] = el} columns={columns.cert} data={cert} usageStatistics={false} onAfterChange={afterChange}/>
                            </div>
                        </div>
                    </div>
                </div>
                { button }
            </form>
        </div>
    );
}

export function EmpList(props) {
    const listTitle = ['순번', '사진', '이름', '부서', '팀', '직급', '근무지', '입사일', '비고'];
    // const sCtg = ['CAKE', 'COOKIE', 'SANDWICH'];
    const [keyword, search] = useState([{ perPage: 10, page: 0 }]);

    if(props.state.mode === 0) {
        return (
            <div id='body'>
                <div className='cmm_list_wrap'>
                    <Title bigTit='직원' button={props.state} refetch={props.refetch} />
                    <EmpSearch />
                    <List ctg='employee' tit={listTitle} search={keyword} setSearch={search} refetch={props.refetch}/>
                </div>
            </div>
        );
    } else {
        return <EmpForm state={props.state} refetch={props.refetch}/>;
    }
}