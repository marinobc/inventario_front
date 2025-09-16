# Sistema de Gestión de Inventario - Frontend

Este documento ofrece una visión completa de la aplicación frontend en Vue.js para el Sistema de Gestión de Inventario. Está dirigido a desarrolladores que deban mantener o extender la aplicación.

## 📋 Tabla de Contenidos

* [Resumen](#-resumen)
* [Conceptos Clave y Arquitectura](#-conceptos-clave-y-arquitectura)
  * [Flujo de Autenticación](#flujo-de-autenticación)
  * [Gestión de Estado (Pinia)](#gestión-de-estado-pinia)
  * [Permisos y Control de Acceso Basado en Roles (RBAC)](#permisos-y-control-de-acceso-basado-en-roles-rbac)
* [Estructura del Proyecto](#-estructura-del-proyecto)
* [🚀 Primeros Pasos: Configuración del Entorno de Desarrollo](#-primeros-pasos-configuración-del-entorno-de-desarrollo)
* [🛠️ Cómo Agregar un Nuevo Módulo de Departamento](#️-cómo-agregar-un-nuevo-módulo-de-departamento)
* [Dependencia del Backend](#-dependencia-del-backend)



## 📖 Resumen

Se trata de una aplicación moderna de una sola página (SPA) construida con **Vue 3**, **Vite**, **Pinia** y **Vue Router**. Proporciona una interfaz para gestionar activos de la empresa, comenzando con el inventario de hardware y la gestión de usuarios. La aplicación cuenta con un sólido sistema de control de acceso basado en roles (RBAC), que adapta la experiencia del usuario según su rol y departamento.

### Funcionalidades Principales

* **Autenticación Segura**: Sistema de inicio de sesión que establece una sesión segura con el backend.
* **Navegación Dinámica**: La barra de navegación muestra solo los módulos permitidos para el usuario.
* **Acceso Basado en Roles**: Los elementos de la interfaz (botones como “Agregar”, “Editar”, “Eliminar”) y páginas completas se renderizan de forma condicional según los permisos del usuario.
* **Módulo de Inventario de Hardware**: Interfaz CRUD (Crear, Leer, Actualizar, Eliminar) para gestionar activos de hardware, con capacidad de filtrado.
* **Módulo de Gestión de Usuarios**: Interfaz CRUD para gestionar cuentas de usuario, con lógica de permisos que restringe acciones (por ejemplo, un Gerente solo puede gestionar usuarios de su propio departamento).


## 🏛️ Conceptos Clave y Arquitectura

### Flujo de Autenticación

1. El usuario ingresa sus credenciales en la **página de Login** (`src/pages/Login.vue`).
2. La acción `login` en el **store de auth** (`src/stores/auth.js`) envía la solicitud al backend (`/api/auth/login`).
3. Si es exitoso, el backend devuelve una cookie de sesión. El servicio `api.js` está configurado con `withCredentials: true` para enviarla en cada petición.
4. Luego, la aplicación ejecuta `checkSession()` para obtener los datos del usuario y almacenarlos en el estado de Pinia.
5. El **router** (`src/router/index.js`) utiliza un guard `beforeEach` para proteger rutas, verificando autenticación y permisos definidos en `meta`.

### Gestión de Estado (Pinia)

El estado global (usuario y autenticación) se maneja en el **store de auth** (`src/stores/auth.js`):

* `user`: Contiene los datos del usuario autenticado (ID, nombre, rol, departamento).
* `isAuthenticated`: Propiedad computada que indica si existe un usuario autenticado.
* **Permisos Computados**: Propiedades reactivas (`canAccessHardwareModule`, `canEditUser`, etc.) que definen permisos de forma sencilla.

### Permisos y Control de Acceso Basado en Roles (RBAC)

El sistema de permisos se define en `src/stores/auth.js` y depende de dos atributos:

* **Rol (Scope)**: Nivel de rol del usuario (ej. ‘Owner’, ‘Manager’, ‘Employee’).
* **Departamento**: Área asignada al usuario (ej. ‘Hardware’, ‘Ventas’).

Los permisos se aplican en:

1. **UI (Plantillas)**: Con directivas `v-if` basadas en permisos del store.
2. **Router**: Usando `meta.permission` en cada ruta y validado por el guard de navegación.

## 📁 Estructura del Proyecto

La carpeta `src` está organizada para mantener el código modular y ordenado:

```
src/
├── components/      # Componentes reutilizables (ej. Navbar)
├── pages/           # Páginas principales (una por ruta)
├── router/          # Configuración de Vue Router y guards
├── services/        # Capa de comunicación con API (Axios)
├── stores/          # Stores de Pinia (ej. auth)
├── App.vue          # Shell principal de la app
└── main.js          # Punto de entrada de la aplicación
```


## 🚀 Primeros Pasos: Configuración del Entorno de Desarrollo

### Requisitos Previos

* **Node.js**: Se requiere una versión reciente ser recomienda la version ltsc (`22.19.0`).
* **Servidor Backend**: Debe estar en ejecución en `http://localhost:3000`. Vite está configurado para redirigir peticiones `/api` a esa dirección.

### Instalación y Ejecución

1. **Clonar el Repositorio**
2. **Instalar Dependencias**

   ```bash
   npm install
   ```
3. **Iniciar el Servidor de Desarrollo**

   ```bash
   npm run dev
   ```
4. **Acceder a la Aplicación**
   Normalmente en `http://localhost:5173`.


## 🛠️ Cómo Agregar un Nuevo Módulo de Departamento

Ejemplo: crear un módulo de inventario para **Software**, siguiendo el modelo del módulo de **Hardware**.

1. **Crear el Componente de Página**: `src/pages/Software.vue`. Copiar `Hardware.vue` y reemplazar referencias de “Hardware” por “Software”.
2. **Definir Permisos en el Store**: Agregar propiedades computadas en `src/stores/auth.js`.
3. **Agregar la Ruta**: Editar `src/router/index.js` e incluir el nuevo componente con su validación de permisos.
4. **Agregar el Enlace en Navbar**: Modificar `src/components/Navbar.vue` para incluir `<RouterLink v-if="authStore.canAccessSoftwareModule" to="/software">Software</RouterLink>`.
5. **Crear Endpoints en Backend**: Implementar rutas `/api/software` y asociadas.


## 🔌 Dependencia del Backend

La aplicación es **solo frontend** y depende completamente de un backend externo. La configuración de Vite (`vite.config.js`) redirige cualquier petición a `/api` hacia `http://localhost:3000`.

**Es obligatorio que el backend esté en ejecución en el puerto 3000 antes de iniciar el frontend.**