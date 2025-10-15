import { Link } from "react-router-dom";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Cookie, Shield, Settings } from "lucide-react";

const CookiePolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <PageHeader
        title="Cookie Policy"
        description="Learn how we use cookies to improve your experience"
        icon={Cookie}
      />

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center space-x-4 mb-6">
          <Button asChild variant="outline" size="sm">
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Cookie className="h-5 w-5 text-primary" />
              <span>What Are Cookies?</span>
            </CardTitle>
            <CardDescription>
              Last updated: {new Date().toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground leading-relaxed">
              Cookies are small text files that are stored on your computer or mobile device when you visit our website. 
              They help us provide you with a better experience by remembering your preferences and improving our services.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5 text-primary" />
              <span>Types of Cookies We Use</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-foreground mb-2">Essential Cookies</h4>
                <p className="text-muted-foreground">
                  These cookies are necessary for the website to function properly. They enable basic features 
                  like page navigation and access to secure areas of the website.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-foreground mb-2">Functional Cookies</h4>
                <p className="text-muted-foreground">
                  These cookies enable enhanced functionality and personalization, such as remembering your 
                  language preferences and theme settings.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-foreground mb-2">Analytics Cookies</h4>
                <p className="text-muted-foreground">
                  We use these cookies to understand how visitors interact with our website, helping us 
                  improve the user experience and our mental health services.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-foreground mb-2">Performance Cookies</h4>
                <p className="text-muted-foreground">
                  These cookies collect information about how you use our website to help us improve 
                  performance and ensure our mental health resources load quickly.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-primary" />
              <span>Your Choices</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-foreground mb-2">Managing Cookies</h4>
                <p className="text-muted-foreground">
                  You can control and/or delete cookies as you wish. You can delete all cookies that are 
                  already on your computer and you can set most browsers to prevent them from being placed.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-foreground mb-2">Browser Settings</h4>
                <p className="text-muted-foreground">
                  Most web browsers allow you to control cookies through their settings preferences. 
                  However, if you limit the ability of websites to set cookies, you may impact your 
                  overall user experience.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-foreground mb-2">Third-Party Cookies</h4>
                <p className="text-muted-foreground">
                  We may use third-party services for analytics and functionality. These services may 
                  set their own cookies. We recommend reviewing their privacy policies for more information.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-primary mt-1" />
              <div>
                <h4 className="font-semibold text-foreground mb-2">Privacy Protection</h4>
                <p className="text-muted-foreground">
                  We are committed to protecting your privacy and mental health information. 
                  For more details about how we handle your data, please review our{" "}
                  <Link to="/privacy" className="text-primary hover:underline">
                    Privacy Policy
                  </Link>.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center pt-8">
          <p className="text-muted-foreground">
            If you have questions about our Cookie Policy, please{" "}
            <Link to="/about" className="text-primary hover:underline">
              contact us
            </Link>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicy;