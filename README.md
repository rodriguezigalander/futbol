# ⚽ Disponibilidad Fútbol Peñas

App sencilla para recoger la disponibilidad de los jugadores para los partidos de la semana.

## Páginas

- **`/`** → Formulario para jugadores (nombre + días/horas + observaciones)
- **`/admin`** → Panel del capitán con heatmap y resumen de respuestas

## Despliegue en Vercel (5 minutos)

### Opción A: Desde GitHub (recomendado)

1. Sube esta carpeta a un repositorio de GitHub
2. Ve a [vercel.com](https://vercel.com) → "Add New Project"
3. Importa el repositorio
4. Haz clic en **Deploy** (sin tocar nada más)
5. ¡Listo! Vercel detecta Next.js automáticamente

### Opción B: Con Vercel CLI

```bash
npm install -g vercel
cd futbol-app
vercel
```

## Uso

1. Comparte la URL principal (`https://tu-app.vercel.app`) en el grupo de WhatsApp
2. Cada jugador entra, pone su nombre, marca sus huecos y envía
3. Tú entras en `https://tu-app.vercel.app/admin` para ver el resumen

## Desarrollo local

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## Nota sobre el almacenamiento

En local los votos se guardan en `data/votes.json`.
En Vercel el sistema de archivos es efímero. Para producción real se recomienda
conectar una base de datos gratuita como **Vercel KV** o **PlanetScale** —
pero para una semana de torneo funciona perfectamente sin ella si el servidor no se reinicia.

Para hacerlo 100% persistente en Vercel, añade **Vercel KV** (gratuito, 1 click):
1. En el dashboard de Vercel → tu proyecto → Storage → Create KV Database
2. Sustituye `lib/storage.js` por la versión con `@vercel/kv` (ver comentarios en el archivo)
