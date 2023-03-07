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

export function GoodsForm(props) {
    const param = props.state.data;
    const [item, dispatch] = useReducer(reducer, {});

    let title = '' , button = <div></div>;

    useEffect(() => {
        if(!param) return;

        axios.get(`/api/menu/goods/${param}`)
             .then(res => {
                const allergy = res.data.rows[0][0].allergy.split(',');
                const cmmInfo = {
                    ...res.data.rows[0][0],
                    allergy : allergy
                }

                Object.keys(res.data.rows[1][0]).map(key => {
                    cmmInfo[key+'_goods'] = res.data.rows[1][0][key];
                });

                document.getElementById('preview_img_goods').style.background = `url('http://localhost:3000/api/image/${cmmInfo.pic_goods}') center/cover no-repeat`;
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
        const entries = fd.entries();
        for(const pair of entries) {
            console.log(pair[0], pair[1]);
        }

        createFile(fd, `/api/menu/goods`);
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
        createFile(fd, `/api/menu/goods/${param}`);
    }

    const onDelete = (e) => {
        console.log('delete');
        erase(`/api/menu/goods/${item.id}`, '/menu/goods');
    }

    if(!param) {
        title = '등록';
        button = <InfoButton onSubmit={e => onSubmit(e)} replace={`/menu/goods/add`}  refetch={props.refetch}/>
    } else {
        title = '상세'
        button = <UpdateButton onSubmit={() => onUpdate()} onDelete={() => onDelete()} replace={`/menu/goods/${param.id}`} refetch={props.refetch}/>;
    }

    return(
        <div id="body">
            <Title bigTit={`상품 ${title}`} button={props.state} refetch={props.refetch}/>
            <form className='cmm_info_wrap' encType='multipart/form-item' onSubmit={e => e.preventDefault()}>
                
                <div className='cmm_info_container'>
                    <h3 className='headline'>기본정보 <img src='/images/info.svg' alt='info' style={{ verticalAlign: 'middle' }} /></h3>
                    <div className='flex_item' style={{borderBottom: '1px solid #2B2B2B', borderTop: '1px solid #2B2B2B'}}>
                        <div className='file_item'>
                            <input id='img_goods' type='file' name='img_goods' onChange={e => preview(e, (type, item) => dispatch({ type: type, item: item }))}/>
                            <label htmlFor='img_goods' id='preview_img_goods'></label>
                        </div>
                        <ul className='info_item'>
                            <li>
                               <span>분류</span>
                               <select name='sub_clas' className='cmm_minimal_dropbox' value={item?.sub_clas} 
                                       onChange={ (e) => dispatch({ type : 'WRITE' , item: e.target }) }>
                                    <option value=''>분류를 선택하세요.</option>
                                    <option value='MUG'>Mug</option>
                                    <option value='TUMBLER'>Tumbler</option>
                                </select>
                            </li>
                            <li className='info_columns opt'>
                                <div>
                                    <span>이름</span>
                                    <input type='text' name='nm' className='in_txt_small' value={item?.nm} onChange={(e) => dispatch({ type : 'WRITE' , item: e.target })}/>
                                </div>
                                <div>
                                    <span>영문이름</span>
                                    <input type='text' name='nm_eng' className='in_txt_small' value={item?.nm_eng} onChange={(e) => dispatch({ type : 'WRITE' , item: e.target })}/>
                                </div>
                            </li>
                            <li className='info_columns opt'>
                                <div>
                                    <span>가격</span>
                                    <input type='text' name='fee_goods' className='in_txt_small' value={item?.fee_goods} onChange={(e) => dispatch({ type : 'WRITE' , item: e.target })}/>
                                </div>
                                <div>
                                    <span>옵션</span>
                                    <input id='opt_season' type='radio' name='yn_season' value='Y' checked={item?.yn_season === 'Y'} onChange={(e) => dispatch({ type : 'WRITE' , item: e.target })}/> 
                                    <label htmlFor='opt_season'>Season</label>
                                    <input id='opt_recomm' type='radio' name='yn_recomm' value='Y' checked={item?.yn_recomm === 'Y'} onChange={(e) => dispatch({ type : 'WRITE' , item: e.target })}/>
                                    <label htmlFor='opt_recomm'>추천</label>
                                </div>
                            </li>
                            <li>
                                <span>판매기간</span>
                                <input type='date' name='dt_start' className='in_txt_small' value={item?.dt_start} onChange={(e) => dispatch({ type : 'WRITE' , item: e.target })}/> 
                                ~ 
                                <input type='date' name='dt_end' className='in_txt_small' value={item?.dt_end} onChange={(e) => dispatch({ type : 'WRITE' , item: e.target })}/>
                            </li>
                            <li className='info_columns' style={{gap : 0}}>
                                <span>설명</span>
                                <textarea name='expl' className='textarea' value={item?.expl ?? ''} onChange={(e) => dispatch({ type : 'WRITE' , item: e.target })}></textarea>
                            </li>
                            <li className='info_columns' style={{gap : 0}}>
                                <span>추가설명</span>
                                <textarea name='add_expl' className='textarea' value={item?.add_expl ?? ''} onChange={(e) => dispatch({ type : 'WRITE' , item: e.target })}></textarea>
                            </li>
                        </ul>
                    </div>
                </div>
                
                { button }
            </form>
        </div>
    );
}

export function GoodsList(props) {
    const listTit = ['No', '분류', '사진', '온도', '이름', '가격', '시작일', '종료일', '시즌', '추천'];
    const sCtg = ['CAKE', 'COOKIE', 'SANDWICH'];
    const [keyword, search] = useState([{ perPage: 10, page: 0 }]);

    if(props.state.mode === 0) {
        return(
            <div id="body">
                <Title bigTit='음식' button={props.state} refetch={props.refetch}/>
                <div className='cmm_list_wrap'>
                    <MenuSearch ctg={sCtg} search={search} keyword={keyword}/>
                    <List ctg='goods' tit={listTit} search={keyword} setSearch={search} refetch={props.refetch}/>
                </div>
            </div>
        );
    } else {
        return <GoodsForm state={props.state} refetch={props.refetch}/>
    }
}