import { useTranslations } from 'next-intl';

export default function TestPage() {
  const t = useTranslations();
  
  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Mobile Bottom Navigation Test</h1>
        
        <div className="space-y-6">
          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-3">Navigation Features</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Only visible on mobile devices (screen width &lt; 768px)</li>
              <li>• Fixed at bottom of screen with proper z-index</li>
              <li>• Active state highlighting for current page</li>
              <li>• Internationalization support (EN/PT-BR)</li>
              <li>• Smooth transitions and hover effects</li>
            </ul>
          </div>

          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-3">Navigation Items</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="font-medium">Home</h3>
                <p className="text-sm text-muted-foreground">Main landing page with search functionality</p>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium">Search</h3>
                <p className="text-sm text-muted-foreground">Find parking lots near your destination</p>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium">Account</h3>
                <p className="text-sm text-muted-foreground">Manage your profile and reservations</p>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium">Settings</h3>
                <p className="text-sm text-muted-foreground">App preferences and configuration</p>
              </div>
            </div>
          </div>

          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-3">Testing Instructions</h2>
            <ol className="space-y-2 text-muted-foreground">
              <li>1. Resize your browser window to mobile width (&lt; 768px)</li>
              <li>2. The bottom navigation should appear at the bottom of the screen</li>
              <li>3. Click on different navigation items to test routing</li>
              <li>4. Notice the active state highlighting on the current page</li>
              <li>5. Test on different screen sizes to see the responsive behavior</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
