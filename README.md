# Sistema de Gestión de Biblioteca

Un sistema completo de gestión de biblioteca construido con Next.js, TypeScript y TailwindCSS que consume una API backend de NestJS.

## 🚀 Características

- **Gestión de Libros**: Agregar, listar y administrar el catálogo de libros
- **Gestión de Miembros**: Registrar y administrar miembros de la biblioteca
- **Sistema de Préstamos**: Crear préstamos y gestionar devoluciones
- **Interfaz Moderna**: UI limpia y responsiva con TailwindCSS
- **TypeScript**: Tipado estricto para mayor confiabilidad
- **Arquitectura Limpia**: Separación clara entre Server y Client Components

## 🛠️ Tecnologías

- **Frontend**: Next.js 14 (App Router), React 19, TypeScript
- **Estilos**: TailwindCSS v4, Radix UI Components
- **Calidad de Código**: ESLint, Prettier
- **Despliegue**: Docker, Google Cloud Run

## 📋 Requisitos Previos

- Node.js >= 18.0.0
- npm >= 8.0.0
- Docker (para despliegue)
- API Backend de NestJS ejecutándose

## 🚀 Instalación y Configuración

### 1. Clonar el repositorio

\`\`\`bash
git clone <repository-url>
cd library-management-system
\`\`\`

### 2. Instalar dependencias

\`\`\`bash
npm install
\`\`\`

### 3. Configurar URL del backend

La aplicación consume el backend desde la URL
`https://backend-480236425407.us-central1.run.app` definida en
`lib/api.ts`. Si necesitas apuntar a otra instancia (por ejemplo, un
backend local para desarrollo), actualiza el valor de
`API_BASE_URL` en ese archivo antes de iniciar la aplicación.

### 4. Ejecutar en desarrollo

\`\`\`bash
npm run dev
\`\`\`

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000)

## 🏗️ Scripts Disponibles

- \`npm run dev\` - Ejecutar en modo desarrollo
- \`npm run build\` - Construir para producción
- \`npm run start\` - Ejecutar versión de producción
- \`npm run lint\` - Ejecutar ESLint
- \`npm run lint:fix\` - Corregir errores de ESLint automáticamente
- \`npm run type-check\` - Verificar tipos de TypeScript
- \`npm run format\` - Formatear código con Prettier
- \`npm run format:check\` - Verificar formato del código

## 🐳 Despliegue con Docker

### Construcción local

\`\`\`bash
# Construir imagen
npm run docker:build

# Ejecutar contenedor
npm run docker:run
\`\`\`

### Despliegue en Google Cloud Run

1. **Construir y subir imagen**:

\`\`\`bash
# Configurar proyecto de Google Cloud
gcloud config set project TU_PROJECT_ID

# Construir y subir imagen
gcloud builds submit --tag gcr.io/TU_PROJECT_ID/library-management

# Desplegar en Cloud Run
gcloud run deploy library-management \\
  --image gcr.io/TU_PROJECT_ID/library-management \\
  --platform managed \\
  --region us-central1 \\
  --allow-unauthenticated \\
  # No es necesario definir NEXT_PUBLIC_API_URL; la URL está codificada en lib/api.ts
\`\`\`

2. **Variables de entorno en Cloud Run**:

Si necesitas ajustar otras variables de entorno, puedes usar la consola de Google Cloud o la CLI (NEXT_PUBLIC_API_URL ya está definida en el código):

\`\`\`bash
gcloud run services update library-management \\
  --region us-central1
\`\`\`

## 📁 Estructura del Proyecto

\`\`\`
├── app/                    # App Router de Next.js
│   ├── books/             # Gestión de libros
│   │   ├── page.tsx       # Lista de libros (Server Component)
│   │   └── new/           # Crear libro
│   │       └── create-book-form.tsx  # Formulario (Client Component)
│   ├── members/           # Gestión de miembros
│   │   ├── page.tsx       # Lista de miembros
│   │   └── new/           # Crear miembro
│   ├── loans/             # Gestión de préstamos
│   │   ├── page.tsx       # Lista de préstamos
│   │   ├── actions.ts     # Server Actions
│   │   └── loan-actions.tsx  # Componente de acciones
│   └── page.tsx           # Página principal
├── components/            # Componentes reutilizables
│   └── ui/               # Componentes de UI
├── lib/                  # Utilidades y configuración
│   ├── api.ts            # Cliente HTTP centralizado
│   ├── types.ts          # Tipos TypeScript
│   └── utils.ts          # Utilidades generales
├── public/               # Archivos estáticos
├── Dockerfile            # Configuración Docker
├── .dockerignore         # Archivos ignorados por Docker
└── README.md            # Este archivo
\`\`\`

## 🔧 Configuración de la API

El sistema está diseñado para consumir una API REST de NestJS. Asegúrate de que tu backend tenga los siguientes endpoints:

### Libros
- \`GET /books\` - Listar libros
- \`POST /books\` - Crear libro
- \`GET /books/:id\` - Obtener libro por ID
- \`PUT /books/:id\` - Actualizar libro
- \`DELETE /books/:id\` - Eliminar libro

### Miembros
- \`GET /members\` - Listar miembros
- \`POST /members\` - Crear miembro
- \`GET /members/:id\` - Obtener miembro por ID
- \`PUT /members/:id\` - Actualizar miembro
- \`DELETE /members/:id\` - Eliminar miembro

### Préstamos
- \`GET /loans\` - Listar préstamos
- \`POST /loans\` - Crear préstamo
- \`POST /loans/:id/return\` - Devolver libro

## 🎨 Principios de Diseño

- **Server Components** para lecturas (con \`cache: 'no-store'\` para consistencia)
- **Client Components** solo para formularios e interacciones
- **Centralización** de llamadas HTTP en \`lib/api.ts\`
- **TypeScript estricto** para mayor confiabilidad
- **Componentes pequeños** con nombres descriptivos
- **Separación** de lógica de negocio y UI

## 🔒 Configuración CORS

Asegúrate de que tu API backend de NestJS tenga configurado CORS para permitir requests desde tu dominio de frontend:

\`\`\`typescript
// En tu backend NestJS
app.enableCors({
  origin: ['http://localhost:3000', 'https://tu-frontend.run.app'],
  credentials: true,
});
\`\`\`

## 📝 Notas para Google Cloud

### Base de Datos
Si usas Cloud SQL Postgres:
- Conecta por TCP con SSL o usa Cloud SQL Auth Proxy
- Mantén \`DATABASE_URL\` en Secret Manager
- Ejecuta migraciones en CI/CD antes de actualizar tráfico

### Despliegue
- Ambos servicios (NestJS y Next.js) deben leer la variable \`PORT\`
- Configura CORS en NestJS permitiendo el dominio de Next.js
- Usa Cloud Build o GitHub Actions para CI/CD automatizado

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (\`git checkout -b feature/AmazingFeature\`)
3. Commit tus cambios (\`git commit -m 'Add some AmazingFeature'\`)
4. Push a la rama (\`git push origin feature/AmazingFeature\`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo \`LICENSE\` para más detalles.
