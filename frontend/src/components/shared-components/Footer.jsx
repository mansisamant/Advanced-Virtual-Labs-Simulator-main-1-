import { Beaker, Github, Mail, Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Column 1 */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Beaker className="h-6 w-6 text-indigo-400" />
              <h2 className="text-lg font-bold">Virtual Lab</h2>
            </div>
            <p className="text-gray-400 text-sm">
              An advanced virtual laboratory simulation platform for collaborative learning and experimentation.
            </p>
          </div>
          
          {/* Column 2 */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Home</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Available Experiments</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
            </ul>
          </div>
          
          {/* Column 3 */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Connect With Us</h3>
            <div className="flex space-x-4 mb-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Mail className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
            <p className="text-gray-400 text-sm">
              Subscribe to our newsletter for updates on new experiments and features.
            </p>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-6 pt-6 text-sm text-gray-400 flex flex-col md:flex-row justify-between">
          <p>© {new Date().getFullYear()} Virtual Lab. All rights reserved.</p>
          <div className="flex space-x-4 mt-2 md:mt-0">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}