import { useRouter } from 'next/router'

export function Footer() {
  const router = useRouter()

  return (
    <footer className="border-t">
      <div className="container mx-auto px-8 py-16">
        <div className="flex h-24 items-center justify-between">
          <div className="md:col-span-1">
            <p className="text-sm text-gray-600 mb-4">
              Simplify your travel expenses planning with ExpeArti management
              platform.
            </p>
            <p className="text-sm text-gray-500">
              © 2025 ExpeArti. All rights reserved.
            </p>
          </div>
          <div className="flex items-center space-x-6 mt-4 md:mt-0">
            <span className="text-xs text-gray-400">Version 0.1.0</span>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs text-gray-500">
                All systems operational
              </span>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <a href="#" className="hover:text-blue-600 transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600 transition-colors">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600 transition-colors">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600 transition-colors">
                  API Reference
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <a href="#" className="hover:text-blue-600 transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600 transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600 transition-colors">
                  Cookie Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600 transition-colors">
                  GDPR
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  )
}
