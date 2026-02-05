import { useState, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Glasses, Download, Clock, Star, ChevronRight, X, Play, Smartphone, Monitor, Info } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AppHeader } from "@/components/AppHeader";
import { SEOHead } from "@/components/SEOHead";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

// VR Experiences data
const vrExperiences = [
  {
    id: "mina-sotón",
    title: {
      es: "Mina Sotón VR",
      en: "Sotón Mine VR",
      fr: "Mine Sotón VR",
    },
    description: {
      es: "Desciende 600 metros bajo tierra y recorre las galerías reales del Pozo Sotón",
      en: "Descend 600 meters underground and explore the real galleries of Pozo Sotón",
      fr: "Descendez à 600 mètres sous terre et parcourez les galeries réelles du Puits Sotón",
    },
    fullDescription: {
      es: "Una experiencia VR inmersiva que te transporta al corazón de la minería asturiana. Baja en la jaula minera, recorre las galerías iluminadas por tu lámpara y descubre la vida de los mineros.",
      en: "An immersive VR experience that transports you to the heart of Asturian mining. Go down in the mining cage, explore the galleries lit by your lamp and discover the life of the miners.",
      fr: "Une expérience VR immersive qui vous transporte au cœur de l'industrie minière asturienne. Descendez dans la cage minière, explorez les galeries éclairées par votre lampe et découvrez la vie des mineurs.",
    },
    coverImage: "/placeholder.svg",
    duration: "15-20 min",
    difficulty: "easy",
    compatible: ["Quest 2", "Quest 3", "Pico 4"],
    apkUrl: "https://example.com/mina-soton.apk",
    previewVideo: "https://youtube.com/watch?v=example",
    screenshots: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"],
  },
  {
    id: "camino-real",
    title: {
      es: "Camino Real VR",
      en: "Royal Path VR",
      fr: "Chemin Royal VR",
    },
    description: {
      es: "Recorre el antiguo camino de los peregrinos hacia Covadonga",
      en: "Walk the ancient pilgrims path to Covadonga",
      fr: "Parcourez l'ancien chemin des pèlerins vers Covadonga",
    },
    fullDescription: {
      es: "Viaja en el tiempo y recorre el Camino Real que conectaba las villas asturianas con el santuario de Covadonga. Experimenta el paisaje tal como lo veían los peregrinos medievales.",
      en: "Travel back in time and walk the Royal Path that connected Asturian towns with the sanctuary of Covadonga. Experience the landscape as medieval pilgrims saw it.",
      fr: "Voyagez dans le temps et parcourez le Chemin Royal qui reliait les villes asturiennes au sanctuaire de Covadonga.",
    },
    coverImage: "/placeholder.svg",
    duration: "25-30 min",
    difficulty: "medium",
    compatible: ["Quest 2", "Quest 3", "Pico 4"],
    apkUrl: "https://example.com/camino-real.apk",
    previewVideo: "https://youtube.com/watch?v=example2",
    screenshots: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"],
  },
  {
    id: "sidra-experience",
    title: {
      es: "Sidra Experience VR",
      en: "Cider Experience VR",
      fr: "Expérience Cidre VR",
    },
    description: {
      es: "Aprende el arte del escanciado y visita un llagar tradicional",
      en: "Learn the art of cider pouring and visit a traditional cider house",
      fr: "Apprenez l'art du service du cidre et visitez une cidrerie traditionnelle",
    },
    fullDescription: {
      es: "Sumérgete en la cultura sidrera asturiana. Visita un llagar tradicional, participa en la cosecha de manzanas y aprende la técnica del escanciado con realidad virtual.",
      en: "Immerse yourself in Asturian cider culture. Visit a traditional cider house, participate in the apple harvest and learn the pouring technique with virtual reality.",
      fr: "Plongez dans la culture cidricole asturienne. Visitez une cidrerie traditionnelle et apprenez la technique de service.",
    },
    coverImage: "/placeholder.svg",
    duration: "10-15 min",
    difficulty: "easy",
    compatible: ["Quest 2", "Quest 3", "Pico 4"],
    apkUrl: "https://example.com/sidra.apk",
    previewVideo: "https://youtube.com/watch?v=example3",
    screenshots: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"],
  },
  {
    id: "prehistoria-astur",
    title: {
      es: "Prehistoria Astur VR",
      en: "Asturian Prehistory VR",
      fr: "Préhistoire Asturienne VR",
    },
    description: {
      es: "Viaja 20.000 años atrás a las cuevas prehistóricas",
      en: "Travel 20,000 years back to prehistoric caves",
      fr: "Voyagez 20 000 ans en arrière dans les grottes préhistoriques",
    },
    fullDescription: {
      es: "Una aventura en el tiempo que te lleva a las cuevas de Tito Bustillo. Observa las pinturas rupestres en su contexto original y conoce a los primeros habitantes de Asturias.",
      en: "A time adventure that takes you to the caves of Tito Bustillo. Observe the cave paintings in their original context and meet the first inhabitants of Asturias.",
      fr: "Une aventure dans le temps qui vous emmène aux grottes de Tito Bustillo. Observez les peintures rupestres dans leur contexte original.",
    },
    coverImage: "/placeholder.svg",
    duration: "20-25 min",
    difficulty: "easy",
    compatible: ["Quest 2", "Quest 3", "Pico 4"],
    apkUrl: "https://example.com/prehistoria.apk",
    previewVideo: "https://youtube.com/watch?v=example4",
    screenshots: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"],
  },
];

const difficultyColors = {
  easy: "bg-primary/20 text-primary",
  medium: "bg-warm/20 text-warm",
  hard: "bg-destructive/20 text-destructive",
};

export function VRExperiencesPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as "es" | "en" | "fr";
  const [selectedExperience, setSelectedExperience] = useState<(typeof vrExperiences)[0] | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title={t("vr.title")} description={t("vr.subtitle")} />
      <AppHeader variant="light" />

      <main id="main-content" className="pt-20">
        {/* Hero section */}
        <div className="bg-gradient-to-r from-accent to-accent/80 py-12 mb-8">
          <div className="container mx-auto px-4 max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-white"
            >
              <div className="flex items-center justify-center gap-3 mb-4">
                <Glasses className="w-10 h-10" aria-hidden="true" />
                <h1 className="text-4xl md:text-5xl font-bold">{t("vr.title")}</h1>
              </div>
              <p className="text-lg text-white/90 max-w-2xl mx-auto">{t("vr.subtitle")}</p>
            </motion.div>
          </div>
        </div>

        <div className="container mx-auto px-4 max-w-6xl">
          {/* Experiences grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {vrExperiences.map((exp, index) => (
              <motion.article
                key={exp.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="group cursor-pointer bg-card rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-border hover:border-accent"
                onClick={() => setSelectedExperience(exp)}
                tabIndex={0}
                role="button"
                aria-label={`${t("common.viewDetails")}: ${exp.title[lang]}`}
                onKeyDown={(e) => e.key === "Enter" && setSelectedExperience(exp)}
              >
                {/* Cover image */}
                <div className="relative aspect-video">
                  <img
                    src={exp.coverImage}
                    alt={exp.title[lang]}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  {/* VR badge */}
                  <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-accent-foreground text-sm font-bold">
                    <Glasses className="w-4 h-4" aria-hidden="true" />
                    VR
                  </span>

                  {/* Play button overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-16 h-16 rounded-full bg-accent/90 flex items-center justify-center">
                      <Play className="w-8 h-8 text-white ml-1" aria-hidden="true" />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h2 className="text-xl font-bold text-foreground mb-2 group-hover:text-accent transition-colors">
                    {exp.title[lang]}
                  </h2>

                  <p className="text-muted-foreground mb-4 line-clamp-2">{exp.description[lang]}</p>

                  <div className="flex flex-wrap items-center gap-3">
                    {/* Duration */}
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" aria-hidden="true" />
                      {exp.duration}
                    </span>

                    {/* Difficulty */}
                    <span
                      className={`px-2 py-1 rounded-md text-xs font-bold ${difficultyColors[exp.difficulty as keyof typeof difficultyColors]}`}
                    >
                      {t(`difficulty.${exp.difficulty}`)}
                    </span>

                    {/* Compatible devices */}
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Glasses className="w-3 h-3" aria-hidden="true" />
                      {exp.compatible.slice(0, 2).join(", ")}
                    </span>

                    <ChevronRight
                      className="w-5 h-5 text-muted-foreground ml-auto group-hover:text-accent transition-colors"
                      aria-hidden="true"
                    />
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>

        <Footer />
      </main>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedExperience && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedExperience(null)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="vr-detail-title"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-background rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header image */}
              <div className="relative aspect-video">
                <img
                  src={selectedExperience.coverImage}
                  alt={selectedExperience.title[lang]}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setSelectedExperience(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                  aria-label={t("common.close")}
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background to-transparent p-6">
                  <h2 id="vr-detail-title" className="text-2xl font-bold text-foreground">
                    {selectedExperience.title[lang]}
                  </h2>
                </div>
              </div>

              <ScrollArea className="max-h-[50vh]">
                <div className="p-6 space-y-6">
                  {/* Metadata */}
                  <div className="flex flex-wrap gap-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted text-foreground text-sm font-medium">
                      <Clock className="w-4 h-4 text-primary" aria-hidden="true" />
                      {selectedExperience.duration}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ${difficultyColors[selectedExperience.difficulty as keyof typeof difficultyColors]}`}
                    >
                      <Star className="w-4 h-4" aria-hidden="true" />
                      {t(`difficulty.${selectedExperience.difficulty}`)}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-muted-foreground leading-relaxed">{selectedExperience.fullDescription[lang]}</p>

                  {/* Compatible devices */}
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                      <Glasses className="w-4 h-4 text-accent" aria-hidden="true" />
                      {t("vr.compatible")}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedExperience.compatible.map((device) => (
                        <span
                          key={device}
                          className="px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium border border-accent/30"
                        >
                          {device}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Screenshots */}
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-2">Screenshots</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {selectedExperience.screenshots.map((img, i) => (
                        <img
                          key={i}
                          src={img}
                          alt={`Screenshot ${i + 1}`}
                          className="rounded-lg aspect-video object-cover"
                          loading="lazy"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollArea>

              {/* CTA Footer */}
              <div className="p-4 border-t border-border">
                <Button
                  className="w-full h-12 text-base font-bold bg-accent hover:bg-accent/90"
                  onClick={() => window.open(selectedExperience.apkUrl, "_blank")}
                >
                  <Download className="w-5 h-5 mr-2" aria-hidden="true" />
                  {t("vr.downloadAPK")}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
