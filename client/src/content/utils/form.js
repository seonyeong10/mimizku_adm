import axios from "axios";
import { nvl } from "./common";

let src = null;
// text, radio, select, textarea
export function inputHandler(e, state, setState) {
    const name = e.target.name;
    const value = e.target.value;

    setState({
        ...state,
        [name] : value
    });
}

// checkbox
export function arrayHandler(e, state, setState) {
    const name = e.target.name;
    const value = e.target.value;
    let array = state[name] ?? [];

    if(array.includes(value)) 
        array = array.filter(el => el !== value);
    else {
        array.push(value);

    }

    array.sort();

    setState({
        ...state,
        [name] : array
    });
}

// input[type='number']
export function increaseHandler(name, value, state, setState) {
    let cnt = state[name] + value;
    if(Number.isNaN(cnt)) {
        cnt = 1;
    } else if(cnt < 0) {
        cnt = 0;
    }
    setState({
        ...state,
        [name]: cnt
    });
}

// preview
// export function preview(e, state, setState) {
export function preview(e, setState) {
    const fileDOM = document.querySelector(`#${e.target.name}`);

    if(src != null){
        // 링크 삭제
        URL.revokeObjectURL(src);
    }
    src = URL.createObjectURL(fileDOM.files[0]);
    document.querySelector(`#preview_${e.target.name}`).style.background = 'url('+src+') center/cover no-repeat';

    setState('FILE', e.target);
}

// submit
// action : C, R, U, D
// file : 0 has, 1 no
export function create(data, url) {
    axios.post(url, data, {
        headers: { 'Content-Type' : 'application/json;charset=UTF-8' }
    }).then(res => {
        console.log(res);
    }).catch(err => {
        if(err.response) {
            // 요청이 이루어졌으나 서버가 2xx의 범위를 벗어나는 상태코드로 응답
            console.log(err.reponse.data);
            console.log(err.reponse.status);
            console.log(err.reponse.headers);
        } else if(err.request) {
            // 요청이 이루어졌으나 응답을 받지 못함
            // 브라우저의 XMLHttpRequest 인스턴스 또는 Node.js의 http.ClientRequest 인스턴스
            console.log(err.reuqest);
        } else {
            console.log('Err', err.message);
        }
    }).then(res => {
        URL.revokeObjectURL(src);
    });
}

// update
export function update(data, url) {
    axios.put(url, data, {
        headers: { 'Content-Type' : 'application/json;charset=UTF-8' }
    }).then(res => {
        console.log(res);
    }).catch(err => {
        if(err.response) {
            // 요청이 이루어졌으나 서버가 2xx의 범위를 벗어나는 상태코드로 응답
            console.log(err.reponse.data);
            console.log(err.reponse.status);
            console.log(err.reponse.headers);
        } else if(err.request) {
            // 요청이 이루어졌으나 응답을 받지 못함
            // 브라우저의 XMLHttpRequest 인스턴스 또는 Node.js의 http.ClientRequest 인스턴스
            console.log(err.reuqest);
        } else {
            console.log('Err', err.message);
        }
    }).then(res => {
        URL.revokeObjectURL(src);
    });
}

// delete
export function erase(url, relocate) {
    axios.delete(url, [], {
        headers: { 'Content-Type' : 'application/json;charset=UTF-8' }
    }).then(res => {
        // console.log(res);
        window.location.reload();
    }).catch(err => {
        if(err.response) {
            // 요청이 이루어졌으나 서버가 2xx의 범위를 벗어나는 상태코드로 응답
            console.log(err);
        } else if(err.request) {
            // 요청이 이루어졌으나 응답을 받지 못함
            // 브라우저의 XMLHttpRequest 인스턴스 또는 Node.js의 http.ClientRequest 인스턴스
            console.log(err.reuqest);
        } else {
            console.log('Err', err.message);
        }
    });
}

// sumit with file
export function createFile(data, url) {
    console.log(data);
    axios.post(url, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => {
        console.log(res);
        alert('저장되었습니다.');
        // window.location.reload();
    }).catch(err => {
        if(err) {
            // 요청이 이루어졌으나 서버가 2xx의 범위를 벗어나는 상태코드로 응답
            console.log(err);
        } else if(err.request) {
            // 요청이 이루어졌으나 응답을 받지 못함
            // 브라우저의 XMLHttpRequest 인스턴스 또는 Node.js의 http.ClientRequest 인스턴스
            console.log(err.reuqest);
        } else {
            console.log('Err', err.message);
        }
    }).then(res => {
        URL.revokeObjectURL(src);
    });
}

// multi create test
function multiCreate(url, data) {
    // console.log(data);
    return axios.post(url, data, {
        headers: { 'Content-Type' : 'application/json;charset=UTF-8' }
    });
}

// 파일 업로드
function fileUpload(data) {
    const fileData = { file: data.file, id: data.id }

    return axios.post('/api/upload', fileData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
}

// delete file
function fileDelete(data) {
    if(data.file) {
        return axios.delete(`/api/image/${data.file}`, {
            headers: { 'Content-Type' : 'application/json;charset=UTF-8' }
        });
    } else {
        // no file
    }
}

// multi axios
export function createWithFile(data, url) {
    console.log('start create with file upload');
    axios.all([multiCreate(url, data), fileUpload(data)])
        .then(res => {
            const create = res[0].data.message;
            const file = res[1].data.message;
            if(create === file) {
                alert('success!!');
            } else if(create === 'rejected' || file === 'rejected') {
                alert('rejected..');
            }
        });
}

// multi update
export function multiUpdate(data, url) {
    console.log('start multi update');
    axios.all([createFile(data, url), fileDelete(data)])
        .then(res => {
            const update = res[0].data.message;
            const file = res[1].data.message;
            if(create === file) {
                alert('success!!');
            } else if(create === 'rejected' || file === 'rejected') {
                alert('rejected..');
            }
        });
}

// multi delete
export function multiErase(data, url) {
    console.log('start multi delete');
    
    axios.all([erase(url, null), fileDelete(data)])
        .then(res => {
            const update = res[0].data.message;
            const file = res[1].data.message;
            if(update === file) {
                alert('success!!');
                window.location.reload();
            }
        });
    
}

// formatter
export function formatter({type, target, reducer}) {
    switch(type) {
        case 'PHONE' : 
            const regEx1 = /[^0-9]/g;
            const regEx2 = /^(\d{2,3})(\d{3,4})(\d{4})$/;
            target.value = target.value.replace(regEx1, '').replace(regEx2,`$1-$2-$3`);
            break;
        case 'COST' : break;
        default : return;
    }
    // console.log(target.value);
    reducer({ type : 'WRITE' , item: target });
}