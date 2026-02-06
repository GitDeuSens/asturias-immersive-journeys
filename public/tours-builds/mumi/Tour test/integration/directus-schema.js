// Directus Schema для панорам
// Создайте эти коллекции в Directus

export const panoramasSchema = {
  collection: "panoramas",
  fields: [
    { field: "id", type: "uuid", meta: { hidden: true } },
    { field: "name", type: "string", meta: { required: true } },
    { field: "subtitle", type: "string" },
    { field: "description", type: "text" },
    // Папка с файлами кубической панорамы (r,l,u,d,f,b)
    { 
      field: "panorama_folder", 
      type: "uuid",
      schema: { foreign_key_table: "directus_folders" },
      meta: { interface: "system-folder" }
    },
    // Или прямые ссылки на файлы
    { 
      field: "panorama_files", 
      type: "files",
      meta: { interface: "files" }
    },
    { field: "thumbnail", type: "uuid", schema: { foreign_key_table: "directus_files" } },
    // Hotspots - точки перехода
    { 
      field: "hotspots", 
      type: "json",
      meta: { 
        interface: "list",
        options: {
          template: "{{target_panorama.name}} - {{label}}",
          fields: [
            { field: "target_panorama", type: "uuid", meta: { interface: "select-dropdown-m2o", options: { collection: "panoramas" } } },
            { field: "label", type: "string" },
            { field: "yaw", type: "float", meta: { note: "Horizontal angle (-180 to 180)" } },
            { field: "pitch", type: "float", meta: { note: "Vertical angle (-90 to 90)" } },
            { field: "icon", type: "string", meta: { options: { choices: [{ text: "Arrow", value: "arrow" }, { text: "Point", value: "point" }, { text: "Info", value: "info" }] } } }
          ]
        }
      }
    },
    // Начальный угол обзора
    { field: "initial_yaw", type: "float", schema: { default_value: 0 } },
    { field: "initial_pitch", type: "float", schema: { default_value: 0 } },
    { field: "initial_fov", type: "float", schema: { default_value: 90 } },
    { field: "sort_order", type: "integer", schema: { default_value: 0 } },
    { field: "is_active", type: "boolean", schema: { default_value: true } },
    { field: "date_created", type: "timestamp", meta: { special: ["date-created"] } },
    { field: "date_updated", type: "timestamp", meta: { special: ["date-updated"] } }
  ]
};

// SQL для создания таблиц (если нужно мигрировать)
export const migrationSQL = `
CREATE TABLE IF NOT EXISTS panoramas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  subtitle VARCHAR(255),
  description TEXT,
  panorama_folder UUID REFERENCES directus_folders(id),
  thumbnail UUID REFERENCES directus_files(id),
  hotspots JSON DEFAULT '[]',
  initial_yaw FLOAT DEFAULT 0,
  initial_pitch FLOAT DEFAULT 0,
  initial_fov FLOAT DEFAULT 90,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  date_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_panoramas_active ON panoramas(is_active);
CREATE INDEX idx_panoramas_sort ON panoramas(sort_order);
`;

// Пример данных
export const samplePanorama = {
  name: "Living Room",
  subtitle: "Main Floor",
  description: "Spacious living room with city view",
  initial_yaw: 45,
  initial_pitch: 0,
  initial_fov: 100,
  hotspots: [
    {
      target_panorama: "uuid-kitchen",
      label: "Go to Kitchen",
      yaw: 90,
      pitch: 0,
      icon: "arrow"
    }
  ]
};
