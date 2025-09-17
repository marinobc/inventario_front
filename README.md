# Frontend - Sistema de Gestión de Inventario

## Tabla de Contenidos

- [Descripción General](#descripción-general)
- [Arquitectura y Tecnologías](#arquitectura-y-tecnologías)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Funcionalidades Principales](#funcionalidades-principales)
- [Sistema de Autenticación y Autorización](#sistema-de-autenticación-y-autorización)
- [Componentes Principales](#componentes-principales)
- [Gestión de Estado](#gestión-de-estado)
- [Manejo de API](#manejo-de-api)
- [Instalación y Ejecución](#instalación-y-ejecución)

## Descripción General

Este proyecto es una aplicación frontend desarrollada con Vue.js 3 para gestionar inventario de hardware y usuarios. La aplicación ofrece un sistema completo de autenticación, autorización basada en permisos, y interfaces para administrar equipos de hardware y usuarios del sistema.

## Arquitectura y Tecnologías

- **Framework**: Vue.js 3 (Composition API)
- **Enrutamiento**: Vue Router 4
- **Gestión de Estado**: Pinia
- **HTTP Client**: Axios
- **Build Tool**: Vite
- **Estilos**: CSS modular con variables CSS
- **Lenguaje**: JavaScript ES6+

## Estructura del Proyecto

```
src/
├── assets/           # Estilos y recursos
│   ├── main.css      # Estilos principales y variables CSS
│   ├── layout.css    # Estilos de layout
│   ├── forms.css     # Estilos de formularios
│   ├── tables.css    # Estilos de tablas
│   ├── buttons.css   # Estilos de botones
│   ├── alerts.css    # Estilos de alertas
│   ├── navbar.css    # Estilos de navegación
│   ├── login.css     # Estilos de login
│   └── modal.css     # Estilos de modales
├── components/       # Componentes reutilizables
│   ├── common/       # Componentes base
│   │   ├── AlertMessage.vue
│   │   ├── BaseButton.vue
│   │   ├── BaseModal.vue
│   │   ├── ConfirmDeleteModal.vue
│   │   ├── DataTable.vue
│   │   ├── ModalForm.vue
│   │   └── PageWrapper.vue
│   ├── Navbar.vue    # Barra de navegación
│   └── IdleTimeoutModal.vue  # Modal de timeout
├── pages/            # Componentes de página
│   ├── Dashboard.vue
│   ├── Hardware.vue
│   ├── Login.vue
│   ├── Profile.vue
│   └── Users.vue
├── router/           # Configuración de rutas
│   └── index.js
├── services/         # Servicios de API
│   └── api.js
├── stores/           # Stores de Pinia
│   └── auth.js
└── main.js           # Punto de entrada
```

## Funcionalidades Principales

### 1. Autenticación y Gestión de Sesión
- Login/logout de usuarios
- Verificación de sesión activa
- Timeout automático por inactividad
- Heartbeat para mantener sesión activa

### 2. Gestión de Hardware
- Listado de equipos con filtros avanzados
- Creación, edición y eliminación de equipos
- Filtros por tipo, marca, estado, responsable, etc.
- Validación de permisos por usuario

### 3. Gestión de Usuarios
- Listado de usuarios del sistema
- Creación, edición y eliminación de usuarios
- Asignación de departamentos y scopes (roles)
- Validación de permisos cruzados

### 4. Sistema de Permisos
- Autorización basada en backend
- Permisos granular por módulo y acción
- Restricciones visuales según permisos

## Sistema de Autenticación y Autorización

### Flujo de Autenticación
1. Usuario ingresa credenciales en `/login`
2. Backend valida y retorna usuario + permisos
3. Información se almacena en Pinia store
4. Router guard verifica acceso a rutas protegidas
5. Interceptor de Axios maneja errores 401 automáticamente

### Sistema de Permisos
Los permisos son proporcionados por el backend y se almacenan en el store de autenticación. Cada módulo (hardware, users) tiene permisos específicos:
- `canAccessModule`: Acceso al módulo
- `canCreate`: Crear nuevos elementos
- `canUpdate`: Editar elementos existentes
- `canDelete`: Eliminar elementos

## Componentes Principales

### Componentes Base Reutilizables

**BaseModal**: Componente modal genérico con teleportación al body y transiciones.

**DataTable**: Tabla de datos con slots personalizables para celdas y acciones.

**ModalForm**: Formulario modal para crear/editar entidades.

**ConfirmDeleteModal**: Modal de confirmación para eliminaciones.

### Páginas

**Hardware.vue**: Gestión completa de inventario de hardware con filtros, formularios y validaciones.

**Users.vue**: Administración de usuarios con lógica compleja de permisos.

**Dashboard.vue**: Página principal con información del usuario.

## Gestión de Estado

La aplicación utiliza Pinia para el manejo de estado global:

### Auth Store
- `user`: Información del usuario autenticado
- `permissions`: Permisos del usuario actual
- `isAuthenticated`: Estado de autenticación
- Acciones: `login`, `logout`, `checkSession`

## Manejo de API

El servicio `api.js` configura Axios con:
- URL base configurable por environment variables
- Interceptores para manejar errores de autenticación
- Credenciales incluidas en todas las requests

```javascript
// Ejemplo de uso en componentes
import apiClient from '@/services/api';

const fetchData = async () => {
  try {
    const response = await apiClient.get('/endpoint');
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
  }
};
```

## Instalación y Ejecución

### Prerrequisitos
- Node.js (`22.19.0`)
- npm
- Backend

### Pasos para Ejecución Local

1. **Clonar el Repositorio**
   ```bash
   git clone <repositorio>
   cd <repositorio>
   ```

2. **Instalar Dependencias**
   ```bash
   npm install
   ```

3. **Configurar Variables de Entorno**

   Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido (ajusta los valores según tu entorno):

   ```env
   # Connects the local frontend to the local backend
   VITE_API_BASE_URL=/api
   # Connects the local frontend to the production backend
   # VITE_API_BASE_URL=<URL>/api
   ```

4. **Iniciar el Servidor de Desarrollo**
   ```bash
   npm run dev
   ```

5. **Acceder a la Aplicación**
   Normalmente en `http://localhost:5173`.

### Notas importantes:
- Asegúrate de que el backend esté ejecutándose localmente en el puerto 3000
- El proxy de Vite redirige las requests `/api` al backend local
- Para conectar con un backend remoto, modifica la variable `VITE_API_BASE_URL`

### Configuración de Vercel
El proyecto incluye `vercel.json` para configurar rewrites necesarios para SPAs.