import { useState, useRef, useEffect } from 'react';
import Page from "../components/Page";
import '../styles/Profile.css';
import VehicleRegistrationModal from "../components/VehicleRegistrationModal.tsx";
import RatingModal from "../components/RatingModal.tsx";
import {useNavigate} from "react-router-dom";
import QRCode from 'react-qr-code'

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

interface Booking {
    id: number;
    status: string;
    travel: {
        id: number;
        origin: string;
        destination: string;
        departure_time: string;
        price: string;
        status: string;
        driver: {
            id: number;
            name: string;
            username: string;
        };
    };
}

interface VmpQrItem {
    id: number;
    payment_intent_id: string;
    status: string;
    created_at: string | null;
    vmp_id: number | null;
    title: string | null;
    qr_value: string | null;
    vmp: {
        id: number;
        code: string;
        location_name: string | null;
        type: string;
    } | null;
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
    const navigate = useNavigate();

    const [passwordData, setPasswordData] = useState({
        new_password: '',
        new_password_confirmation: '',
    });
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [passwordSuccess, setPasswordSuccess] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [showPasswordSection, setShowPasswordSection] = useState(false);

    const [tempData, setTempData] = useState<ProfileData>({
        fullName: profileData.fullName || "",
        username: profileData.username || "",
        email: profileData.email || "",
        avatarUrl: getImageUrl(profileData.avatarUrl),
        rating: profileData.rating ?? 0,
    });

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<number | string | null>(null);
    const [vehicleActionError, setVehicleActionError] = useState<string | null>(null);
    const [bookings, setBookings] = useState<Booking[]>([])
    const [bookingsLoading, setBookingsLoading] = useState(false)
    const [cancellingBookingId, setCancellingBookingId] = useState<number | null>(null)
    const [vmpQrs, setVmpQrs] = useState<VmpQrItem[]>([])
    const [vmpQrsLoading, setVmpQrsLoading] = useState(false)
    const [ratingModal, setRatingModal] = useState({isOpen: false, travelId: 0, revieweeId: 0, name: "", bookingId: 0});
    const [myReviewTravelIds, setMyReviewTravelIds] = useState<number[]>([])
    const [myRatings, setMyRatings] = useState<any[]>([])
    const [ratingsLoading, setRatingsLoading] = useState(false)

    const fetchMyRatings = async () => {
        setRatingsLoading(true)
        try {
            const token = localStorage.getItem('auth_token')
            const res = await fetch(`http://localhost:8000/api/profile/@${tempData.username}/reviews`, {
                headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
            })
            if (!res.ok) return
            const data = await res.json()
            setMyRatings(data)
        } catch {
            //
        } finally {
            setRatingsLoading(false)
        }
    }

    const fetchMyReviews = async () => {
        try {
            const token = localStorage.getItem('auth_token')
            const res = await fetch('http://localhost:8000/api/reviews/me', {
                headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
            })
            if (!res.ok) return
            const data = await res.json()
            setMyReviewTravelIds(data.map((r: any) => r.travel_id))
        }
        catch {
            //
        }
    }

    const handleCancelBooking = async (bookingId: number) => {
        try {
            const token = localStorage.getItem('auth_token')
            const res = await fetch(`http://localhost:8000/api/bookings/${bookingId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            })
            if (!res.ok) throw new Error()
            setBookings(prev => prev.filter(b => b.id !== bookingId))
        } catch {
            alert('No se pudo cancelar la reserva.')
        } finally {
            setCancellingBookingId(null)
        }
    }

    const handleDeleteVehicle = async (id: number | string) => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`http://localhost:8000/api/vehicles/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al eliminar');
            }

            setDeleteConfirmId(null);
            fetchVehicles();
        } catch (err) {
            console.error('Error completo:', err);
            setVehicleActionError(err instanceof Error ? err.message : 'No se pudo eliminar el vehículo.');
        }
    };

    const handleUpdateVehicle = async () => {
        if (!editingVehicle) return;

        const normalizedPlate = editingVehicle.plate.toUpperCase().replace(/\s/g, '');
        const plateRegex = /^\d{4}[A-Z]{3}$/;
        if (!plateRegex.test(normalizedPlate)) {
            setVehicleActionError('Formato de matrícula inválido. Ej: 1234ABC');
            return;
        }

        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`http://localhost:8000/api/vehicles/${editingVehicle.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ ...editingVehicle, plate: normalizedPlate }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al actualizar');
            }

            setEditingVehicle(null);
            setVehicleActionError(null);
            fetchVehicles();
        } catch (err) {
            setVehicleActionError(err instanceof Error ? err.message : 'Error desconocido');
        }
    };

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

    const fetchBookings = async () => {
        setBookingsLoading(true)
        try {
            const token = localStorage.getItem('auth_token')
            const res = await fetch('http://localhost:8000/api/bookings/me', {
                headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
            })
            if (!res.ok) throw new Error()
            const data = await res.json()
            setBookings(data)
        }
        catch {
            //
        }
        finally {
            setBookingsLoading(false)
        }
    }

    const fetchMyVmpQrs = async () => {
        setVmpQrsLoading(true)
        try {
            const token = localStorage.getItem('auth_token')
            const res = await fetch('http://localhost:8000/api/payments/vmp/me', {
                headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
            })
            if (!res.ok) throw new Error()
            const data = await res.json()
            setVmpQrs(Array.isArray(data) ? data : [])
        } catch {
            setVmpQrs([])
        } finally {
            setVmpQrsLoading(false)
        }
    }

    useEffect(() => {
        fetchVehicles()
        fetchBookings()
        fetchMyVmpQrs()
        fetchMyReviews()
        fetchMyRatings()
    }, [])

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

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
        if (passwordError) setPasswordError(null);
        if (passwordSuccess) setPasswordSuccess(false);
    };

    const handlePasswordSubmit = async () => {
        if (!passwordData.new_password || !passwordData.new_password_confirmation) {
            setPasswordError('Por favor, rellena todos los campos.');
            return;
        }
        if (passwordData.new_password.length < 8) {
            setPasswordError('La nueva contraseña debe tener al menos 8 caracteres.');
            return;
        }
        if (passwordData.new_password !== passwordData.new_password_confirmation) {
            setPasswordError('Las contraseñas no coinciden.');
            return;
        }

        setPasswordLoading(true);
        setPasswordError(null);

        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch('http://localhost:8000/api/profile/password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
                body: JSON.stringify(passwordData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                const message =
                    errorData.message ||
                    (errorData.errors ? Object.values(errorData.errors).flat().join(', ') : 'Error al cambiar la contraseña.');
                throw new Error(message);
            }

            setPasswordSuccess(true);
            setPasswordData({ new_password: '', new_password_confirmation: '' });

            setTimeout(() => {
                setShowPasswordSection(false);
                setPasswordSuccess(false);
            }, 2000);

        } catch (err) {
            setPasswordError(err instanceof Error ? err.message : 'Error desconocido');
        } finally {
            setPasswordLoading(false);
        }
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
            setShowPasswordSection(false);
            setPasswordData({ new_password: '', new_password_confirmation: '' });
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
        setShowPasswordSection(false);
        setPasswordData({ new_password: '', new_password_confirmation: '' });
        setPasswordError(null);
        setPasswordSuccess(false);
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
                            <img src="/star.svg" alt="Estrella" className="profile-star-icon" />
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
                                        <input type="text" name="fullName" value={tempData.fullName} onChange={handleChange} className="profile-field-input" />
                                    ) : (
                                        <p className="profile-field-value">{tempData.fullName}</p>
                                    )}
                                </div>

                                <div className="profile-field">
                                    <label className="profile-field-label">Usuario</label>
                                    {isEditing ? (
                                        <input type="text" name="username" value={tempData.username} onChange={handleChange} className="profile-field-input" />
                                    ) : (
                                        <p className="profile-field-value">{tempData.username}</p>
                                    )}
                                </div>

                                <div className="profile-field">
                                    <label className="profile-field-label">Correo Electrónico</label>
                                    {isEditing ? (
                                        <input type="email" name="email" value={tempData.email} onChange={handleChange} className="profile-field-input" />
                                    ) : (
                                        <p className="profile-field-value">{tempData.email}</p>
                                    )}
                                </div>
                            </div>

                            {isEditing && (
                                <div className="password-section">
                                    <button
                                        type="button"
                                        className="profile-btn-toggle-password"
                                        onClick={() => {
                                            setShowPasswordSection(prev => !prev);
                                            setPasswordError(null);
                                            setPasswordSuccess(false);
                                            setPasswordData({ new_password: '', new_password_confirmation: '' });
                                        }}
                                    >
                                        {showPasswordSection ? 'Ocultar cambio de contraseña' : 'Cambiar contraseña'}
                                    </button>

                                    {showPasswordSection && (
                                        <div className="password-fields">
                                            <div className="profile-field">
                                                <label className="profile-field-label">Nueva contraseña</label>
                                                <input
                                                    type="password"
                                                    name="new_password"
                                                    value={passwordData.new_password}
                                                    onChange={handlePasswordChange}
                                                    className="profile-field-input"
                                                    placeholder="Mínimo 8 caracteres"
                                                />
                                            </div>
                                            <div className="profile-field">
                                                <label className="profile-field-label">Repetir nueva contraseña</label>
                                                <input
                                                    type="password"
                                                    name="new_password_confirmation"
                                                    value={passwordData.new_password_confirmation}
                                                    onChange={handlePasswordChange}
                                                    className="profile-field-input"
                                                    placeholder="••••••••"
                                                />
                                            </div>

                                            {passwordError && (
                                                <div className="error-message">{passwordError}</div>
                                            )}
                                            {passwordSuccess && (
                                                <div className="error-message" style={{ color: '#10b981' }}>
                                                    ✅ Contraseña cambiada con éxito
                                                </div>
                                            )}

                                            <button
                                                type="button"
                                                className="btn-register"
                                                onClick={handlePasswordSubmit}
                                                disabled={passwordLoading}
                                            >
                                                {passwordLoading ? 'Guardando...' : 'Guardar nueva contraseña'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

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
                                        <button type="button" onClick={handleCancel} className="profile-btn profile-btn-cancel">
                                            Cancelar
                                        </button>
                                        <button type="submit" className="profile-btn profile-btn-confirm">
                                            Confirmar
                                        </button>
                                    </>
                                )}
                            </div>
                        </form>
                    </div>
                </div>

                <h2 style={{ fontSize: 20, fontWeight: "bold", marginTop: 32 }}>Mis reservas</h2>
                <div className="vehicles-list-container">
                    {bookingsLoading ? (
                        <p>Cargando reservas...</p>
                    ) : bookings.length === 0 ? (
                        <p>No tienes reservas.</p>
                    ) : (
                        <ul className="vehicles-list">
                            {bookings.map((booking) => (
                                <li key={booking.id} className="vehicle-item">
                                    <div className="vehicle-info">
                                        <strong>{booking.travel?.origin} → {booking.travel?.destination}</strong>
                                        <span>{booking.travel?.departure_time}</span>
                                        <span style={{
                                            color: booking.status === 'confirmed' ? '#10b981'
                                                : booking.status === 'cancelled' ? '#dc2626'
                                                    : booking.status === 'completed' ? '#6366f1'
                                                        : '#f59e0b',
                                            fontWeight: 500
                                        }}>
                            {booking.status === 'confirmed' ? 'Confirmada'
                                : booking.status === 'cancelled' ? 'Cancelada'
                                    : booking.status === 'completed' ? 'Completada'
                                        : 'Pendiente'}
                        </span>
                                        <span>{booking.travel?.price}€</span>
                                    </div>
                                    {booking.status === 'confirmed' && booking.travel?.status === 'completed' && !myReviewTravelIds.includes(booking.travel.id) && (
                                        <div className="vehicle-actions">
                                            <button
                                                className="profile-btn profile-btn-edit"
                                                onClick={() => {
                                                    setRatingModal({
                                                        isOpen: true,
                                                        travelId: booking.travel.id,
                                                        revieweeId: booking.travel.driver.id,
                                                        name: booking.travel.driver.name,
                                                        bookingId: booking.id
                                                    });
                                                }}
                                            >
                                                Valorar
                                            </button>
                                        </div>
                                    )}
                                    {booking.status === 'pending' && (
                                        <div className="vehicle-actions">
                                            <button
                                                className="profile-btn profile-btn-edit"
                                                onClick={() => navigate(`/checkout?type=carpool&id=${booking.travel.id}`)}
                                            >
                                                Pagar
                                            </button>
                                            {cancellingBookingId === booking.id ? (
                                                <>
                                                    <button
                                                        className="vehicle-btn-confirm-delete"
                                                        onClick={() => handleCancelBooking(booking.id)}
                                                    >
                                                        Confirmar
                                                    </button>
                                                    <button
                                                        className="vehicle-btn-cancel-delete"
                                                        onClick={() => setCancellingBookingId(null)}
                                                    >
                                                        Cancelar
                                                    </button>
                                                </>
                                            ) : (
                                                <button
                                                    className="vehicle-btn-icon vehicle-btn-delete"
                                                    title="Cancelar reserva"
                                                    onClick={() => setCancellingBookingId(booking.id)}
                                                >
                                                    ✕
                                                </button>
                                            )}
                                        </div>
                                    )}
                                    {myReviewTravelIds.includes(booking.travel.id) && (
                                        <span style={{ color: '#10b981', fontSize: 13 }}>Valorado</span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <h2 style={{ fontSize: 20, fontWeight: "bold", marginTop: 32 }}>Mis QR</h2>
                <div className="vehicles-list-container">
                    {vmpQrsLoading ? (
                        <p>Cargando QR...</p>
                    ) : vmpQrs.length === 0 ? (
                        <p>Aún no tienes QR de VMP.</p>
                    ) : (
                        <ul className="vehicles-list">
                            {vmpQrs
                                .filter((x) => !!x?.qr_value)
                                .map((item) => (
                                    <li key={item.id} className="vehicle-item">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                            <div style={{ background: '#fff', padding: 10, borderRadius: 12, border: '1px solid rgba(0,0,0,0.08)' }}>
                                                <QRCode value={item.qr_value as string} size={84} />
                                            </div>
                                            <div className="vehicle-info" style={{ flex: 1 }}>
                                                <strong>{item.title || item.vmp?.location_name || item.vmp?.code || (item.vmp_id ? `VMP #${item.vmp_id}` : 'VMP')}</strong>
                                                {item.vmp_id && <span>ID VMP: {item.vmp_id}</span>}
                                                {item.created_at && <span>{new Date(item.created_at).toLocaleString()}</span>}
                                                <span style={{ color: item.status === 'succeeded' ? '#10b981' : item.status === 'failed' ? '#dc2626' : '#f59e0b', fontWeight: 500 }}>
                                                    {item.status === 'succeeded' ? 'Pagado' : item.status === 'failed' ? 'Fallido' : 'Pendiente'}
                                                </span>
                                            </div>
                                            {item.vmp_id && (
                                                <div className="vehicle-actions">
                                                    <button
                                                        className="profile-btn profile-btn-edit"
                                                        onClick={() => navigate(`/vmp-success/${item.vmp_id}`, { state: { returnTo: '/profile/me', returnLabel: 'Volver al perfil' } })}
                                                    >
                                                        Ver grande
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </li>
                                ))}
                        </ul>
                    )}
                </div>

                <h2 style={{ fontSize: 20, fontWeight: "bold", marginTop: 32 }}>Mis valoraciones</h2>
                <div className="vehicles-list-container">
                    {ratingsLoading ? (
                        <p>Cargando valoraciones...</p>
                    ) : myRatings.length === 0 ? (
                        <p>Aún no tienes valoraciones.</p>
                    ) : (
                        <ul className="vehicles-list">
                            {myRatings.map((review, index) => (
                                <li key={index} className="vehicle-item">
                                    <div className="vehicle-info">
                                        <strong>{review.author}</strong>
                                        <span style={{ color: '#f59e0b' }}>
                            {'⭐'.repeat(review.rating)} {review.rating}/5
                        </span>
                                        {review.comment && (
                                            <span style={{ color: '#555', fontStyle: 'italic' }}>
                                "{review.comment}"
                            </span>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>


                <h2 style={{ fontSize: 20, fontWeight: "bold" }}>Mis vehículos</h2>

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
                                    {editingVehicle?.id === vehicle.id ? (
                                        <div className="vehicle-edit-form">
                                            <input
                                                className="profile-field-input"
                                                value={editingVehicle.brand}
                                                onChange={e => setEditingVehicle({ ...editingVehicle, brand: e.target.value })}
                                                placeholder="Marca"
                                            />
                                            <input
                                                className="profile-field-input"
                                                value={editingVehicle.model}
                                                onChange={e => setEditingVehicle({ ...editingVehicle, model: e.target.value })}
                                                placeholder="Modelo"
                                            />
                                            <input
                                                className="profile-field-input"
                                                value={editingVehicle.plate}
                                                onChange={e => setEditingVehicle({ ...editingVehicle, plate: e.target.value })}
                                                placeholder="Matrícula"
                                                maxLength={8}
                                            />
                                            <input
                                                className="profile-field-input"
                                                type="number"
                                                value={editingVehicle.total_seats}
                                                onChange={e => setEditingVehicle({ ...editingVehicle, total_seats: Number(e.target.value) })}
                                                placeholder="Asientos"
                                                min={1}
                                                max={9}
                                            />
                                            {vehicleActionError && (
                                                <p style={{ color: 'red', fontSize: 13 }}>{vehicleActionError}</p>
                                            )}
                                            <div className="vehicle-edit-actions">
                                                <button className="vehicle-btn-save" onClick={handleUpdateVehicle}>Guardar</button>
                                                <button className="vehicle-btn-cancel" onClick={() => { setEditingVehicle(null); setVehicleActionError(null); }}>Cancelar</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="vehicle-info">
                                                <strong>{vehicle.brand} {vehicle.model}</strong>
                                                <span>Matrícula: {vehicle.plate}</span>
                                                <span>Asientos: {vehicle.total_seats}</span>
                                            </div>
                                            <div className="vehicle-actions">
                                                <button
                                                    className="vehicle-btn-icon"
                                                    title="Editar"
                                                    onClick={() => { setEditingVehicle(vehicle); setVehicleActionError(null); }}
                                                >✏️</button>
                                                {deleteConfirmId === vehicle.id ? (
                                                    <>
                                                        <button className="vehicle-btn-confirm-delete" onClick={() => handleDeleteVehicle(vehicle.id)}>Confirmar</button>
                                                        <button className="vehicle-btn-cancel-delete" onClick={() => { setDeleteConfirmId(null); setVehicleActionError(null); }}>Cancelar</button>
                                                    </>
                                                ) : (
                                                    <button
                                                        className="vehicle-btn-icon vehicle-btn-delete"
                                                        title="Eliminar"
                                                        onClick={() => { setDeleteConfirmId(vehicle.id); setVehicleActionError(null); }}
                                                    >✕</button>
                                                )}
                                                {deleteConfirmId === vehicle.id && vehicleActionError && (
                                                    <p style={{ color: 'red', fontSize: 13, marginTop: 4 }}>{vehicleActionError}</p>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>


                <button onClick={() => setIsModalOpen(true)} className="profile-btn-nuevo">
                    Nuevo vehículo
                </button>

                <VehicleRegistrationModal isOpen={isModalOpen} onClose={handleCloseModal} />
            </div>
            <RatingModal 
                isOpen={ratingModal.isOpen} 
                onClose={() => setRatingModal({ ...ratingModal, isOpen: false })}
                travelId={ratingModal.travelId}
                revieweeId={ratingModal.revieweeId}
                revieweeName={ratingModal.name}
                onSuccess={() => {
                    setMyReviewTravelIds(prev => [...prev, ratingModal.travelId])
                    fetchBookings()
                }}
            />
        </Page>
    );
}