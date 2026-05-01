import { useState, useRef } from 'react';
import Page from "../components/Page";
import '../styles/Profile.css';

interface ProfileData {
    fullName: string;
    username: string;
    email: string;
    avatarUrl: string;
}

interface ProfileProps {
    profileData: ProfileData;
}

export default function Profile({ profileData }: ProfileProps) {
    const [isEditing, setIsEditing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [tempData, setTempData] = useState<ProfileData>({ ...profileData });
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

        const formData = new FormData();
        formData.append('fullName', tempData.fullName);
        formData.append('username', tempData.username);
        formData.append('email', tempData.email);

        if (selectedFile) {
            formData.append('avatar', selectedFile);
        }

        try {
            // POST a la api
            await new Promise(resolve => setTimeout(resolve, 1000));

            setTempData(profileData);
            setIsEditing(false);
            setSelectedFile(null);
            alert("Perfil actualizado correctamente");
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