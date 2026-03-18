import Header from '../components/Header.tsx';
import Map from '../components/Map.tsx';

// Página principal
export default function Main() {
    return (
        <>
            <Map />
            <Header type='mobile' page='inicio'/>
        </>
    )
}