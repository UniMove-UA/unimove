import { useState, useRef, useEffect } from 'react';
import Page from "../components/Page";
import '../styles/Profile.css';
import VehicleRegistrationModal from "../components/VehicleRegistrationModal.tsx";

interface ProfileData {
    fullName: string;
    username: string;
    email: string;
    avatarUrl: string;
    rating?: number;
}

interface Vehicle {
    id: number | string;
    brand: string;
    model: string;
    plate: string;
    total_seats: number;
}

interface ProfileProps {
    profileData: ProfileData;
}

const getImageUrl = (image: string | null | undefined): string => {
    if (!image) {
        return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ccc'%3E%3Cpath d='M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z'/%3E%3C/svg%3E`;
    }
    if (image.startsWith('http') || image.startsWith('blob') || image.startsWith('data')) {
        return image;
    }
    return `http://localhost:8000/storage/${image}`;
};

export default function Profile({ profileData }: ProfileProps) {
    const [isEditing, setIsEditing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [vehiclesLoading, setVehiclesLoading] = useState(false);
    const [vehiclesError, setVehiclesError] = useState<string | null>(null);

    const [tempData, setTempData] = useState<ProfileData>({
        fullName: profileData.fullName || "",
        username: profileData.username || "",
        email: profileData.email || "",
        avatarUrl: getImageUrl(profileData.avatarUrl),
        rating: profileData.rating ?? 0,
    });

    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const fetchVehicles = async () => {
        setVehiclesLoading(true);
        setVehiclesError(null);
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch('http://localhost:8000/api/vehicles/me', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Error al cargar vehículos: ${response.statusText}`);
            }

            const data = await response.json();
            setVehicles(data);
        } catch (err) {
            setVehiclesError(err instanceof Error ? err.message : 'Error desconocido');
        } finally {
            setVehiclesLoading(false);
        }
    };

    useEffect(() => {
        fetchVehicles();
    }, []);

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
            const formData = new FormData();
            formData.append('name', tempData.fullName);
            formData.append('username', tempData.username);
            formData.append('email', tempData.email);
            if (selectedFile) {
                formData.append('image', selectedFile);
            }
            const response = await fetch(`/api/profile/me`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Error del backend:", errorData);
                alert(JSON.stringify(errorData));
                throw new Error(`Error: ${response.status}`);
            }

            const data = await response.json();

            setTempData({
                fullName: data.user.name,
                username: data.user.username,
                email: data.user.email,
                avatarUrl: getImageUrl(data.user.image),
                rating: data.user.rating ?? tempData.rating,
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
        setTempData({
            ...profileData,
            avatarUrl: getImageUrl(profileData.avatarUrl),
        });
        setIsEditing(false);
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        fetchVehicles();
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
                                onError={(e) => {
                                    e.currentTarget.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ccc'%3E%3Cpath d='M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z'/%3E%3C/svg%3E`;
                                }}
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
                                {tempData.rating ? `${tempData.rating} estrellas` : 'Sin valoraciones'}
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

                <h2 style={{fontSize: 20, fontWeight: "bold"}}>Mis vehículos</h2>

                <div className="vehicles-list-container">
                    {vehiclesLoading ? (
                        <p>Cargando vehículos...</p>
                    ) : vehiclesError ? (
                        <p style={{ color: 'red' }}>{vehiclesError}</p>
                    ) : vehicles.length === 0 ? (
                        <p>No tienes vehículos registrados.</p>
                    ) : (
                        <ul className="vehicles-list">
                            {vehicles.map((vehicle) => (
                                <li key={vehicle.id} className="vehicle-item">
                                    <strong>{vehicle.brand} {vehicle.model}</strong>
                                    <span>Matrícula: {vehicle.plate}</span>
                                    <span>Asientos: {vehicle.total_seats}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className={"profile-btn-nuevo"}
                >Nuevo vehículo</button>
                <VehicleRegistrationModal isOpen={isModalOpen} onClose={handleCloseModal} />
            </div>
        </Page>
    );
}