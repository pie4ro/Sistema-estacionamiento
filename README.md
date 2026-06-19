# ParkAccess - Sistema Web de Gestión de Estacionamiento

## Descripción del proyecto

**ParkAccess** es un sistema web para la gestión de un estacionamiento. Permite registrar usuarios, diferenciar roles entre cliente y administrador, controlar vehículos, reservar espacios, liberar espacios y visualizar historiales de ingreso y salida.

El sistema fue desarrollado con **HTML, CSS, JavaScript y Supabase**. Supabase se utiliza para la autenticación de usuarios, almacenamiento de datos, registro de reservas, historial de accesos, gestión de fotos de perfil y aplicación de políticas de seguridad mediante Row Level Security.

El proyecto cuenta con dos tipos de usuario:

* **Cliente:** puede iniciar sesión, ver su panel, editar su perfil, administrar información de su vehículo, reservar espacios, liberar espacios y consultar su historial personal.
* **Administrador:** puede iniciar sesión, visualizar clientes registrados, buscar clientes, activar o desactivar cuentas, autorizar o no autorizar vehículos, revisar espacios ocupados/libres, liberar espacios y consultar el historial general.

---

# Tecnologías utilizadas

* HTML5
* CSS3
* JavaScript
* Supabase Auth
* Supabase Database
* Supabase Storage
* Row Level Security, RLS
* Visual Studio Code
* Live Server
* GitHub
* Vercel, GitHub Pages o Netlify para posible despliegue

---

# Estructura del proyecto

El proyecto está organizado separando las páginas del administrador, las páginas del cliente y los archivos generales.

```text
frontend/
│
├── admin/
│   ├── admin_dashboard.html
│   ├── admin_clientes.html
│   ├── admin_vehiculos.html
│   ├── admin_espacios.html
│   └── admin_historial.html
│
├── cliente/
│   ├── dashboard.html
│   ├── history.html
│   ├── parking.html
│   ├── profile.html
│   └── vehicle.html
│
├── index.html
├── new_account.html
├── script.js
├── styles.css
└── README.md
```

---

# Organización de archivos

## Archivos generales

### `index.html`

Es la página de inicio de sesión. Desde esta página pueden ingresar tanto clientes como administradores.

El sistema verifica el rol del usuario y redirige según corresponda:

```text
Administrador → admin/admin_dashboard.html
Cliente → cliente/dashboard.html
```

---

### `new_account.html`

Es la página de creación de cuenta. Permite registrar dos tipos de cuenta:

```text
Cliente
Administrador
```

Cuando se registra un cliente, se solicitan datos personales y datos del vehículo:

* Nombre completo
* DNI
* Correo electrónico
* Teléfono
* Placa del vehículo
* Color del vehículo
* Contraseña

Cuando se registra un administrador, se solicita una clave especial de administrador de 6 dígitos.

---

### `script.js`

Archivo principal de lógica del sistema. Contiene:

* Conexión a Supabase.
* Inicio de sesión.
* Registro de usuarios.
* Validación de rol.
* Redirección de cliente o administrador.
* Carga de datos del usuario.
* Gestión de perfil.
* Subida de foto de perfil.
* Gestión de vehículo.
* Reserva y liberación de espacios.
* Registro de historial.
* Panel administrador.
* Gestión de clientes.
* Gestión de vehículos.
* Gestión de espacios.
* Historial general.

---

### `styles.css`

Archivo principal de estilos. Contiene el diseño visual de:

* Login.
* Registro.
* Dashboard cliente.
* Perfil.
* Vehículo.
* Espacios.
* Historial.
* Panel administrador.
* Tablas del administrador.
* Diseño responsive.

---

# Carpeta `cliente/`

La carpeta `cliente/` contiene las páginas que usa el cliente después de iniciar sesión.

## `cliente/dashboard.html`

Panel principal del cliente. Muestra:

* Nombre del cliente.
* Placa del vehículo.
* Estado de acceso.
* Espacios disponibles.
* Último ingreso registrado.
* Accesos a perfil, vehículo, espacios e historial.

---

## `cliente/profile.html`

Página de perfil del cliente. Permite:

* Visualizar datos personales.
* Ver nombre, DNI, correo, teléfono y placa.
* Subir foto de perfil.
* Guardar foto en Supabase Storage.
* Editar información del perfil.

---

## `cliente/vehicle.html`

Página de información del vehículo. Muestra:

* Placa.
* Tipo de vehículo.
* Color.
* Estado de acceso.
* Espacio activo.
* Último ingreso.
* Validación del vehículo.

También permite editar:

* Tipo de vehículo.
* Color del vehículo.

---

## `cliente/parking.html`

Página de espacios del estacionamiento. Muestra un croquis visual de 12 espacios:

```text
A1, A2, A3, A4
B1, B2, B3, B4
C1, C2, C3, C4
```

Desde esta página el cliente puede:

* Ver espacios libres.
* Ver espacios ocupados.
* Reservar un espacio.
* Liberar su propio espacio.
* Registrar ingreso en el historial.
* Registrar salida al liberar el espacio.

Un cliente no puede reservar si su vehículo está en estado:

```text
No autorizado
```

---

## `cliente/history.html`

Página de historial personal del cliente. Muestra:

* Total de visitas.
* Último ingreso.
* Estado actual.
* Fecha.
* Hora de ingreso.
* Hora de salida.
* Placa.
* Espacio.
* Estado.

El cliente solo puede ver su propio historial.

---

# Carpeta `admin/`

La carpeta `admin/` contiene las páginas del administrador.

## `admin/admin_dashboard.html`

Panel principal del administrador. Muestra:

* Bienvenida del administrador.
* Estado del sistema.
* Acceso a clientes.
* Acceso a vehículos.
* Acceso a espacios.
* Acceso a historial.
* Total de clientes registrados.
* Total de vehículos registrados.
* Espacios disponibles.
* Estado general del sistema.

---

## `admin/admin_clientes.html`

Página para gestionar clientes registrados.

Permite:

* Ver clientes registrados.
* Buscar clientes por nombre, DNI, correo o placa.
* Ver datos principales del cliente.
* Activar o desactivar la cuenta del cliente.

Campos mostrados:

```text
Nombre
DNI
Correo
Teléfono
Placa
Estado
```

El estado del cliente puede ser:

```text
Activo
Inactivo
```

Si el cliente está inactivo, no puede ingresar al sistema.

---

## `admin/admin_vehiculos.html`

Página para gestionar vehículos registrados.

Permite:

* Ver vehículos asociados a clientes.
* Ver placa.
* Ver propietario.
* Ver correo.
* Ver teléfono.
* Cambiar estado del vehículo.

El estado del vehículo puede ser:

```text
Autorizado
No autorizado
```

Si el vehículo está como `No autorizado`, el cliente no puede reservar espacios.

---

## `admin/admin_espacios.html`

Página para gestionar espacios del estacionamiento.

Permite:

* Ver total de espacios.
* Ver espacios disponibles.
* Ver espacios ocupados.
* Ver qué cliente ocupa un espacio.
* Liberar espacios desde el panel administrador.

El sistema trabaja con 12 espacios en total.

---

## `admin/admin_historial.html`

Página para consultar el historial general.

Permite ver los ingresos y salidas de todos los clientes.

Muestra:

```text
Cliente
Placa
Espacio
Ingreso
Salida
Estado
```

También permite buscar registros por:

* Cliente.
* Placa.
* Espacio.
* Estado.

---

# Roles del sistema

## Cliente

El cliente puede:

* Crear una cuenta.
* Iniciar sesión.
* Ver su panel principal.
* Ver y editar su perfil.
* Subir foto de perfil.
* Ver los datos de su vehículo.
* Editar tipo y color del vehículo.
* Ver si su vehículo está autorizado.
* Reservar espacios.
* Liberar su espacio.
* Consultar su historial personal.

---

## Administrador

El administrador puede:

* Iniciar sesión.
* Ver el panel administrativo.
* Ver clientes registrados.
* Buscar clientes.
* Activar o desactivar cuentas.
* Ver vehículos registrados.
* Autorizar o no autorizar vehículos.
* Ver espacios libres y ocupados.
* Liberar espacios.
* Ver historial general.

---

# Estados utilizados

## Estado del cliente

Columna usada:

```text
estado_cliente
```

Valores:

```text
Activo
Inactivo
```

Significado:

* **Activo:** el cliente puede iniciar sesión y usar el sistema.
* **Inactivo:** el cliente no puede ingresar al sistema.

---

## Estado del vehículo

Columna usada:

```text
estado_vehiculo
```

Valores:

```text
Autorizado
No autorizado
```

Significado:

* **Autorizado:** el cliente puede reservar espacios.
* **No autorizado:** el cliente no puede reservar espacios.

---

## Estado del historial

Columna usada en `historial_accesos`:

```text
estado
```

Valores:

```text
Dentro
Finalizado
```

Significado:

* **Dentro:** el cliente tiene un espacio activo.
* **Finalizado:** el cliente ya liberó el espacio.

---

# Configuración de Supabase

El proyecto utiliza Supabase para:

* Autenticación.
* Base de datos.
* Storage.
* Seguridad con RLS.
* Roles de usuario.
* Registro de reservas.
* Registro de historial.

---

# Conexión a Supabase

En el archivo `script.js` se configura la conexión con Supabase:

```js
const SUPABASE_URL = "https://wmguxwalpztndjlsyvoz.supabase.co";
const SUPABASE_ANON_KEY = "TU_SUPABASE_ANON_KEY";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

La clave `SUPABASE_ANON_KEY` debe corresponder al proyecto de Supabase utilizado.

---

# Tabla `clientes`

La tabla `clientes` almacena los datos principales de los usuarios.

```sql
create table if not exists clientes (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre_completo text not null,
  dni text,
  telefono text,
  correo text not null,
  placa text,
  rol text default 'cliente',
  foto_url text,
  estado_cliente text default 'Activo',
  estado_vehiculo text default 'Autorizado',
  tipo_vehiculo text default 'Automóvil',
  color_vehiculo text default 'No registrado',
  zona_asignada text default 'Zona A',
  validacion_vehiculo text default 'Verificado',
  observacion text,
  updated_at timestamp default now(),
  created_at timestamp default now()
);
```

Si la tabla ya existe, se pueden agregar las columnas necesarias con:

```sql
alter table clientes add column if not exists rol text default 'cliente';
alter table clientes add column if not exists foto_url text;
alter table clientes add column if not exists estado_cliente text default 'Activo';
alter table clientes add column if not exists estado_vehiculo text default 'Autorizado';
alter table clientes add column if not exists tipo_vehiculo text default 'Automóvil';
alter table clientes add column if not exists color_vehiculo text default 'No registrado';
alter table clientes add column if not exists zona_asignada text default 'Zona A';
alter table clientes add column if not exists validacion_vehiculo text default 'Verificado';
alter table clientes add column if not exists observacion text;
alter table clientes add column if not exists updated_at timestamp default now();

alter table clientes alter column placa drop not null;
alter table clientes alter column dni drop not null;
alter table clientes alter column telefono drop not null;
```

Si existe una columna antigua llamada `estado`, se recomienda eliminarla para evitar confusión:

```sql
alter table clientes
drop column if exists estado;
```

---

# Políticas RLS para `clientes`

Activar RLS:

```sql
alter table clientes enable row level security;
```

Permitir que cada usuario inserte su propio perfil:

```sql
create policy "Cada usuario inserta su propio perfil"
on clientes
for insert
to authenticated
with check (auth.uid() = id);
```

Permitir que cada usuario vea su propio perfil:

```sql
create policy "Cada usuario ve su propio perfil"
on clientes
for select
to authenticated
using (auth.uid() = id);
```

Permitir que cada usuario actualice su propio perfil:

```sql
create policy "Cada usuario actualiza su propio perfil"
on clientes
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);
```

---

# Función para identificar administradores

```sql
create or replace function public.es_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.clientes
    where id = auth.uid()
    and rol = 'administrador'
  );
$$;
```

---

# Permisos de administrador sobre `clientes`

Permitir que los administradores vean todos los clientes:

```sql
drop policy if exists "Administradores pueden ver todos los clientes" on clientes;

create policy "Administradores pueden ver todos los clientes"
on clientes
for select
to authenticated
using (
  auth.uid() = id or public.es_admin()
);
```

Permitir que los administradores actualicen clientes:

```sql
drop policy if exists "Administradores pueden actualizar clientes" on clientes;

create policy "Administradores pueden actualizar clientes"
on clientes
for update
to authenticated
using (public.es_admin())
with check (public.es_admin());
```

---

# Tabla `admin_claves`

Esta tabla almacena las claves para crear cuentas de administrador.

```sql
create table if not exists admin_claves (
  id bigint generated always as identity primary key,
  codigo text not null,
  descripcion text,
  activo boolean default true,
  created_at timestamp default now()
);

alter table admin_claves enable row level security;
```

Ejemplo de clave de administrador:

```sql
insert into admin_claves (codigo, descripcion, activo)
values ('123456', 'Clave principal de administrador', true);
```

---

# Función para verificar clave de administrador

```sql
create or replace function verificar_clave_admin(codigo_input text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  return exists (
    select 1
    from admin_claves
    where codigo = codigo_input
    and activo = true
  );
end;
$$;
```

---

# Storage de fotos de perfil

El proyecto usa un bucket de Supabase Storage llamado:

```text
fotos-perfil
```

Este bucket se utiliza para guardar las fotos de perfil de los clientes.

El bucket debe estar configurado como público.

---

# Políticas para Storage

Permitir subir fotos de perfil:

```sql
create policy "Usuarios pueden subir su foto de perfil"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'fotos-perfil'
);
```

Permitir actualizar fotos de perfil:

```sql
create policy "Usuarios pueden actualizar su foto de perfil"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'fotos-perfil'
);
```

Permitir ver fotos de perfil:

```sql
create policy "Usuarios pueden ver fotos de perfil"
on storage.objects
for select
to public
using (
  bucket_id = 'fotos-perfil'
);
```

---

# Tabla `reservas_espacios`

Esta tabla almacena los espacios reservados por los clientes.

```sql
create table if not exists reservas_espacios (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  nombre_cliente text,
  espacio text not null unique,
  estado text default 'ocupado',
  created_at timestamp default now()
);

alter table reservas_espacios enable row level security;
```

---

# Políticas RLS para `reservas_espacios`

Permitir que los usuarios vean las reservas:

```sql
create policy "Usuarios pueden ver espacios reservados"
on reservas_espacios
for select
to authenticated
using (true);
```

Permitir que los usuarios reserven un espacio propio:

```sql
create policy "Usuarios pueden reservar un espacio"
on reservas_espacios
for insert
to authenticated
with check (auth.uid() = user_id);
```

Permitir que los usuarios liberen su propio espacio:

```sql
create policy "Usuarios pueden liberar su propio espacio"
on reservas_espacios
for delete
to authenticated
using (auth.uid() = user_id);
```

Permitir que los administradores liberen cualquier espacio:

```sql
drop policy if exists "Administradores pueden liberar cualquier espacio" on reservas_espacios;

create policy "Administradores pueden liberar cualquier espacio"
on reservas_espacios
for delete
to authenticated
using (public.es_admin());
```

---

# Tabla `historial_accesos`

Esta tabla registra los ingresos y salidas de los clientes.

```sql
create table if not exists historial_accesos (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  nombre_cliente text,
  placa text,
  espacio text,
  fecha date default current_date,
  hora_ingreso timestamp default now(),
  hora_salida timestamp null,
  estado text default 'Dentro',
  created_at timestamp default now()
);

alter table historial_accesos enable row level security;
```

---

# Políticas RLS para `historial_accesos`

Permitir que los usuarios vean su propio historial:

```sql
create policy "Usuarios pueden ver su historial"
on historial_accesos
for select
to authenticated
using (auth.uid() = user_id);
```

Permitir que los usuarios inserten su propio historial:

```sql
create policy "Usuarios pueden insertar su historial"
on historial_accesos
for insert
to authenticated
with check (auth.uid() = user_id);
```

Permitir que los usuarios actualicen su propio historial:

```sql
create policy "Usuarios pueden actualizar su historial"
on historial_accesos
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
```

Permitir que los administradores vean todo el historial:

```sql
create policy "Administradores pueden ver todo el historial"
on historial_accesos
for select
to authenticated
using (public.es_admin());
```

Permitir que los administradores actualicen todo el historial:

```sql
drop policy if exists "Administradores pueden actualizar todo el historial" on historial_accesos;

create policy "Administradores pueden actualizar todo el historial"
on historial_accesos
for update
to authenticated
using (public.es_admin())
with check (public.es_admin());
```

---

# Flujo del sistema

## Registro de cliente

1. El usuario entra a `new_account.html`.
2. Selecciona tipo de cuenta `Cliente`.
3. Completa sus datos personales.
4. Registra placa y color del vehículo.
5. Se crea el usuario en Supabase Auth.
6. Se insertan sus datos en la tabla `clientes`.
7. El usuario inicia sesión desde `index.html`.

---

## Registro de administrador

1. El usuario entra a `new_account.html`.
2. Selecciona tipo de cuenta `Administrador`.
3. Ingresa nombre, correo, contraseña y clave de administrador.
4. El sistema valida la clave con la función `verificar_clave_admin`.
5. Si la clave es válida, se crea el usuario con rol `administrador`.
6. El administrador puede iniciar sesión y acceder al panel.

---

## Inicio de sesión

1. El usuario ingresa correo y contraseña en `index.html`.
2. Supabase valida las credenciales.
3. El sistema consulta la tabla `clientes`.
4. Si el rol es `administrador`, redirige a:

```text
admin/admin_dashboard.html
```

5. Si el rol es `cliente`, redirige a:

```text
cliente/dashboard.html
```

6. Si el cliente está inactivo, el sistema cierra sesión y muestra un mensaje.

---

## Reserva de espacios

1. El cliente entra a `cliente/parking.html`.
2. El sistema carga las reservas existentes desde `reservas_espacios`.
3. El cliente selecciona un espacio libre.
4. El sistema valida que su vehículo esté autorizado.
5. El sistema verifica que no tenga otra reserva activa.
6. Se registra la reserva en `reservas_espacios`.
7. Se registra el ingreso en `historial_accesos`.
8. El espacio queda ocupado.

---

## Liberación de espacios

1. El cliente selecciona su espacio reservado.
2. El sistema elimina la reserva de `reservas_espacios`.
3. El sistema actualiza `historial_accesos`.
4. Se registra la hora de salida.
5. El estado cambia a `Finalizado`.
6. El espacio vuelve a estar libre.

---

## Gestión administrativa

El administrador puede realizar acciones desde las páginas de la carpeta `admin/`.

Desde `admin_clientes.html` puede:

* Buscar clientes.
* Ver información general.
* Activar o desactivar cuentas.

Desde `admin_vehiculos.html` puede:

* Ver vehículos registrados.
* Autorizar o no autorizar vehículos.

Desde `admin_espacios.html` puede:

* Ver espacios libres y ocupados.
* Liberar espacios ocupados.

Desde `admin_historial.html` puede:

* Ver el historial general.
* Buscar registros por cliente, placa, espacio o estado.

---

# Cómo ejecutar el proyecto localmente

1. Descargar o clonar el proyecto.
2. Abrir la carpeta en Visual Studio Code.
3. Instalar la extensión **Live Server**.
4. Abrir el archivo:

```text
index.html
```

5. Clic derecho y seleccionar:

```text
Open with Live Server
```

6. Crear una cuenta o iniciar sesión.

---

# Descarga desde GitHub

El proyecto puede subirse a un repositorio de GitHub para facilitar su descarga y revisión.

Para descargarlo desde GitHub:

```text
Code → Download ZIP
```

También se puede clonar con Git:

```bash
git clone URL_DEL_REPOSITORIO
```

Luego se abre la carpeta en Visual Studio Code y se ejecuta `index.html` con Live Server.

---

# Posible despliegue en la nube

El sistema puede desplegarse como sitio estático en plataformas como:

```text
Vercel
GitHub Pages
Netlify
```

---

## Despliegue con Vercel

1. Subir el proyecto a GitHub.
2. Iniciar sesión en Vercel.
3. Importar el repositorio.
4. Configurar el proyecto como sitio estático.
5. Publicar el proyecto.
6. Vercel generará un enlace público.

---

## Despliegue con GitHub Pages

1. Subir el proyecto a GitHub.
2. Entrar a la configuración del repositorio.
3. Ir a `Pages`.
4. Seleccionar la rama principal.
5. Guardar configuración.
6. GitHub generará un enlace público.

---

## Despliegue con Netlify

1. Subir el proyecto a GitHub.
2. Iniciar sesión en Netlify.
3. Importar el repositorio.
4. Configurar el sitio.
5. Publicar el proyecto.

---

# Recomendaciones para despliegue

Antes de desplegar el proyecto, se recomienda:

* Verificar que `index.html` funcione correctamente.
* Verificar que las páginas de `admin/` carguen `../styles.css` y `../script.js`.
* Verificar que las páginas de `cliente/` carguen `../styles.css` y `../script.js`.
* Confirmar que Supabase esté funcionando.
* Revisar las políticas RLS.
* Probar una cuenta cliente.
* Probar una cuenta administrador.
* Validar reservas, liberación e historial.
* Verificar que el dominio desplegado pueda conectarse con Supabase.

---

# Estado final del proyecto

El sistema cuenta con:

* Login con Supabase.
* Registro de clientes.
* Registro de administradores con clave.
* Roles diferenciados.
* Panel cliente.
* Panel administrador.
* Carpeta `cliente/`.
* Carpeta `admin/`.
* Gestión de clientes.
* Búsqueda de clientes.
* Activación y desactivación de cuentas.
* Gestión de vehículos.
* Autorización y no autorización de vehículos.
* Gestión de espacios.
* Reserva de espacios.
* Liberación de espacios.
* Historial personal.
* Historial general.
* Fotos de perfil con Supabase Storage.
* Seguridad con Row Level Security.
* Posibilidad de despliegue en Vercel, GitHub Pages o Netlify.
