"use client";

export default function ColorPalette() {
  const colors = [
    { name: "Primary (Carnation)", hex: "#f76361", description: "Main brand color, used for primary buttons, important UI elements, and brand identity" },
    { name: "Secondary (Strikemaster)", hex: "#884f83", description: "Used for secondary elements, accents, and to create visual hierarchy" },
    { name: "Tertiary (Rhino)", hex: "#263b58", description: "Used for headings, important text, and to create depth in the UI" },
  ];

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Onix AI Sales Agent Color Palette</h1>
      
      <div className="grid gap-6">
        {colors.map((color) => (
          <div key={color.hex} className="border rounded-lg overflow-hidden">
            <div className="h-24" style={{ backgroundColor: color.hex }}></div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">{color.name}</h3>
                <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm">{color.hex}</code>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">{color.description}</p>
            </div>
          </div>
        ))}
      </div>
      
      <h2 className="text-xl font-bold mt-8 mb-4">Color Usage Examples</h2>
      
      <div className="grid gap-6 md:grid-cols-2">
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-3">Gradients</h3>
          <div className="space-y-4">
            <div>
              <div className="h-12 rounded-md bg-gradient-to-r from-[#f76361] to-[#884f83] mb-2"></div>
              <code className="text-xs">from-[#f76361] to-[#884f83]</code>
            </div>
            <div>
              <div className="h-12 rounded-md bg-gradient-to-r from-[#263b58] to-[#3d5a85] mb-2"></div>
              <code className="text-xs">from-[#263b58] to-[#3d5a85]</code>
            </div>
          </div>
        </div>
        
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-3">Text Colors</h3>
          <div className="space-y-4">
            <div>
              <p className="text-[#f76361] font-medium">Primary Text (#f76361)</p>
              <p className="text-[#884f83] font-medium">Secondary Text (#884f83)</p>
              <p className="text-[#263b58] font-medium">Tertiary Text (#263b58)</p>
            </div>
          </div>
        </div>
        
        <div className="border rounded-lg p-4 md:col-span-2">
          <h3 className="font-medium mb-3">UI Components</h3>
          <div className="flex flex-wrap gap-4">
            <button className="px-4 py-2 rounded-md bg-[#f76361] text-white">Primary Button</button>
            <button className="px-4 py-2 rounded-md bg-[#884f83] text-white">Secondary Button</button>
            <button className="px-4 py-2 rounded-md bg-[#263b58] text-white">Tertiary Button</button>
            <button className="px-4 py-2 rounded-md border-2 border-[#f76361] text-[#f76361]">Outline Button</button>
            <div className="px-3 py-1 rounded-full bg-[#f76361]/20 text-[#f76361] text-sm">Primary Badge</div>
            <div className="px-3 py-1 rounded-full bg-[#884f83]/20 text-[#884f83] text-sm">Secondary Badge</div>
          </div>
        </div>
      </div>
      
      <div className="mt-8 p-4 border rounded-lg">
        <h3 className="font-medium mb-2">Implementation Notes</h3>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>Use <span className="font-mono text-[#f76361]">#f76361</span> (Carnation) as the primary brand color for main actions and brand identity</li>
          <li>Use <span className="font-mono text-[#884f83]">#884f83</span> (Strikemaster) for secondary elements and to create visual interest</li>
          <li>Use <span className="font-mono text-[#263b58]">#263b58</span> (Rhino) for headings and important UI elements</li>
          <li>Combine colors in gradients for buttons and visual elements</li>
          <li>Maintain sufficient contrast for accessibility (WCAG AA compliance)</li>
        </ul>
      </div>
    </div>
  );
}