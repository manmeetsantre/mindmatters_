import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Shield } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageHeader
          icon={Shield}
          title="Privacy Policy"
          description="Your privacy and data security are our top priorities. Learn how we protect and handle your information."
        />

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Data Collection & Usage</CardTitle>
              <CardDescription>What information we collect and how we use it</CardDescription>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none">
              <h3>Information We Collect</h3>
              <ul>
                <li><strong>Account Information:</strong> Name, email address, and profile details</li>
                <li><strong>Wellness Data:</strong> Mood tracking, journal entries, and activity logs</li>
                <li><strong>Usage Data:</strong> How you interact with our platform (anonymized)</li>
                <li><strong>Device Information:</strong> Browser type, device type, and IP address</li>
              </ul>
              
              <h3>How We Use Your Information</h3>
              <ul>
                <li>Provide personalized mental health support and recommendations</li>
                <li>Improve our services and develop new features</li>
                <li>Send important updates about your account or our services</li>
                <li>Generate anonymized insights for research and platform improvement</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Protection & Security</CardTitle>
              <CardDescription>How we keep your information safe</CardDescription>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none">
              <ul>
                <li><strong>Encryption:</strong> All data is encrypted in transit and at rest</li>
                <li><strong>Access Controls:</strong> Strict access controls limit who can view your data</li>
                <li><strong>Anonymization:</strong> Personal identifiers are removed from research data</li>
                <li><strong>Regular Audits:</strong> We conduct regular security audits and assessments</li>
                <li><strong>HIPAA Compliance:</strong> We follow healthcare data protection standards</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Rights & Controls</CardTitle>
              <CardDescription>What you can do with your data</CardDescription>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none">
              <ul>
                <li><strong>Access:</strong> View all data we have about you</li>
                <li><strong>Correction:</strong> Update or correct your personal information</li>
                <li><strong>Deletion:</strong> Request deletion of your account and data</li>
                <li><strong>Export:</strong> Download a copy of your data</li>
                <li><strong>Opt-out:</strong> Withdraw consent for data processing</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Third-Party Services</CardTitle>
              <CardDescription>External services we work with</CardDescription>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none">
              <p>We may share anonymized, aggregated data with:</p>
              <ul>
                <li><strong>Research Partners:</strong> Academic institutions studying mental health</li>
                <li><strong>Service Providers:</strong> Cloud hosting and analytics services</li>
                <li><strong>Healthcare Providers:</strong> With your explicit consent only</li>
              </ul>
              <p>We never sell personal data to third parties or use it for advertising.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact & Updates</CardTitle>
              <CardDescription>How to reach us and stay informed</CardDescription>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none">
              <p>
                For questions about this privacy policy or your data, contact us at:
                <br />
                <strong>Email:</strong> privacy@mindmatters.com
                <br />
                <strong>Phone:</strong> 1-800-MINDFUL
              </p>
              <p>
                We may update this policy from time to time. We'll notify you of significant 
                changes via email or platform notification.
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