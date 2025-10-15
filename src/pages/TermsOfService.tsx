import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { FileText } from "lucide-react";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageHeader
          icon={FileText}
          title="Terms of Service"
          description="Please read these terms carefully before using our mental health platform."
        />

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Acceptance of Terms</CardTitle>
              <CardDescription>By using MAITRI, you agree to these terms</CardDescription>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none">
              <p>
                Welcome to MAITRI. By accessing or using our mental health platform, 
                you agree to be bound by these Terms of Service and all applicable laws and regulations.
              </p>
              <p>
                If you do not agree with any of these terms, you are prohibited from using 
                or accessing this site.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Service Description</CardTitle>
              <CardDescription>What MAITRI provides</CardDescription>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none">
              <p>MAITRI provides:</p>
              <ul>
                <li>Mental health tracking and analytics tools</li>
                <li>AI-powered wellness support and recommendations</li>
                <li>Educational resources and content</li>
                <li>Community support features</li>
                <li>Professional counselor booking services</li>
              </ul>
              <p>
                <strong>Important:</strong> Our platform is designed to supplement, not replace, 
                professional mental health care. Always consult qualified healthcare providers 
                for serious mental health concerns.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>User Responsibilities</CardTitle>
              <CardDescription>Your obligations when using our platform</CardDescription>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none">
              <h3>You agree to:</h3>
              <ul>
                <li>Provide accurate and truthful information</li>
                <li>Keep your account credentials secure</li>
                <li>Use the platform responsibly and ethically</li>
                <li>Respect other users' privacy and experiences</li>
                <li>Report any inappropriate behavior or content</li>
              </ul>
              
              <h3>You agree NOT to:</h3>
              <ul>
                <li>Share harmful, abusive, or inappropriate content</li>
                <li>Impersonate others or create false accounts</li>
                <li>Attempt to hack or compromise platform security</li>
                <li>Use the platform for commercial or promotional purposes</li>
                <li>Share medical advice beyond personal experience sharing</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Privacy & Data Protection</CardTitle>
              <CardDescription>How we handle your information</CardDescription>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none">
              <p>
                Your privacy is paramount. We collect and use personal information only as 
                described in our Privacy Policy. Key points:
              </p>
              <ul>
                <li>We never sell personal data to third parties</li>
                <li>All data is encrypted and securely stored</li>
                <li>You can delete your account and data at any time</li>
                <li>We comply with applicable data protection regulations</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Medical Disclaimer</CardTitle>
              <CardDescription>Important health information</CardDescription>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none">
              <p className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <strong>Important:</strong> MAITRI is not a substitute for professional 
                medical advice, diagnosis, or treatment. Always seek the advice of qualified 
                health providers with questions regarding mental health conditions.
              </p>
              <p>
                In case of emergency or suicidal thoughts, contact emergency services 
                immediately or call the National Suicide Prevention Lifeline.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Platform Availability</CardTitle>
              <CardDescription>Service availability and modifications</CardDescription>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none">
              <ul>
                <li>We strive for 99.9% uptime but cannot guarantee uninterrupted service</li>
                <li>We may modify or discontinue features with appropriate notice</li>
                <li>Planned maintenance will be announced in advance when possible</li>
                <li>We are not liable for service interruptions beyond our control</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Limitation of Liability</CardTitle>
              <CardDescription>Legal limitations and protections</CardDescription>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none">
              <p>
                To the fullest extent permitted by law, MAITRI shall not be liable for:
              </p>
              <ul>
                <li>Indirect, incidental, or consequential damages</li>
                <li>Loss of data, profits, or business interruption</li>
                <li>Actions taken based on platform content or recommendations</li>
                <li>Third-party content or user-generated content</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Changes to Terms</CardTitle>
              <CardDescription>How we update these terms</CardDescription>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none">
              <p>
                We may revise these terms from time to time. Significant changes will be 
                communicated via email or platform notification. Continued use of the 
                platform constitutes acceptance of updated terms.
              </p>
              <p>
                For questions about these terms, contact us at legal@maitri.com
              </p>
              <p className="text-sm text-muted-foreground">
                Last updated: December 2024
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}