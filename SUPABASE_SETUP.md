# Configuración de Supabase para Gim Stats App

Esta guía te ayudará a configurar correctamente Supabase para que funcione tu aplicación de estadísticas del gimnasio.

## 📋 Prerrequisitos

- Cuenta en [Supabase](https://supabase.com) (gratuita)
- Node.js instalado en tu sistema
- Proyecto clonado y dependencias instaladas (`npm install`)

## 🚀 Paso 1: Crear un proyecto en Supabase

1. Ve a [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Haz clic en "New Project"
3. Completa la información:
   - **Name**: `gim-stats-app` (o el nombre que prefieras)
   - **Database Password**: Crea una contraseña segura (guárdala)
   - **Region**: Elige la región más cercana a ti
4. Haz clic en "Create new project"
5. Espera a que se complete la configuración (puede tomar unos minutos)

## 🔑 Paso 2: Obtener las credenciales de la API

1. En tu dashboard de Supabase, ve a **Settings** → **API**
2. Copia los siguientes valores:
   - **Project URL** (algo como `https://abcdefghijklmnop.supabase.co`)
   - **anon public** key (una cadena larga que empieza con `eyJ...`)

## ⚙️ Paso 3: Configurar las variables de entorno

1. En la raíz de tu proyecto, crea un archivo `.env` (si no existe)
2. Agrega las siguientes variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://tu-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui

# Optional: Enable Supabase features
VITE_ENABLE_SUPABASE=true
```

3. Reemplaza los valores con los que copiaste del dashboard de Supabase

## 🗄️ Paso 4: Configurar la base de datos

1. En tu dashboard de Supabase, ve a **SQL Editor**
2. Haz clic en "New query"
3. Copia y pega todo el contenido del archivo `supabase-schema.sql`
4. Haz clic en "Run" para ejecutar el script

Este script creará:
- Las tablas necesarias (`gym_groups`, `gym_users`, `gym_entries`)
- Los índices para optimizar el rendimiento
- Las políticas de seguridad (RLS - Row Level Security)
- Los triggers para actualizar automáticamente las fechas

## 🔒 Paso 5: Configurar autenticación (opcional)

Si quieres usar autenticación por email:

1. Ve a **Authentication** → **Settings**
2. En "Site URL", agrega: `http://localhost:5173` (para desarrollo)
3. En "Redirect URLs", agrega: `http://localhost:5173/**`
4. Para producción, reemplaza `localhost:5173` con tu dominio

## 🧪 Paso 6: Probar la configuración

1. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

2. Abre la consola del navegador (F12)
3. Deberías ver mensajes como:
   - ✅ "Supabase connection successful" (si todo está bien)
   - ⚠️ Advertencias si faltan las variables de entorno

## 🔧 Solución de problemas

### Error: "Supabase URL not configured"
- Verifica que el archivo `.env` existe y tiene las variables correctas
- Asegúrate de que las variables empiecen con `VITE_`
- Reinicia el servidor de desarrollo después de cambiar el `.env`

### Error: "relation does not exist"
- Ejecuta el script SQL en Supabase SQL Editor
- Verifica que todas las tablas se crearon correctamente

### Error de autenticación
- Verifica que las políticas RLS están configuradas
- Asegúrate de que el usuario está autenticado antes de hacer operaciones

### Error de CORS
- Verifica que las URLs están configuradas en Authentication → Settings
- Para desarrollo, usa `http://localhost:5173`

## 📱 Para producción

Cuando despliegues tu aplicación:

1. Actualiza las URLs en Supabase Authentication:
   - Site URL: `https://tu-dominio.com`
   - Redirect URLs: `https://tu-dominio.com/**`

2. Asegúrate de que las variables de entorno estén configuradas en tu plataforma de despliegue (Vercel, Netlify, etc.)

## 🎯 Funcionalidades disponibles

Una vez configurado, tu aplicación tendrá:

- ✅ Autenticación de usuarios
- ✅ Creación y gestión de grupos
- ✅ Registro de usuarios en grupos
- ✅ Seguimiento de puntos diarios
- ✅ Historial de estadísticas
- ✅ Seguridad a nivel de fila (RLS)

## 📞 Soporte

Si tienes problemas:

1. Revisa la consola del navegador para errores
2. Verifica que todas las variables de entorno están configuradas
3. Asegúrate de que el script SQL se ejecutó correctamente
4. Consulta la [documentación de Supabase](https://supabase.com/docs)

¡Tu aplicación de estadísticas del gimnasio está lista para usar! 🏋️‍♂️
