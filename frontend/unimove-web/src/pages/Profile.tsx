import { useState, useRef } from 'react';
import Page from "../components/Page";
import '../styles/Profile.css';

// 1. Actualizar la interfaz para incluir rating (opcional)
interface ProfileData {
    fullName: string;
    username: string;
    email: string;
    avatarUrl: string;
    rating?: number; // Nuevo campo
}

interface ProfileProps {
    profileData: ProfileData;
}

export default function Profile({ profileData }: ProfileProps) {
    const [isEditing, setIsEditing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 2. Inicializar rating en tempData
    const [tempData, setTempData] = useState<ProfileData>({
        fullName: profileData.fullName || "",
        username: profileData.username || "",
        email: profileData.email || "",
        avatarUrl: profileData.avatarUrl || "",
        rating: profileData.rating ?? 0, // Si no viene, usa 0
    });

    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleAvatarClick = () => {
        if (isEditing && fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const objectUrl = URL.createObjectURL(file);
            setTempData(prev => ({ ...prev, avatarUrl: objectUrl }));
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setTempData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem('auth_token');
            const payload = {
                name: tempData.fullName,
                username: tempData.username,
                email: tempData.email,
                image: tempData.avatarUrl != "" ? tempData.avatarUrl : null,
            };
            const response = await fetch(`http://localhost:8000/api/profile/me`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }

            const data = await response.json();

            // Actualizar también el rating si el backend lo devuelve
            setTempData({
                fullName: data.user.name,
                username: data.user.username,
                email: data.user.email,
                avatarUrl: data.user.image,
                rating: data.user.rating ?? tempData.rating, // Mantener el actual si no viene
            });

            setIsEditing(false);
            setSelectedFile(null);
            alert(data.message);
        } catch (error) {
            console.error("Error al actualizar perfil", error);
            alert("Hubo un error al guardar los cambios.");
        }
    };

    const handleCancel = () => {
        setTempData(profileData);
        setIsEditing(false);
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <Page name='perfil'>
            <div className="profile-container">
                <h1 className="profile-title">Mi Perfil</h1>

                <div className="profile-layout">
                    <div className="profile-avatar-section">
                        <div
                            onClick={isEditing ? handleAvatarClick : undefined}
                            className={`profile-avatar-wrapper ${isEditing ? 'editing' : ''}`}
                            title={isEditing ? "Haz clic para cambiar la foto" : ""}
                        >
                            <img
                                src={tempData.avatarUrl}
                                alt="Foto de perfil"
                                className="profile-avatar-image"
                            />
                            {isEditing && (
                                <div className="profile-avatar-overlay">
                                    <span className="profile-avatar-overlay-text">Cambiar</span>
                                </div>
                            )}
                        </div>

                        <div className="profile-rating-badge">
                            <img
                                src="/star.svg"
                                alt="Estrella"
                                className="profile-star-icon"
                            />
                            <span className="profile-rating-text">
                                {tempData.rating} estrellas
                            </span>
                        </div>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="file-input-hidden"
                        />
                    </div>

                    <div className="profile-info-section">
                        <form onSubmit={handleSubmit} className="profile-form">
                            <div className="profile-field-group">
                                <div className="profile-field">
                                    <label className="profile-field-label">Nombre Completo</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="fullName"
                                            value={tempData.fullName}
                                            onChange={handleChange}
                                            className="profile-field-input"
                                        />
                                    ) : (
                                        <p className="profile-field-value">{tempData.fullName}</p>
                                    )}
                                </div>

                                <div className="profile-field">
                                    <label className="profile-field-label">Usuario</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="username"
                                            value={tempData.username}
                                            onChange={handleChange}
                                            className="profile-field-input"
                                        />
                                    ) : (
                                        <p className="profile-field-value">{tempData.username}</p>
                                    )}
                                </div>

                                <div className="profile-field">
                                    <label className="profile-field-label">Correo Electrónico</label>
                                    {isEditing ? (
                                        <input
                                            type="email"
                                            name="email"
                                            value={tempData.email}
                                            onChange={handleChange}
                                            className="profile-field-input"
                                        />
                                    ) : (
                                        <p className="profile-field-value">{tempData.email}</p>
                                    )}
                                </div>
                            </div>

                            <div className="profile-actions">
                                {!isEditing ? (
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(true)}
                                        className="profile-btn profile-btn-edit"
                                    >
                                        Editar perfil
                                    </button>
                                ) : (
                                    <>
                                        <button
                                            type="button"
                                            onClick={handleCancel}
                                            className="profile-btn profile-btn-cancel"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="submit"
                                            className="profile-btn profile-btn-confirm"
                                        >
                                            Confirmar
                                        </button>
                                    </>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </Page>
    );
}