
interface ButtonProps {
    active: boolean;
    size: number;
    name: string;
    src: string;
}

export default function HeaderButton(props: ButtonProps){
    return <a className={props.active ? 'active' : ''}>
        <img src={props.src} width={props.size} height={props.size} />
        {props.name}
    </a>
}