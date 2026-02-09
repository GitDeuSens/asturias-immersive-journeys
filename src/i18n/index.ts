import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Translation resources
const resources = {
  es: {
    translation: {
      // Common
      "common.loading": "Cargando...",
      "common.error": "Error",
      "common.close": "Cerrar",
      "common.back": "Volver",
      "common.next": "Siguiente",
      "common.restart": "Reiniciar",
      "common.share": "Compartir",
      "common.download": "Descargar",
      "common.search": "Buscar",
      "common.filter": "Filtrar",
      "common.all": "Todos",
      "common.results": "resultados",
      "common.viewDetails": "Ver detalles",
      "common.viewList": "Ver lista",
      "common.viewMap": "Ver mapa",

      // Navigation
      "nav.home": "Inicio",
      "nav.tours360": "Tours 360°",
      "nav.routes": "Rutas Inmersivas",
      "nav.map": "Mapa",
      "nav.vrExperiences": "Experiencias VR",
      "nav.arExperiences": "Experiencias AR",
      "nav.help": "Ayuda",

      // Header
      "header.asturiasInmersivo": "Asturias Inmersivo",
      "header.skipToContent": "Saltar al contenido principal",

      // Onboarding
      "onboarding.discoverFrom": "Descubriendo desde casa",
      "onboarding.discoverFromDesc": "Explora Asturias virtualmente",
      "onboarding.alreadyHere": "Ya estoy en Asturias",
      "onboarding.alreadyHereDesc": "Contenido según tu ubicación",
      "onboarding.selectMode": "¿Cómo quieres explorar?",
      "onboarding.selectExperience": "Elige tu experiencia",
      "onboarding.tours360": "Tours Virtuales 360°",
      "onboarding.tours360Desc": "11 museos y equipamientos",
      "onboarding.immersiveRoutes": "Rutas Inmersivas",
      "onboarding.immersiveRoutesDesc": "29 rutas AR/360°",

      // Routes
      "routes.title": "Rutas Inmersivas",
      "routes.search": "Buscar rutas...",
      "routes.fitBounds": "Ajustar vista",
      "routes.enterRoute": "Entrar en la ruta",
      "routes.exitRoute": "Salir de la ruta",
      "routes.duration": "Duración",
      "routes.difficulty": "Dificultad",
      "routes.points": "puntos",
      "routes.distance": "Distancia",
      "routes.circular": "Ruta circular",
      "routes.linear": "Ruta lineal",
      "routes.tour360Available": "Tour 360° disponible",
      "routes.noPoints": "Los puntos de esta ruta están en desarrollo",
      "routes.progress": "Progreso",
      "routes.exploring": "Explorando",
      "routes.howToGet": "Cómo llegar",

      // Difficulty
      "difficulty.easy": "Fácil",
      "difficulty.medium": "Media",
      "difficulty.hard": "Difícil",

      // POI / Points
      "poi.arExperience": "Experiencia de Realidad Aumentada",
      "poi.launchAR": "Abrir experiencia AR",
      "poi.scanQR": "Escanea con tu móvil",
      "poi.scanQRDesc": "Apunta la cámara de tu móvil al código QR para abrir la experiencia de Realidad Aumentada",
      "poi.arInstructions": "Instrucciones AR",
      "poi.location": "Ubicación",
      "poi.open360": "Abrir tour 360°",
      "poi.playVideo": "Reproducir vídeo",
      "poi.downloadPDF": "Descargar PDF",
      "poi.listenAudio": "Escuchar audioguía",
      "poi.tryARDesktop": "Probar en este dispositivo",
      "poi.arRecommendation": "Recomendado: usa tu móvil para la mejor experiencia AR",
      "poi.gallery": "Galería de imágenes",
      "poi.practicalInfo": "Información práctica",
      "poi.schedule": "Horarios",
      "poi.prices": "Precios",
      "poi.contact": "Contacto",
      "poi.contentAvailable": "Contenido disponible",

      // Tours 360
      "tours360.title": "Tours Virtuales 360°",
      "tours360.subtitle": "Explora Asturias desde cualquier lugar",
      "tours360.startTour": "Iniciar Tour",
      "tours360.scenes": "escenas",
      "tours360.allCategories": "Todas las categorías",

      // VR Experiences
      "vr.title": "Experiencias VR",
      "vr.subtitle": "Sumérgete en Asturias con realidad virtual",
      "vr.downloadAPK": "Descargar APK",
      "vr.duration": "Duración estimada",
      "vr.difficulty": "Dificultad",
      "vr.instructions": "Instrucciones de uso",
      "vr.requirements": "Requisitos",
      "vr.compatible": "Compatible con",

      // Map
      "map.yourLocation": "Tu ubicación",
      "map.locationActive": "Ubicación activa",
      "map.enableLocation": "Activar ubicación",
      "map.clusterPoints": "puntos de interés",

      // Navigation
      "navigation.getDirections": "Cómo llegar",
      "navigation.walking": "A pie",
      "navigation.driving": "En coche",
      "navigation.chooseMode": "Elige cómo llegar",
      "navigation.fromYourLocation": "Desde tu ubicación",
      "navigation.nearestPoint": "Punto más cercano",
      "navigation.startHere": "Empezar aquí",
      "navigation.nearYou": "Cerca de ti",
      "navigation.withinRadius": "en un radio de",
      "navigation.noLocation": "Activa tu ubicación para ver qué tienes cerca",
      "navigation.nothingNearby": "No hay puntos cercanos en un radio de 50km",
      "navigation.calculatingRoute": "Calculando ruta...",
      "navigation.error": "Error",
      "navigation.retry": "Reintentar",
      "navigation.arrived": "¡Has llegado!",
      "navigation.arrivedDesc": "Has llegado a tu destino",
      "navigation.recalculate": "Recalcular",
      "navigation.remaining": "restante",
      "navigation.stepOf": "Paso",
      "navigation.of": "de",
      "navigation.allSteps": "Todas las indicaciones",
      "navigation.stopNavigation": "Detener navegación",
      "navigation.selectMode": "Selecciona modo de transporte",
      "navigation.start": "Iniciar",
      "navigation.offlineMode": "Modo sin conexión",
      "navigation.progress": "Progreso",
      "navigation.inApp": "Navegar en app",
      "navigation.externalMaps": "Abrir en Maps",
      "navigation.stepByStep": "Paso a paso con mapa en tiempo real",
      "navigation.cachedRoutes": "rutas guardadas disponibles",

      // Network
      "network.offline": "Sin conexión a Internet",
      "network.offlineDescription": "Algunas funciones pueden no estar disponibles",
      "network.offlineWithCache": "Modo sin conexión - Datos disponibles",
      "network.backOnline": "¡Conexión restaurada!",
      "network.slowConnection": "Conexión lenta detectada",
      "network.slowConnectionDescription": "El contenido puede tardar más en cargar",

      // Categories
      "category.nature": "Naturaleza",
      "category.heritage": "Patrimonio",
      "category.adventure": "Aventura",
      "category.gastronomy": "Gastronomía",
      "category.culture": "Cultura",

      // Share
      "share.title": "Compartir",
      "share.copyLink": "Copiar enlace",
      "share.linkCopied": "Enlace copiado",
      "share.whatsapp": "Compartir en WhatsApp",
      "share.facebook": "Compartir en Facebook",
      "share.twitter": "Compartir en Twitter",
      "share.email": "Enviar por email",

      // Accessibility
      "a11y.mainNavigation": "Navegación principal",
      "a11y.closeModal": "Cerrar ventana modal",
      "a11y.openMenu": "Abrir menú",
      "a11y.closeMenu": "Cerrar menú",
      "a11y.languageSelector": "Selector de idioma",
      "a11y.currentLanguage": "Idioma actual",
      "a11y.mapInteractive": "Mapa interactivo",
      "a11y.zoomIn": "Acercar",
      "a11y.zoomOut": "Alejar",
      "a11y.imageGallery": "Galería de imágenes",
      "a11y.playPause": "Reproducir/Pausar",
      "a11y.fullscreen": "Pantalla completa",

      // Settings
      "settings.language": "Idioma",
      "settings.theme": "Tema",
      "settings.lightTheme": "Claro",
      "settings.darkTheme": "Oscuro",
      "settings.systemTheme": "Sistema",

      // Footer
      "footer.privacy": "Política de privacidad",
      "footer.cookies": "Política de cookies",
      "footer.accessibility": "Declaración de accesibilidad",
      "footer.contact": "Contacto",
      "footer.legal": "Aviso legal",
      "footer.fundedBy": "Financiado por la Unión Europea – NextGenerationEU",
      "footer.copyright": "© 2026 Principado de Asturias. Todos los derechos reservados.",
      "footer.developedBy": "Desarrollado por",
      "footer.arExperiences": "Experiencias AR",

      // Cookie Consent
      "cookies.consentTitle": "Utilizamos cookies",
      "cookies.consentDescription":
        "Usamos cookies para mejorar tu experiencia de navegación, mostrar contenido personalizado y analizar nuestro tráfico.",
      "cookies.learnMore": "Más información",
      "cookies.acceptAll": "Aceptar todas",
      "cookies.rejectAll": "Rechazar",
      "cookies.customize": "Personalizar",
      "cookies.savePreferences": "Guardar preferencias",
      "cookies.necessary": "Cookies necesarias",
      "cookies.necessaryDesc": "Esenciales para el funcionamiento del sitio web.",
      "cookies.analytics": "Cookies analíticas",
      "cookies.analyticsDesc": "Nos ayudan a entender cómo usas el sitio.",
      "cookies.marketing": "Cookies de marketing",
      "cookies.marketingDesc": "Utilizadas para mostrarte anuncios relevantes.",
      "cookies.required": "Obligatorio",

      // Errors
      "error.generic": "Ha ocurrido un error",
      "error.notFound": "Página no encontrada",
      "error.goHome": "Volver al inicio",
      "error.tryAgain": "Intentar de nuevo",
    },
  },
  en: {
    translation: {
      // Common
      "common.loading": "Loading...",
      "common.error": "Error",
      "common.close": "Close",
      "common.back": "Back",
      "common.next": "Next",
      "common.restart": "Restart",
      "common.share": "Share",
      "common.download": "Download",
      "common.search": "Search",
      "common.filter": "Filter",
      "common.all": "All",
      "common.results": "results",
      "common.viewDetails": "View details",
      "common.viewList": "View list",
      "common.viewMap": "View map",

      // Navigation
      "nav.home": "Home",
      "nav.tours360": "360° Tours",
      "nav.routes": "Immersive Routes",
      "nav.map": "Map",
      "nav.vrExperiences": "VR Experiences",
      "nav.arExperiences": "AR Experiences",
      "nav.help": "Help",

      // Header
      "header.asturiasInmersivo": "Asturias Immersive",
      "header.skipToContent": "Skip to main content",

      // Onboarding
      "onboarding.discoverFrom": "Discovering from home",
      "onboarding.discoverFromDesc": "Explore Asturias virtually",
      "onboarding.alreadyHere": "I'm already in Asturias",
      "onboarding.alreadyHereDesc": "Location-based content",
      "onboarding.selectMode": "How do you want to explore?",
      "onboarding.selectExperience": "Choose your experience",
      "onboarding.tours360": "360° Virtual Tours",
      "onboarding.tours360Desc": "11 museums and venues",
      "onboarding.immersiveRoutes": "Immersive Routes",
      "onboarding.immersiveRoutesDesc": "29 AR/360° routes",

      // Routes
      "routes.title": "Immersive Routes",
      "routes.search": "Search routes...",
      "routes.fitBounds": "Fit view",
      "routes.enterRoute": "Enter route",
      "routes.exitRoute": "Exit route",
      "routes.duration": "Duration",
      "routes.difficulty": "Difficulty",
      "routes.points": "points",
      "routes.distance": "Distance",
      "routes.circular": "Circular route",
      "routes.linear": "Linear route",
      "routes.tour360Available": "360° tour available",
      "routes.noPoints": "Points for this route are in development",
      "routes.progress": "Progress",
      "routes.exploring": "Exploring",
      "routes.howToGet": "How to get there",

      // Difficulty
      "difficulty.easy": "Easy",
      "difficulty.medium": "Medium",
      "difficulty.hard": "Hard",

      // POI / Points
      "poi.arExperience": "Augmented Reality Experience",
      "poi.launchAR": "Launch AR experience",
      "poi.scanQR": "Scan with your phone",
      "poi.scanQRDesc": "Point your phone camera at the QR code to open the Augmented Reality experience",
      "poi.arInstructions": "AR Instructions",
      "poi.location": "Location",
      "poi.open360": "Open 360° tour",
      "poi.playVideo": "Play video",
      "poi.downloadPDF": "Download PDF",
      "poi.listenAudio": "Listen to audioguide",
      "poi.tryARDesktop": "Try on this device",
      "poi.arRecommendation": "Recommended: use your phone for the best AR experience",
      "poi.gallery": "Image gallery",
      "poi.practicalInfo": "Practical information",
      "poi.schedule": "Schedule",
      "poi.prices": "Prices",
      "poi.contact": "Contact",
      "poi.contentAvailable": "Available content",

      // Tours 360
      "tours360.title": "360° Virtual Tours",
      "tours360.subtitle": "Explore Asturias from anywhere",
      "tours360.startTour": "Start Tour",
      "tours360.scenes": "scenes",
      "tours360.allCategories": "All categories",

      // VR Experiences
      "vr.title": "VR Experiences",
      "vr.subtitle": "Immerse yourself in Asturias with virtual reality",
      "vr.downloadAPK": "Download APK",
      "vr.duration": "Estimated duration",
      "vr.difficulty": "Difficulty",
      "vr.instructions": "Usage instructions",
      "vr.requirements": "Requirements",
      "vr.compatible": "Compatible with",

      // Map
      "map.yourLocation": "Your location",
      "map.locationActive": "Location active",
      "map.enableLocation": "Enable location",
      "map.clusterPoints": "points of interest",

      // Navigation
      "navigation.getDirections": "Get directions",
      "navigation.walking": "Walking",
      "navigation.driving": "Driving",
      "navigation.chooseMode": "Choose how to get there",
      "navigation.fromYourLocation": "From your location",
      "navigation.nearestPoint": "Nearest point",
      "navigation.startHere": "Start here",
      "navigation.nearYou": "Near you",
      "navigation.withinRadius": "within",
      "navigation.noLocation": "Enable location to see what's nearby",
      "navigation.nothingNearby": "No points within 50km radius",
      "navigation.calculatingRoute": "Calculating route...",
      "navigation.error": "Error",
      "navigation.retry": "Retry",
      "navigation.arrived": "You arrived!",
      "navigation.arrivedDesc": "You have arrived at your destination",
      "navigation.recalculate": "Recalculate",
      "navigation.remaining": "remaining",
      "navigation.stepOf": "Step",
      "navigation.of": "of",
      "navigation.allSteps": "All directions",
      "navigation.stopNavigation": "Stop navigation",
      "navigation.selectMode": "Select transport mode",
      "navigation.start": "Start",
      "navigation.offlineMode": "Offline mode",
      "navigation.progress": "Progress",
      "navigation.inApp": "Navigate in app",
      "navigation.externalMaps": "Open in Maps",
      "navigation.stepByStep": "Step-by-step with real-time map",
      "navigation.cachedRoutes": "saved routes available",

      // Network
      "network.offline": "No internet connection",
      "network.offlineDescription": "Some features may not be available",
      "network.offlineWithCache": "Offline mode - Data available",
      "network.backOnline": "Connection restored!",
      "network.slowConnection": "Slow connection detected",
      "network.slowConnectionDescription": "Content may take longer to load",

      // Categories
      "category.nature": "Nature",
      "category.heritage": "Heritage",
      "category.adventure": "Adventure",
      "category.gastronomy": "Gastronomy",
      "category.culture": "Culture",

      // Share
      "share.title": "Share",
      "share.copyLink": "Copy link",
      "share.linkCopied": "Link copied",
      "share.whatsapp": "Share on WhatsApp",
      "share.facebook": "Share on Facebook",
      "share.twitter": "Share on Twitter",
      "share.email": "Send by email",

      // Accessibility
      "a11y.mainNavigation": "Main navigation",
      "a11y.closeModal": "Close modal window",
      "a11y.openMenu": "Open menu",
      "a11y.closeMenu": "Close menu",
      "a11y.languageSelector": "Language selector",
      "a11y.currentLanguage": "Current language",
      "a11y.mapInteractive": "Interactive map",
      "a11y.zoomIn": "Zoom in",
      "a11y.zoomOut": "Zoom out",
      "a11y.imageGallery": "Image gallery",
      "a11y.playPause": "Play/Pause",
      "a11y.fullscreen": "Fullscreen",

      // Settings
      "settings.language": "Language",
      "settings.theme": "Theme",
      "settings.lightTheme": "Light",
      "settings.darkTheme": "Dark",
      "settings.systemTheme": "System",

      // Footer
      "footer.privacy": "Privacy Policy",
      "footer.cookies": "Cookie Policy",
      "footer.accessibility": "Accessibility Statement",
      "footer.contact": "Contact",
      "footer.legal": "Legal Notice",
      "footer.fundedBy": "Funded by the European Union – NextGenerationEU",
      "footer.copyright": "© 2024 Principality of Asturias. All rights reserved.",
      "footer.developedBy": "Developed by",
      "footer.arExperiences": "AR Experiences",

      // Cookie Consent
      "cookies.consentTitle": "We use cookies",
      "cookies.consentDescription":
        "We use cookies to improve your browsing experience, show personalized content and analyze our traffic.",
      "cookies.learnMore": "Learn more",
      "cookies.acceptAll": "Accept all",
      "cookies.rejectAll": "Reject",
      "cookies.customize": "Customize",
      "cookies.savePreferences": "Save preferences",
      "cookies.necessary": "Necessary cookies",
      "cookies.necessaryDesc": "Essential for the website to function properly.",
      "cookies.analytics": "Analytics cookies",
      "cookies.analyticsDesc": "Help us understand how you use the site.",
      "cookies.marketing": "Marketing cookies",
      "cookies.marketingDesc": "Used to show you relevant ads.",
      "cookies.required": "Required",

      // Errors
      "error.generic": "An error has occurred",
      "error.notFound": "Page not found",
      "error.goHome": "Go to home",
      "error.tryAgain": "Try again",
    },
  },
  fr: {
    translation: {
      // Common
      "common.loading": "Chargement...",
      "common.error": "Erreur",
      "common.close": "Fermer",
      "common.back": "Retour",
      "common.next": "Suivant",
      "common.restart": "Redémarrer",
      "common.share": "Partager",
      "common.download": "Télécharger",
      "common.search": "Rechercher",
      "common.filter": "Filtrer",
      "common.all": "Tous",
      "common.results": "résultats",
      "common.viewDetails": "Voir les détails",
      "common.viewList": "Vue liste",
      "common.viewMap": "Vue carte",

      // Navigation
      "nav.home": "Accueil",
      "nav.tours360": "Tours 360°",
      "nav.routes": "Itinéraires Immersifs",
      "nav.map": "Carte",
      "nav.vrExperiences": "Expériences VR",
      "nav.arExperiences": "Expériences AR",
      "nav.help": "Aide",

      // Header
      "header.asturiasInmersivo": "Asturies Immersif",
      "header.skipToContent": "Aller au contenu principal",

      // Onboarding
      "onboarding.discoverFrom": "Découvrir depuis chez soi",
      "onboarding.discoverFromDesc": "Explorez les Asturies virtuellement",
      "onboarding.alreadyHere": "Je suis déjà aux Asturies",
      "onboarding.alreadyHereDesc": "Contenu basé sur votre position",
      "onboarding.selectMode": "Comment voulez-vous explorer ?",
      "onboarding.selectExperience": "Choisissez votre expérience",
      "onboarding.tours360": "Visites Virtuelles 360°",
      "onboarding.tours360Desc": "11 musées et équipements",
      "onboarding.immersiveRoutes": "Itinéraires Immersifs",
      "onboarding.immersiveRoutesDesc": "29 itinéraires AR/360°",

      // Routes
      "routes.title": "Itinéraires Immersifs",
      "routes.search": "Rechercher des itinéraires...",
      "routes.fitBounds": "Ajuster la vue",
      "routes.enterRoute": "Entrer dans l'itinéraire",
      "routes.exitRoute": "Quitter l'itinéraire",
      "routes.duration": "Durée",
      "routes.difficulty": "Difficulté",
      "routes.points": "points",
      "routes.distance": "Distance",
      "routes.circular": "Itinéraire circulaire",
      "routes.linear": "Itinéraire linéaire",
      "routes.tour360Available": "Tour 360° disponible",
      "routes.noPoints": "Les points de cet itinéraire sont en développement",
      "routes.progress": "Progression",
      "routes.exploring": "Exploration",
      "routes.howToGet": "Comment y aller",

      // Difficulty
      "difficulty.easy": "Facile",
      "difficulty.medium": "Moyenne",
      "difficulty.hard": "Difficile",

      // POI / Points
      "poi.arExperience": "Expérience de Réalité Augmentée",
      "poi.launchAR": "Lancer l'expérience AR",
      "poi.scanQR": "Scannez avec votre téléphone",
      "poi.scanQRDesc":
        "Pointez la caméra de votre téléphone vers le code QR pour ouvrir l'expérience de Réalité Augmentée",
      "poi.arInstructions": "Instructions AR",
      "poi.location": "Emplacement",
      "poi.open360": "Ouvrir le tour 360°",
      "poi.playVideo": "Lire la vidéo",
      "poi.downloadPDF": "Télécharger le PDF",
      "poi.listenAudio": "Écouter l'audioguide",
      "poi.tryARDesktop": "Essayer sur cet appareil",
      "poi.arRecommendation": "Recommandé : utilisez votre téléphone pour la meilleure expérience AR",
      "poi.gallery": "Galerie d'images",
      "poi.practicalInfo": "Informations pratiques",
      "poi.schedule": "Horaires",
      "poi.prices": "Prix",
      "poi.contact": "Contact",
      "poi.contentAvailable": "Contenu disponible",

      // Tours 360
      "tours360.title": "Visites Virtuelles 360°",
      "tours360.subtitle": "Explorez les Asturies de n'importe où",
      "tours360.startTour": "Démarrer la visite",
      "tours360.scenes": "scènes",
      "tours360.allCategories": "Toutes les catégories",

      // VR Experiences
      "vr.title": "Expériences VR",
      "vr.subtitle": "Plongez dans les Asturies avec la réalité virtuelle",
      "vr.downloadAPK": "Télécharger APK",
      "vr.duration": "Durée estimée",
      "vr.difficulty": "Difficulté",
      "vr.instructions": "Instructions d'utilisation",
      "vr.requirements": "Exigences",
      "vr.compatible": "Compatible avec",

      // Map
      "map.yourLocation": "Votre position",
      "map.locationActive": "Position active",
      "map.enableLocation": "Activer la position",
      "map.clusterPoints": "points d'intérêt",

      // Navigation
      "navigation.getDirections": "Itinéraire",
      "navigation.walking": "À pied",
      "navigation.driving": "En voiture",
      "navigation.chooseMode": "Choisissez comment y aller",
      "navigation.fromYourLocation": "Depuis votre position",
      "navigation.nearestPoint": "Point le plus proche",
      "navigation.startHere": "Commencer ici",
      "navigation.nearYou": "Près de vous",
      "navigation.withinRadius": "dans un rayon de",
      "navigation.noLocation": "Activez la localisation pour voir ce qui est proche",
      "navigation.nothingNearby": "Aucun point dans un rayon de 50km",
      "navigation.calculatingRoute": "Calcul de l'itinéraire...",
      "navigation.error": "Erreur",
      "navigation.retry": "Réessayer",
      "navigation.arrived": "Vous êtes arrivé !",
      "navigation.arrivedDesc": "Vous êtes arrivé à destination",
      "navigation.recalculate": "Recalculer",
      "navigation.remaining": "restant",
      "navigation.stepOf": "Étape",
      "navigation.of": "sur",
      "navigation.allSteps": "Toutes les indications",
      "navigation.stopNavigation": "Arrêter la navigation",
      "navigation.selectMode": "Sélectionnez le mode de transport",
      "navigation.start": "Démarrer",
      "navigation.offlineMode": "Mode hors ligne",
      "navigation.progress": "Progression",
      "navigation.inApp": "Naviguer dans l'app",
      "navigation.externalMaps": "Ouvrir dans Maps",
      "navigation.stepByStep": "Pas à pas avec carte en temps réel",
      "navigation.cachedRoutes": "itinéraires sauvegardés disponibles",

      // Network
      "network.offline": "Pas de connexion Internet",
      "network.offlineDescription": "Certaines fonctionnalités peuvent ne pas être disponibles",
      "network.offlineWithCache": "Mode hors ligne - Données disponibles",
      "network.backOnline": "Connexion restaurée !",
      "network.slowConnection": "Connexion lente détectée",
      "network.slowConnectionDescription": "Le contenu peut prendre plus de temps à charger",

      // Categories
      "category.nature": "Nature",
      "category.heritage": "Patrimoine",
      "category.adventure": "Aventure",
      "category.gastronomy": "Gastronomie",
      "category.culture": "Culture",

      // Share
      "share.title": "Partager",
      "share.copyLink": "Copier le lien",
      "share.linkCopied": "Lien copié",
      "share.whatsapp": "Partager sur WhatsApp",
      "share.facebook": "Partager sur Facebook",
      "share.twitter": "Partager sur Twitter",
      "share.email": "Envoyer par email",

      // Accessibility
      "a11y.mainNavigation": "Navigation principale",
      "a11y.closeModal": "Fermer la fenêtre modale",
      "a11y.openMenu": "Ouvrir le menu",
      "a11y.closeMenu": "Fermer le menu",
      "a11y.languageSelector": "Sélecteur de langue",
      "a11y.currentLanguage": "Langue actuelle",
      "a11y.mapInteractive": "Carte interactive",
      "a11y.zoomIn": "Zoom avant",
      "a11y.zoomOut": "Zoom arrière",
      "a11y.imageGallery": "Galerie d'images",
      "a11y.playPause": "Lecture/Pause",
      "a11y.fullscreen": "Plein écran",

      // Settings
      "settings.language": "Langue",
      "settings.theme": "Thème",
      "settings.lightTheme": "Clair",
      "settings.darkTheme": "Sombre",
      "settings.systemTheme": "Système",

      // Footer
      "footer.privacy": "Politique de confidentialité",
      "footer.cookies": "Politique de cookies",
      "footer.accessibility": "Déclaration d'accessibilité",
      "footer.contact": "Contact",
      "footer.legal": "Mentions légales",
      "footer.fundedBy": "Financé par l'Union Européenne – NextGenerationEU",
      "footer.copyright": "© 2024 Principauté des Asturies. Tous droits réservés.",
      "footer.developedBy": "Développé par",
      "footer.arExperiences": "Expériences AR",

      // Cookie Consent
      "cookies.consentTitle": "Nous utilisons des cookies",
      "cookies.consentDescription":
        "Nous utilisons des cookies pour améliorer votre expérience de navigation, afficher du contenu personnalisé et analyser notre trafic.",
      "cookies.learnMore": "En savoir plus",
      "cookies.acceptAll": "Tout accepter",
      "cookies.rejectAll": "Refuser",
      "cookies.customize": "Personnaliser",
      "cookies.savePreferences": "Enregistrer les préférences",
      "cookies.necessary": "Cookies nécessaires",
      "cookies.necessaryDesc": "Essentiels au bon fonctionnement du site.",
      "cookies.analytics": "Cookies analytiques",
      "cookies.analyticsDesc": "Nous aident à comprendre comment vous utilisez le site.",
      "cookies.marketing": "Cookies marketing",
      "cookies.marketingDesc": "Utilisés pour vous montrer des publicités pertinentes.",
      "cookies.required": "Requis",

      // Errors
      "error.generic": "Une erreur s'est produite",
      "error.notFound": "Page non trouvée",
      "error.goHome": "Aller à l'accueil",
      "error.tryAgain": "Réessayer",
    },
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "es",
    supportedLngs: ["es", "en", "fr"],
    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"],
      lookupLocalStorage: "asturias-inmersivo-lang",
    },
    interpolation: {
      escapeValue: false,
    },
  });

export { loadDirectusTranslations } from './directus-backend';
export default i18n;
