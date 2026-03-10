import {
  AssetReference,
  Behaviour,
  BoxCollider,
  DragControls,
  GameObject,
} from "@needle-tools/engine";
import { AnimationAction, AnimationClip, AnimationMixer, Box3, Clock, MathUtils, Object3D, Vector3 } from "three";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils.js";
import { DIRECTUS_URL } from '@/lib/directus-url';
import { logger } from '@/lib/logger';
export { DIRECTUS_URL };

// ─────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────
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
      `${DIRECTUS_URL}/items/ar_scenes` +
        `?filter[slug][_eq]=${encodeURIComponent(slug)}` +
        `&fields=id,slug,glb_model,glb_scale,glb_rotation_y,audio_es,audio_en,audio_fr` +
        `&limit=1`
    );
    if (!res.ok) {
      if (import.meta.env.DEV) console.error(`[Directus] HTTP ${res.status}: ${res.statusText}`);
      return null;
    }
    const json = await res.json();
    return (json.data?.[0] as ArScene) ?? null;
  } catch (e) {
    if (import.meta.env.DEV) console.error("[Directus] Fetch failed:", e);
    return null;
  }
}

export function getAssetUrl(uuid: string): string {
  return `${DIRECTUS_URL}/assets/${uuid}`;
}

// ─────────────────────────────────────────────
// MODEL LOADING — Needle Behaviour
// With AnimationMixer support for GLB animations
// ─────────────────────────────────────────────
export class ModelLoading extends Behaviour {
  public parent: GameObject | undefined = undefined;
  public loadedModels: Object3D[] = [];
  private currentIndex = 0;

  // Animation support
  private mixer: AnimationMixer | null = null;
  private actions: AnimationAction[] = [];
  private clock = new Clock();
  private animationFrameId: number | null = null;

  public async load(url: string, name: string): Promise<void> {
    this.clearAll();
    await this.instantiateModel(url, name);
    this.showModelAt(0);
  }

  public clearAll(): void {
    this.stopAnimations();
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
    await asset.loadAssetAsync();

    const parentGO = this.parent ?? this.gameObject;
    const parentObj = parentGO as unknown as Object3D;
    const instance = (await asset.instantiate(parentGO)) as unknown as Object3D;

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

    // Setup animations if the asset has them
    this.setupAnimations(asset, instance);
  }

  /**
   * Setup AnimationMixer for GLB animations.
   * Standard Three.js pattern: create mixer, extract actions, start render loop.
   */
  private setupAnimations(asset: AssetReference, instance: Object3D): void {
    // Extract animations from the GLTF root (rawAsset) — this is where Three.js stores clip data.
    // Needle's AssetReference stores the raw GLTF result in rawAsset, with animations at rawAsset.animations.
    // The asset.asset property returns the scene child, which may also have animations copied over.
    const assetAny = asset as any;
    const animations: AnimationClip[] = assetAny.rawAsset?.animations
      ?? assetAny._rawAsset?.animations
      ?? assetAny.asset?.animations
      ?? (instance as any).animations
      ?? [];

    if (!animations || animations.length === 0) {
      logger.log('[ModelLoading] No animations found in GLB');
      return;
    }

    logger.log(`[ModelLoading] Found ${animations.length} animation(s), setting up mixer`);

    // Collect material names present on the instantiated object
    const materialNames: string[] = [];
    instance.traverse((child: any) => {
      if (child.isMesh) {
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        mats.filter(Boolean).forEach((m: any) => {
          if (m?.name && !materialNames.includes(m.name)) materialNames.push(m.name);
        });
      }
    });

    // Clone clips and normalize material track targets to actual material names
    const clonedClips = animations.map((clip) => {
      const cloned = clip?.clone ? clip.clone() : clip;

      const fixedTracks = (cloned as any).tracks?.map((track: any) => {
        const path = track?.name as string;
        if (!path || !path.startsWith('.materials.')) return track;

        const match = path.match(/\.materials\.([^\.]+)(.*)/);
        if (!match) return track;

        const [, requestedName, rest] = match;
        if (materialNames.includes(requestedName)) return track;

        const fallback = materialNames.find((n) =>
          n === requestedName || n.startsWith(requestedName) || n.replace(/\.\d+$/, '') === requestedName
        );

        if (!fallback) return track;

        const clonedTrack = track.clone ? track.clone() : track;
        clonedTrack.name = `.materials.${fallback}${rest}`;
        return clonedTrack;
      });

      if (fixedTracks) (cloned as any).tracks = fixedTracks;
      return cloned;
    });

    let boundClips = clonedClips;
    const retargetClip = (SkeletonUtils as any).retargetClip as
      | ((obj: Object3D, clip: AnimationClip) => AnimationClip | undefined)
      | undefined;

    if (retargetClip) {
      boundClips = clonedClips.map((clip) => {
        try {
          const retargeted = retargetClip(instance, clip as AnimationClip);
          return (retargeted as AnimationClip) ?? (clip as AnimationClip);
        } catch (e) {
          console.warn('[ModelLoading] RetargetClip failed for clip, using cloned clip', e);
          return clip as AnimationClip;
        }
      });
    }

    (instance as any).animations = boundClips;

    // Create AnimationMixer on the loaded scene
    this.mixer = new AnimationMixer(instance);
    this.actions = boundClips.map((clip: AnimationClip) => this.mixer!.clipAction(clip));

    // Start all animations
    this.playAnimations();

    // Start the animation update loop
    this.startAnimationLoop();
  }

  /** Play all animation actions */
  public playAnimations(): void {
    this.actions.forEach(action => {
      action.reset();
      action.play();
    });
  }

  /** Stop all animation actions */
  public stopAnimations(): void {
    this.actions.forEach(action => action.stop());
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.mixer) {
      this.mixer.stopAllAction();
      this.mixer = null;
    }
    this.actions = [];
  }

  /** Update mixer every frame — essential for animations to play */
  private startAnimationLoop(): void {
    if (!this.mixer) return;
    this.clock = new Clock();

    const animate = () => {
      if (!this.mixer) return;
      const delta = this.clock.getDelta();
      this.mixer.update(delta);
      this.animationFrameId = requestAnimationFrame(animate);
    };

    this.animationFrameId = requestAnimationFrame(animate);
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

  /** Clean up on destroy */
  onDestroy(): void {
    this.stopAnimations();
    this.clearAll();
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
    logger.log("[Directus] GLB override:", glbUrl);
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
    logger.log(`[Directus] Loading '${name}':`, glbUrl);
  } else {
    console.warn("[Directus] No slug or glb param provided");
    return;
  }

  await loader.load(glbUrl, name);

  const model = loader.loadedModels[0];
  if (model) {
    model.scale.setScalar(scale);
    model.rotation.y = MathUtils.degToRad(ry);
    logger.log(`[Directus] Ready. scale=${scale}, rotY=${ry}°`);
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
