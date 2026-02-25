import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Facebook, Twitter } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SettingsDropdown } from "@/components/SettingsDropdown";
interface AppHeaderProps {
  showRestart?: boolean;
  variant?: "light" | "dark";
  routes?: any
  markerRoute?: any
  mapReference?: any
}

export function AppHeader({ showRestart = true, variant = "light", routes = {}, markerRoute, mapReference }: AppHeaderProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as 'es' | 'en' | 'fr';
  const navigate = useNavigate();
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
      <div style={{backgroundColor: '#0a4b77', borderTop: '8px solid hsl(var(--primary))'}}>
        <div className="container flex mx-auto pl-4 px-2 justify-between">
          <div style={{ width: '33px', height: '48px', backgroundColor: 'hsl(var(--primary))', position: 'absolute', top: '16px' }}>
          </div>
          <div className="container mx-auto pl-4 px-2 py-1.5 flex justify-end gap-2">
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
      </div>

      {/* Main header */}
      <div style={{backgroundColor: '#006db0', color: 'white'}} >
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo section */}
          <Link to="/experience" className="flex items-center gap-4 group" aria-label="Asturias Inmersivo - Inicio">
            {/* Coat of arms style icon */}

            {/* Brand text */}
                <div style={{ display: 'flex', flexDirection: 'row', height: '58px' }}>
                  <svg fill="white" width={50}>
                    <path d="M16.483 60a9.972 9.972 0 0 0-7.865-3.78 8.585 8.585 0 0 1-6.1-2.541A8.658 8.658 0 0 1 0 47.546v-27.4h32.976v27.402a8.684 8.684 0 0 1-2.527 6.117 8.609 8.609 0 0 1-6.091 2.538 9.972 9.972 0 0 0-5.89 1.89A10.186 10.186 0 0 0 16.483 60ZM2.474 47.547a6.184 6.184 0 0 0 1.803 4.356 6.13 6.13 0 0 0 4.341 1.804c1.806-.004 3.592.39 5.23 1.153.888.408 1.725.918 2.494 1.521l.141.114.15-.114a12.573 12.573 0 0 1 7.725-2.674 6.13 6.13 0 0 0 4.335-1.807 6.183 6.183 0 0 0 1.8-4.353V22.61H2.473v24.936Zm4.46-29.944v-2.485h19.202v2.485H6.934Zm20.632-4.941v-2.74a2.758 2.758 0 0 1 .457-1.53 2.727 2.727 0 0 1 4.213-.427 2.753 2.753 0 0 1 .598 2.997 2.746 2.746 0 0 1-1.008 1.236 2.73 2.73 0 0 1-1.522.464h-2.738Zm-9.756 0V8.967c.002-.976.39-1.91 1.078-2.6a3.661 3.661 0 0 1 2.591-1.075h3.679v3.694c0 .975-.386 1.91-1.072 2.599a3.652 3.652 0 0 1-2.588 1.077H17.81Zm-6.2 0a3.67 3.67 0 0 1-2.598-1.08 3.702 3.702 0 0 1-1.08-2.605V5.32h3.64a3.67 3.67 0 0 1 2.598 1.079 3.703 3.703 0 0 1 1.08 2.606v3.657h-3.64Zm-8.872 0a2.712 2.712 0 0 1-1.514-.457A2.741 2.741 0 0 1 .806 8a2.715 2.715 0 0 1 2.967-.59 2.728 2.728 0 0 1 1.674 2.53v2.722h-2.71Zm13.792-8.4a.31.31 0 0 1-.216-.095l-1.816-1.814a.312.312 0 0 1 0-.444L16.314.095A.273.273 0 0 1 16.53 0a.31.31 0 0 1 .226.095l1.806 1.795a.313.313 0 0 1 .095.217.331.331 0 0 1-.095.227l-1.806 1.833a.347.347 0 0 1-.226.095Zm-3.584 38.532-.715-1.22-.81-1.407a.387.387 0 0 0-.535-.148.387.387 0 0 0-.142.148l-.818 1.408-.753 1.294c-.056.104-.103.331 0 .407a.293.293 0 0 0 .188.18c0 .094.442.056.508 0l.395-.143.18-.056a2.624 2.624 0 0 1 1.27 0l.263.085.3.104c.085.075.603.085.575 0a.197.197 0 0 0 .094-.057c.094-.142.075-.454 0-.595Zm10.735-1.04a2.16 2.16 0 0 0-.113-.708 2.576 2.576 0 0 0-.254-.51.452.452 0 0 0-.395-.218h-2.324a.469.469 0 0 0-.395.208 2.15 2.15 0 0 0-.367 1.228 2.3 2.3 0 0 0 .094.69c.07.251.218.473.423.633.228.17.507.256.79.246h1.223a1.19 1.19 0 0 0 1.214-.87c.073-.225.108-.461.104-.699Zm3.292-5.225-1.335-1.795a.859.859 0 0 0-.918-.325.852.852 0 0 0-.306.155l-1.25 1.001H17.97v-6.84l1.016-1.323a.872.872 0 0 0-.17-1.2l-1.787-1.333a.872.872 0 0 0-1.035 0l-1.787 1.333a.86.86 0 0 0-.151 1.2l.997 1.322v6.841H9.88l-1.252-1.001a.853.853 0 0 0-1.223.17l-1.336 1.795a.872.872 0 0 0 0 1.03l1.336 1.805a.866.866 0 0 0 1.223.16l1.252-1.001h5.174v10.394l-1.072 1.341a.625.625 0 0 0 .423 1.002c1.396.132 2.8.132 4.196 0a.62.62 0 0 0 .504-.376.626.626 0 0 0-.08-.626l-1.054-1.323V38.542h5.193l1.298.983a.866.866 0 0 0 1.224-.161l1.335-1.805a.872.872 0 0 0-.047-1.03Z"></path>
                  </svg>
                  <span style={{paddingTop: '20px'}} className="hidden sm:block text-sm max-w-[180px] leading-tight">
                    {t("common.title")}
                  </span>
                </div>
          </Link>

          {/* Right side controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                // filterMap();
              }}
              style={{ fontSize: '16px', height: '50px' }}
              className="hidden items-center gap-2 px-5 py-2.5 rounded-lg transition-all duration-200 text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg"
              aria-label={t("common.home")}
            >
              <span className="hidden sm:inline">Ver puntos de interés</span>
            </button>

            {/* Restart button - styled as primary button */}
            {/* Settings dropdown (language + theme) */}
            <SettingsDropdown variant="light" />
          </div>
        </div>
      </div>
    </motion.header>
  );
}
