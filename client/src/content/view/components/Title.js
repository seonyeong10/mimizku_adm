export default function Title(props) {
    const pathname = window.location.pathname;
    // const button = () => {
    //     if(props.add === 1) {
    //         return <button className="cmm_filled_button" onClick={() => window.location.href=`${pathname}/add`}><img src='/images/add.svg' alt='add'/>Add</button>
    //         ;
    //     }
    // }
    // const annotation = () => {
    //     if(props.add === 0) {
    //         return <span><sup>*</sup>이 표시된 항목은 필수 항목입니다.</span>
    //     }
    // }
    let button, annotation;

    switch(props.button.mode) {
        case 0 : 
            button = <button className="cmm_filled_button" onClick={() => props.refetch('VIEW')}><img src='/images/add.svg' alt='add'/>Add</button>;
            annotation = '';
            break;
        case 1 :
            button = '';
            annotation = <span><sup>*</sup>이 표시된 항목은 필수 항목입니다.</span>;
            break;
    }
    
    return(
        <div className="cmm_title">
            <h2 className="bigTitle">
                { props.bigTit }
                { annotation }
            </h2>
            { button }
        </div>
    );
}