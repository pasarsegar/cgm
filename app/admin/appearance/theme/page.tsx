"use client";

import { useState } from "react";
import { useShop } from "@/context/ShopContext";
import { Save, Loader2, RotateCcw } from "lucide-react";

export default function AdminTheme() {
  const { themeSettings, setThemeSettings } = useShop();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState(themeSettings);

  const handleSave = async () => {
    setLoading(true);
    await setThemeSettings(settings);
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
