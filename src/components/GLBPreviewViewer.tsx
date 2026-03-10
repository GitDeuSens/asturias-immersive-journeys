// ============ GLB PREVIEW VIEWER ============
// Lightweight Three.js viewer for GLB model preview (VR experiences)
// Uses orbit controls for interactive 3D preview

import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface GLBPreviewViewerProps {
  glbUrl: string;
  scale?: number;
  rotationY?: number;
  className?: string;
}

export default function GLBPreviewViewer({ glbUrl, scale = 1, rotationY = 0, className = '' }: GLBPreviewViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !glbUrl) return;

    let cancelled = false;

    async function init() {
      try {
        const THREE = await import('three');
        const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
        const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js');
        const { DRACOLoader } = await import('three/examples/jsm/loaders/DRACOLoader.js');

        if (cancelled) return;

        const width = container.clientWidth;
        const height = container.clientHeight;

        // Scene
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x1a1a2e);

        // Camera
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.01, 100);
        camera.position.set(0, 1.5, 3);

        // Renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.2;
        container.appendChild(renderer.domElement);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
        dirLight.position.set(5, 10, 7);
        dirLight.castShadow = true;
        scene.add(dirLight);

        const fillLight = new THREE.DirectionalLight(0x8888ff, 0.4);
        fillLight.position.set(-5, 3, -5);
        scene.add(fillLight);

        // Subtle ground grid
        const gridHelper = new THREE.GridHelper(10, 20, 0x333355, 0x222244);
        scene.add(gridHelper);

        // Controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 1.5;
        controls.minDistance = 0.5;
        controls.maxDistance = 20;
        controls.target.set(0, 0.5, 0);

        // Load GLB
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');

        const loader = new GLTFLoader();
        loader.setDRACOLoader(dracoLoader);

        loader.load(
          glbUrl,
          (gltf) => {
            if (cancelled) return;

            const model = gltf.scene;
            model.scale.setScalar(scale);
            model.rotation.y = (rotationY * Math.PI) / 180;

            // Center the model
            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            model.position.sub(center);
            model.position.y += size.y / 2;

            scene.add(model);

            // Adjust camera to fit model
            const maxDim = Math.max(size.x, size.y, size.z);
            const fov = camera.fov * (Math.PI / 180);
            let cameraZ = maxDim / (2 * Math.tan(fov / 2));
            cameraZ *= 2;
            camera.position.set(cameraZ * 0.7, cameraZ * 0.5, cameraZ * 0.7);
            controls.target.set(0, size.y / 2, 0);
            controls.update();

            // Handle animations
            if (gltf.animations.length > 0) {
              const m = new THREE.AnimationMixer(model);
              gltf.animations.forEach(clip => {
                m.clipAction(clip).play();
              });
              mixer = m;
            }

            setLoading(false);
          },
          undefined,
          (err) => {
            if (cancelled) return;
            console.error('[GLBPreviewViewer] Load error:', err);
            setError('Failed to load 3D model');
            setLoading(false);
          }
        );

        // Animation loop
        const clock = new THREE.Clock();
        let mixer: InstanceType<typeof THREE.AnimationMixer> | undefined;
        let animId: number;
        const animate = () => {
          animId = requestAnimationFrame(animate);
          const delta = clock.getDelta();
          controls.update();
          if (mixer) mixer.update(delta);
          renderer.render(scene, camera);
        };
        animate();

        // Resize handler
        const onResize = () => {
          const w = container.clientWidth;
          const h = container.clientHeight;
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        };
        const resizeObserver = new ResizeObserver(onResize);
        resizeObserver.observe(container);

        cleanupRef.current = () => {
          cancelled = true;
          cancelAnimationFrame(animId);
          resizeObserver.disconnect();
          controls.dispose();
          renderer.dispose();
          dracoLoader.dispose();
          scene.clear();
          if (renderer.domElement.parentElement) {
            renderer.domElement.parentElement.removeChild(renderer.domElement);
          }
        };
      } catch (err) {
        if (!cancelled) {
          console.error('[GLBPreviewViewer] Init error:', err);
          setError('Failed to initialize 3D viewer');
          setLoading(false);
        }
      }
    }

    init();

    return () => {
      cancelled = true;
      cleanupRef.current?.();
      cleanupRef.current = null;
    };
  }, [glbUrl, scale, rotationY]);

  return (
    <div ref={containerRef} className={`relative w-full h-full ${className}`}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#1a1a2e]">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <span className="text-xs text-white/60 font-medium">Loading 3D model…</span>
          </div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#1a1a2e]">
          <span className="text-xs text-destructive">{error}</span>
        </div>
      )}
    </div>
  );
}
