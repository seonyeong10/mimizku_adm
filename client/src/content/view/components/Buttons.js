export function InfoButton(props) {
    const goList = (url) => {
        window.location.replace(url);
    }
    return (
        <div className='cmm_button_wrap'>
            <button className="cmm_outlined_button" onClick={() => props.refetch('LIST')}>목록</button>
            <button className="cmm_filled_button" onClick={(e) => props.onSubmit(e)}>저장</button>
        </div>
    );
}

export function UpdateButton(props) {
    const goList = (url) => {
        window.location.replace(url);
    }
    return (
        <div className='cmm_button_wrap'>
            <button className="cmm_outlined_button" onClick={() => props.onDelete()}>삭제</button>
            <button className="cmm_filled_button" onClick={() => props.onSubmit()}>저장</button>
            <button className="cmm_outlined_button" onClick={() => props.refetch('LIST')}>목록</button>
        </div>
    );
}