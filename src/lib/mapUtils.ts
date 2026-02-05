// Enhanced map utilities for clustering, user position, and navigation
import L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

// Create user position marker with pulsing animation
export const createUserPositionMarker = (lat: number, lng: number): L.Marker => {
  const userIcon = L.divIcon({
    className: 'user-position-marker',
    html: `
      <div class="user-marker-container" role="img" aria-label="Tu ubicación">
        <div class="user-marker-pulse"></div>
        <div class="user-marker-dot"></div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });

  return L.marker([lat, lng], { 
    icon: userIcon,
    zIndexOffset: 1000,
  });
};

// Create marker cluster group with custom styling
export const createClusterGroup = (): L.MarkerClusterGroup => {
  return L.markerClusterGroup({
    maxClusterRadius: 50,
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: false,
    zoomToBoundsOnClick: true,
    iconCreateFunction: (cluster: L.MarkerCluster) => {
      const count = cluster.getChildCount();
      let size = 'small';
      let diameter = 40;
      
      if (count >= 10) {
        size = 'large';
        diameter = 60;
      } else if (count >= 5) {
        size = 'medium';
        diameter = 50;
      }

      return L.divIcon({
        html: `
          <div class="cluster-marker cluster-${size}" role="button" aria-label="${count} puntos de interés">
            <span class="cluster-count">${count}</span>
          </div>
        `,
        className: 'custom-cluster-icon',
        iconSize: [diameter, diameter],
        iconAnchor: [diameter / 2, diameter / 2],
      });
    },
  });
};

// Calculate distance between two coordinates in km
export const calculateDistance = (
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRad = (deg: number): number => deg * (Math.PI / 180);

// Format distance for display
export const formatDistance = (km: number): string => {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
};

// Open navigation to coordinates
export const openNavigation = (lat: number, lng: number, name?: string): void => {
  const encodedName = name ? encodeURIComponent(name) : '';

  // Prefer a real anchor click to ensure the navigation happens in a new tab
  // and never attempts to load inside the preview iframe (can trigger ERR_BLOCKED_BY_RESPONSE).
  const openInNewTab = (url: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    // Appending improves reliability in some browsers
    document.body.appendChild(a);
    a.click();
    a.remove();
  };
  
  // Check if iOS
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  
  if (isIOS) {
    // Apple Maps
    openInNewTab(`maps://maps.apple.com/?daddr=${lat},${lng}&dirflg=d${name ? `&q=${encodedName}` : ''}`);
  } else {
    // Google Maps
    openInNewTab(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}${name ? `&destination_place_id=${encodedName}` : ''}`);
  }
};

// Calculate total route distance from polyline
export const calculateRouteDistance = (polyline: { lat: number; lng: number }[]): number => {
  if (polyline.length < 2) return 0;
  
  let totalDistance = 0;
  for (let i = 0; i < polyline.length - 1; i++) {
    totalDistance += calculateDistance(
      polyline[i].lat,
      polyline[i].lng,
      polyline[i + 1].lat,
      polyline[i + 1].lng
    );
  }
  return totalDistance;
};

// Add CSS for user position and cluster markers
export const injectMapStyles = (): void => {
  const styleId = 'asturias-map-styles';
  if (document.getElementById(styleId)) return;

  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    .user-marker-container {
      position: relative;
      width: 40px;
      height: 40px;
    }
    
    .user-marker-pulse {
      position: absolute;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: hsl(203, 100%, 32%);
      opacity: 0.3;
      animation: user-pulse 2s ease-out infinite;
    }
    
    .user-marker-dot {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 16px;
      height: 16px;
      background: hsl(203, 100%, 32%);
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 10px rgba(0, 102, 161, 0.5);
    }
    
    @keyframes user-pulse {
      0% {
        transform: scale(0.5);
        opacity: 0.5;
      }
      100% {
        transform: scale(2);
        opacity: 0;
      }
    }
    
    .cluster-marker {
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, hsl(79, 100%, 36%) 0%, hsl(79, 100%, 28%) 100%);
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
      font-family: 'Montserrat', sans-serif;
      transition: transform 0.2s ease;
    }
    
    .cluster-marker:hover {
      transform: scale(1.1);
    }
    
    .cluster-small {
      width: 40px;
      height: 40px;
    }
    
    .cluster-medium {
      width: 50px;
      height: 50px;
    }
    
    .cluster-large {
      width: 60px;
      height: 60px;
    }
    
    .cluster-count {
      color: white;
      font-weight: 800;
      font-size: 14px;
    }
    
    .cluster-large .cluster-count {
      font-size: 18px;
    }
    
    .custom-cluster-icon {
      background: transparent !important;
      border: none !important;
    }
    
    /* Focus styles for accessibility */
    .leaflet-marker-icon:focus {
      outline: 3px solid hsl(79, 100%, 36%);
      outline-offset: 2px;
    }
    
    .leaflet-interactive:focus {
      outline: 3px solid hsl(79, 100%, 36%);
      outline-offset: 2px;
    }
  `;
  document.head.appendChild(style);
};
