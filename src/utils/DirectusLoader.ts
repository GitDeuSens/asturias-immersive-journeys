import {
  AssetReference,
  Behaviour,
  BoxCollider,
  DragControls,
  GameObject,
} from "@needle-tools/engine";
import { Box3, MathUtils, Object3D, Vector3 } from "three";

// ─────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────
// Reads URL injected by React app (NeedleARViewer sets window.__DIRECTUS_URL)
// Falls back to Vite env var (works in direct web context), then hardcoded dev fallback
export function getDirectusUrl(): string {
  return (
    (window as any).__DIRECTUS_URL ??
    (typeof import.meta !== 'undefined' ? (import.meta as any).env?.VITE_DIRECTUS_URL : undefined) ??
    'http://192.168.12.71:8055'
  );
}
// Keep DIRECTUS_URL as a compat alias (used in getAssetUrl)
export const DIRECTUS_URL = "http://192.168.12.71:8055"; // fallback only
const DEFAULT_SCALE = 1;
const DEFAULT_RY = 0;

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────
export interface ArScene {
  id: string;
  slug: string;
  glb_model: string;
  glb_scale?: number;
  glb_rotation_y?: number;
  audio_es?: string;
  audio_en?: string;
  audio_fr?: string;
}

// ─────────────────────────────────────────────
// DIRECTUS API HELPERS
// ─────────────────────────────────────────────
export async function fetchSceneBySlug(slug: string): Promise<ArScene | null> {
  try {
    const res = await fetch(
      `${getDirectusUrl()}/items/ar_scenes` +
        `?filter[slug][_eq]=${encodeURIComponent(slug)}` +
        `&fields=id,slug,glb_model,glb_scale,glb_rotation_y,audio_es,audio_en,audio_fr` +
        `&limit=1`
    );
    if (!res.ok) {
      console.error(`[Directus] HTTP ${res.status}: ${res.statusText}`);
      return null;
    }
    const json = await res.json();
    return (json.data?.[0] as ArScene) ?? null;
  } catch (e) {
    console.error("[Directus] Fetch failed:", e);
    return null;
  }
}

export function getAssetUrl(uuid: string): string {
  if (import.meta.env.DEV) {
    return `/directus-assets/${uuid}`;
  }
  return `${getDirectusUrl()}/assets/${uuid}`;
}

// ─────────────────────────────────────────────
// MODEL LOADING — Needle Behaviour
// No decorators — not needed without Unity inspector
// ─────────────────────────────────────────────
export class ModelLoading extends Behaviour {
  public parent: GameObject | undefined = undefined;
  public loadedModels: Object3D[] = [];
  private currentIndex = 0;

  public async load(url: string, name: string): Promise<void> {
    this.clearAll();
    await this.instantiateModel(url, name);
    this.showModelAt(0);
  }

  public clearAll(): void {
    this.loadedModels.forEach((obj) => {
      this.disposeObject(obj);
      obj.removeFromParent();
    });
    this.loadedModels = [];
    this.currentIndex = 0;
  }

  private disposeObject(obj: Object3D): void {
    obj.traverse((child: any) => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        const mats: any[] = Array.isArray(child.material) ? child.material : [child.material];
        mats.forEach((m: any) => {
          (["map", "lightMap", "aoMap", "emissiveMap", "normalMap", "roughnessMap", "metalnessMap"] as const)
            .forEach((k) => m[k]?.dispose());
          m.dispose();
        });
      }
    });
  }

  private async instantiateModel(url: string, name: string): Promise<void> {
    const asset = AssetReference.getOrCreate(this, url, this.context);

    try {
      await asset.loadAssetAsync();
    } catch (e) {
      console.error(`[DirectusLoader] Failed to load asset "${name}" from ${url}:`, e);
      return;
    }

    const parentGO = this.parent ?? this.gameObject;
    const parentObj = parentGO as unknown as Object3D;
    const instance = (await asset.instantiate(parentGO)) as unknown as Object3D;

    if (!instance) {
      console.error(`[DirectusLoader] instantiate() returned null for "${name}" — asset likely failed to load (403?)`);
      return;
    }

    instance.name = name;
    instance.visible = true;

    instance.traverse((child: any) => {
      if (child.isMesh) {
        child.addComponent?.(BoxCollider)?.autoFit();
      }
    });

    (instance as unknown as GameObject).addComponent?.(DragControls);

    parentObj.add(instance);
    this.loadedModels.push(instance);
  }

  public showModelAt(i: number): void {
    this.loadedModels.forEach((obj, idx) => (obj.visible = idx === i));
    this.currentIndex = i;
  }

  public getBoundingSize(): Vector3 | null {
    const model = this.loadedModels[this.currentIndex];
    if (!model) return null;
    return new Box3().setFromObject(model).getSize(new Vector3());
  }
}

// ─────────────────────────────────────────────
// SHARED LOAD FUNCTION
// Used by NeedleARViewer after needle-engine loadfinished
// ─────────────────────────────────────────────
export async function loadSceneInto(
  loader: ModelLoading | null,
  slug?: string,
  glbOverride?: string
): Promise<void> {
  if (!loader) {
    console.error("[loadSceneInto] No ModelLoading component provided");
    return;
  }

  let glbUrl: string;
  let scale = DEFAULT_SCALE;
  let ry = DEFAULT_RY;
  let name = "model";

  if (glbOverride) {
    glbUrl = glbOverride;
    name = slug ?? "override";
    console.log("[Directus] GLB override:", glbUrl);
  } else if (slug) {
    const scene = await fetchSceneBySlug(slug);
    if (!scene) {
      console.error(`[Directus] Scene '${slug}' not found`);
      return;
    }
    if (!scene.glb_model) {
      console.error(`[Directus] Scene '${slug}' has no GLB assigned`);
      return;
    }
    glbUrl = getAssetUrl(scene.glb_model);
    scale = scene.glb_scale ?? DEFAULT_SCALE;
    ry = scene.glb_rotation_y ?? DEFAULT_RY;
    name = scene.slug;
    console.log(`[Directus] Loading '${name}':`, glbUrl);
  } else {
    console.warn("[Directus] No slug or glb param provided");
    return;
  }

  await loader.load(glbUrl, name);

  const model = loader.loadedModels[0];
  if (model) {
    model.scale.setScalar(scale);
    model.rotation.y = MathUtils.degToRad(ry);
    console.log(`[Directus] Ready. scale=${scale}, rotY=${ry}°`);
  }
}

// ─────────────────────────────────────────────
// DIRECTUS LOADER — Needle Behaviour (optional)
// Can be used if you ever add a Unity base scene
// ─────────────────────────────────────────────
export class DirectusLoader extends Behaviour {
  public modelLoader: ModelLoading | undefined = undefined;

  async onEnable(): Promise<void> {
    const slug = new URL(window.location.href).searchParams.get("slug") ?? undefined;
    const glbOverride = new URL(window.location.href).searchParams.get("glb") ?? undefined;
    await loadSceneInto(
      this.modelLoader ?? GameObject.findObjectOfType(ModelLoading) ?? null,
      slug,
      glbOverride
    );
  }
}