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
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl mb-6 shadow-lg animate-pulse">
            <Building className="text-white w-10 h-10" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-600 to-slate-800 bg-clip-text text-transparent mb-4">
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
