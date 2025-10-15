import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  TrendingUp, 
  AlertTriangle,
  Phone,
  Calendar,
  BarChart3,
  Shield
} from "lucide-react";
import { 
  mockStudentProfiles, 
  getStudentsByRiskLevel, 
  getAverageScores,
  getEngagementStats,
  getDemographicBreakdown 
} from "@/data/studentProfiles";
import { 
  counselingStaff, 
  getAvailableCounselors,
  getSupportMetrics,
  crisisContacts
} from "@/data/institutionalSupport";

export default function ParticipantDashboard() {
  const riskLevels = getStudentsByRiskLevel();
  const avgScores = getAverageScores();
  const engagement = getEngagementStats();
  const demographics = getDemographicBreakdown();
  const supportMetrics = getSupportMetrics();
  const availableCounselors = getAvailableCounselors();

  return (
    <div className="min-h-screen bg-background pt-20 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Participant Dashboard</h1>
          <p className="text-muted-foreground">Mental health support system overview</p>
        </div>

        {/* Risk Level Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-red-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-700">High Risk</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{riskLevels.high}</div>
              <p className="text-xs text-muted-foreground">Require immediate support</p>
            </CardContent>
          </Card>
          
          <Card className="border-orange-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-orange-700">Medium Risk</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{riskLevels.medium}</div>
              <p className="text-xs text-muted-foreground">Monitoring recommended</p>
            </CardContent>
          </Card>
          
          <Card className="border-green-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-700">Low Risk</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{riskLevels.low}</div>
              <p className="text-xs text-muted-foreground">Stable condition</p>
            </CardContent>
          </Card>
        </div>

        {/* Support Availability */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Counseling Availability
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Available Counselors</span>
                  <Badge variant="outline">{availableCounselors.length}/{counselingStaff.length}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Crisis Support</span>
                  <Badge className="bg-green-100 text-green-800">24/7 Available</Badge>
                </div>
                <Button size="sm" className="w-full">
                  <Phone className="h-4 w-4 mr-2" />
                  Contact Crisis Line
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Assessment Scores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Avg PHQ-9:</span>
                  <span className="font-medium">{avgScores.avgPHQ9}/27</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Avg GAD-7:</span>
                  <span className="font-medium">{avgScores.avgGAD7}/21</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Avg GHQ-12:</span>
                  <span className="font-medium">{avgScores.avgGHQ12}/12</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Participants */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Participant Profiles</CardTitle>
            <CardDescription>Anonymized student data for monitoring</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockStudentProfiles.slice(0, 3).map((student) => {
                const latestAssessment = student.mentalHealth.previousAssessments[0];
                return (
                  <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">{student.anonymizedId}</div>
                      <div className="text-sm text-muted-foreground">
                        {student.demographics.year} • {student.demographics.major}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={
                        latestAssessment?.riskLevel === 'high' ? 'bg-red-100 text-red-800' :
                        latestAssessment?.riskLevel === 'medium' ? 'bg-orange-100 text-orange-800' :
                        'bg-green-100 text-green-800'
                      }>
                        {latestAssessment?.riskLevel || 'unknown'} risk
                      </Badge>
                      <div className="text-xs text-muted-foreground mt-1">
                        Last assessment: {latestAssessment?.date}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}