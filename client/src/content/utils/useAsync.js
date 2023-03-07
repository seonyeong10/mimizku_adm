const { useReducer, useEffect } = require("react");

// custom hook
function reducer(state, action) {
    switch(action.type) {
        case 'LOADING' : return{
            loading: true,
            data: null,
            error: null
        };
        case 'SUCCESS' : return{
            loading: false,
            data: action.data,
            error: null
        };
        case 'ERROR' : return{
            loading: false,
            data: null,
            error: action.error
        };
        default :
            throw new Error(`Unhandled action type : ${action.type}`);
    }
}

/** async-await custom hook
 * - callback : callback함수
 * - deps : 파라미터
 */
export function useAsync(callback, deps = []) {
    const [state, dispatch] = useReducer(reducer, {
        loading: false,
        data: null,
        error: false
    });

    const fetchData = async () => {
        dispatch({ type: 'LOADING' });
        try {
            const data = await callback();
            console.log('fetch data');
            console.log(data);
            dispatch({ type: 'SUCCESS', data });
        } catch(e) {
            console.log(e);
            dispatch({ type: 'ERROR', error: e });
        }
    }

    useEffect(() => {
        fetchData();
    }, deps);

    return [state, fetchData];
}

// 데이터 나중에 가져오기
// --> skip = true
export function useAsyncSkip(callback, deps = [], skip = false) {
    const [state, dispatch] = useReducer(reducer, {
        loading: false,
        data: null,
        error: false
    });

    const fetchData = async () => {
        dispatch({ type : 'LOADING' });
        try {
            const data = await callback();
            // console.log('fetchData');
            // console.log(data);
            dispatch({ type: 'SUCCESS', data });
        } catch (e) {
            console.log(e);
            dispatch({ type: 'ERROR', error: e });
        }
    }

    useEffect(() => {
        if(skip) return;
        fetchData();
    }, deps);

    return [state, fetchData];
}