import HeaderButton from "./HeaderButton";

interface PageProps {
    page: 'inicio' | 'viajes' | 'mensajes' | 'perfil';
}

export default function HeaderMobile(props: PageProps){
    return <div>
            <header id="header_mobile_bottom">
                <nav>
                    <HeaderButton active={props.page === 'inicio'} size={30} name='Inicio' src='house.svg' href='./' />
                    <HeaderButton active={props.page === 'viajes'}  size={30} name='Viajes' src='route.svg' href='./travel' />
                    <HeaderButton active={props.page === 'mensajes'}  size={30} name='Mensajes' src='message.svg' href='./chat' />
                    <HeaderButton active={props.page === 'perfil'}  size={30} name='Perfil' src='profile.svg' href='./profile' />
                </nav>
            </header>
            <header id="header_mobile_top">
                <nav>
                    <div></div>
                    <p>UniMove</p>
                    <a style={{position: 'absolute', right: 30}}>
                        <img src='/bell.svg'/>
                    </a>
                </nav>
            </header>
        </div>
}