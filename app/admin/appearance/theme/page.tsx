"use client";

import { useState, useEffect } from "react";
import { useShop } from "@/context/ShopContext";
import { Save, Loader2, RotateCcw, Upload } from "lucide-react";

export default function AdminTheme() {
  const { themeSettings, setThemeSettings, headerSettings, setHeaderSettings } = useShop();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState(themeSettings);

  // Sync local settings with theme settings once they load from database
  useEffect(() => {
    setSettings(themeSettings);
  }, [themeSettings]);

  const updateHeaderSettings = (update: Partial<typeof headerSettings>) => {
      setHeaderSettings({ ...headerSettings, ...update });
  };

  const handleSave = async () => {
    setLoading(true);
    // Ensure all settings from the local form state are saved
    await Promise.all([
        setThemeSettings(settings),
        setHeaderSettings(headerSettings)
    ]);
    setLoading(false);
  };

  const handleReset = () => {
    setSettings({
        bodyBackgroundColor: "#F0F3F7",
        primaryColor: "#ff4d00",
        secondaryColor: "#1d2327",
        textColor: "#333333",
        fontFamily: "Inter",
        buttonColor: "#ff4d00",
        buttonTextColor: "#ffffff",
        productButtonColor: "#ff4d00",
        productButtonTextColor: "#ffffff",
        footerBackgroundColor: "#1d2327",
        footerTextColor: "#ffffff",
        footerButtonColor: "#ff4d00",
        footerButtonTextColor: "#ffffff"
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Theme Settings</h2>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="bg-primary hover:bg-orange-600 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200 font-bold text-sm uppercase tracking-wider shadow-lg shadow-primary/20 disabled:opacity-70"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Save Changes</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 space-y-8">
            {/* Header Section */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">Header Customization</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Logo URL</label>
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        value={headerSettings.logoUrl || ''}
                        onChange={(e) => updateHeaderSettings({ logoUrl: e.target.value })}
                        className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary font-mono text-sm"
                        placeholder="https://example.com/logo.png"
                    />
                    <button 
                        onClick={() => document.getElementById('logo-upload')?.click()}
                        className="bg-gray-50 hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-xs font-bold transition-all border border-gray-200 flex items-center gap-2 uppercase tracking-widest whitespace-nowrap"
                    >
                        <Upload className="w-4 h-4" />
                        Upload
                    </button>
                    <input 
                        id="logo-upload"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => updateHeaderSettings({ logoUrl: reader.result as string });
                                reader.readAsDataURL(file);
                            }
                        }}
                    />
                </div>
                <p className="text-xs text-gray-400 mt-2">Leave empty to use Site Title.</p>
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Logo Height</label>
                <input 
                    type="text" 
                    value={headerSettings.logoHeight || '40px'}
                    onChange={(e) => updateHeaderSettings({ logoHeight: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary font-mono text-sm"
                    placeholder="e.g. 40px"
                />
            </div>
            
            <div className="col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Layout</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-2">Logo Position</label>
                        <select 
                            value={headerSettings.logoPosition || 'left'}
                            onChange={(e) => updateHeaderSettings({ logoPosition: e.target.value as any })}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary text-sm"
                        >
                            <option value="left">Left</option>
                            <option value="center">Center</option>
                            <option value="right">Right</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-2">Menu Position</label>
                        <select 
                            value={headerSettings.menuPosition || 'center'}
                            onChange={(e) => updateHeaderSettings({ menuPosition: e.target.value as any })}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary text-sm"
                        >
                            <option value="left">Left</option>
                            <option value="center">Center</option>
                            <option value="right">Right</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-2">Icons Position</label>
                        <select 
                            value={headerSettings.iconsPosition || 'right'}
                            onChange={(e) => updateHeaderSettings({ iconsPosition: e.target.value as any })}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary text-sm"
                        >
                            <option value="left">Left</option>
                            <option value="center">Center</option>
                            <option value="right">Right</option>
                        </select>
                    </div>
                </div>

                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Header Icons</label>
                <div className="flex space-x-6">
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={headerSettings.showSearch}
                            onChange={(e) => updateHeaderSettings({ showSearch: e.target.checked })}
                            className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <span className="text-sm font-medium text-gray-700">Show Search</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={headerSettings.showAccount}
                            onChange={(e) => updateHeaderSettings({ showAccount: e.target.checked })}
                            className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <span className="text-sm font-medium text-gray-700">Show Account</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={headerSettings.showCart}
                            onChange={(e) => updateHeaderSettings({ showCart: e.target.checked })}
                            className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <span className="text-sm font-medium text-gray-700">Show Cart</span>
                    </label>
                </div>
            </div>

            <div className="col-span-2 pt-6 border-t border-gray-100">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Top Bar (Announcement)</label>
                <div className="flex items-center space-x-4 mb-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={headerSettings.topBarShow}
                            onChange={(e) => updateHeaderSettings({ topBarShow: e.target.checked })}
                            className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <span className="text-sm font-medium text-gray-700">Show Top Bar</span>
                    </label>
                </div>
                
                {headerSettings.topBarShow && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
                        <div className="col-span-2">
                            <label className="block text-xs font-medium text-gray-700 mb-2">Announcement Message</label>
                            <input 
                                type="text" 
                                value={headerSettings.topBarMessage}
                                onChange={(e) => updateHeaderSettings({ topBarMessage: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary text-sm"
                                placeholder="e.g. Free Shipping on all orders over $500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-2">Background Color</label>
                            <div className="flex items-center space-x-3">
                                <input 
                                    type="color" 
                                    value={headerSettings.topBarBackgroundColor}
                                    onChange={(e) => updateHeaderSettings({ topBarBackgroundColor: e.target.value })}
                                    className="w-10 h-10 rounded border border-gray-200 cursor-pointer p-1"
                                />
                                <input 
                                    type="text" 
                                    value={headerSettings.topBarBackgroundColor}
                                    onChange={(e) => updateHeaderSettings({ topBarBackgroundColor: e.target.value })}
                                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg font-mono text-xs uppercase"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-2">Text Color</label>
                            <div className="flex items-center space-x-3">
                                <input 
                                    type="color" 
                                    value={headerSettings.topBarTextColor}
                                    onChange={(e) => updateHeaderSettings({ topBarTextColor: e.target.value })}
                                    className="w-10 h-10 rounded border border-gray-200 cursor-pointer p-1"
                                />
                                <input 
                                    type="text" 
                                    value={headerSettings.topBarTextColor}
                                    onChange={(e) => updateHeaderSettings({ topBarTextColor: e.target.value })}
                                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg font-mono text-xs uppercase"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* Colors Section */}
            <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">Colors</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Primary Color</label>
                        <div className="flex items-center space-x-3">
                            <input 
                                type="color" 
                                value={settings.primaryColor}
                                onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                                className="w-12 h-12 rounded-lg border border-gray-200 cursor-pointer p-1"
                            />
                            <input 
                                type="text" 
                                value={settings.primaryColor}
                                onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                                className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary font-mono text-sm uppercase"
                            />
                        </div>
                        <p className="text-xs text-gray-400 mt-2">Used for buttons, links, and highlights.</p>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Secondary Color</label>
                        <div className="flex items-center space-x-3">
                            <input 
                                type="color" 
                                value={settings.secondaryColor}
                                onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                                className="w-12 h-12 rounded-lg border border-gray-200 cursor-pointer p-1"
                            />
                            <input 
                                type="text" 
                                value={settings.secondaryColor}
                                onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                                className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary font-mono text-sm uppercase"
                            />
                        </div>
                        <p className="text-xs text-gray-400 mt-2">Used for footer background and dark sections.</p>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Body Background</label>
                        <div className="flex items-center space-x-3">
                            <input 
                                type="color" 
                                value={settings.bodyBackgroundColor}
                                onChange={(e) => setSettings({ ...settings, bodyBackgroundColor: e.target.value })}
                                className="w-12 h-12 rounded-lg border border-gray-200 cursor-pointer p-1"
                            />
                            <input 
                                type="text" 
                                value={settings.bodyBackgroundColor}
                                onChange={(e) => setSettings({ ...settings, bodyBackgroundColor: e.target.value })}
                                className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary font-mono text-sm uppercase"
                            />
                        </div>
                        <p className="text-xs text-gray-400 mt-2">Main background color of the website.</p>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Text Color</label>
                        <div className="flex items-center space-x-3">
                            <input 
                                type="color" 
                                value={settings.textColor}
                                onChange={(e) => setSettings({ ...settings, textColor: e.target.value })}
                                className="w-12 h-12 rounded-lg border border-gray-200 cursor-pointer p-1"
                            />
                            <input 
                                type="text" 
                                value={settings.textColor}
                                onChange={(e) => setSettings({ ...settings, textColor: e.target.value })}
                                className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary font-mono text-sm uppercase"
                            />
                        </div>
                        <p className="text-xs text-gray-400 mt-2">Default color for body text.</p>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Button Background</label>
                        <div className="flex items-center space-x-3">
                            <input 
                                type="color" 
                                value={settings.buttonColor}
                                onChange={(e) => setSettings({ ...settings, buttonColor: e.target.value })}
                                className="w-12 h-12 rounded-lg border border-gray-200 cursor-pointer p-1"
                            />
                            <input 
                                type="text" 
                                value={settings.buttonColor}
                                onChange={(e) => setSettings({ ...settings, buttonColor: e.target.value })}
                                className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary font-mono text-sm uppercase"
                            />
                        </div>
                        <p className="text-xs text-gray-400 mt-2">Global button background color.</p>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Button Text Color</label>
                        <div className="flex items-center space-x-3">
                            <input 
                                type="color" 
                                value={settings.buttonTextColor}
                                onChange={(e) => setSettings({ ...settings, buttonTextColor: e.target.value })}
                                className="w-12 h-12 rounded-lg border border-gray-200 cursor-pointer p-1"
                            />
                            <input 
                                type="text" 
                                value={settings.buttonTextColor}
                                onChange={(e) => setSettings({ ...settings, buttonTextColor: e.target.value })}
                                className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary font-mono text-sm uppercase"
                            />
                        </div>
                        <p className="text-xs text-gray-400 mt-2">Global button text color.</p>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Product Button Background</label>
                        <div className="flex items-center space-x-3">
                            <input 
                                type="color" 
                                value={settings.productButtonColor}
                                onChange={(e) => setSettings({ ...settings, productButtonColor: e.target.value })}
                                className="w-12 h-12 rounded-lg border border-gray-200 cursor-pointer p-1"
                            />
                            <input 
                                type="text" 
                                value={settings.productButtonColor}
                                onChange={(e) => setSettings({ ...settings, productButtonColor: e.target.value })}
                                className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary font-mono text-sm uppercase"
                            />
                        </div>
                        <p className="text-xs text-gray-400 mt-2">Product "Add to Cart" button color.</p>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Product Button Text</label>
                        <div className="flex items-center space-x-3">
                            <input 
                                type="color" 
                                value={settings.productButtonTextColor}
                                onChange={(e) => setSettings({ ...settings, productButtonTextColor: e.target.value })}
                                className="w-12 h-12 rounded-lg border border-gray-200 cursor-pointer p-1"
                            />
                            <input 
                                type="text" 
                                value={settings.productButtonTextColor}
                                onChange={(e) => setSettings({ ...settings, productButtonTextColor: e.target.value })}
                                className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary font-mono text-sm uppercase"
                            />
                        </div>
                        <p className="text-xs text-gray-400 mt-2">Product button text color.</p>
                    </div>
                </div>
            </div>

            {/* Footer Section */}
            <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">Footer</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Background Color</label>
                        <div className="flex items-center space-x-3">
                            <input 
                                type="color" 
                                value={settings.footerBackgroundColor}
                                onChange={(e) => setSettings({ ...settings, footerBackgroundColor: e.target.value })}
                                className="w-12 h-12 rounded-lg border border-gray-200 cursor-pointer p-1"
                            />
                            <input 
                                type="text" 
                                value={settings.footerBackgroundColor}
                                onChange={(e) => setSettings({ ...settings, footerBackgroundColor: e.target.value })}
                                className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary font-mono text-sm uppercase"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Text Color</label>
                        <div className="flex items-center space-x-3">
                            <input 
                                type="color" 
                                value={settings.footerTextColor}
                                onChange={(e) => setSettings({ ...settings, footerTextColor: e.target.value })}
                                className="w-12 h-12 rounded-lg border border-gray-200 cursor-pointer p-1"
                            />
                            <input 
                                type="text" 
                                value={settings.footerTextColor}
                                onChange={(e) => setSettings({ ...settings, footerTextColor: e.target.value })}
                                className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary font-mono text-sm uppercase"
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100">
                    <h4 className="text-sm font-bold text-gray-900 mb-4">Bottom Section</h4>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Copyright Year</label>
                                <input 
                                    type="text" 
                                    value={settings.footerYear || ''}
                                    onChange={(e) => setSettings({ ...settings, footerYear: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary text-sm"
                                    placeholder={new Date().getFullYear().toString()}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Copyright Text</label>
                                <input 
                                    type="text" 
                                    value={settings.footerCopyrightText || ''}
                                    onChange={(e) => setSettings({ ...settings, footerCopyrightText: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary text-sm"
                                    placeholder="e.g. ALL RIGHTS RESERVED."
                                />
                            </div>
                        </div>
                        <div className="flex space-x-6">
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={settings.showFooterPrivacy}
                                    onChange={(e) => setSettings({ ...settings, showFooterPrivacy: e.target.checked })}
                                    className="rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <span className="text-sm font-medium text-gray-700">Show Privacy Policy</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={settings.showFooterTerms}
                                    onChange={(e) => setSettings({ ...settings, showFooterTerms: e.target.checked })}
                                    className="rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <span className="text-sm font-medium text-gray-700">Show Terms of Service</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            {/* Typography Section */}
            <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">Typography</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Font Family</label>
                        <select 
                            value={settings.fontFamily}
                            onChange={(e) => setSettings({ ...settings, fontFamily: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary bg-white"
                        >
                            <option value="Inter">Inter (Default)</option>
                            <option value="Roboto">Roboto</option>
                            <option value="Open Sans">Open Sans</option>
                            <option value="Montserrat">Montserrat</option>
                            <option value="Lato">Lato</option>
                            <option value="Poppins">Poppins</option>
                        </select>
                        <p className="text-xs text-gray-400 mt-2">Primary font used across the site.</p>
                    </div>
                </div>
            </div>

            <div className="pt-6 border-t border-gray-100">
                <button 
                    onClick={handleReset}
                    className="text-gray-500 hover:text-gray-700 text-sm font-bold flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                    <RotateCcw className="w-4 h-4" />
                    <span>Reset to Defaults</span>
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}
