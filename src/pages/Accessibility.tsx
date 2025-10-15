import { Link } from "react-router-dom";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Accessibility, Eye, Keyboard, Volume2, Users, Heart } from "lucide-react";

const AccessibilityStatement = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <PageHeader
        title="Accessibility Statement"
        description="Our commitment to making mental health support accessible to everyone"
        icon={Accessibility}
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
              <Heart className="h-5 w-5 text-primary" />
              <span>Our Commitment</span>
            </CardTitle>
            <CardDescription>
              Last updated: {new Date().toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground leading-relaxed">
              MAITRI is committed to ensuring digital accessibility for people with disabilities. 
              We believe that mental health support should be available to everyone, regardless of their abilities or disabilities.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              We are continuously working to improve the accessibility of our website and services to ensure 
              we provide equal access to information and functionality for all our users.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-primary" />
              <span>Accessibility Standards</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              Our website strives to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 
              at the AA level. These guidelines help make web content more accessible to people with disabilities.
            </p>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-foreground mb-2">WCAG 2.1 Principles</h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• <strong>Perceivable:</strong> Information must be presentable in ways users can perceive</li>
                  <li>• <strong>Operable:</strong> Interface components must be operable by all users</li>
                  <li>• <strong>Understandable:</strong> Information and UI operation must be understandable</li>
                  <li>• <strong>Robust:</strong> Content must be robust enough for various assistive technologies</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Eye className="h-5 w-5 text-primary" />
              <span>Accessibility Features</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Keyboard className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Keyboard Navigation</h4>
                    <p className="text-muted-foreground">
                      Full keyboard navigation support for all interactive elements and features.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Eye className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Screen Reader Support</h4>
                    <p className="text-muted-foreground">
                      Semantic HTML and ARIA labels for screen reader compatibility.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Volume2 className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Alternative Text</h4>
                    <p className="text-muted-foreground">
                      Descriptive alt text for images and meaningful content descriptions.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Accessibility className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Color Contrast</h4>
                    <p className="text-muted-foreground">
                      High contrast ratios and color combinations that meet WCAG standards.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Assistive Technologies Supported</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              Our website is designed to work with the following assistive technologies:
            </p>
            
            <div className="grid md:grid-cols-2 gap-4">
              <ul className="space-y-2 text-muted-foreground">
                <li>• JAWS (Windows)</li>
                <li>• NVDA (Windows)</li>
                <li>• VoiceOver (macOS/iOS)</li>
                <li>• TalkBack (Android)</li>
              </ul>
              
              <ul className="space-y-2 text-muted-foreground">
                <li>• Dragon NaturallySpeaking</li>
                <li>• Switch navigation devices</li>
                <li>• Keyboard-only navigation</li>
                <li>• High contrast displays</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Known Limitations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              We are continuously working to improve accessibility. Currently known limitations include:
            </p>
            
            <ul className="space-y-2 text-muted-foreground">
              <li>• Some third-party embedded content may not be fully accessible</li>
              <li>• Complex interactive elements are being enhanced for better screen reader support</li>
              <li>• We are working on improving mobile accessibility for certain features</li>
            </ul>
            
            <p className="text-muted-foreground leading-relaxed mt-4">
              We are committed to addressing these limitations in future updates.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Feedback and Support</h4>
              <p className="text-muted-foreground leading-relaxed">
                If you encounter any accessibility barriers while using our website or need assistance 
                with any content, please don't hesitate to contact us. Your feedback helps us improve 
                our accessibility and ensure that our mental health resources are available to everyone.
              </p>
              
              <div className="space-y-2">
                <p className="text-muted-foreground">
                  <strong>Contact us:</strong>
                </p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Email: accessibility@mindmatters.com</li>
                  <li>• Phone: 1800-599-0019</li>
                  <li>• <Link to="/about" className="text-primary hover:underline">Contact form</Link></li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center pt-8">
          <p className="text-muted-foreground">
            We welcome your feedback and are committed to making continuous improvements to ensure 
            our mental health support is accessible to all.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccessibilityStatement;