# Sistema de Gestión de Inventario

Este documento ofrece una visión general del **Sistema de Gestión de Inventario**, una aplicación web construida con **Vue.js** para administrar el inventario de hardware y las cuentas de usuario. Incluye una explicación detallada de la estructura del proyecto, su funcionalidad y las instrucciones para configurarlo y ejecutarlo localmente.

## Tabla de Contenidos

* [Visión General del Proyecto](#visión-general-del-proyecto)
* [Funcionalidades Clave](#funcionalidades-clave)
* [Arquitectura](#arquitectura)
* [Estructura del Frontend](#estructura-del-frontend)
* [Autenticación y Autorización](#autenticación-y-autorización)
* [Gestión de Inventario](#gestión-de-inventario)
* [Gestión de Usuarios](#gestión-de-usuarios)
* [Gestión de Sesiones](#gestión-de-sesiones)
* [Estilos y Componentes UI](#estilos-y-componentes-ui)
* [Instalación y Configuración](#instalación-y-configuración)
* [Ejecución de la Aplicación](#ejecución-de-la-aplicación)

## Visión General del Proyecto

El **Sistema de Gestión de Inventario** es una **SPA (Single Page Application)** diseñada para administrar el inventario de hardware y las cuentas de usuario dentro de una organización. Construida con **Vue.js**, ofrece una interfaz **responsiva y fácil de usar** para visualizar, crear, actualizar y eliminar registros de hardware y perfiles de usuario.
La aplicación se integra con un **backend API** (asumido en `http://localhost:3000`) para manejar operaciones de datos y autenticación de usuarios.

## Funcionalidades Clave

* **Autenticación de Usuarios:** Sistema de login seguro con gestión de sesiones y cierre automático por inactividad.
* **Gestión de Inventario de Hardware:** Crear, actualizar, eliminar y filtrar registros de hardware.
* **Gestión de Usuarios:** Administración de cuentas con permisos basados en roles (Propietario, Gerente, Empleado).
* **Interfaz Responsiva:** Estilos consistentes con componentes reutilizables (tablas, formularios, modales y alertas).
* **Control de Acceso Basado en Roles:** Restricción de funcionalidades según el rol del usuario.
* **Tiempo de Sesión:** Cierre automático después de un periodo de inactividad con modal de advertencia.

## Arquitectura

La aplicación sigue una arquitectura modular de frontend usando:

* **Vue.js 3**
* **Vue Router** para enrutamiento del cliente
* **Pinia** para gestión centralizada del estado
* **Axios** para comunicación con el API

Componentes clave:

* **Componentes Vue:** UI reutilizable (`DataTable`, `ModalForm`, `BaseButton`, etc.).
* **Pinia Store:** Manejo del estado de autenticación (`auth.js`).
* **Composables:** Lógica reutilizable para interacciones con la API (`useApiResource.js`) y gestión de inventario (`useInventory.js`).
* **Vue Router:** Rutas protegidas según autenticación y permisos.
* **CSS Modules:** Estilos modulares con variables CSS para un tema consistente.

## Estructura del Frontend

El frontend está organizado en el directorio `inventario_front`:

* `src/assets/` → Archivos CSS para estilos de componentes, formularios, tablas, modales y alertas.
* `src/components/` → Componentes reutilizables como `DataTable.vue`, `ModalForm.vue`, `Navbar.vue`.
* `src/composables/` → Lógica para API (`useApiResource.js`) e inventario (`useInventory.js`).
* `src/pages/` → Páginas principales: `Login.vue`, `Dashboard.vue`, `Hardware.vue`, `Users.vue`, `Profile.vue`.
* `src/router/` → Configuración de rutas y protección de navegación.
* `src/services/` → Configuración de Axios (`api.js`).
* `src/stores/` → Estado de autenticación (`auth.js`).
* `src/App.vue` → Componente raíz con lógica de timeout de sesión y layout.
* `src/main.js` → Punto de entrada de la aplicación Vue.

## Autenticación y Autorización

Manejada por el **store de Pinia `auth.js`**:

* **Login:** Los usuarios se autentican vía `/auth/login`, y los datos se almacenan en el store.
* **Gestión de Sesiones:** La función `checkSession` verifica sesiones activas vía `/auth/session`.
* **Permisos:** Roles con capacidades (`canAccessModule`, `canCreate`, `canUpdate`, `canDelete`).
* **Protección de Rutas:** El hook `beforeEach` de Vue Router restringe rutas protegidas y redirige a login si no hay autorización.

## Gestión de Inventario

La página `Hardware.vue`, junto con el composable `useInventory`, maneja los registros de hardware:

* **Tabla de Datos:** Columnas para tipo, marca, modelo, serie, fecha de mantenimiento, versión de SO, responsable, costo y estado.
* **Filtros:** Búsqueda por tipo, marca, estado, responsable, versión de SO y fecha de mantenimiento.
* **CRUD:** Crear, actualizar y eliminar registros con formularios modales y diálogos de confirmación.
* **Datos Relacionados:** Opciones de filtros desde el endpoint `/hardware/filters`.

## Gestión de Usuarios

La página `Users.vue` maneja las cuentas de usuario:

* **Tabla de Datos:** Columnas para usuario, nombre completo, correo, departamento y rol.
* **Restricciones por Rol:** Propietarios gestionan todos los usuarios; Gerentes solo empleados; edición propia limitada en algunos campos.
* **CRUD:** Crear, actualizar y eliminar cuentas con validación de campos obligatorios.

## Gestión de Sesiones

El componente `App.vue` incluye lógica de timeout de sesión:

* **Inactividad:** Tras 2.5 minutos sin actividad aparece un modal (`IdleTimeoutModal.vue`) con cuenta regresiva de 30 segundos.
* **Extensión de Sesión:** El usuario puede mantener la sesión activa con un clic, enviando ping a `/auth/session`.
* **Heartbeat:** Pings periódicos a `/auth/ping` cada 2 minutos para mantener la sesión.
* **Visibilidad:** Controla visibilidad de la pestaña del navegador para pausar/reanudar el temporizador.

## Estilos y Componentes UI

La aplicación usa **CSS modular** con un tema consistente definido en `main.css`:

* **Variables CSS:** En `:root` (colores, bordes, etc.).
* **Componentes Reutilizables:** `BaseButton`, `AlertMessage`, `DataTable`, `ModalForm`, `ConfirmDeleteModal`.
* **Diseño Responsivo:** Layouts en grid para formularios y filtros, manejo de overflow en tablas.
* **Transiciones:** Modales con efecto de fade usando `Transition` de Vue.

## Instalación y Configuración

### Clonar el Repositorio

```bash
> git clone <repositorio>
> cd <repositorio>
```

### Instalar Dependencias

```bash
> npm install
```

### Configurar Variables de Entorno

Crear un archivo `.env` en la raíz con:

```env
# Conecta frontend local con backend local
VITE_API_BASE_URL=/api

# Conecta frontend local con backend en producción
# VITE_API_BASE_URL=<backend-url>/api
```

## Ejecución de la Aplicación

### Iniciar Servidor de Desarrollo

```bash
> npm run dev
```

### Acceder a la Aplicación

Abrir en el navegador:

```
http://localhost:5173
```

⚠️ Nota: Asegúrate de que el **backend API** esté corriendo (por ejemplo en `http://localhost:3000`) y configurado correctamente para aceptar solicitudes del frontend.