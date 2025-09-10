# 🗂️ Path Aliases - Navegación Mejorada del Proyecto

Este proyecto ahora incluye **path aliases** configurados para hacer la navegación y los imports más cómodos y legibles.

## 📁 Alias Disponibles

| Alias | Ruta Real | Descripción |
|-------|-----------|-------------|
| `@` | `src/` | Raíz del directorio src |
| `@/components` | `src/components/` | Componentes Vue |
| `@/config` | `src/config/` | Configuraciones (Supabase, etc.) |
| `@/services` | `src/services/` | Servicios y lógica de negocio |
| `@/utils` | `src/utils/` | Utilidades y helpers |
| `@/assets` | `src/assets/` | Recursos estáticos |
| `@/styles` | `src/styles/` | Archivos de estilos |

## 🚀 Cómo Usar los Aliases

### ❌ Antes (imports relativos):
```javascript
// Imports complicados y difíciles de mantener
import { getCurrentUser } from '../../../config/supabase.js'
import DailyBoard from '../../components/DailyBoard.vue'
import { storage } from '../services/storage.js'
```

### ✅ Ahora (con aliases):
```javascript
// Imports limpios y fáciles de entender
import { getCurrentUser } from '@/config/supabase.js'
import DailyBoard from '@/components/DailyBoard.vue'
import { storage } from '@/services/storage.js'
```

## 📝 Ejemplos de Uso

### En Componentes Vue:
```vue
<script>
// Importar configuración
import { supabase, isSupabaseConfigured } from '@/config/supabase.js'

// Importar servicios
import { storage } from '@/services/storage.js'

// Importar utilidades
import { formatDate } from '@/utils/dateHelpers.js'

// Importar otros componentes
import UserRow from '@/components/UserRow.vue'
</script>
```

### En Archivos JavaScript:
```javascript
// main.js
import App from './App.vue'
import { getCurrentUser } from '@/config/supabase.js'
import Onboarding from '@/components/Onboarding.vue'
```

### En Archivos de Configuración:
```javascript
// vite.config.js
import { resolve } from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@/components': resolve(__dirname, 'src/components'),
      // ... otros aliases
    }
  }
})
```

## 🛠️ Configuración Técnica

### jsconfig.json
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@/components/*": ["src/components/*"],
      "@/config/*": ["src/config/*"],
      "@/services/*": ["src/services/*"],
      "@/utils/*": ["src/utils/*"]
    }
  }
}
```

### vite.config.js
```javascript
import { resolve } from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@/components': resolve(__dirname, 'src/components'),
      '@/config': resolve(__dirname, 'src/config'),
      '@/services': resolve(__dirname, 'src/services'),
      '@/utils': resolve(__dirname, 'src/utils')
    }
  }
})
```

## 🎯 Beneficios

### ✅ **Navegación más fácil**:
- No más `../../../` confusos
- Imports más legibles y mantenibles
- Fácil refactoring de archivos

### ✅ **Mejor experiencia de desarrollo**:
- Autocompletado mejorado en el IDE
- Navegación "Go to Definition" más precisa
- Refactoring automático más confiable

### ✅ **Código más limpio**:
- Imports consistentes en todo el proyecto
- Fácil de entender para nuevos desarrolladores
- Menos errores de rutas incorrectas

## 🔧 Migración Gradual

Puedes migrar gradualmente tus imports existentes:

1. **Identifica imports relativos largos**:
   ```javascript
   import { something } from '../../../config/supabase.js'
   ```

2. **Reemplázalos con aliases**:
   ```javascript
   import { something } from '@/config/supabase.js'
   ```

3. **Verifica que todo funcione**:
   ```bash
   npm run dev
   ```

## 🚨 Notas Importantes

- Los aliases funcionan tanto en **desarrollo** como en **producción**
- Son compatibles con **Vite**, **Vue Router**, y **Vue 3**
- El IDE (VS Code, WebStorm, etc.) los reconocerá automáticamente
- No afectan el rendimiento de la aplicación

## 🎉 ¡Disfruta de la navegación mejorada!

Ahora puedes navegar por tu proyecto de manera más cómoda y profesional. Los imports son más limpios, el código es más mantenible, y la experiencia de desarrollo es mucho mejor.
