import type React from 'react';
import Header from './Header';

interface PageProps {
    children?: React.ReactNode;
    name: 'inicio' | 'viajes' | 'vmp' | 'mensajes' | 'perfil';
}

export default function Page(props: PageProps) {
    return (
        <>
            <main>
                {props.children ?? ''}
            </main>
            <Header type='mobile' page={props.name} />
        </>
    );
}