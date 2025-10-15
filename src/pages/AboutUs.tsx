import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useRef } from "react";
import { Heart, Users, Shield, Award } from "lucide-react";

const AboutUs = () => {
  const teamMembers = [
    {
      name: "Ayush Shevde",
      role: "Team Lead",
      description: "Project Architect & ML Engineer",
      imageUrl: "https://media.istockphoto.com/id/1332100919/vector/man-icon-black-icon-person-symbol.jpg?s=612x612&w=0&k=20&c=AVVJkvxQQCuBhawHrUhDRTCeNQ3Jgt0K1tXjJsFy1eg="
    },
    {
      name: "Manmeet Santre",
      role: "Co-Lead",
      description: "Full-Stack Engineer",
      imageUrl: "https://media.istockphoto.com/id/1332100919/vector/man-icon-black-icon-person-symbol.jpg?s=612x612&w=0&k=20&c=AVVJkvxQQCuBhawHrUhDRTCeNQ3Jgt0K1tXjJsFy1eg="
    },
    {
      name: "Nihar Bapat",
      description: "Front-End Engineer",
      imageUrl: "https://media.istockphoto.com/id/1332100919/vector/man-icon-black-icon-person-symbol.jpg?s=612x612&w=0&k=20&c=AVVJkvxQQCuBhawHrUhDRTCeNQ3Jgt0K1tXjJsFy1eg="
    },
    {
      name: "Anvit Panhalkar",
      description: "Back-End Engineer",
      imageUrl: "https://media.istockphoto.com/id/1332100919/vector/man-icon-black-icon-person-symbol.jpg?s=612x612&w=0&k=20&c=AVVJkvxQQCuBhawHrUhDRTCeNQ3Jgt0K1tXjJsFy1eg="
    },
    {
      name: "Shreesh Jugade",
      description: "ML Engineer",
      imageUrl: "https://media.istockphoto.com/id/1332100919/vector/man-icon-black-icon-person-symbol.jpg?s=612x612&w=0&k=20&c=AVVJkvxQQCuBhawHrUhDRTCeNQ3Jgt0K1tXjJsFy1eg="
    },
    {
      name: "Ananya Munshi",
      description: "Team Coordinator",
      imageUrl: "https://static.vecteezy.com/system/resources/previews/042/125/244/non_2x/people-person-contact-black-solid-flat-glyph-icon-single-icon-isolated-on-white-background-free-vector.jpg"
    }
  ];

  const values = [
    {
      title: "Mission Critical",
      description: "Crew mental health is essential for mission success. We provide 24/7 monitoring and support for optimal performance.",
      icon: Shield,
      color: "bg-gradient-primary"
    },
    {
      title: "Crew Support",
      description: "We foster a supportive environment for crew members, ensuring psychological well-being in the challenging space environment.",
      icon: Users,
      color: "bg-gradient-wellness"
    },
    {
      title: "Evidence-Based AI",
      description: "Our multimodal AI system is grounded in psychological research and proven therapeutic methods for space missions.",
      icon: Award,
      color: "bg-gradient-calm"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative text-primary-foreground py-20 min-h-[500px] flex items-center">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://img.freepik.com/premium-photo/friends-have-fun-sunset-funny-friends-group-people-nature_1036975-116957.jpg')`
          }}
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-6">
            <Heart className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white text-glow">
            About MAITRI Space Station System
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90 text-white text-glow">
            Advanced multimodal AI assistant for crew mental health monitoring and psychological support in space missions
          </p>
        </div>
      </section>

      {/* Our Mission Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-8">Our Mission</h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              At MAITRI, we believe that crew mental health is critical for mission success. 
              Our advanced AI system provides real-time emotional and physical well-being monitoring 
              for space station crew members. We combine cutting-edge multimodal AI technology 
              with psychological expertise to ensure crew members receive the support they need 
              in the challenging environment of space.
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              {values.map((value) => (
                <Card key={value.title} className="shadow-card hover:shadow-glow transition-shadow">
                  <CardHeader className="text-center">
                    <div className={`mx-auto w-12 h-12 ${value.color} rounded-full flex items-center justify-center mb-4`}>
                      <value.icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-xl">{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-center">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Mental Health Matters Section */}
      <section className="py-16 bg-gradient-wellness/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Why Mental Health Matters</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="text-xl text-primary">Breaking the Stigma</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Mental health is just as important as physical health. By creating open conversations 
                    and providing accessible resources, we help break down barriers and reduce stigma 
                    around mental health challenges.
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="text-xl text-primary">Support & Resources</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Our platform offers comprehensive support through professional guidance, peer connections, 
                    evidence-based tools, and educational resources designed to empower your mental wellness journey.
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="text-xl text-primary">Safe Space</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    We've created a judgment-free environment where you can express yourself freely, 
                    connect with others who understand, and access help without fear or shame.
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="text-xl text-primary">Awareness & Education</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Through education and awareness initiatives, we help individuals recognize mental health 
                    signs, understand available treatments, and build resilience for long-term wellbeing.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section - Auto Carousel */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Meet Our Team</h2>
            <Carousel members={teamMembers} />
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8">Our Story</h2>
            <div className="prose prose-lg mx-auto text-muted-foreground">
              <p className="text-center mb-8">
                MAITRI was born from a critical need: while space missions have advanced 
                technologically, crew mental health monitoring remained limited and reactive, 
                often detecting issues only after they became critical.
              </p>
              
              <Card className="shadow-card">
                <CardContent className="pt-6">
                  <p className="mb-4">
                  Life aboard a space station is extraordinary yet demanding — isolation, disrupted sleep, and constant pressure can take a toll on astronauts’ emotional and physical health. Our team recognized the need for an intelligent system that could sense these challenges early and offer meaningful support.
                  </p>
                  <p className="mb-4">
                  We set out to create a Multimodal AI Assistant that understands human emotions through facial expressions, voice tone, and behavioral cues. This assistant doesn’t just detect — it engages astronauts in short, adaptive conversations, offering comfort, motivation, and guidance to maintain emotional balance and focus during missions.
                  </p>
                  <p>
                  Designed for offline, real-time operation, our AI ensures reliability even in deep space. By providing timely insights and empathetic interaction, it acts as a trusted psychological companion, promoting crew well-being and mission efficiency aboard the Bhartiya Antariksh Station (BAS).
                  </p>
                  
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-gradient-beige">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Mission Control Contact</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Have questions about our space station crew monitoring system or need technical support? 
            Contact our mission control team.
          </p>
          <Card className="max-w-md mx-auto shadow-card">
            <CardContent className="pt-6">
              <div className="space-y-2 text-sm">
                <p><strong>Mission Control:</strong> mission-control@maitri.com</p>
                <p><strong>Technical Support:</strong> tech-support@maitri.com</p>
                <p><strong>Emergency Line :</strong> 1800-599-0019</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;

// Simple auto-scrolling horizontal carousel
const Carousel = ({ members }: { members: Array<{ name: string; role?: string; description?: string; imageUrl?: string }> }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let raf: number | null = null;
    let frame: number | null = null;
    const speedPxPerFrame = 2; // increased flow speed slightly

    const step = () => {
      if (!el) return;
      el.scrollLeft += speedPxPerFrame;
      // reset to start when reaching end for infinite loop effect
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 1) {
        el.scrollLeft = 0;
      }
      frame = window.setTimeout(() => {
        raf = requestAnimationFrame(step);
      }, 16);
    };

    raf = requestAnimationFrame(step);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      if (frame) clearTimeout(frame);
    };
  }, []);

  // duplicate list to avoid large visual gap during reset
  const items = [...members, ...members];

  return (
    <div className="relative">
      <div ref={containerRef} className="overflow-hidden">
        <div className="flex gap-6 py-2">
          {items.map((m, idx) => (
            <Card key={`${m.name}-${idx}`} className="min-w-[240px] w-[240px] shadow-card hover:shadow-glow transition-shadow">
              <CardHeader className="text-center">
                {m.imageUrl && (
                  <img
                    src={m.imageUrl}
                    alt={`${m.name} avatar`}
                    className="mx-auto mb-3 w-16 h-16 rounded-full object-cover border border-primary/30"
                  />
                )}
                <CardTitle className="text-lg">{m.name}</CardTitle>
                {m.role && (
                  <CardDescription className="font-medium text-primary">{m.role}</CardDescription>
                )}
              </CardHeader>
              {m.description && (
                <CardContent>
                  <p className="text-sm text-muted-foreground text-center">{m.description}</p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};