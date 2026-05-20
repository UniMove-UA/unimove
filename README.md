#  UniMove

**UniMove** es una plataforma de movilidad colaborativa diseñada por y para la comunidad universitaria. Conectamos a estudiantes y personal académico para compartir trayectos, reducir gastos y fomentar una movilidad más sostenible tanto en el interior como en el exterior del campus

---

###  Características Principales
* **Carpooling Universitario:** Encuentra o publica viajes al campus en segundos.
* **Consulta intensiva:** Con los horarios de todo el transporte público relativo a la universidad
* **Desplazamientos a través del campus universitario:** Permite la movilidad rápida en el interior del campus con el alquiler 
* **Interfaz Intuitiva:** Diseño adaptado a móvil y escritorio.

---

###  Tecnologías
* **Frontend:** React / Dashboard Web
* **Backend:** PHP con Laravel
* **Mapas:** Integración con OpenStreetMap

---

### Instalación local

Se necesitarán los archivos `.env` tanto del backend como del frontend.

#### Backend
Para utilizar la integración con Stripe:
```sh
stripe login
stripe listen --forward-to localhost:8000/api/stripe/webhook```

```sh
php composer install
php artisan migrate:all --fresh --seed
php artisan serve
```

#### Frontend

```sh
npm install
npm run dev
```
