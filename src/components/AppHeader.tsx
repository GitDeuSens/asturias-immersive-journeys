import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { RotateCcw, Mountain, Facebook, Twitter } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SettingsDropdown } from "@/components/SettingsDropdown";
import { useTheme } from "@/hooks/useTheme";

interface AppHeaderProps {
  showRestart?: boolean;
  variant?: "light" | "dark";
}

export function AppHeader({ showRestart = true, variant = "light" }: AppHeaderProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const handleRestart = () => {
    localStorage.removeItem("asturias-mode");
    navigate("/");
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed -top-3 left-0 right-0 z-50"
    >
      {/* Green accent bar */}
      <div className="h-2 bg-primary" />

      {/* Social bar */}
      <div className="bg-muted border-b border-border">
        <div className="container mx-auto px-4 py-1.5 flex justify-end gap-2">
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 rounded-full bg-muted-foreground/60 hover:bg-primary flex items-center justify-center transition-colors"
            aria-label="Facebook"
          >
            <Facebook className="w-4 h-4 text-white" />
          </a>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 rounded-full bg-muted-foreground/60 hover:bg-primary flex items-center justify-center transition-colors"
            aria-label="X (Twitter)"
          >
            <Twitter className="w-4 h-4 text-white" />
          </a>
        </div>
      </div>

      {/* Main header */}
      <div className="bg-background border-b-4 border-primary">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo section */}
          <Link to="/experience" className="flex items-center gap-4 group" aria-label="Asturias Inmersivo - Inicio">
            {/* Coat of arms style icon */}
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform shadow-md">
              <Mountain className="w-7 h-7 text-primary-foreground" aria-hidden="true" />
            </div>

            {/* Separator */}
            <div className="hidden sm:block h-10 w-px bg-border" />

            {/* Brand text */}
            <div className="hidden sm:flex items-center gap-3">
              <div>
                <span className="font-bold text-xl text-foreground block leading-tight">Asturias</span>
                <span className="text-primary font-semibold text-xs uppercase tracking-widest">Inmersivo</span>
              </div>
              <div className="h-8 w-px bg-border" />
              <span className="text-muted-foreground text-sm max-w-[180px] leading-tight">
                {t("common.tagline", "Experiencias turísticas inmersivas")}
              </span>
            </div>
          </Link>

          {/* Right side controls */}
          <div className="flex items-center gap-3">
            {/* Settings dropdown (language + theme) */}
            <SettingsDropdown variant="light" />

            {/* Restart button - styled as primary button */}
            {showRestart && (
              <button
                onClick={handleRestart}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg transition-all duration-200 text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg"
                aria-label={t("common.restart")}
              >
                <RotateCcw className="w-4 h-4" aria-hidden="true" />
                <span className="hidden sm:inline">{t("common.restart")}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
}
