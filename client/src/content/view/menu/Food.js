import Title from 'content/view/components/Title';
import { MenuSearch } from 'content/view/components/Search';
import { List } from 'content/view/List';
import { preview, createFile, erase } from 'content/utils/form';
import { InfoButton, UpdateButton } from 'content/view/components/Buttons';
import { useEffect, useReducer, useState } from 'react';
import axios from 'axios';

function reducer(state, action) {
    const name = action.item?.name;
    const value = action.item?.value;
    let count = 0;

    // console.log(name, value);
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
    }
}

export function FoodForm(props) {
    const param = props.state.data;
    const [item, dispatch] = useReducer(reducer, {});

    let title = '' , button = <div></div>;

    useEffect(() => {
        if(!param) return;

        axios.get(`/api/menu/food/${param}`)
             .then(res => {
                const allergy = res.data.rows[0][0].allergy.split(',');
                const cmmInfo = {
                    ...res.data.rows[0][0],
                    allergy : allergy
                }

                Object.keys(res.data.rows[1][0]).map(key => {
                    cmmInfo[key+'_food'] = res.data.rows[1][0][key];
                });

                document.getElementById('preview_img_food').style.background = `url('http://localhost:3000/api/image/${cmmInfo.pic_food}') center/cover no-repeat`;
                dispatch({ type: 'FETCH', item: cmmInfo });
             })
             .catch(err => console.log(err));
    }, [param]);

    const onSubmit = (e) => {
        const fd = new FormData();
        const keys = Object.keys(item);

        keys.map(key => {
            fd.append(key, item[key]);
        });
        console.log('submit!');

        // for debug
        /*
        const entries = fd.entries();
        for(const pair of entries) {
            console.log(pair[0], pair[1]);
        }
        */

        createFile(fd, `/api/menu/food`);
    }

    const onUpdate = (e) => {
        const fd = new FormData();
        const keys = Object.keys(item);

        keys.map(key => {
            fd.append(key, item[key] ?? '');
        });
        console.log('update');
        const entries = fd.entries();
        for(const pair of entries) {
            console.log(pair[0], pair[1]);
        }
        createFile(fd, `/api/menu/food/${param}`);
    }

    const onDelete = (e) => {
        console.log('delete');
        erase(`/api/menu/food/${item.id}`, '/menu/food');
    }

    if(!param) {
        title = '??????';
        button = <InfoButton onSubmit={e => onSubmit(e)} replace={`/menu/food/add`} refetch={props.refetch}/>
    } else {
        title = '??????'
        button = <UpdateButton onSubmit={() => onUpdate()} onDelete={() => onDelete()} replace={`/menu/food/${param.id}`} refetch={props.refetch}/>;
    }

    return(
        <div id="body">
            <Title bigTit={`?????? ${title}`} button={props.state} refetch={props.refetch}/>
            <form className='cmm_info_wrap' encType='multipart/form-item' onSubmit={e => e.preventDefault()}>
                
                <div className='cmm_info_container'>
                    <h3 className='headline'>???????????? <img src='/images/info.svg' alt='info' style={{ verticalAlign: 'middle' }} /></h3>
                    <div className='flex_item' style={{borderBottom: '1px solid #2B2B2B', borderTop: '1px solid #2B2B2B'}}>
                        <ul className='info_item alone'>
                            <li>
                               <span>??????</span>
                               <select name='sub_clas' className='cmm_minimal_dropbox' value={item?.sub_clas} 
                                       onChange={ (e) => dispatch({ type : 'WRITE' , item: e.target }) }>
                                    <option value=''>????????? ???????????????.</option>
                                    <option value='CAKE'>CAKE</option>
                                    <option value='COOKIE'>COOKIE</option>
                                    <option value='SANDWICH'>SANDWICH</option>
                                </select>
                            </li>
                            <li className='info_columns opt'>
                                <div>
                                    <span>??????</span>
                                    <input type='text' name='nm' className='in_txt_small' value={item?.nm} onChange={(e) => dispatch({ type : 'WRITE' , item: e.target })}/>
                                </div>
                                <div>
                                    <span>????????????</span>
                                    <input type='text' name='nm_eng' className='in_txt_small' value={item?.nm_eng} onChange={(e) => dispatch({ type : 'WRITE' , item: e.target })}/>
                                </div>
                            </li>
                            <li className='info_columns opt'>
                                <div>
                                    <span>????????????</span>
                                    <input type='date' name='dt_start' className='in_txt_small' value={item?.dt_start} onChange={(e) => dispatch({ type : 'WRITE' , item: e.target })}/> 
                                    ~ 
                                    <input type='date' name='dt_end' className='in_txt_small' value={item?.dt_end} onChange={(e) => dispatch({ type : 'WRITE' , item: e.target })}/>
                                </div>
                                <div>
                                    <span>??????</span>
                                    <input id='opt_season' type='checkbox' name='yn_season' value='Y' checked={item?.yn_season === 'Y'} onChange={(e) => dispatch({ type : 'WRITE' , item: e.target })}/> 
                                    <label htmlFor='opt_season'>Season</label>
                                    <input id='opt_recomm' type='checkbox' name='yn_recomm' value='Y' checked={item?.yn_recomm === 'Y'} onChange={(e) => dispatch({ type : 'WRITE' , item: e.target })}/>
                                    <label htmlFor='opt_recomm'>??????</label>
                                </div>
                            </li>
                            <li>
                                <span>?????????</span>
                                <input id='al_1' type='checkbox' name='allergy' value='0' checked={item?.allergy?.includes('0')} onChange={(e) => dispatch({ type : 'APPEND', item : e.target })}/> 
                                <label htmlFor='al_1'>?????????</label>
                                <input id='al_2' type='checkbox' name='allergy' value='1' checked={item?.allergy?.includes('1')} onChange={(e) => dispatch({ type : 'APPEND', item : e.target })}/>
                                <label htmlFor='al_2'>??????</label>
                                <input id='al_3' type='checkbox' name='allergy' value='2' checked={item?.allergy?.includes('2')} onChange={(e) => dispatch({ type : 'APPEND', item : e.target })}/>
                                <label htmlFor='al_3'>??????</label>
                                <input id='al_4' type='checkbox' name='allergy' value='3' checked={item?.allergy?.includes('3')} onChange={(e) => dispatch({ type : 'APPEND', item : e.target })}/>
                                <label htmlFor='al_4'>??????</label>
                                <input id='al_5' type='checkbox' name='allergy' value='4' checked={item?.allergy?.includes('4')} onChange={(e) => dispatch({ type : 'APPEND', item : e.target })}/>
                                <label htmlFor='al_5'>???</label>
                                <input id='al_6' type='checkbox' name='allergy' value='5' checked={item?.allergy?.includes('5')} onChange={(e) => dispatch({ type : 'APPEND', item : e.target })}/>
                                <label htmlFor='al_6'>????????????</label>
                            </li>
                            <li>
                                <span>??????</span>
                                <textarea name='expl' className='textarea' value={item?.expl ?? ''} onChange={(e) => dispatch({ type : 'WRITE' , item: e.target })}></textarea>
                            </li>
                            <li>
                                <span>????????????</span>
                                <textarea name='add_expl' className='textarea' value={item?.add_expl ?? ''} onChange={(e) => dispatch({ type : 'WRITE' , item: e.target })}></textarea>
                            </li>
                        </ul>
                    </div>
                </div>
                
                <div className='cmm_info_container'>
                <h3 className='headline'>???????????? <img src='/images/info.svg' alt='info' style={{ verticalAlign: 'middle' }} /></h3>
                    <div className='flex_item' style={{ borderBottom: '1px solid #2B2B2B', borderTop: '1px solid #2B2B2B' }}>
                        <div className='file_item'>
                            <input id='img_food' type='file' name='img_food' onChange={e => preview(e, (type, item) => dispatch({ type: type, item: item }))} />
                            <label htmlFor='img_food' id='preview_img_food'></label>
                        </div>
                        <ul className='info_item'>
                            <li className='info_columns'>
                                <div>
                                    <span>??????<sup>*</sup></span>
                                    <input type='text' name={`fee_food`} className='in_txt_small' value={item[`fee_food`] ?? 0} onChange={e => dispatch({ type: 'WRITE', item: e.target })} />
                                </div>
                            </li>
                            <li className='info_columns'>
                                <div>
                                    <span>?????????</span>
                                    <input type='text' name={`calorie_food`} className='in_txt_small' value={item[`calorie_food`] ?? 0} onChange={e => dispatch({ type: 'WRITE', item: e.target })} />
                                    {/* <p>{(item[`protein_food`] ?? 0) * 4 + (item[`sugar_food`] ?? 0) * 4 + (item[`fat_food`] ?? 0) * 9}</p> */}
                                </div>
                            </li>
                            <li className='info_columns opt'>
                                <div>
                                    <span>????????????</span>
                                    <div className='number'>
                                        <input type='number' name={`carbon_food`} className='in_txt_small' value={item[`carbon_food`] ?? 0} onChange={e => dispatch({ type: 'WRITE', item: e.target })} />
                                        <div className='icon_wrap'>
                                            <button className='add'  onClick={() => dispatch('INCREASE', { name : `carbon_food` })}></button>
                                            <button className='diff' onClick={() => dispatch('DECREASE', { name : `carbon_food` })}></button>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <span>??????</span>
                                    <div className='number'>
                                        <input type='number' name={`sugar_food`} className='in_txt_small' value={item[`sugar_food`] ?? 0} onChange={e => dispatch({ type: 'WRITE', item: e.target })} />
                                        <div className='icon_wrap'>
                                            <button className='add'  onClick={() => dispatch('INCREASE', { name: `sugar_food` })}></button>
                                            <button className='diff' onClick={() => dispatch('DECREASE', { name: `sugar_food` })}></button>
                                        </div>
                                    </div>
                                </div>
                            </li>
                            <li className='info_columns opt'>
                                <div>
                                    <span>?????????</span>
                                    <div className='number'>
                                        <input type='number' name={`salt_food`} className='in_txt_small' value={item[`salt_food`] ?? 0} onChange={e => dispatch({ type: 'WRITE', item: e.target })} />
                                        <div className='icon_wrap'>
                                            <button className='add'  onClick={() => dispatch('INCREASE', { name : `salt_food` })}></button>
                                            <button className='diff' onClick={() => dispatch('DECREASE', { name : `salt_food` })}></button>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <span>?????????</span>
                                    <div className='number'>
                                        <input type='number' name={`protein_food`} className='in_txt_small' value={item[`protein_food`] ?? 0} onChange={e => dispatch({ type: 'WRITE', item: e.target })} />
                                        <div className='icon_wrap'>
                                            <button className='add'  onClick={() => dispatch('INCREASE', { name: `protein_food` } )}></button>
                                            <button className='diff' onClick={() => dispatch('DECREASE', { name: `protein_food` } )}></button>
                                        </div>
                                    </div>
                                </div>
                            </li>
                            <li className='info_columns opt'>
                                <div>
                                    <span>??????</span>
                                    <div className='number'>
                                        <input type='number' name={`fat_food`} className='in_txt_small' value={item[`fat_food`] ?? 0} onChange={e => dispatch({ type: 'WRITE', item: e.target })} />
                                        <div className='icon_wrap'>
                                            <button className='add'  onClick={() => dispatch('INCREASE', { name: `fat_food` })}></button>
                                            <button className='diff' onClick={() => dispatch('DECREASE', { name: `fat_food` })}></button>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <span>???????????????</span>
                                    <div className='number'>
                                        <input type='number' name={`colesterol_food`} className='in_txt_small' value={item[`colesterol_food`] ?? 0} onChange={e => dispatch({ type: 'WRITE', item: e.target })} />
                                        <div className='icon_wrap'>
                                            <button className='add'  onClick={() => dispatch('INCREASE', { name: `colesterol_food` })}></button>
                                            <button className='diff' onClick={() => dispatch('DECREASE', { name: `colesterol_food` })}></button>
                                        </div>
                                    </div>
                                </div>
                            </li>
                            <li className='info_columns opt'>
                                <div>
                                    <span>???????????????</span>
                                    <div className='number'>
                                        <input type='number' name={`trans_fat_food`} className='in_txt_small' value={item[`trans_fat_food`] ?? 0} onChange={e => dispatch({ type: 'WRITE', item: e.target })} />
                                        <div className='icon_wrap'>
                                            <button className='add'  onClick={() => dispatch('INCREASE', { name: `trans_fat_food` })}></button>
                                            <button className='diff' onClick={() => dispatch('DECREASE', { name: `trans_fat_food` })}></button>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <span>????????????</span>
                                    <div className='number'>
                                        <input type='number' name={`ploy_fat_food`} className='in_txt_small' value={item[`ploy_fat_food`] ?? 0} onChange={e => dispatch({ type: 'WRITE', item: e.target })} />
                                        <div className='icon_wrap'>
                                            <button className='add'  onClick={() => dispatch('INCREASE', { name: `ploy_fat_food` })}></button>
                                            <button className='diff' onClick={() => dispatch('DECREASE', { name: `ploy_fat_food` })}></button>
                                        </div>
                                    </div>
                                </div>
                            </li>
                            <li className='info_columns opt'>
                                <div>
                                    <span>?????????</span>
                                    <div className='number'>
                                        <input type='number' name={`caffeine_food`} className='in_txt_small' value={item[`caffeine_food`] ?? 0} onChange={e => dispatch({ type: 'WRITE', item: e.target })} />
                                        <div className='icon_wrap'>
                                            <button className='add'  onClick={() => dispatch('INCREASE', { name: `caffeine_food` })}></button>
                                            <button className='diff' onClick={() => dispatch('DECREASE', { name: `caffeine_food` })}></button>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>

                { button }
            </form>
        </div>
    );
}



export function FoodList(props) {
    const listTit = ['No', '??????', '??????', '??????', '??????', '??????', '?????????', '?????????', '??????', '??????'];
    const sCtg = ['CAKE', 'COOKIE', 'SANDWICH'];
    const [keyword, search] = useState([{ perPage: 10, page: 0 }]);

    if(props.state.mode === 0) {
        return(
            <div id="body">
                <Title bigTit='??????' button={props.state} refetch={props.refetch}/>
                <div className='cmm_list_wrap'>
                    <MenuSearch ctg={sCtg} search={search} keyword={keyword}/>
                    <List ctg='food' tit={listTit} search={keyword} setSearch={search} refetch={props.refetch}/>
                </div>
            </div>
    );
    } else {
        return(
            <FoodForm state={props.state} refetch={props.refetch}/>
        );
    }
}