// Offline caching service for routes and navigation data
// Uses IndexedDB for larger data and localStorage for quick access

const DB_NAME = 'asturias-offline-db';
const DB_VERSION = 1;
const ROUTES_STORE = 'cached-routes';
const TILES_STORE = 'cached-tiles';

interface CachedRoute {
  id: string; // origin-destination key
  origin: { lat: number; lng: number };
  destination: { lat: number; lng: number; name: string };
  mode: 'walking' | 'driving';
  route: any; // OSRMRoute
  timestamp: number;
  expiresAt: number;
}

// Cache expiration: 7 days for routes
const ROUTE_CACHE_DURATION = 7 * 24 * 60 * 60 * 1000;

/**
 * Open IndexedDB database
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create routes store
      if (!db.objectStoreNames.contains(ROUTES_STORE)) {
        const routeStore = db.createObjectStore(ROUTES_STORE, { keyPath: 'id' });
        routeStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
      
      // Create tiles store for map caching
      if (!db.objectStoreNames.contains(TILES_STORE)) {
        const tilesStore = db.createObjectStore(TILES_STORE, { keyPath: 'url' });
        tilesStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}

/**
 * Generate cache key for a route
 */
function generateRouteKey(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
  mode: string
): string {
  // Round to 4 decimal places for reasonable precision
  const oLat = origin.lat.toFixed(4);
  const oLng = origin.lng.toFixed(4);
  const dLat = destination.lat.toFixed(4);
  const dLng = destination.lng.toFixed(4);
  return `${oLat},${oLng}-${dLat},${dLng}-${mode}`;
}

/**
 * Cache a route for offline use
 */
export async function cacheRoute(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number; name: string },
  mode: 'walking' | 'driving',
  route: any
): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(ROUTES_STORE, 'readwrite');
    const store = tx.objectStore(ROUTES_STORE);
    
    const cachedRoute: CachedRoute = {
      id: generateRouteKey(origin, destination, mode),
      origin,
      destination,
      mode,
      route,
      timestamp: Date.now(),
      expiresAt: Date.now() + ROUTE_CACHE_DURATION,
    };
    
    store.put(cachedRoute);
    
    await new Promise((resolve, reject) => {
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
    
    db.close();
    // Route cached
  } catch (error) {
    // Failed to cache route
  }
}

/**
 * Get cached route if available
 */
export async function getCachedRoute(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
  mode: 'walking' | 'driving'
): Promise<any | null> {
  try {
    const db = await openDB();
    const tx = db.transaction(ROUTES_STORE, 'readonly');
    const store = tx.objectStore(ROUTES_STORE);
    
    const key = generateRouteKey(origin, destination, mode);
    const request = store.get(key);
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const cached = request.result as CachedRoute | undefined;
        db.close();
        
        if (cached && cached.expiresAt > Date.now()) {
          // Cache hit
          resolve(cached.route);
        } else {
          // Cache miss or expired
          resolve(null);
        }
      };
      request.onerror = () => {
        db.close();
        reject(request.error);
      };
    });
  } catch (error) {
    // Failed to get cached route
    return null;
  }
}

/**
 * Clear expired cache entries
 */
export async function clearExpiredCache(): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(ROUTES_STORE, 'readwrite');
    const store = tx.objectStore(ROUTES_STORE);
    const index = store.index('timestamp');
    
    const request = index.openCursor();
    const now = Date.now();
    
    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result;
      if (cursor) {
        const cached = cursor.value as CachedRoute;
        if (cached.expiresAt < now) {
          cursor.delete();
          // Deleted expired entry
        }
        cursor.continue();
      }
    };
    
    await new Promise((resolve, reject) => {
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
    
    db.close();
  } catch (error) {
    // Failed to clear expired cache
  }
}

/**
 * Get all cached routes (for offline browsing)
 */
export async function getAllCachedRoutes(): Promise<CachedRoute[]> {
  try {
    const db = await openDB();
    const tx = db.transaction(ROUTES_STORE, 'readonly');
    const store = tx.objectStore(ROUTES_STORE);
    const request = store.getAll();
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        db.close();
        const routes = request.result.filter(
          (r: CachedRoute) => r.expiresAt > Date.now()
        );
        resolve(routes);
      };
      request.onerror = () => {
        db.close();
        reject(request.error);
      };
    });
  } catch (error) {
    // Failed to get all cached routes
    return [];
  }
}

/**
 * Cache immersive routes data for offline access
 */
/*export function cacheImmersiveRoutes(routes: any[]): void {
  try {
    localStorage.setItem('asturias-immersive-routes', JSON.stringify({
      data: routes,
      timestamp: Date.now(),
      expiresAt: Date.now() + ROUTE_CACHE_DURATION,
    }));
    // Immersive routes cached
  } catch (error) {
    // Failed to cache immersive routes
  }
}*/

/**
 * Get cached immersive routes
 */
export function getCachedImmersiveRoutes(): any[] | null {
  try {
    const cached = localStorage.getItem('asturias-immersive-routes');
    if (!cached) return null;
    
    const parsed = JSON.parse(cached);
    if (parsed.expiresAt > Date.now()) {
      return parsed.data;
    }
    
    localStorage.removeItem('asturias-immersive-routes');
    return null;
  } catch (error) {
    // Failed to get cached immersive routes
    return null;
  }
}

/**
 * Check if currently offline
 */
export function isOffline(): boolean {
  return !navigator.onLine;
}

/**
 * Get cache statistics
 */
export async function getCacheStats(): Promise<{ routeCount: number; lastUpdated: number | null }> {
  try {
    const routes = await getAllCachedRoutes();
    const lastUpdated = routes.length > 0 
      ? Math.max(...routes.map(r => r.timestamp))
      : null;
    
    return {
      routeCount: routes.length,
      lastUpdated,
    };
  } catch {
    return { routeCount: 0, lastUpdated: null };
  }
}
