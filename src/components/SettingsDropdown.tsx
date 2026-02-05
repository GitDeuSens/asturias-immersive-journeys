import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Sun, Moon, Globe, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTheme, Theme } from "@/hooks/useTheme";

const languages = [
  { code: "es", label: "ES", fullLabel: "Español", flag: "🇪🇸" },
  { code: "en", label: "EN", fullLabel: "English", flag: "🇬🇧" },
  { code: "fr", label: "FR", fullLabel: "Français", flag: "🇫🇷" },
];

const themeOptions: { value: Theme; icon: typeof Sun; labelKey: string }[] = [
  { value: "light", icon: Sun, labelKey: "settings.lightTheme" },
  { value: "dark", icon: Moon, labelKey: "settings.darkTheme" },
];

interface SettingsDropdownProps {
  variant?: "light" | "dark" | "glass";
}

export function SettingsDropdown({ variant = "light" }: SettingsDropdownProps) {
  const { t, i18n } = useTranslation();
  const { theme, setTheme, isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLang = languages.find((l) => l.code === i18n.language) || languages[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem("asturias-inmersivo-lang", langCode);
  };

  const getButtonStyles = () => {
    switch (variant) {
      case "glass":
        return "bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20";
      case "dark":
        return "bg-muted/50 border border-border text-foreground hover:bg-muted";
      default:
        return "bg-muted border border-border text-foreground hover:bg-muted/80";
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${getButtonStyles()}`}
        aria-label={t("a11y.languageSelector")}
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <span className="text-xs font-bold">{currentLang.label}</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-56 rounded-xl bg-popover shadow-xl border border-border overflow-hidden z-50"
            role="menu"
          >
            {/* Language section */}
            <div className="p-2 border-b border-border">
              <p className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                <Globe className="w-3.5 h-3.5" aria-hidden="true" />
                {t("settings.language")}
              </p>
              <div className="space-y-0.5">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors duration-150 ${
                      i18n.language === lang.code ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"
                    }`}
                    role="menuitem"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-xs font-bold w-6">{lang.label}</span>
                      <span className="font-medium text-sm">{lang.fullLabel}</span>
                    </span>
                    {i18n.language === lang.code && <Check className="w-4 h-4 text-primary" aria-hidden="true" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Theme section */}
            <div className="p-2">
              <p className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                {isDark ? (
                  <Moon className="w-3.5 h-3.5" aria-hidden="true" />
                ) : (
                  <Sun className="w-3.5 h-3.5" aria-hidden="true" />
                )}
                {t("settings.theme")}
              </p>
              <div className="space-y-0.5">
                {themeOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      onClick={() => setTheme(option.value)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors duration-150 ${
                        theme === option.value ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"
                      }`}
                      role="menuitem"
                    >
                      <span className="flex items-center gap-2">
                        <Icon className="w-4 h-4" aria-hidden="true" />
                        <span className="font-medium text-sm">{t(option.labelKey)}</span>
                      </span>
                      {theme === option.value && <Check className="w-4 h-4 text-primary" aria-hidden="true" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
