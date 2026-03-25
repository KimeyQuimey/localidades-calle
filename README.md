# Editor de Calles GeoJSON

Aplicación web interactiva para editar atributos de calles desde archivos GeoJSON usando Leaflet.

## 🚀 Características

- **Selector de archivos**: Carga dinámicamente archivos `.geojson` de la carpeta
- **Mapa interactivo**: Visualización de todas las calles con Leaflet
- **Edición de atributos**: Modifica directamente desde el mapa:
  - `nomvia`: Nombre de la calle
  - `via`: Código/identificador
  - `tipovia`: Tipo de vía (CALLE, AV, PJE, OTRO)
  - `desdei`: Altura inicio lado izquierdo
  - `hastai`: Altura fin lado izquierdo
  - `objectid`: Identificador único (solo lectura)

- **Resaltado por código**: Checkbox para visualizar todas las calles con el mismo código
- **Descargar cambios**: Exporta el GeoJSON modificado como archivo `.geojson`

## 📁 Estructura

```
web/
├── index.html              # Estructura HTML
├── style.css               # Estilos CSS
├── app.js                  # Lógica de la aplicación
├── server.py               # Servidor Python (opcional)
└── ejes_90105080.geojson   # Archivo de datos
```

## 🛠️ Cómo usar

### Opción 1: Live Server (Recomendado en VS Code)

1. Instala la extensión **Live Server** en VS Code
2. Click derecho en `index.html` → **Open with Live Server**
3. Se abrirá automáticamente en http://localhost:5500

### Opción 2: Desde terminal con Node.js (si lo tienes)

```bash
cd /ruta/a/web
npx http-server -p 8000
```

Accede a: http://localhost:8000

### Opción 3: Desde navegador directamente

Simplemente abre el archivo `index.html` con doble click (requiere que los archivos `.geojson` estén en la misma carpeta)

## 🎨 Sistema de Estilos Simplificado

La aplicación usa 4 estados de estilo para las calles:

| Estado | Color | Grosor | Opacidad | Descripción |
|--------|-------|--------|----------|-------------|
| **Default** | Azul (#667eea) | 2px | 0.6 | Calle normal, sin interacción |
| **Hover** | Púrpura (#764ba2) | 3px | 0.9 | Al pasar el mouse sobre la calle |
| **Selected** | Cian (#06b6d4) | 4px | 1.0 | Calle seleccionada para editar |
| **Highlighted** | Amarillo (#fbbf24) | 3px | 0.9 | Calles con el mismo código (checkbox activado) |

## 📝 Uso de la aplicación

1. **Selecciona un archivo**: Usa el dropdown "Archivo" para cambiar entre GeoJSON
2. **Haz click en una calle**: Se abrirá el panel de edición
3. **Edita los atributos**: Modifica los valores que necesites
4. **(Opcional) Resalta por código**: Marca el checkbox para ver todas las calles con ese código en amarillo
5. **Guarda cambios**: Presiona "Guardar Cambios"
6. **Exporta**: Usa "Descargar GeoJSON" para obtener el archivo modificado

## 🎨 Interfaz

- **Color azul (dashado)**: Calles normales
- **Color cian (sólido)**: Calle seleccionada
- **Color amarillo (sólido)**: Calles con el mismo código (cuando está el checkbox activado)
- **Color púrpura**: Efecto hover

## 📦 Dependencias

- **Leaflet 1.9.4**: CDN (no requiere instalación)
- **OpenStreetMap**: Tiles del mapa

## 🔧 Notas técnicas

- La aplicación carga todos los archivos `.geojson` de la carpeta
- Los cambios se guardan en memoria hasta que exportes
- El navegador necesita permiso para descargar archivos
- Compatible con cualquier navegador moderno (Chrome, Firefox, Safari, Edge)

## 📄 Formato GeoJSON esperado

El archivo debe tener features con las siguientes propiedades:

```json
{
  "type": "Feature",
  "properties": {
    "objectid": "1",
    "via": "1900",
    "nomvia": "LARRABURE",
    "tipovia": "CALLE",
    "desdei": 0,
    "hastai": 0,
    "desded": 0,
    "hastad": 0
  },
  "geometry": {
    "type": "MultiLineString",
    "coordinates": [ [...] ]
  }
}
```

## 💡 Tips

- Los cambios de `via` actualizan el resaltado en tiempo real
- Puedes hacer click en varias calles seguidas para editar múltiples
- Usa Ctrl+Scroll o zoom del mapa para ver mejor
- Descarga periódicamente tus cambios para no perderlos

---

**Versión**: 1.0  
**Última actualización**: 2026-03-24
