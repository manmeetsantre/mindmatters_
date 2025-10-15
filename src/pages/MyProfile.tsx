import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Mail, Calendar, Target, Heart } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { API_URL } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const MyProfile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    age: "",
    locality: "",
    personalNotes: "",
    goals: "",
    bp: "",
    heartRate: "",
    o2Level: "",
    stressLevel: ""
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/signin");
      return;
    }
    (async () => {
      const res = await fetch(`${API_URL}/profile/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) return navigate("/signin");
      const json = await res.json();
      setProfile({
        name: json.user?.name || "",
        email: json.user?.email || "",
        age: json.profile?.age?.toString?.() || "",
        locality: json.profile?.locality || "",
        personalNotes: json.profile?.personalNotes || "",
        goals: json.profile?.goals || "",
        bp: json.profile?.bp || "",
        heartRate: json.profile?.heartRate || "",
        o2Level: json.profile?.o2Level || "",
        stressLevel: json.profile?.stressLevel || "",
      });
    })();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background dark:bg-gradient-to-b dark:from-blue-900 dark:via-blue-800 dark:to-blue-950 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <PageHeader
          icon={User}
          title="My Profile"
          description="Manage your personal information and track your mental wellness journey"
        />

        <div className="grid gap-6">
          {/* Personal Information Card */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Personal Information
              </CardTitle>
              <CardDescription>
                Update your basic profile information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Picture Section */}
              <div className="flex items-center gap-4">
                <Avatar className="w-20 h-20">
                  <AvatarFallback className="bg-gradient-primary text-primary-foreground text-lg">
                    {profile.name ? profile.name.charAt(0).toUpperCase() : "U"}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Personal Details */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    placeholder="Enter your full name"
                    value={profile.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={profile.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age" className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Age
                  </Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="Enter your age"
                    value={profile.age}
                    onChange={(e) => handleInputChange("age", e.target.value)}
                  />
                </div>
              </div>

              {/* Second row for locality */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="locality" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Locality
                  </Label>
                  <Select value={profile.locality} onValueChange={(value) => handleInputChange("locality", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your locality type" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border border-border z-50">
                      <SelectItem value="rural">Rural</SelectItem>
                      <SelectItem value="semi-urban">Semi-Urban</SelectItem>
                      <SelectItem value="urban">Urban</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Health Metrics Card */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500" />
                Health Metrics
              </CardTitle>
              <CardDescription>
                Track your vital health indicators
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bp" className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                    Blood Pressure (BP)
                  </Label>
                  <Input
                    id="bp"
                    placeholder="e.g., 120/80 mmHg"
                    value={profile.bp}
                    onChange={(e) => handleInputChange("bp", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="heartRate" className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                    Heart Rate (BPM)
                  </Label>
                  <Input
                    id="heartRate"
                    type="number"
                    placeholder="e.g., 72"
                    value={profile.heartRate}
                    onChange={(e) => handleInputChange("heartRate", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="o2Level" className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                    Oxygen Level (SpO2)
                  </Label>
                  <Input
                    id="o2Level"
                    type="number"
                    placeholder="e.g., 98"
                    value={profile.o2Level}
                    onChange={(e) => handleInputChange("o2Level", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stressLevel" className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                    Stress Level (1-10)
                  </Label>
                  <Input
                    id="stressLevel"
                    type="number"
                    min="1"
                    max="10"
                    placeholder="e.g., 5"
                    value={profile.stressLevel}
                    onChange={(e) => handleInputChange("stressLevel", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Wellness Journey Card */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                My Wellness Journey
              </CardTitle>
              <CardDescription>
                Track your personal mental health goals and reflections
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="goals" className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Personal Goals
                </Label>
                <Textarea
                  id="goals"
                  placeholder="What are your mental wellness goals? (e.g., practice mindfulness daily, improve sleep quality, manage stress better...)"
                  value={profile.goals}
                  onChange={(e) => handleInputChange("goals", e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="personalNotes">Personal Notes & Reflections</Label>
                <Textarea
                  id="personalNotes"
                  placeholder="Share your thoughts, experiences, or anything you'd like to remember about your mental health journey..."
                  value={profile.personalNotes}
                  onChange={(e) => handleInputChange("personalNotes", e.target.value)}
                  className="min-h-[120px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button 
              className="bg-gradient-primary hover:shadow-glow transition-all"
              disabled={isSaving}
              onClick={async () => {
                const token = localStorage.getItem("token");
                if (!token) return navigate("/signin");
                try {
                  setIsSaving(true);
                  const res = await fetch(`${API_URL}/profile/me`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                    body: JSON.stringify({
                      name: profile.name,
                      age: profile.age ? Number(profile.age) : undefined,
                      locality: profile.locality || undefined,
                      personalNotes: profile.personalNotes || undefined,
                      goals: profile.goals || undefined,
                      bp: profile.bp || undefined,
                      heartRate: profile.heartRate || undefined,
                      o2Level: profile.o2Level || undefined,
                      stressLevel: profile.stressLevel || undefined,
                    })
                  });
                  const json = await res.json().catch(() => ({}));
                  if (!res.ok) throw new Error((json as any)?.error || "Save failed");
                  toast({ title: "Profile saved", className: "bg-success text-success-foreground" });
                } catch (e: any) {
                  toast({ title: "Could not save profile", description: e?.message || "Try again", variant: "destructive" });
                } finally {
                  setIsSaving(false);
                }
              }}
            >
              {isSaving ? "Saving..." : "Save Profile"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;