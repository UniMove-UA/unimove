import HeaderMobile from './HeaderMobile';
import '../styles/Header.css';

interface HeaderProps {
    type: string;
    page: 'inicio' | 'viajes' | 'mensajes' | 'perfil';
}

export default function Header(props: HeaderProps ){
    switch(props.type){
        case 'mobile':
            return <HeaderMobile page={props.page} />
        default:
            return <div></div>
    }
}