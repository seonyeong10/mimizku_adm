import { ACTION } from "content/common/action";
/** 공통 Reducer 
 * WRITE: text,radio,textarea,date
 * APPEND: checkbox
*/
export function formReducer(state, action) {
    const name = action.data?.name;
    let value = action.data?.value;
    
    switch(action.type) {
        // form 작성
        case ACTION.WRITE : {
            if(state[name] === 'Y') value = 'N';
            return { ...state, [name]: value };
        }
        // 배열 객체
        case ACTION.APPEND : {
            let arr = state[name]?.filter(el => el !== value) ?? [];
            if(action.data.checked) arr.push(value);
            return { ...state, [name]: arr };
        }
        // 개수 증가
        case ACTION.INCREASE : {
            const count = state[name] ?? 0;
            return { ...state, [name]: count+1 };
        }
        // 개수 감소
        case ACTION.DECREASE : {
            const count = state[name] ?? 0;
            return { ...state, [name]: count < 1 ? 0 : count-1 };
        }
        // 파일 첨부
        case ACTION.FILE : return { ...state, [name] : action.data.files[0] };
        // 조회
        case ACTION.FETCH : return action.data;
        // 컴포넌트 열기
        case ACTION.OPEN : {}
        // 컴포넌트 닫기
        case ACTION.CLOSE : {}
        default : return {};
    }
}