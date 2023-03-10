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
            { header: '?????????', name: 'dt_start', editor: 'datePicker' },
            { header: '?????????', name: 'dt_end', editor: 'datePicker' },
            { header: '??????', name: 'dept', formatter: 'listItemText',
              editor: {
                type: 'select',
                options: {
                    listItems: [
                        {text:'????????????', value:'100'},
                        {text:'????????????', value:'200'},
                        {text:'????????????', value:'300'},
                        {text:'????????????', value:'400'},
                        {text:'????????????', value:'500'},
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
                            items = [{text:'?????????', value:'001'},{text:'?????????', value:'002'}];
                        } else if(value === '300') {
                            items = [{text:'????????????', value:'301'},{text:'??????', value:'302'},{text:'?????????', value:'303'}];
                        } else if(value === '400') {
                            items = [{text:'??????', value:'401'},{text:'??????', value:'402'}];
                        } else if(value === '500') {
                            items = [{text:'1?????????', value:'501'},{text:'2?????????', value:'502'},{text:'3?????????', value:'503'}];
                        } else if(value === '600') {
                            items = [{text:'??????', value:'601'},{text:'????????????', value:'602'},{text:'??????', value:'603'}];
                        }
                        return items;
                    }
                }
              ],
            },
            { header: '???', name: 'team', formatter: 'listItemText',
              editor: {
                type: 'select',
                options: {listItems:[]}
              }
            },
            { header: '?????????', name: 'location', editor: 'text' },
            { header: '??????', name: 'position', formatter: 'listItemText',
              editor: { 
                type: 'select', 
                options: { 
                    listItems: cCode?.length > 0 ? cCode.position : []
                } 
              } 
            },
        ],
        edu : [
            { header: '?????????', name: 'dt_start', 
              editor: { type: 'datePicker', options: { format: 'yyyy-MM', type:'month' } }, 
            },
            { header: '?????????', name: 'dt_end', 
              editor: { type: 'datePicker', options: { format: 'yyyy-MM', type:'month' } }, 
            },
            { header: '?????????', name: 'school', editor: 'text' },
            { header: '??????', name: 'dept', editor: 'text' },
            { header: '??????', name: 'degree', editor: 'text' },
            { header: '??????', name: 'score', editor: 'text' },
            { header: '??????', name: 'graduate', formatter: 'listItemText',
              editor: { type: 'radio', options: { listItems: [{ text:'??????', value: '0' }, { text:'??????', value: '1' }] } } 
            },
        ],
        cert : [
            { header: '????????????', name: 'nm', editor: 'text' },
            { header: '????????????', name: 'agency', editor: 'text' },
            { header: '?????????', name: 'dt_in', editor: 'datePicker' },
            { header: '??????', name: 'level', editor: 'text' },
            { header: '??????', name: 'note', editor: 'text' },
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
        title = '??????';
        button = <InfoButton onSubmit={e => onSubmit(e)} replace={`/menu/goods/add`}  refetch={props.refetch}/>
    } else {
        title = '??????';
        button = <UpdateButton onSubmit={() => onUpdate()} onDelete={() => onDelete()} replace={`/staff/employee/${param.id}`} refetch={props.refetch}/>;
    }
    return(
        <div id="body">
            <Title bigTit={`?????? ${title}`} button={props.state} refetch={props.refetch}/>
            <form className='cmm_info_wrap' encType='multipart/form-data' onSubmit={e => e.preventDefault()}>
                <div className='cmm_info_container'>
                    <h3 className='headline'>???????????? <img src='/images/info.svg' alt='info' style={{ verticalAlign: 'middle' }} /></h3>
                    <div className='flex_item' style={{borderBottom: '1px solid #2B2B2B', borderTop: '1px solid #2B2B2B'}}>
                        <div className='file_item'>
                            <input id='img_emp' type='file' name='img_emp' onChange={e => preview(e, (type, item) => dispatch({ type: type, item: item }))}/>
                            <label htmlFor='img_emp' id='preview_img_emp' style={fileStyle}></label>
                        </div>
                        <ul className='info_item'>
                            <li className='info_columns opt'>
                                <div>
                                    <span>??????</span>
                                    <input type='text' name='nm' className='in_txt_small' value={item?.nm ?? ''} onChange={(e) => dispatch({ type : 'WRITE' , item: e.target })}/>
                                </div>
                                <div>
                                    <span>????????????</span>
                                    <input type='text' name='nm_eng' className='in_txt_small' value={item?.nm_eng ?? ''} onChange={(e) => dispatch({ type : 'WRITE' , item: e.target })}/>
                                </div>
                            </li>
                            <li className='info_columns opt'>
                                <div>
                                    <span>?????????</span>
                                    <input type='text' name='phone' className='in_txt_small' 
                                           value={item?.phone ?? ''} onChange={(e) => formatter({type: 'PHONE', target: e.target, reducer: dispatch})}/>
                                </div>
                                <div>
                                    <span>?????????</span>
                                    <input type='text' name='email' className='in_txt_small' value={item?.email ?? ''} onChange={(e) => dispatch({ type : 'WRITE' , item: e.target })}/>
                                </div>
                            </li>
                            <li className='info_columns opt'>
                                <div>
                                    <span>????????????</span>
                                    <input type='date' name='birth' className='in_txt_small' value={item?.birth ?? ''} onChange={(e) => dispatch({ type : 'WRITE' , item: e.target })}/>
                                </div>
                                <div>
                                    <span>(???)??????</span>
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
                                    <span>????????????</span>
                                    <select className='cmm_minimal_dropbox' name='tp_employ' value={item?.tp_employ ?? ''} onChange={(e) => dispatch({ type : 'WRITE' , item: e.target })}>
                                        <option value=''>????????????</option> 
                                        { cCode?.employ?.map(el => <option key={el.value} value={el.value}>{el.text}</option>) }
                                    </select>   
                                </div>
                                <div>
                                    <span>??????</span>
                                    <select className='cmm_minimal_dropbox' name='position' value={item?.position ?? ''} onChange={(e) => dispatch({ type : 'WRITE' , item: e.target })}>
                                        <option value=''>??????</option>
                                        { cCode?.position?.map(el => <option key={el.value} value={el.value}>{el.text}</option>) }
                                    </select>
                                </div>
                            </li>
                            <li className='info_columns' style={{gap : 0}}>
                                <span>????????????</span>
                                <input type='text' name='post' className='in_txt_small' value={item?.post  ?? ''} onChange={(e) => dispatch({ type : 'WRITE' , item: e.target })}/>
                            </li>
                            <li className='info_columns' style={{gap : 0}}>
                                <span>??????</span>
                                <textarea name='addr' className='textarea' value={item?.addr ?? ''} onChange={(e) => dispatch({ type : 'WRITE' , item: e.target })}></textarea>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className='cmm_info_container'>
                    <h3 className='headline'>???????????? <img src='/images/info.svg' alt='info' style={{ verticalAlign: 'middle' }} /></h3>
                    <div className='cmm_button_area'>
                        <button className="cmm_outlined_button grid" onClick={() => appendRow({target: 'dept'})} ><img src='/images/add_black.svg' alt='add'/>??????</button>
                        <button className="cmm_outlined_button grid" onClick={() => removeRow({target: 'dept'})} ><img src='/images/remove.svg' alt='add'/>??????</button>
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
                            <h3 className='headline'>???????????? <img src='/images/info.svg' alt='info' style={{ verticalAlign: 'middle' }} /></h3>
                            <div className='cmm_button_area'>
                                <button className="cmm_outlined_button grid" onClick={() => appendRow({target: 'edu'})} ><img src='/images/add_black.svg' alt='add'/>??????</button>
                                <button className="cmm_outlined_button grid" onClick={() => setEdu({type: 'REMOVE'})} ><img src='/images/remove.svg' alt='add'/>??????</button>
                            </div>
                            <div className='grid_item edu' style={{borderBottom: '1px solid #2B2B2B', borderTop: '1px solid #2B2B2B'}}>
                                <Grid ref={el => gridRef.current[1] = el} columns={columns.edu} data={edu} usageStatistics={false} onAfterChange={afterChange}/>
                            </div>
                        </div>
                        <div className='info_item'>
                            <h3 className='headline'>???????????? <img src='/images/info.svg' alt='info' style={{ verticalAlign: 'middle' }} /></h3>
                            <div className='cmm_button_area'>
                                <button className="cmm_outlined_button grid" onClick={() => appendRow({target: 'cert'})} ><img src='/images/add_black.svg' alt='add'/>??????</button>
                                <button className="cmm_outlined_button grid" onClick={() => setCert({type: 'REMOVE'})} ><img src='/images/remove.svg' alt='add'/>??????</button>
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
    const listTitle = ['??????', '??????', '??????', '??????', '???', '??????', '?????????', '?????????', '??????'];
    // const sCtg = ['CAKE', 'COOKIE', 'SANDWICH'];
    const [keyword, search] = useState([{ perPage: 10, page: 0 }]);

    if(props.state.mode === 0) {
        return (
            <div id='body'>
                <div className='cmm_list_wrap'>
                    <Title bigTit='??????' button={props.state} refetch={props.refetch} />
                    <EmpSearch />
                    <List ctg='employee' tit={listTitle} search={keyword} setSearch={search} refetch={props.refetch}/>
                </div>
            </div>
        );
    } else {
        return <EmpForm state={props.state} refetch={props.refetch}/>;
    }
}