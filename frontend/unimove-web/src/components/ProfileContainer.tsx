import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Profile from '../pages/Profile.tsx';

interface ProfileData {
    fullName: string;
    username: string;
    email: string;
    avatarUrl: string;
}

export default function ProfileContainer() {
    const { id } = useParams<{ id: string }>();
    const [profileData, setProfileData] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;

        const fetchProfile = async () => {
            setLoading(true);
            setError(null);

            try {
                let url = '';

                if (id === 'me') {
                    url = '/profile/me';
                } else {
                    url = `/profile?user=${encodeURIComponent(id)}`;
                }

                const response = await fetch(url);

                // 1. Verificar si la respuesta fue exitosa (status 200-299)
                if (!response.ok) {
                    // Intentar leer el cuerpo del error para ver qué dice el servidor
                    const errorText = await response.text();
                    throw new Error(`Servidor respondió con ${response.status}: ${errorText.substring(0, 100)}`);
                }

                // 2. Verificar el tipo de contenido antes de parsear
                const contentType = response.headers.get("content-type");

                if (!contentType || !contentType.includes("application/json")) {
                    const textContent = await response.text();
                    throw new Error(`La respuesta no es JSON. Recibido: ${textContent.substring(0, 100)}`);
                }

                // 3. Parsear JSON seguro
                const data = await response.json();

                // Validación básica de estructura
                if (!data.fullName || !data.username || !data.email || !data.avatarUrl) {
                    throw new Error("La respuesta del servidor no tiene la estructura esperada.");
                }

                setProfileData(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Ocurrió un error desconocido al cargar el perfil');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [id]);

    if (loading) {
        return (
            <div className="profile-container" style={{ textAlign: 'center', padding: '50px' }}>
                <p>Cargando perfil...</p>
            </div>
        );
    }

    if (error || !profileData) {
        return (
            <div className="profile-container" style={{ textAlign: 'center', padding: '50px', color: '#dc2626' }}>
                <h3>Error al cargar perfil</h3>
                <p>{error}</p>
                <p style={{ fontSize: '0.9em', color: '#666' }}>
                    Revisa la consola del navegador (F12) para ver los detalles de la petición.
                </p>
            </div>
        );
    }

    return <Profile profileData={profileData} />;
}