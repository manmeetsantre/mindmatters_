import { Link } from "react-router-dom";
import { Brain, Heart, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/contexts/LanguageContext";

export function Footer() {
  const { t } = useLanguage();
  
  const footerLinks = {
    platform: [
      { name: t('footer.links.aboutUs'), href: "/about" },
      { name: t('footer.links.resources'), href: "/resources" },
      { name: t('footer.links.community'), href: "/community" },
      { name: t('footer.links.aiSupport'), href: "/ai-chat" },
    ],
    support: [
      { name: t('footer.links.crisisHelpline'), href: "tel:1800-599-0019" },
      { name: t('footer.links.bookSession'), href: "/booking" },
      { name: t('footer.links.localSupport'), href: "/local-support" },
      { name: t('footer.links.emergencyResources'), href: "/resources#emergency" },
    ],
    legal: [
      { name: t('footer.links.privacyPolicy'), href: "/privacy" },
      { name: t('footer.links.termsOfService'), href: "/terms" },
      { name: t('footer.links.cookiePolicy'), href: "/cookies" },
      { name: t('footer.links.accessibility'), href: "/accessibility" },
    ],
  };

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Youtube, href: "#", label: "YouTube" },
  ];

  return (
    <footer className="bg-card/95 backdrop-blur-md border-t border-border relative z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                {t('footer.brand')}
              </span>
            </div>
            <p className="text-muted-foreground max-w-sm">
              {t('footer.tagline')}
            </p>
            
            {/* Newsletter Signup */}
            <div className="space-y-2">
              <h4 className="font-medium text-foreground">{t('footer.stayUpdated')}</h4>
              <div className="flex space-x-2">
                <Input 
                  placeholder={t('footer.emailPlaceholder')} 
                  className="flex-1"
                  type="email"
                />
                <Button size="sm" variant="default">
                  {t('footer.subscribe')}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {t('footer.subscribeNote')}
              </p>
            </div>
          </div>

          {/* Links Sections */}
          <div className="lg:col-span-2">
            <h4 className="font-semibold text-foreground mb-4">{t('footer.platform')}</h4>
            <ul className="space-y-3">
              {footerLinks.platform.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="font-semibold text-foreground mb-4">{t('footer.support')}</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="font-semibold text-foreground mb-4">{t('footer.legal')}</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Emergency */}
          <div className="lg:col-span-2">
            <h4 className="font-semibold text-foreground mb-4">{t('footer.contact')}</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span className="text-sm">hello@mindmatters.com</span>
              </div>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span className="text-sm">1800-599-0019</span>
              </div>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">Pune, India</span>
              </div>
              
              {/* Emergency Notice */}
              <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <div className="flex items-center space-x-2 text-destructive">
                  <Heart className="h-4 w-4" />
                  <span className="text-sm font-medium">{t('footer.crisisSupport')}</span>
                </div>
                <p className="text-xs text-destructive mt-1">
                  {t('footer.crisisMessage')}
                </p>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Bottom Section */}
        <div className="py-6 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-sm text-muted-foreground">
            {t('footer.copyright')}
          </div>
          
          {/* Social Links */}
          <div className="flex items-center space-x-4">
            {socialLinks.map((social) => (
              <Button
                key={social.label}
                variant="ghost"
                size="sm"
                asChild
                className="hover:bg-primary/10"
              >
                <a 
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                >
                  <social.icon className="h-4 w-4" />
                </a>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;