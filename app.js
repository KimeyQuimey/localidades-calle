// Global state
let map;
let geojsonLayer;
let currentFeature = null;
let geojsonData = null;
let availableFiles = [];

// Estilos simplificados
const STYLES = {
  default: {
    color: "#5170fa",
    weight: 9,
    opacity: 0.9,
  },
  hover: {
    color: "#764ba2",
    weight: 9,
    opacity: 0.9,
  },
  selected: {
    color: "#06b6d4",
    weight: 9,
    opacity: 1,
  },
  highlighted: {
    color: "#fbbf24",
    weight: 9,
    opacity: 0.9,
  },
};

// Initialize app
document.addEventListener("DOMContentLoaded", async () => {
  initMap();
  await loadAvailableFiles();
  setupEventListeners();
});

// Initialize Leaflet map
function initMap() {
  map = L.map("map").setView([-26.74, -65.26], 15);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
    maxZoom: 19,
    minZoom: 14,
  }).addTo(map);
}

// Load available GeoJSON files from the directory
async function loadAvailableFiles() {
  try {
    const filesToCheck = [
      "ejes_90105080.geojson",
      "ejes_90105080_editado.geojson",
    ];

    for (const file of filesToCheck) {
      try {
        const response = await fetch(file, { method: "HEAD" });
        if (response.ok) {
          availableFiles.push(file);
        }
      } catch (e) {
        // Archivo no existe
      }
    }

    if (availableFiles.length === 0) {
      availableFiles = ["ejes_90105080.geojson"];
    }

    populateFileSelector();

    if (availableFiles.length > 0) {
      await loadGeoJSON(availableFiles[0]);
    }
  } catch (error) {
    console.error("Error loading available files:", error);
    availableFiles = ["ejes_90105080.geojson"];
    populateFileSelector();
    await loadGeoJSON("ejes_90105080.geojson");
  }
}

// Populate file selector dropdown
function populateFileSelector() {
  const fileSelect = document.getElementById("fileSelect");
  fileSelect.innerHTML = "";

  availableFiles.forEach((file) => {
    const option = document.createElement("option");
    option.value = file;
    option.textContent = file.replace(".geojson", "").replace(/_/g, " ");
    fileSelect.appendChild(option);
  });

  if (availableFiles.length > 0) {
    fileSelect.value = availableFiles[0];
  }
}

// Load GeoJSON file
async function loadGeoJSON(fileName = null) {
  try {
    const file = fileName || document.getElementById("fileSelect").value;
    if (!file) return;

    const response = await fetch(file);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    geojsonData = await response.json();
    displayGeoJSON();
    cancelEdit();
    showStatus(`${file} cargado correctamente`, "success");
  } catch (error) {
    console.error("Error loading GeoJSON:", error);
    showStatus("Error al cargar el archivo GeoJSON", "error");
  }
}

// Display GeoJSON on map
function displayGeoJSON() {
  if (geojsonLayer) {
    map.removeLayer(geojsonLayer);
  }

  geojsonLayer = L.geoJSON(geojsonData, {
    style: STYLES.default,
    onEachFeature: onEachFeature,
  }).addTo(map);

  if (geojsonLayer.getBounds().isValid()) {
    map.fitBounds(geojsonLayer.getBounds(), { padding: [50, 50] });
  }
}

// Get current style for a feature
function getFeatureStyle(feature) {
  // Si está seleccionado
  if (currentFeature === feature) {
    return STYLES.selected;
  }

  // Si está resaltado por código
  if (document.getElementById("highlightByCode").checked && currentFeature) {
    const currentCode = document.getElementById("via").value;
    if (feature.properties.via === currentCode) {
      return STYLES.highlighted;
    }
  }

  return STYLES.default;
}

// Handle feature interactions
function onEachFeature(feature, layer) {
  layer.on("click", () => {
    selectFeature(feature, layer);
  });

  layer.on("mouseover", () => {
    if (currentFeature !== feature) {
      layer.setStyle(STYLES.hover);
    }
    layer.bringToFront();
  });

  layer.on("mouseout", () => {
    if (currentFeature !== feature) {
      layer.setStyle(getFeatureStyle(feature));
    }
  });
}

// Select feature and show edit form
function selectFeature(feature, layer) {
  // Reset previous selection
  if (currentFeature && geojsonLayer) {
    geojsonLayer.eachLayer((featureLayer) => {
      if (featureLayer.feature === currentFeature) {
        featureLayer.setStyle(getFeatureStyle(currentFeature));
      }
    });
  }

  // Highlight selected feature
  currentFeature = feature;
  layer.setStyle(STYLES.selected);
  layer.bringToFront();

  // Populate form
  populateForm(feature.properties);

  // Show form
  document.getElementById("editForm").classList.remove("hidden");
  document.getElementById("mainActions").classList.add("hidden");
  document.getElementById("selectionInfo").classList.remove("hidden");
  document.getElementById("streetName").textContent =
    feature.properties.nomvia || "Sin nombre";
}

// Populate form with feature properties
function populateForm(properties) {
  document.getElementById("objectid").value = properties.objectid || "";
  document.getElementById("nomvia").value = properties.nomvia || "";
  document.getElementById("via").value = properties.via || "";
  document.getElementById("tipovia").value = properties.tipovia || "CALLE";
  document.getElementById("desdei").value = properties.desdei || 0;
  document.getElementById("hastai").value = properties.hastai || 0;
  document.getElementById("highlightByCode").checked = false;
}

// Setup event listeners
function setupEventListeners() {
  // File selector change
  document.getElementById("fileSelect").addEventListener("change", () => {
    loadGeoJSON();
  });

  // Form submit
  document.getElementById("editForm").addEventListener("submit", (e) => {
    e.preventDefault();
    saveChanges();
  });

  // Cancel button
  document.getElementById("cancelBtn").addEventListener("click", () => {
    cancelEdit();
  });

  // Export button
  document.getElementById("exportBtn").addEventListener("click", () => {
    exportGeoJSON();
  });

  // Highlight by code checkbox
  document.getElementById("highlightByCode").addEventListener("change", () => {
    updateAllStyles();
  });

  // Via code input change
  document.getElementById("via").addEventListener("change", () => {
    updateAllStyles();
  });
}

// Update all features styling (called when highlight checkbox changes)
function updateAllStyles() {
  if (geojsonLayer) {
    geojsonLayer.eachLayer((layer) => {
      layer.setStyle(getFeatureStyle(layer.feature));
    });
  }
}

// Save changes
function saveChanges() {
  if (!currentFeature) return;

  // Update properties
  currentFeature.properties.objectid =
    document.getElementById("objectid").value;
  currentFeature.properties.nomvia = document.getElementById("nomvia").value;
  currentFeature.properties.via = document.getElementById("via").value;
  currentFeature.properties.tipovia = document.getElementById("tipovia").value;
  currentFeature.properties.desdei =
    parseInt(document.getElementById("desdei").value) || 0;
  currentFeature.properties.hastai =
    parseInt(document.getElementById("hastai").value) || 0;

  // Update map display
  displayGeoJSON();

  // Reselect feature to highlight it again
  geojsonLayer.eachLayer((layer) => {
    if (layer.feature === currentFeature) {
      selectFeature(currentFeature, layer);
    }
  });

  showStatus("Cambios guardados correctamente", "success");
}

// Cancel edit
function cancelEdit() {
  currentFeature = null;
  document.getElementById("editForm").classList.add("hidden");
  document.getElementById("mainActions").classList.remove("hidden");
  document.getElementById("selectionInfo").classList.add("hidden");
  document.getElementById("highlightByCode").checked = false;

  // Reset all features styling
  if (geojsonLayer) {
    geojsonLayer.eachLayer((layer) => {
      layer.setStyle(STYLES.default);
    });
  }
}

// Export GeoJSON
function exportGeoJSON() {
  if (!geojsonData) return;

  const dataStr = JSON.stringify(geojsonData, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(dataBlob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "ejes_90105080_editado.geojson";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  showStatus("GeoJSON descargado correctamente", "success");
}

// Show status message
function showStatus(message, type) {
  const statusEl = document.getElementById("statusMessage");
  statusEl.textContent = message;
  statusEl.className = `status-message show ${type}`;

  // Auto-hide after 3 seconds
  setTimeout(() => {
    statusEl.classList.remove("show");
  }, 3000);
}
