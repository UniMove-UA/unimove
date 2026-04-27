import {Link} from "react-router-dom";

interface ButtonProps {
    active: boolean;
    size: number;
    name: string;
    src: string;
    href?: string;
}

export default function HeaderButton(props: ButtonProps){
    return <Link className={props.active ? 'active' : ''} to={ props.href ? '/' + props.href : ''} >
        <img src={'/' + props.src} width={props.size} height={props.size} />
        {props.name}
    </Link>
}