import 'scss/Info.scss';
import Title from 'content/view/components/Title';
import { MenuSearch } from 'content/view/components/Search';
import { List } from 'content/view/List';
import { InfoButton, UpdateButton } from 'content/view/components/Buttons';
import { useEffect, useReducer, useRef, useState } from 'react';
import { preview, update, erase, createFile } from 'content/utils/form';
import axios from 'axios';

// 상세정보 컴포넌트
function reducer(state, action) {
    switch(action.type) {
        case 'OPEN' : return { ...state, [action.key] : true }
        case 'CLOSE' : return { ...state, [action.key] : false }
        default : return { hot: false, iced: false };
    }
}

// update viewForm data
// WRITE: text,radio,textarea,date | APPEND: checkbox | SUBMIT: submit
function menuReducer(state, action) {
    const name = action.data?.name;
    let value = action.data?.value;
    let count;

    console.log(name, value);
    switch(action.type) {
        case 'WRITE'  : 
            console.log(action.data?.type === 'radio');
            console.log(!action.data?.checked);
            if(action.data?.type === 'radio' && state[name] === 'Y') {
                value = 'N';
            }
            return { ...state, [name] : value };
        case 'APPEND' : 
            let arr = state[name] ?? [];
            arr = arr.filter(el => el !== value);
            if(action.data.checked) arr.push(value);
            return { ...state, [name] : arr };
        case 'INCREASE' : 
            count = state[name] ?? 0;
            return { ...state, [name] : count+1 };
        case 'DECREASE' :
            count = (state[name] ?? 0) - 1; 
            if(count < 0) count = 0;
            return { ...state, [name] : count };
        case 'FILE' : return { ...state, [name] : action.data.files[0] }
        case 'FETCH' : return action.data;
        case 'SUBMIT' : return {}
        default: return {}
    }
}

// menu detail form
function MenuDetail(props) {
    const data = props.data;
    const fileStyle = props.data[`pic_${props.degree}`] ? {background: `url(http://localhost:3000/api/image/${data['pic_'+props.degree]}) center/cover no-repeat`} : {};

    if(!props.state[props.degree]) return null;

    return (
        <div>
            <h4 className='headline'>{props.degree.toUpperCase()}</h4>
            <div className='flex_item'
                style={{ borderBottom: '1px solid #2B2B2B', borderTop: '1px solid #2B2B2B' }}
            >
                <div className='file_item'>
                    <input id={`img_${props.degree}`} type='file' name={`img_${props.degree}`} multiple onChange={(e) => preview(e, props.setData)} />
                    {/* <label htmlFor={`img_${props.degree}`} id={`preview_img_${props.degree}`} style={{background: `url('http://localhost:3000/api/image/${data['pic_'+props.degree]}') center/cover no-repeat`}}></label> */}
                    <label htmlFor={`img_${props.degree}`} id={`preview_img_${props.degree}`} style={fileStyle}></label>
                </div>
                <ul className='info_item'>
                    <li className='info_columns'>
                        <div>
                            <span>가격<sup>*</sup></span>
                            <input type='text' name={`fee_${props.degree}`} className='in_txt_small' value={data[`fee_${props.degree}`] ?? 0} onChange={e => props.setData('WRITE', e.target)} />
                        </div>
                    </li>
                    <li className='info_columns'>
                        <div>
                            <span>칼로리</span>
                            <input type='text' name={`calorie_${props.degree}`} className='in_txt_small' value={data[`calorie_${props.degree}`] ?? 0} onChange={e => props.setData('WRITE', e.target)} />
                            {/* <p>{(data[`protein_${props.degree}`] ?? 0) * 4 + (data[`sugar_${props.degree}`] ?? 0) * 4 + (data[`fat_${props.degree}`] ?? 0) * 9}</p> */}
                        </div>
                    </li>
                    <li className='info_columns opt'>
                        <div>
                            <span>탄수화물</span>
                            <div className='number'>
                                <input type='number' name={`carbon_${props.degree}`} className='in_txt_small' value={data[`carbon_${props.degree}`] ?? 0} onChange={e => props.setData('WRITE', e.target)} />
                                <div className='icon_wrap'>
                                    <button className='add'  onClick={() => props.setData('INCREASE', { name : `carbon_${props.degree}` })}></button>
                                    <button className='diff' onClick={() => props.setData('DECREASE', { name : `carbon_${props.degree}` })}></button>
                                </div>
                            </div>
                        </div>
                        <div>
                            <span>당류</span>
                            <div className='number'>
                                <input type='number' name={`sugar_${props.degree}`} className='in_txt_small' value={data[`sugar_${props.degree}`] ?? 0} onChange={e => props.setData('WRITE', e.target)} />
                                <div className='icon_wrap'>
                                    <button className='add'  onClick={() => props.setData('INCREASE', { name: `sugar_${props.degree}` })}></button>
                                    <button className='diff' onClick={() => props.setData('DECREASE', { name: `sugar_${props.degree}` })}></button>
                                </div>
                            </div>
                        </div>
                    </li>
                    <li className='info_columns opt'>
                        <div>
                            <span>나트륨</span>
                            <div className='number'>
                                <input type='number' name={`salt_${props.degree}`} className='in_txt_small' value={data[`salt_${props.degree}`] ?? 0} onChange={e => props.setData('WRITE', e.target)} />
                                <div className='icon_wrap'>
                                    <button className='add'  onClick={() => props.setData('INCREASE', { name : `salt_${props.degree}` })}></button>
                                    <button className='diff' onClick={() => props.setData('DECREASE', { name : `salt_${props.degree}` })}></button>
                                </div>
                            </div>
                        </div>
                        <div>
                            <span>단백질</span>
                            <div className='number'>
                                <input type='number' name={`protein_${props.degree}`} className='in_txt_small' value={data[`protein_${props.degree}`] ?? 0} onChange={e => props.setData('WRITE', e.target)} />
                                <div className='icon_wrap'>
                                    <button className='add'  onClick={() => props.setData('INCREASE', { name: `protein_${props.degree}` } )}></button>
                                    <button className='diff' onClick={() => props.setData('DECREASE', { name: `protein_${props.degree}` } )}></button>
                                </div>
                            </div>
                        </div>
                    </li>
                    <li className='info_columns opt'>
                        <div>
                            <span>지방</span>
                            <div className='number'>
                                <input type='number' name={`fat_${props.degree}`} className='in_txt_small' value={data[`fat_${props.degree}`] ?? 0} onChange={e => props.setData('WRITE', e.target)} />
                                <div className='icon_wrap'>
                                    <button className='add'  onClick={() => props.setData('INCREASE', { name: `fat_${props.degree}` })}></button>
                                    <button className='diff' onClick={() => props.setData('DECREASE', { name: `fat_${props.degree}` })}></button>
                                </div>
                            </div>
                        </div>
                        <div>
                            <span>콜레스테롤</span>
                            <div className='number'>
                                <input type='number' name={`colesterol_${props.degree}`} className='in_txt_small' value={data[`colesterol_${props.degree}`] ?? 0} onChange={e => props.setData('WRITE', e.target)} />
                                <div className='icon_wrap'>
                                    <button className='add'  onClick={() => props.setData('INCREASE', { name: `colesterol_${props.degree}` })}></button>
                                    <button className='diff' onClick={() => props.setData('DECREASE', { name: `colesterol_${props.degree}` })}></button>
                                </div>
                            </div>
                        </div>
                    </li>
                    <li className='info_columns opt'>
                        <div>
                            <span>트랜스지방</span>
                            <div className='number'>
                                <input type='number' name={`trans_fat_${props.degree}`} className='in_txt_small' value={data[`trans_fat_${props.degree}`] ?? 0} onChange={e => props.setData('WRITE', e.target)} />
                                <div className='icon_wrap'>
                                    <button className='add'  onClick={() => props.setData('INCREASE', { name: `trans_fat_${props.degree}` })}></button>
                                    <button className='diff' onClick={() => props.setData('DECREASE', { name: `trans_fat_${props.degree}` })}></button>
                                </div>
                            </div>
                        </div>
                        <div>
                            <span>포화지방</span>
                            <div className='number'>
                                <input type='number' name={`ploy_fat_${props.degree}`} className='in_txt_small' value={data[`ploy_fat_${props.degree}`] ?? 0} onChange={e => props.setData('WRITE', e.target)} />
                                <div className='icon_wrap'>
                                    <button className='add'  onClick={() => props.setData('INCREASE', { name: `ploy_fat_${props.degree}` })}></button>
                                    <button className='diff' onClick={() => props.setData('DECREASE', { name: `ploy_fat_${props.degree}` })}></button>
                                </div>
                            </div>
                        </div>
                    </li>
                    <li className='info_columns opt'>
                        <div>
                            <span>카페인</span>
                            <div className='number'>
                                <input type='number' name={`caffeine_${props.degree}`} className='in_txt_small' value={data[`caffeine_${props.degree}`] ?? 0} onChange={e => props.setData('WRITE', e.target)} />
                                <div className='icon_wrap'>
                                    <button className='add'  onClick={() => props.setData('INCREASE', { name: `caffeine_${props.degree}` })}></button>
                                    <button className='diff' onClick={() => props.setData('DECREASE', { name: `caffeine_${props.degree}` })}></button>
                                </div>
                            </div>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    );
}

function AddForm(props) {
    const [data, setData] = useReducer(menuReducer, {});
    const [degree, dispatch] = useReducer(reducer, {hot: false, iced: false});
    
    const onSubmit = (e) => {
        const formData = new FormData();
        // e.preventDefault();
        const keys = Object.keys(data);
        
        keys.map(key => {
            formData.append(key, data[key]);
        });
        console.log('submit!');
        const entries = formData.entries();
        for(const pair of entries) {
            console.log(pair[0], pair[1]);
        }

        // console.log(data);
        createFile(formData, '/api/menu/drink');
        // document.frm.submit();
    }
    
    // onclick temperatrue
    const openTemp = (e) => {
        const key = e.target.value === '0' ? 'hot' : 'iced';
        if(e.target.checked) {
            dispatch({ type : 'OPEN', key : key });
        } else {
            dispatch({ type : 'CLOSE', key : key });
        }

        setData({ type : 'APPEND', data : e.target }); // state에 데이터 저장
    }

    // console.log('degree >> ', degree);
    // console.log('data >> ', data);

    return(
        <form name='frm' className='cmm_info_wrap' encType='multipart/form-data' method='post' action='/api/menu/drink' onSubmit={(e) => e.preventDefault()}>
            <div className='cmm_info_container'>
                <h3 className='headline'>기본정보 <img src='/images/info.svg' alt='info' style={{ verticalAlign: 'middle' }} /></h3>
                
                <div className='flex_item' style={{borderBottom: '1px solid #2B2B2B', borderTop: '1px solid #2B2B2B'}}>
                    <ul className='info_item alone'>
                        <li>
                            <span>분류<sup>*</sup></span>
                            <select name='sub_clas' className='cmm_minimal_dropbox' onChange={e => setData({ type : 'WRITE' , data: e.target })}>
                                <option value=''>분류를 선택하세요.</option>
                                <option value='COFFEE'>COFFEE</option>
                                <option value='BEVERAGE'>BEVERAGE</option>
                                <option value='BLENDING TEA'>BLENDING TEA</option>
                                <option value='SHAKE&ADE'>SHAKE&ADE</option>
                                <option value='COLD BREW'>COLD BREW</option>
                            </select>
                        </li>
                        <li className='info_columns opt'>
                            <div>
                                <span>이름<sup>*</sup></span>
                                <input type='text' name='nm' className='in_txt_small' onChange={e => setData({ type : 'WRITE' , data: e.target })}/>
                            </div>
                            <div>
                                <span>영문이름<sup>*</sup></span>
                                <input type='text' name='nm_eng' className='in_txt_small' onChange={e => setData({ type : 'WRITE' , data: e.target })}/>
                            </div>
                        </li>
                        <li className='info_columns opt'>
                            <div>
                                <span>온도<sup>*</sup></span>
                                <input id='temp_1' type='checkbox' name='temp' value='0' onChange={e => openTemp(e)}/> 
                                <label htmlFor='temp_1'>Hot</label>
                                <input id='temp_2' type='checkbox' name='temp' value='1' onChange={e => openTemp(e)}/>
                                <label htmlFor='temp_2'>Iced</label>
                            </div>
                            <div>
                                <span>사이즈<sup>*</sup></span>
                                <input id='v_1' type='checkbox' name='volume' value='0' onChange={e => setData({ type : 'APPEND', data : e.target })}/>
                                <label htmlFor='v_1' className='checkbox'>Small</label>
                                <input id='v_2' type='checkbox' name='volume' value='1' onChange={e => setData({ type : 'APPEND', data : e.target })}/>
                                <label htmlFor='v_2'>Medium</label>
                                <input id='v_3' type='checkbox' name='volume' value='2' onChange={e => setData({ type : 'APPEND', data : e.target })}/>
                                <label htmlFor='v_3'>Large</label>
                                <input id='v_4' type='checkbox' name='volume' value='3' onChange={e => setData({ type : 'APPEND', data : e.target })}/>
                                <label htmlFor='v_4'>Extra</label>
                            </div>
                        </li>
                        <li className='info_columns opt'>
                            <div>
                                <span>판매기간<sup>*</sup></span>
                                <input type='date' name='dt_start' className='in_txt_small' onChange={e => setData({ type : 'WRITE' , data: e.target })}/> ~ <input type='date' name='dt_end' className='in_txt_small' onChange={e => update({ type : 'WRITE' , data: e.target })}/>
                            </div>
                            <div>
                                <span>옵션</span>
                                <input id='opt_season' type='radio' name='yn_season' value='Y' onChange={e => setData({ type : 'WRITE' , data: e.target })}/> 
                                <label htmlFor='opt_season'>Season</label>
                                <input id='opt_recomm' type='radio' name='yn_recomm' value='Y' onChange={e => setData({ type : 'WRITE' , data: e.target })}/>
                                <label htmlFor='opt_recomm'>추천</label>
                            </div>
                        </li>
                        <li>
                            <span>알러지</span>
                            <input id='al_1' type='checkbox' name='allergy' value='0' onChange={e => setData({ type : 'APPEND', data : e.target })}/> 
                            <label htmlFor='al_1'>복숭아</label>
                            <input id='al_2' type='checkbox' name='allergy' value='1' onChange={e => setData({ type : 'APPEND', data : e.target })}/>
                            <label htmlFor='al_2'>대두</label>
                            <input id='al_3' type='checkbox' name='allergy' value='2' onChange={e => setData({ type : 'APPEND', data : e.target })}/>
                            <label htmlFor='al_3'>우유</label>
                            <input id='al_4' type='checkbox' name='allergy' value='3' onChange={e => setData({ type : 'APPEND', data : e.target })}/>
                            <label htmlFor='al_4'>알</label>
                            <input id='al_5' type='checkbox' name='allergy' value='4' onChange={e => setData({ type : 'APPEND', data : e.target })}/>
                            <label htmlFor='al_5'>밀</label>
                        </li>
                        <li>
                            <span>설명<sup>*</sup></span>
                            <textarea name='expl' className='textarea' onChange={e => setData({ type : 'WRITE' , data: e.target })}></textarea>
                        </li>
                        <li>
                            <span>추가설명</span>
                            <textarea name='add_expl' className='textarea' onChange={e => setData({ type : 'WRITE' , data: e.target })}></textarea>
                        </li>
                    </ul>
                </div>
            </div>

            <div className='cmm_info_container'>
                <h3 className='headline'>상세정보 <img src='/images/info.svg' alt='info' style={{ verticalAlign: 'middle' }} /></h3>
                <div className='detail'>
                    <MenuDetail degree={'hot'} state={degree} data={data} setData={(type, data) => setData({ type: type, data: data })} />
                    <MenuDetail degree={'iced'} state={degree} data={data} setData={(type, data) => setData({ type: type, data: data })} />
                </div>
            </div>

            <div className='cmm_info_container'>
                <h3 className='headline'>기본옵션 <img src='/images/info.svg' alt='info' style={{ verticalAlign: 'middle' }} /></h3>

                <div className='flex_item'
                        style={{borderBottom: '1px solid #2B2B2B', borderTop: '1px solid #2B2B2B'}}
                >
                    <ul className='info_item alone'>
                        <li className='info_columns opt'>
                            <div>
                                <span>원두</span>
                                <select name='bean' className='cmm_minimal_dropbox' onChange={e => setData({ type : 'WRITE' , data: e.target })}>
                                    <option value=''>Dropdown</option>
                                    <option value='0'>드립</option>
                                    <option value='1'>에스프레소</option>
                                </select>
                            </div>
                            <div>
                                <span>샷 수량</span>
                                <div className='number'>
                                    <input type='number' name='bean_cnt' className='in_txt_small' value={data.bean_cnt ?? 0}/>
                                    <div className='icon_wrap'>
                                        <button className='add'  onClick={() => setData({ type : 'INCREASE', data : { name: 'bean_cnt' } })}></button>
                                        <button className='diff' onClick={() => setData({ type : 'DECREASE', data : { name: 'bean_cnt' } })}></button>
                                    </div>
                                </div>
                            </div>
                        </li>
                        <li className='info_columns opt'>
                            <div>
                                <span>시럽</span>
                                <select name='syrup' className='cmm_minimal_dropbox' onChange={e => setData({ type : 'WRITE' , data: e.target })}>
                                    <option value=''>Dropdown</option>
                                    <option value='0'>클래식 시럽</option>
                                    <option value='1'>바닐라 시럽</option>
                                    <option value='2'>모카 시럽</option>
                                    <option value='3'>헤이즐넛 시럽</option>
                                    <option value='4'>블랙 글레이즈드 시럽</option>
                                </select>
                            </div>
                            <div>
                                <span>시럽 양</span>
                                <div className='number'>
                                    <input type='number' name='syrup_cnt' className='in_txt_small' value={data.syrup_cnt ?? 0}/>
                                    <div className='icon_wrap'>
                                        <button className='add'  onClick={() => setData({ type : 'INCREASE', data : { name: 'syrup_cnt' } })}></button>
                                        <button className='diff' onClick={() => setData({ type : 'DECREASE', data : { name: 'syrup_cnt' } })}></button>
                                    </div>
                                </div>
                            </div>
                        </li>
                        <li className='info_columns opt'>
                            <div>
                                <span>휘핑크림</span>
                                <input id='wh_1' type='radio' name='cream' value='0' onChange={e => setData({ type : 'WRITE' , data: e.target })}/>
                                <label htmlFor='wh_1'>일반</label>
                                <input id='wh_2' type='radio' name='cream' value='1' onChange={e => setData({ type : 'WRITE' , data: e.target })}/> 
                                <label htmlFor='wh_2'> 에스프레소</label>
                            </div>
                            <div>
                                <span>드리즐</span>
                                <input id='dz_1' type='radio' name='drizz' value='0' onChange={e => setData({ type : 'WRITE' , data: e.target })}/> 
                                <label htmlFor='dz_1'>카라멜</label>
                                <input id='dz_2' type='radio' name='drizz' value='1' onChange={e => setData({ type : 'WRITE' , data: e.target })}/> 
                                <label htmlFor='dz_2'>초콜릿</label>
                            </div>
                        </li>
                        <li className='info_columns opt'>
                            <div>
                                <span>우유</span>
                                <select name='milk' className='cmm_minimal_dropbox' onChange={e => setData({ type : 'WRITE' , data: e.target })}>
                                    <option value=''>Dropdown</option>
                                    <option value='0'>일반우유</option>
                                    <option value='1'>저지방 우유</option>
                                    <option value='2'>무지방 우류</option>
                                    <option value='3'>두유</option>
                                    <option value='4'>귀리(오트)</option>
                                </select>
                            </div>
                            <div>
                                <span>베이스</span>
                                <input id='bs_1' type='radio' name='base' value='0' onChange={e => setData({ type : 'APPEND', data : e.target })}/>
                                <label htmlFor='bs_1'>물</label>
                                <input id='bs_2' type='radio' name='base' value='1' onChange={e => setData({ type : 'APPEND', data : e.target })}/>
                                <label htmlFor='bs_2'>차</label>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>

            <InfoButton onSubmit={(e) => onSubmit(e)} replace={`/menu/drink`} refetch={props.refetch}/>
        </form>
    );
}

function ViewForm(props) {
    const [degree, dispatch] = useReducer(reducer, {hot: false, iced: false});
    // modifiy : 수정 , submit : formData에 저장
    const [item, modify] = useReducer(menuReducer, {});

    useEffect(() => {
           
        // axios.get(`/api/${window.location.pathname}`)
        axios.get(`/api/menu/drink/${props.id}`)
            .then(res => {
                // Array :: volume, temp, allergy
                const volume = res.data.rows[0][0].volume?.split(',');
                const temp = res.data.rows[0][0].temp?.split(',');
                const allergy = res.data.rows[0][0].allergy?.split(',');

                const commInfo = {
                    ...res.data.rows[0][0]
                    , volume : volume
                    , temp : temp
                    , allergy : allergy
                }

                res.data.rows[1].map(el => {
                    const keys = Object.keys(el);
                    const temp = el.temp === '0' ? 'hot' : 'iced';
                    dispatch({ type: 'OPEN', key: temp });
                    keys.map(key => {
                        commInfo[`${key}_${temp}`] = el[key];
                    });
                });

                console.log('commInfo >>> ', commInfo);
                modify({type : 'FETCH', data : commInfo});
            })
            .catch(err => console.log(err)); 
        
    }, [props.id]);

    // onclick temperatrue
    const openTemp = (e) => {
        const key = e.target.value === '0' ? 'hot' : 'iced';
        if(e.target.checked) {
            dispatch({ type : 'OPEN', key : key });
        } else {
            dispatch({ type : 'CLOSE', key : key });
        }

        modify({ type : 'APPEND', data : e.target }); // state에 데이터 저장
    }

    // 수정
    const onSubmit = () => {
        // const formData = new FormData();
        // // e.preventDefault();
        // const keys = Object.keys(data);
        
        // keys.map(key => {
        //     formData.append(key, data[key]);
        // });
        // console.log('submit!');
        // const entries = formData.entries();
        // for(const pair of entries) {
        //     console.log(pair[0], pair[1]);
        // }
        const fd = new FormData();
        const url = `/api/menu/drink/${item.id}`;
        const keys = Object.keys(item);

        keys.map(key => {
            fd.append(key, item[key]);
        });
        console.log('update!');

        const entries = fd.entries();
        for(const pair of entries) {
            console.log(pair[0], pair[1]);
        }

        // if(edit.file != null) {
            createFile(fd, url);    // 내용 수정
            // multiUpdate(edited, url);   // 파일 삭제
        // } else {
            // update(edited, url);
        // }
    }

    // 삭제
    const onDelete = () => {
        erase(`/api/menu/drink/${item.id}`, '/menu/drink');
    }

    return(
        <form className='cmm_info_wrap' encType='multipart/form-data' onSubmit={e => e.preventDefault()}>
            <div className='cmm_info_container'>
                <h3 className='headline'>기본정보 <img src='/images/info.svg' alt='info' style={{ verticalAlign: 'middle' }} /></h3>
                
                <div className='flex_item' style={{borderBottom: '1px solid #2B2B2B', borderTop: '1px solid #2B2B2B'}}>
                    <ul className='info_item alone'>
                        <li>
                            <span>분류<sup>*</sup></span>
                            <select name='sub_clas' className='cmm_minimal_dropbox' value={item?.sub_clas} 
                                    onChange={ (e) => modify({ type : 'WRITE' , data: e.target }) }>
                                <option value=''>분류를 선택하세요.</option>
                                <option value='COFFEE'>COFFEE</option>
                                <option value='BEVERAGE'>BEVERAGE</option>
                                <option value='BLENDING TEA'>BLENDING TEA</option>
                                <option value='SHAKE&ADE'>SHAKE&ADE</option>
                                <option value='COLD BREW'>COLD BREW</option>
                            </select>
                        </li>
                        <li className='info_columns opt'>
                            <div>
                                <span>이름<sup>*</sup></span>
                                <input type='text' name='nm' className='in_txt_small' value={item?.nm} onChange={(e) => modify({ type : 'WRITE' , data: e.target })}/>
                            </div>
                            <div>
                                <span>영문이름<sup>*</sup></span>
                                <input type='text' name='nm_eng' className='in_txt_small' value={item?.nm_eng} onChange={(e) => modify({ type : 'WRITE' , data: e.target })}/>
                            </div>
                        </li>
                        <li className='info_columns opt'>
                            <div>
                                <span>온도<sup>*</sup></span>
                                <input id='temp_1' type='checkbox' name='temp' value='0' checked={item?.temp?.includes('0')} onChange={(e) => openTemp(e)}/> 
                                <label htmlFor='temp_1'>Hot</label>
                                <input id='temp_2' type='checkbox' name='temp' value='1' checked={item?.temp?.includes('1')} onChange={(e) => openTemp(e)}/>
                                <label htmlFor='temp_2'>Iced</label>
                            </div>
                            <div>
                                <span>사이즈<sup>*</sup></span>
                                <input id='v_1' type='checkbox' name='volume' value='0' checked={item?.volume?.includes('0')} onChange={(e) => modify({ type : 'APPEND', data : e.target })}/>
                                <label htmlFor='v_1' className='checkbox'>Small</label>
                                <input id='v_2' type='checkbox' name='volume' value='1' checked={item?.volume?.includes('1')} onChange={(e) => modify({ type : 'APPEND', data : e.target })}/>
                                <label htmlFor='v_2'>Medium</label>
                                <input id='v_3' type='checkbox' name='volume' value='2' checked={item?.volume?.includes('2')} onChange={(e) => modify({ type : 'APPEND', data : e.target })}/>
                                <label htmlFor='v_3'>Large</label>
                                <input id='v_4' type='checkbox' name='volume' value='3' checked={item?.volume?.includes('3')} onChange={(e) => modify({ type : 'APPEND', data : e.target })}/>
                                <label htmlFor='v_4'>Extra</label>
                            </div>
                        </li>
                        <li className='info_columns opt'>
                            <div>
                            <span>판매기간<sup>*</sup></span>
                                <input type='date' name='dt_start' className='in_txt_small' value={item?.dt_start} onChange={(e) => modify({ type : 'WRITE' , data: e.target })}/> 
                                ~ 
                                <input type='date' name='dt_end' className='in_txt_small' value={item?.dt_end} onChange={(e) => modify({ type : 'WRITE' , data: e.target })}/>
                            </div>
                            <div>
                            <span>옵션</span>
                                <input id='opt_season' type='radio' name='yn_season' value='Y' checked={item?.yn_season === 'Y'} onClick={(e) => modify({ type : 'WRITE' , data: e.target })}/> 
                                <label htmlFor='opt_season'>Season</label>
                                <input id='opt_recomm' type='radio' name='yn_recomm' value='Y' checked={item?.yn_recomm === 'Y'} onClick={(e) => modify({ type : 'WRITE' , data: e.target })}/>
                                <label htmlFor='opt_recomm'>추천</label>
                            </div>
                        </li>
                        <li>
                            <span>알러지</span>
                            <input id='al_1' type='checkbox' name='allergy' value='0' checked={item?.allergy?.includes('0')} onChange={(e) => modify({ type : 'APPEND', data : e.target })}/> 
                            <label htmlFor='al_1'>복숭아</label>
                            <input id='al_2' type='checkbox' name='allergy' value='1' checked={item?.allergy?.includes('1')} onChange={(e) => modify({ type : 'APPEND', data : e.target })}/>
                            <label htmlFor='al_2'>대두</label>
                            <input id='al_3' type='checkbox' name='allergy' value='2' checked={item?.allergy?.includes('2')} onChange={(e) => modify({ type : 'APPEND', data : e.target })}/>
                            <label htmlFor='al_3'>우유</label>
                            <input id='al_4' type='checkbox' name='allergy' value='3' checked={item?.allergy?.includes('3')} onChange={(e) => modify({ type : 'APPEND', data : e.target })}/>
                            <label htmlFor='al_4'>알</label>
                            <input id='al_5' type='checkbox' name='allergy' value='4' checked={item?.allergy?.includes('4')} onChange={(e) => modify({ type : 'APPEND', data : e.target })}/>
                            <label htmlFor='al_5'>밀</label>
                        </li>
                        <li>
                            <span>설명<sup>*</sup></span>
                            <textarea name='expl' className='textarea' value={item?.expl} onChange={(e) => modify({ type : 'WRITE' , data: e.target })}></textarea>
                        </li>
                        <li>
                            <span>추가설명</span>
                            <textarea name='add_expl' className='textarea' value={item?.add_expl} onChange={(e) => modify({ type : 'WRITE' , data: e.target })}></textarea>
                        </li>
                    </ul>
                </div>

            </div>

            <div className='cmm_info_container'>
                <h3 className='headline'>상세정보 <img src='/images/info.svg' alt='info' style={{ verticalAlign: 'middle' }} /></h3>
                <div className='detail'>
                    <MenuDetail degree={'hot'}  state={degree} data={item} setData={(type, data) => modify({ type: type, data: data })}/>
                    <MenuDetail degree={'iced'} state={degree} data={item} setData={(type, data) => modify({ type: type, data: data })}/>
                </div>
            </div>

            <div className='cmm_info_container'>
                <h3 className='headline'>기본옵션 <img src='/images/info.svg' alt='info' style={{ verticalAlign: 'middle' }} /></h3>

                <div className='flex_item'
                        style={{borderBottom: '1px solid #2B2B2B', borderTop: '1px solid #2B2B2B'}}
                >
                    <ul className='info_item alone'>
                        <li className='info_columns opt'>
                            <div>
                                <span>원두</span>
                                <select name='bean' className='cmm_minimal_dropbox' value={item?.bean} onChange={(e) => modify({ type : 'WRITE' , data: e.target })}>
                                    <option value=''>Dropdown</option>
                                    <option value='0'>드립</option>
                                    <option value='1'>에스프레소</option>
                                </select>
                            </div>
                            <div>
                                <span>샷 수량</span>
                                <div className='number'>
                                    <input type='number' name='bean_cnt' className='in_txt_small' value={item?.bean_cnt} onChange={(e) => modify({ type : 'WRITE' , data: e.target })}/>
                                    <div className='icon_wrap'>
                                        <button className='add'  onClick={() => modify({ type : 'INCREASE', data : { name: 'bean_cnt' } })}></button>
                                        <button className='diff' onClick={() => modify({ type : 'DECREASE', data : { name: 'bean_cnt' } })}></button>
                                    </div>
                                </div>
                            </div>
                        </li>
                        <li className='info_columns opt'>
                            <div>
                                <span>시럽</span>
                                <select name='syrup' className='cmm_minimal_dropbox' value={item?.syrup} onChange={(e) => modify({ type : 'WRITE' , data: e.target })}>
                                    <option value=''>Dropdown</option>
                                    <option value='0'>클래식 시럽</option>
                                    <option value='1'>바닐라 시럽</option>
                                    <option value='2'>모카 시럽</option>
                                    <option value='3'>헤이즐넛 시럽</option>
                                    <option value='4'>블랙 글레이즈드 시럽</option>
                                </select>
                            </div>
                            <div>
                                <span>시럽 양</span>
                                <div className='number'>
                                    <input type='number' name='syrup_cnt' className='in_txt_small' value={item?.syrup_cnt} onChange={(e) => modify({ type : 'WRITE' , data: e.target })}/>
                                    <div className='icon_wrap'>
                                        <button className='add'  onClick={() => modify({ type : 'INCREASE', data : { name: 'syrup_cnt' } })}></button>
                                        <button className='diff' onClick={() => modify({ type : 'DECREASE', data : { name: 'syrup_cnt' } })}></button>
                                    </div>
                                </div>
                            </div>
                        </li>
                        <li className='info_columns opt'>
                            <div>
                                <span>휘핑크림</span>
                                <input id='wh_1' type='radio' name='cream' value='0' checked={item?.cream?.includes('0')} onChange={(e) => modify({ type : 'WRITE' , data: e.target })}/>
                                <label htmlFor='wh_1'>
                                    일반
                                </label>
                                <input id='wh_2' type='radio' name='cream' value='1' checked={item?.cream?.includes('1')} onChange={(e) => modify({ type : 'WRITE' , data: e.target })}/> 
                                <label htmlFor='wh_2'>
                                    에스프레소
                                </label>
                            </div>
                            <div>
                                <span>드리즐</span>
                                <input id='dz_1' type='radio' name='drizz' value='0' checked={item?.drizz?.includes('0')} onChange={(e) => modify({ type : 'WRITE' , data: e.target })}/> 
                                <label htmlFor='dz_1'>카라멜</label>
                                <input id='dz_2' type='radio' name='drizz' value='1' checked={item?.drizz?.includes('1')} onChange={(e) => modify({ type : 'WRITE' , data: e.target })}/> 
                                <label htmlFor='dz_2'>초콜릿</label>
                            </div>
                        </li>
                        <li className='info_columns opt'>
                            <div>
                                <span>우유</span>
                                <select name='milk' className='cmm_minimal_dropbox' value={item?.milk} onChange={(e) => modify({ type : 'WRITE' , data: e.target })}>
                                    <option value=''>Dropdown</option>
                                    <option value='0'>일반우유</option>
                                    <option value='1'>저지방 우유</option>
                                    <option value='2'>무지방 우류</option>
                                    <option value='3'>두유</option>
                                    <option value='4'>귀리(오트)</option>
                                </select>
                            </div>
                            <div>
                                <span>베이스</span>
                                <input id='bs_1' type='radio' name='base' value='0' checked={item?.base?.includes('0')} onChange={(e) => modify({ type : 'WRITE' , data: e.target })}/>
                                <label htmlFor='bs_1'>물</label>
                                <input id='bs_2' type='radio' name='base' value='1' checked={item?.base?.includes('1')} onChange={(e) => modify({ type : 'WRITE' , data: e.target })}/>
                                <label htmlFor='bs_2'>차</label>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>

            <UpdateButton onSubmit={() => onSubmit()} onDelete={() => onDelete()} replace={`/menu/drink`} refetch={props.refetch}/>
        </form>
    );
}

// 음료 상세
export function DrinkView(props) {
    if(props.state.data) 
        return(
            <div id='body'>
                <Title bigTit={`음료 상세`} button={props.state} refetch={props.refetch} />  
                <ViewForm id={props.state.data} refetch={props.refetch}/> 
            </div>
        );
    else
        return(
            <div id='body'>
                <Title bigTit='음료 등록' button={props.state} refetch={props.refetch}/>
                <AddForm refetch={props.refetch}/>
            </div>
        ); 
}

// 음료 목록
export function DrinkList(props) {
    const listTit = ['No', '분류', '사진', '온도', '이름', '가격', '시작일', '종료일', '시즌', '추천'];
    const sCtg = ['COFFEE', 'BEVERAGE', 'BLENDING TEA', 'SHAKE&ADE', 'COLD BREW'];
    const [keyword, search] = useState([{ perPage: 10, page: 0 }]);

    if(props.state.mode === 0) {
        return(
            <div id="body">
                <Title bigTit='음료' button={props.state} refetch={props.refetch}/>
                <div className='cmm_list_wrap'>
                    <MenuSearch ctg={sCtg} search={search} keyword={keyword} />
                    <List ctg='drink' tit={listTit} search={keyword} setSearch={search} refetch={(type, id) => props.refetch(type, id)}/>
                </div>
            </div>
        );
    } else {
        return(
            <DrinkView state={props.state} refetch={props.refetch}/>
        );
    }
}

export default DrinkList;