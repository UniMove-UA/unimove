import type React from 'react';
import Header from './Header';

interface PageProps {
    children?: React.ReactNode;
    name: 'inicio' | 'viajes' | 'mensajes' | 'perfil';
}

export default function Page(props: PageProps){
    return (
        <>
            {props.children ?? ''}
            <Header type='mobile' page={props.name}/>
        </>
    );
}