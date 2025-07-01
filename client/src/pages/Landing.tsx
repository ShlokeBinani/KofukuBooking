import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Building, Calendar, Users, Mic } from 'lucide-react';

export default function Landing() {
  const handleLogin = () => {
    window.location.href = '/api/login';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-slate-100 to-amber-100">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center mb-6">
            <svg width="80" height="80" viewBox="0 0 100 100" className="floating-animation">
              <defs>
                <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1e40af" />
                  <stop offset="50%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#60a5fa" />
                </linearGradient>
                <linearGradient id="metallicGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fefce8" />
                  <stop offset="50%" stopColor="#f3f4f6" />
                  <stop offset="100%" stopColor="#e5e7eb" />
                </linearGradient>
              </defs>
              
              {/* Outer metallic ring */}
              <circle cx="50" cy="50" r="45" fill="url(#metallicGradient)" stroke="#d1d5db" strokeWidth="2"/>
              
              {/* Inner blue circle */}
              <circle cx="50" cy="50" r="35" fill="url(#logoGradient)"/>
              
              {/* K letter in center */}
              <g fill="white" transform="translate(50,50)">
                <rect x="-12" y="-15" width="4" height="30"/>
                <rect x="-8" y="-3" width="15" height="3" transform="rotate(-30)"/>
                <rect x="-8" y="0" width="15" height="3" transform="rotate(30)"/>
              </g>
              
              {/* Decorative elements */}
              <circle cx="25" cy="25" r="3" fill="url(#metallicGradient)" opacity="0.7"/>
              <circle cx="75" cy="25" r="2" fill="url(#metallicGradient)" opacity="0.7"/>
              <circle cx="25" cy="75" r="2" fill="url(#metallicGradient)" opacity="0.7"/>
              <circle cx="75" cy="75" r="3" fill="url(#metallicGradient)" opacity="0.7"/>
            </svg>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 bg-clip-text text-transparent mb-4 metallic-text">
            Kofuku Technologies
          </h1>
          <p className="text-xl text-blue-600 font-medium mb-8">
            Smart Room Booking System
          </p>
          <p className="text-lg text-blue-700 max-w-2xl mx-auto mb-8">
            Experience the future of office space management with voice-controlled bookings, 
            intelligent conflict resolution, and seamless team collaboration.
          </p>
          
          <Button
            onClick={handleLogin}
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
          >
            Sign In to Continue
          </Button>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {[
            {
              icon: <Mic className="w-8 h-8" />,
              title: 'Voice Control',
              description: 'Book rooms with simple voice commands using "Hey Kofi"'
            },
            {
              icon: <Calendar className="w-8 h-8" />,
              title: 'Smart Scheduling',
              description: 'Real-time availability checking and conflict resolution'
            },
            {
              icon: <Users className="w-8 h-8" />,
              title: 'Team Bookings',
              description: 'Coordinate team meetings and collaborative sessions'
            },
            {
              icon: <Building className="w-8 h-8" />,
              title: 'Priority System',
              description: 'Department heads can manage booking priorities'
            },
          ].map((feature, index) => (
            <Card key={index} className="bg-white/20 backdrop-blur-lg border-white/30 hover:bg-white/30 transition-all duration-300 transform hover:-translate-y-2">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-600">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-blue-800 mb-2">{feature.title}</h3>
                <p className="text-blue-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Available Rooms Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-blue-800 mb-8">Available Rooms</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="bg-white/20 backdrop-blur-lg border-white/30 hover:bg-white/30 transition-all duration-300">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="text-blue-600 w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-blue-800 mb-2">Conference Room 1</h3>
                <p className="text-blue-600 mb-4">Perfect for team meetings and presentations</p>
                <div className="flex justify-center items-center space-x-4 text-blue-700">
                  <span className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    12 people
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/20 backdrop-blur-lg border-white/30 hover:bg-white/30 transition-all duration-300">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Building className="text-blue-600 w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-blue-800 mb-2">Cabin 1</h3>
                <p className="text-blue-600 mb-4">Ideal for private meetings and calls</p>
                <div className="flex justify-center items-center space-x-4 text-blue-700">
                  <span className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    4 people
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-blue-600/10 to-blue-800/10 backdrop-blur-lg border-blue-200/30 max-w-2xl mx-auto">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold text-blue-800 mb-4">
                Ready to Transform Your Workspace?
              </h2>
              <p className="text-blue-700 mb-6">
                Join Kofuku Technologies and experience the future of room booking today.
              </p>
              <Button
                onClick={handleLogin}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-12 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
              >
                Get Started Now
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
