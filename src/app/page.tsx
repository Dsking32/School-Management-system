import Link from 'next/link';
import { 
  Leaf, 
  Laptop, 
  TrendingUp, 
  Users, 
  Shield, 
  Globe, 
  Award, 
  BookOpen,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section - Based on Slide 1 & 4 */}
      <section className="bg-gradient-to-b from-green-700 to-green-600 text-white py-20 relative overflow-hidden">
        {/* Background sparkle effect */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 animate-pulse">✨</div>
          <div className="absolute bottom-10 right-10 animate-pulse delay-1000">✨</div>
          <div className="absolute top-1/2 left-1/4 animate-pulse delay-500">✨</div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="flex justify-center items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-yellow-300" />
            <span className="text-sm font-medium uppercase tracking-wider text-green-100">Powered by Kreative Sparkles</span>
            <Sparkles className="h-5 w-5 text-yellow-300" />
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Design and Implementation of a Web-Based School Management System
          </h1>
          <p className="text-xl md:text-2xl mb-4 text-green-100">
            For Secondary Schools in Nigeria
          </p>
          <p className="text-lg md:text-xl mb-8 text-green-50 max-w-3xl mx-auto">
            A Case Study on Result Management, Computer Literacy & Environmental Sustainability
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/login" 
              className="bg-white text-green-700 px-8 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors inline-flex items-center justify-center gap-2"
            >
              Get Started <ArrowRight className="h-5 w-5" />
            </Link>
            <Link 
              href="#features" 
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-700 transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Problem Statement - Based on Slide 3 */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">The Challenge</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: <BookOpen className="h-8 w-8" />, title: "Manual Processing", text: "Results processed manually, leading to delays and errors" },
              { icon: <Leaf className="h-8 w-8" />, title: "Excessive Paper Use", text: "High printing costs contributing to deforestation" },
              { icon: <Shield className="h-8 w-8" />, title: "Security Issues", text: "Results can be lost, delayed, or altered" },
              { icon: <Users className="h-8 w-8" />, title: "Limited Access", text: "Parents and students can't easily access results" },
            ].map((item, i) => (
              <div key={i} className="text-center p-6 border rounded-lg hover:shadow-lg transition">
                <div className="text-green-600 mb-4 flex justify-center">{item.icon}</div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Benefits - Based on Slide 5, 7, 8, 9 */}
      <section id="features" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">Our Solution</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            A comprehensive web-based platform that transforms school management while promoting digital literacy and environmental sustainability
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Computer Literacy */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Laptop className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Computer Literacy</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span> Regular tech interaction for students
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span> Teachers develop digital skills
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span> Prepares for digital economy
                </li>
              </ul>
            </div>

            {/* Paperless Management */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Leaf className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Paperless Management</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span> Digital result storage
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span> Online result checking
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span> Eliminate printed report cards
                </li>
              </ul>
            </div>

            {/* Environmental Impact */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="bg-yellow-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Globe className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Environmental Impact</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span> Reduces deforestation
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span> Lowers carbon emissions
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span> Minimizes paper waste
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* System Users - Based on Slide 10 */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Who We Serve</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { role: "Administrators", icon: <Shield className="h-12 w-12" />, count: "Full control" },
              { role: "Teachers", icon: <Users className="h-12 w-12" />, count: "Result management" },
              { role: "Students", icon: <Award className="h-12 w-12" />, count: "Online results" },
              { role: "Parents", icon: <Users className="h-12 w-12" />, count: "Monitor progress" },
            ].map((item, i) => (
              <div key={i} className="text-center p-6 border rounded-lg hover:shadow-md transition">
                <div className="text-green-600 mb-4 flex justify-center">{item.icon}</div>
                <h3 className="font-semibold text-lg">{item.role}</h3>
                <p className="text-gray-500 text-sm">{item.count}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-green-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your School?</h2>
          <p className="text-xl mb-8 text-green-100">Join the digital revolution in Nigerian education</p>
          <Link 
            href="/login" 
            className="bg-white text-green-700 px-8 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors inline-flex items-center gap-2"
          >
            Get Started Now <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer with Kreative Sparkles Branding */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-6 w-6 text-yellow-400" />
                <span className="text-xl font-bold text-white">Kreative Sparkles</span>
              </div>
              <p className="text-sm mb-4">
                Empowering Nigerian education through innovative technology solutions. 
                We build sustainable, paperless systems for secondary schools.
              </p>
              <div className="flex items-center gap-2 text-sm">
                <span className="bg-green-600 text-white px-3 py-1 rounded-full text-xs">EST. 2024</span>
                <span className="text-gray-400">Innovation in Education</span>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-white font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/" className="hover:text-green-400 transition">Home</Link></li>
                <li><Link href="#features" className="hover:text-green-400 transition">Features</Link></li>
                <li><Link href="/about" className="hover:text-green-400 transition">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-green-400 transition">Contact</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-white font-semibold mb-4">Contact Us</h3>
              <ul className="space-y-2 text-sm">
                <li>📍 Lagos, Nigeria</li>
                <li>📞 +234 800 000 0000</li>
                <li>✉️ info@kreativesparkles.com</li>
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-800 my-8"></div>

          {/* Copyright and Powered By */}
          <div className="flex flex-col md:flex-row justify-between items-center text-sm">
            <p className="text-gray-400">
              © {new Date().getFullYear()} Kreative Sparkles. All rights reserved.
            </p>
            <div className="flex items-center gap-2 mt-4 md:mt-0">
              <span className="text-gray-400">Powered by</span>
              <div className="flex items-center gap-1">
                <Sparkles className="h-4 w-4 text-yellow-400" />
                <span className="font-semibold text-white">Kreative Sparkles</span>
              </div>
              <span className="text-gray-500 text-xs ml-2">v1.0.0</span>
            </div>
          </div>

          {/* Company Tagline */}
          <div className="text-center mt-6">
            <p className="text-xs text-gray-500 italic">
              "Igniting creativity, sparking innovation in education"
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}