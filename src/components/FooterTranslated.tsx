import { Link } from "react-router-dom";
import { Brain, Heart, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/contexts/LanguageContext";

export function FooterTranslated() {
  const { t } = useLanguage();

  const footerLinks = {
    platform: [
      { name: t('footer.link.about'), href: "/about" },
      { name: t('footer.link.resources'), href: "/resources" },
      { name: t('footer.link.community'), href: "/community" },
      { name: t('footer.link.ai'), href: "/ai-chat" },
    ],
    support: [
      { name: t('footer.link.crisis'), href: "tel:1800-599-0019" },
      { name: t('footer.link.booking'), href: "/booking" },
      { name: t('footer.link.local'), href: "/local-support" },
      { name: t('footer.link.emergency'), href: "/resources#emergency" },
    ],
    legal: [
      { name: t('footer.link.privacy'), href: "/privacy" },
      { name: t('footer.link.terms'), href: "/terms" },
      { name: t('footer.link.cookies'), href: "/cookies" },
      { name: t('footer.link.accessibility'), href: "/accessibility" },
    ],
  };

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Youtube, href: "#", label: "YouTube" },
  ];

  return (
    <footer className="bg-card border-t border-border animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-4 space-y-4 animate-slide-up">
            <div className="flex items-center space-x-2 group">
              <Brain className="h-8 w-8 text-primary transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" />
              <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent transition-all duration-300 group-hover:scale-105">
                MAITRI
              </span>
            </div>
            <p className="text-muted-foreground max-w-sm leading-relaxed">
              {t('footer.brand.tagline')}
            </p>
            
            {/* Newsletter Signup */}
            <div className="space-y-2">
              <h4 className="font-medium text-foreground">{t('footer.newsletter.title')}</h4>
              <div className="flex space-x-2">
                <Input 
                  placeholder={t('common.email.placeholder')}
                  className="flex-1 transition-all duration-300 focus:scale-105"
                  type="email"
                />
                <Button size="sm" variant="default" className="transition-all duration-300 hover:scale-105 hover:shadow-glow">
                  {t('common.subscribe')}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {t('common.wellness.tips')}. {t('common.unsubscribe')}.
              </p>
            </div>
          </div>

          {/* Links Sections */}
          <div className="lg:col-span-2 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <h4 className="font-semibold text-foreground mb-4">{t('footer.platform')}</h4>
            <ul className="space-y-3">
              {footerLinks.platform.map((link, index) => (
                <li key={link.name} style={{ animationDelay: `${0.2 + index * 0.1}s` }}>
                  <Link 
                    to={link.href}
                    className="text-muted-foreground hover:text-primary transition-all duration-300 hover:translate-x-1 inline-block animate-fade-in"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <h4 className="font-semibold text-foreground mb-4">{t('footer.support')}</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link, index) => (
                <li key={link.name} style={{ animationDelay: `${0.3 + index * 0.1}s` }}>
                  <Link 
                    to={link.href}
                    className="text-muted-foreground hover:text-primary transition-all duration-300 hover:translate-x-1 inline-block animate-fade-in"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <h4 className="font-semibold text-foreground mb-4">{t('footer.legal')}</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link, index) => (
                <li key={link.name} style={{ animationDelay: `${0.4 + index * 0.1}s` }}>
                  <Link 
                    to={link.href}
                    className="text-muted-foreground hover:text-primary transition-all duration-300 hover:translate-x-1 inline-block animate-fade-in"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Emergency */}
          <div className="lg:col-span-2 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <h4 className="font-semibold text-foreground mb-4">{t('footer.contact')}</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-muted-foreground transition-all duration-300 hover:text-primary">
                <Mail className="h-4 w-4 transition-all duration-300 hover:scale-110" />
                <span className="text-sm">{t('contact.email')}</span>
              </div>
              <div className="flex items-center space-x-2 text-muted-foreground transition-all duration-300 hover:text-primary">
                <Phone className="h-4 w-4 transition-all duration-300 hover:scale-110" />
                <span className="text-sm">{t('contact.phone')}</span>
              </div>
              <div className="flex items-center space-x-2 text-muted-foreground transition-all duration-300 hover:text-primary">
                <MapPin className="h-4 w-4 transition-all duration-300 hover:scale-110" />
                <span className="text-sm">{t('contact.location')}</span>
              </div>
              
              {/* Emergency Notice */}
              <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg transition-all duration-300 hover:shadow-lg hover:scale-105">
                <div className="flex items-center space-x-2 text-destructive">
                  <Heart className="h-4 w-4 animate-pulse" />
                  <span className="text-sm font-medium">{t('footer.crisis.support')}</span>
                </div>
                <p className="text-xs text-destructive mt-1">
                  {t('footer.crisis.text')}
                </p>
              </div>
            </div>
          </div>
        </div>

        <Separator className="opacity-50" />

        {/* Bottom Section */}
        <div className="py-6 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 animate-fade-in">
          <div className="text-sm text-muted-foreground">
            {t('footer.copyright')}
          </div>
          
          {/* Social Links */}
          <div className="flex items-center space-x-4">
            {socialLinks.map((social, index) => (
              <Button
                key={social.label}
                variant="ghost"
                size="sm"
                asChild
                className="hover:bg-primary/10 transition-all duration-300 hover:scale-110"
                style={{ animationDelay: `${0.1 + index * 0.1}s` }}
              >
                <a 
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="animate-fade-in"
                >
                  <social.icon className="h-4 w-4 transition-all duration-300 hover:rotate-12" />
                </a>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default FooterTranslated;