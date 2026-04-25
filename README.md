# 🏀 Basketball Torneo — Control de Torneo

App React para gestionar un torneo de basketball: tabla de posiciones, calendario, marcador y póster.

## Características
- 📊 Tabla de posiciones (Masculino / Femenino)
- 📅 Calendario por domingos (máx. 4 partidos por fecha)
- ⚡ Registro de marcadores en tiempo real
- 🎨 Póster visual del programa del día
- ⚙️ Gestión de equipos y configuración
- 💾 **Guardado automático** en localStorage (los datos persisten al recargar)

---

## Despliegue en Netlify

### Opción A — Desde GitHub (recomendado)
1. Sube esta carpeta a un repositorio de GitHub
2. Ve a [netlify.com](https://netlify.com) → **Add new site → Import an existing project**
3. Conecta tu repositorio de GitHub
4. Netlify detectará automáticamente la configuración gracias a `netlify.toml`
5. Haz clic en **Deploy site** ✅

### Opción B — Drag & Drop (sin GitHub)
1. Instala dependencias y construye el proyecto localmente:
   ```bash
   npm install
   npm run build
   ```
2. Ve a [netlify.com/drop](https://app.netlify.com/drop)
3. Arrastra y suelta la carpeta **`dist/`** generada
4. ¡Listo! 🎉

---

## Desarrollo local

```bash
npm install
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173) en tu navegador.

---

## Estructura del proyecto

```
basketball-torneo/
├── index.html          # Entrada HTML
├── netlify.toml        # Config de Netlify (build + redirects)
├── package.json        # Dependencias
├── vite.config.js      # Config de Vite
├── .gitignore
└── src/
    ├── main.jsx        # Bootstrap de React
    └── App.jsx         # Toda la aplicación
```

## Sobre el guardado de datos
Los datos se guardan en el **localStorage del navegador** bajo la clave `bk_torneo_v1`.  
Esto significa que los datos persisten en el mismo navegador/dispositivo.  
Para compartir datos entre dispositivos, se necesitaría un backend o servicio externo.
