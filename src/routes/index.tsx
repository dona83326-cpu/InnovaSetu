import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle, Lightbulb, Users, Building2, Factory, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "InnovaSetu - Turn Local Problems Into Real Solutions" },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-lg">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="InnovaSetu" className="h-10 w-auto" />
            <span className="text-xl font-bold text-white">InnovaSetu</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost" className="text-white hover:bg-white/10">
                Login
              </Button>
            </Link>
            <Link to="/register">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* ENLARGED LOGO - Changed from h-32 to h-56 */}
          <div className="mb-12 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-white/20 blur-3xl rounded-full"></div>
              <img 
                src="/logo.png" 
                alt="InnovaSetu Logo" 
                className="relative h-56 w-auto rounded-3xl shadow-2xl transform hover:scale-105 transition-transform duration-300" 
              />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Turn Local Problems Into{" "}
            <span className="text-orange-500">Real Solutions</span>
          </h1>
          
          <p className="text-xl text-blue-100 mb-12 leading-relaxed max-w-3xl mx-auto">
            InnovaSetu connects citizens, universities, Government and industry to move 
            civic problems from reporting to verified execution.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-16">
            <Link to="/citizen/submit">
              <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white text-lg px-8 py-6 shadow-lg">
                Report a Problem
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-6 bg-transparent"
              >
                See How It Works
              </Button>
            </a>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 text-white">
            <div className="p-6 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
              <CheckCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Verified Solutions</h3>
              <p className="text-blue-100">Real problems, real execution, real impact</p>
            </div>
            <div className="p-6 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
              <Lightbulb className="h-12 w-12 text-orange-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">AI-Powered Triage</h3>
              <p className="text-blue-100">Smart categorization and priority detection</p>
            </div>
            <div className="p-6 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
              <Users className="h-12 w-12 text-orange-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Collaborative Platform</h3>
              <p className="text-blue-100">4 stakeholders working together</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-white py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-blue-900 mb-4">
            How InnovaSetu Works
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            A seamless collaboration between citizens, universities, government, and industry
          </p>
          
          <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center shadow-lg">
                <Users className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">1. Citizens Report</h3>
              <p className="text-gray-600 text-sm">Report civic problems with photos and location</p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center shadow-lg">
                <GraduationCap className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">2. Universities Solve</h3>
              <p className="text-gray-600 text-sm">Academic institutions propose innovative solutions</p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center shadow-lg">
                <Building2 className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">3. Government Approves</h3>
              <p className="text-gray-600 text-sm">Officials review and select best solutions</p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center shadow-lg">
                <Factory className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">4. Industry Executes</h3>
              <p className="text-gray-600 text-sm">Industries bid and implement solutions</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-950 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center items-center gap-2 mb-4">
            <img src="/logo.png" alt="InnovaSetu" className="h-8 w-auto" />
            <span className="text-xl font-bold">InnovaSetu</span>
          </div>
          <p className="text-blue-200 mb-2">Empowering Jharkhand Through Collaborative Innovation</p>
          <p className="text-sm text-blue-300">© {new Date().getFullYear()} Government of Jharkhand</p>
        </div>
      </footer>
    </div>
  );
}