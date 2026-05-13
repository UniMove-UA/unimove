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
                    url = 'http://localhost:8000/api/profile/me';
                } else {
                    url = `http://localhost:8000/api/profile?user=${encodeURIComponent(id)}`;
                }

                const token = localStorage.getItem('auth_token');
                const response = await fetch(url, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Servidor respondió con ${response.status}: ${errorText.substring(0, 100)}`);
                }
                const data = await response.json();
                setProfileData({
                    fullName: data.name,
                    username: data.username,
                    email: data.email,
                    avatarUrl: data.image
                });
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Ocurrió un error desconocido al cargar el perfil');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

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