import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle, Users, Heart, Shield, Search, Plus, TrendingUp, Clock, CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export default function PeerSupport() {
  const [newPostContent, setNewPostContent] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();
  const [mentors, setMentors] = useState<any[]>([]);
  const [loadingMentors, setLoadingMentors] = useState(false);

  const topics = [
    { name: "Mission Stress", posts: 45, active: "2h ago", color: "bg-blue-100 text-blue-800" },
    { name: "Space Station Life", posts: 32, active: "1h ago", color: "bg-green-100 text-green-800" },
    { name: "Space Career Anxiety", posts: 28, active: "30m ago", color: "bg-purple-100 text-purple-800" },
    { name: "Team Dynamics", posts: 23, active: "45m ago", color: "bg-pink-100 text-pink-800" },
    { name: "Family Separation", posts: 19, active: "3h ago", color: "bg-orange-100 text-orange-800" },
    { name: "Resource Management", posts: 15, active: "1h ago", color: "bg-yellow-100 text-yellow-800" }
  ];

  const [discussions, setDiscussions] = useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  const loadPosts = async () => {
    try {
      setLoadingPosts(true);
      const resp = await fetch("http://localhost:4000/community/posts");
      const data = await resp.json();
      const mapped = data.map((p: any) => ({
        id: p.id,
        title: p.content.slice(0, 80) + (p.content.length > 80 ? "..." : ""),
        author: p.author || "Anonymous",
        timeAgo: new Date(p.created_at).toLocaleString(),
        replies: p.replies ?? 0,
        topic: p.topic,
        preview: p.content,
        isAnonymous: true,
        likes: p.likes ?? 0,
      }));
      setDiscussions(mapped);
    } catch {
      toast({ title: "Could not load posts", description: "Please try again later.", variant: "destructive" });
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        setLoadingMentors(true);
        const resp = await fetch("http://localhost:4000/mentors");
        const data = await resp.json();
        setMentors(data);
      } catch {
        toast({ title: "Could not load mentors", description: "Please try again later.", variant: "destructive" });
      } finally {
        setLoadingMentors(false);
      }
    };
    fetchMentors();
  }, [toast]);

  const handleNewPost = async () => {
    if (!newPostContent.trim() || !selectedTopic) {
      toast({
        title: "Missing Information",
        description: "Please select a topic and write your post content.",
        variant: "destructive"
      });
      return;
    }
    try {
      const resp = await fetch("http://localhost:4000/community/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: selectedTopic, content: newPostContent }),
      });
      if (!resp.ok) throw new Error("Failed to create post");
      toast({
        title: "Post Created Successfully!",
        description: "Your anonymous post has been shared with the community.",
      });
      setNewPostContent("");
      setSelectedTopic("");
      await loadPosts();
    } catch (e) {
      toast({ title: "Failed to create post", description: (e as Error).message, variant: "destructive" });
    }
  };

  return (
    <div className="pt-16 min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
            Peer Support Community
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Connect anonymously with fellow astronauts. Share experiences, seek advice, and support each other
            in a safe, moderated environment.
          </p>
        </div>

        {/* Community Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">1,247</div>
              <div className="text-sm text-muted-foreground">Active Members</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <MessageCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold">892</div>
              <div className="text-sm text-muted-foreground">Discussions</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Heart className="h-8 w-8 mx-auto mb-2 text-red-500" />
              <div className="text-2xl font-bold">3,456</div>
              <div className="text-sm text-muted-foreground">Peer Interactions</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Shield className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold">24/7</div>
              <div className="text-sm text-muted-foreground">Safe Space</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="discussions" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="discussions" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Discussions
            </TabsTrigger>
            <TabsTrigger value="mentors" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Peer Mentors
            </TabsTrigger>
            <TabsTrigger value="create" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Post
            </TabsTrigger>
          </TabsList>

          <TabsContent value="discussions" className="space-y-6">
            {/* Topics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Popular Topics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {topics.map((topic) => (
                    <div key={topic.name} className="p-3 border rounded-lg hover:bg-secondary/50 cursor-pointer">
                      <div className="text-sm font-medium mb-1">{topic.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {topic.posts} posts • {topic.active}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search discussions..."
                className="pl-10"
              />
            </div>

            {/* Discussion List */}
            <div className="space-y-4">
              {loadingPosts && (
                <Card>
                  <CardContent className="p-4">Loading posts...</CardContent>
                </Card>
              )}
              {!loadingPosts && discussions.length === 0 && (
                <Card>
                  <CardContent className="p-4 text-muted-foreground">No posts yet. Be the first to share.</CardContent>
                </Card>
              )}
              {!loadingPosts && discussions.map((discussion) => (
                <Card key={discussion.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {discussion.author.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm font-medium">{discussion.author}</div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {discussion.timeAgo}
                          </div>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {discussion.topic}
                      </Badge>
                    </div>
                    
                    <h3 className="font-semibold mb-2 hover:text-primary transition-colors">
                      {discussion.title}
                    </h3>
                    
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {discussion.preview}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MessageCircle className="h-4 w-4" />
                          {discussion.replies} replies
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="h-4 w-4" />
                          {discussion.likes} likes
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          <Shield className="h-3 w-3 mr-1" />
                          Anonymous
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="mentors" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>Connect with Peer Mentors</CardTitle>
                    <CardDescription>
                      Get guidance from trained senior astronauts who understand your challenges
                    </CardDescription>
                  </div>
                  <Button variant="outline" onClick={() => navigate("/volunteer")}>Click here to volunteer for mentoring</Button>
                </div>
              </CardHeader>
            </Card>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(loadingMentors ? [] : mentors).map((mentor: any) => (
                <Card key={mentor.id} className="hover:shadow-card transition-all">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-gradient-primary text-white">
                            {mentor.name.slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">{mentor.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">{mentor.year}</p>
                        </div>
                      </div>
                      <div className={`h-3 w-3 rounded-full ${mentor.available ? 'bg-green-500' : 'bg-gray-400'}`} />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="font-medium text-primary">{mentor.specialization || 'General Support'}</p>
                      <p className="text-sm text-muted-foreground">Languages: {mentor.languages || '—'}</p>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span>Rating: ⭐ {mentor.rating ?? 0}</span>
                      <span>{mentor.sessions ?? 0} sessions</span>
                    </div>
                    
                    <Button 
                      className="w-full" 
                      variant={mentor.available ? "default" : "secondary"}
                      disabled={!mentor.available}
                    >
                      {mentor.available ? "Connect Now" : "Currently Busy"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
              {!loadingMentors && mentors.length === 0 && (
                <Card className="col-span-full">
                  <CardContent className="p-6 text-center text-muted-foreground">No mentors yet. Be the first to volunteer!</CardContent>
                </Card>
              )}
              {loadingMentors && (
                <Card className="col-span-full">
                  <CardContent className="p-6 text-center">Loading mentors...</CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="create" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Share Your Thoughts Anonymously
                </CardTitle>
                <CardDescription>
                  Your identity is protected. Share freely and get support from the community.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Select Topic</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {topics.map((topic) => (
                      <Button
                        key={topic.name}
                        variant={selectedTopic === topic.name ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedTopic(topic.name)}
                        className="text-xs"
                      >
                        {topic.name}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Your Message</label>
                  <Textarea
                    placeholder="Share what's on your mind. Remember, this is a safe space and your identity is protected..."
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    rows={6}
                  />
                </div>
                
                <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                  <Shield className="h-5 w-5 text-green-600" />
                  <span className="text-sm text-green-800">
                    Your post will be anonymous and moderated for safety
                  </span>
                </div>
                
                <Button onClick={handleNewPost} size="lg" className="w-full">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Share Anonymously
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}