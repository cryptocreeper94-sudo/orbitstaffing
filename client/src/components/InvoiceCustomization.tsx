import { useState } from 'react';
import { FileText, Upload, Download, Eye, Save, Palette, Type, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InvoiceTemplate {
  id: string;
  name: string;
  logo?: string;
  primaryColor: string;
  headerText: string;
  footerText: string;
  paymentTerms: string;
  showItemizedBreakdown: boolean;
  showTaxBreakdown: boolean;
  showNotes: boolean;
}

export function InvoiceCustomization() {
  const [templates, setTemplates] = useState<InvoiceTemplate[]>([
    {
      id: 'default',
      name: 'Default ORBIT Template',
      primaryColor: '#06b6d4',
      headerText: 'ORBIT Staffing OS',
      footerText: 'Thank you for your business!',
      paymentTerms: 'Net 30',
      showItemizedBreakdown: true,
      showTaxBreakdown: true,
      showNotes: true,
    },
    {
      id: 'simple',
      name: 'Simple Invoice',
      primaryColor: '#10b981',
      headerText: 'Invoice',
      footerText: 'Payment due upon receipt',
      paymentTerms: 'Due on Receipt',
      showItemizedBreakdown: false,
      showTaxBreakdown: false,
      showNotes: false,
    },
  ]);

  const [selectedTemplate, setSelectedTemplate] = useState<InvoiceTemplate>(templates[0]);
  const [isEditing, setIsEditing] = useState(false);

  const handleSaveTemplate = () => {
    const existing = templates.findIndex(t => t.id === selectedTemplate.id);
    if (existing !== -1) {
      setTemplates(templates.map(t => t.id === selectedTemplate.id ? selectedTemplate : t));
    } else {
      setTemplates([...templates, { ...selectedTemplate, id: `template-${Date.now()}` }]);
    }
    setIsEditing(false);
  };

  const handlePreview = () => {
    alert('Opening invoice preview...');
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In production, upload to server and get URL
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedTemplate({ ...selectedTemplate, logo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Invoice Customization</h2>
        <p className="text-gray-400 text-sm">Create custom invoice templates with your branding</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Template List */}
        <div className="lg:col-span-1">
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <h3 className="font-bold mb-4">Templates</h3>
            <div className="space-y-2">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => {
                    setSelectedTemplate(template);
                    setIsEditing(false);
                  }}
                  className={`w-full p-3 rounded-lg text-left transition ${
                    selectedTemplate.id === template.id
                      ? 'bg-cyan-500/20 border-2 border-cyan-500'
                      : 'bg-slate-700/50 hover:bg-slate-700'
                  }`}
                  data-testid={`button-template-${template.id}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="w-4 h-4" style={{ color: template.primaryColor }} />
                    <span className="font-bold text-sm">{template.name}</span>
                  </div>
                  <p className="text-xs text-gray-400">{template.paymentTerms}</p>
                </button>
              ))}
              
              <Button
                onClick={() => {
                  setSelectedTemplate({
                    id: `new-${Date.now()}`,
                    name: 'New Template',
                    primaryColor: '#06b6d4',
                    headerText: 'ORBIT Staffing OS',
                    footerText: 'Thank you for your business!',
                    paymentTerms: 'Net 30',
                    showItemizedBreakdown: true,
                    showTaxBreakdown: true,
                    showNotes: true,
                  });
                  setIsEditing(true);
                }}
                className="w-full bg-cyan-600 hover:bg-cyan-700 mt-2"
                data-testid="button-new-template"
              >
                + New Template
              </Button>
            </div>
          </div>
        </div>

        {/* Editor */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Template Editor</h3>
              <div className="flex gap-2">
                <Button
                  onClick={handlePreview}
                  className="bg-slate-600 hover:bg-slate-500"
                  data-testid="button-preview"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>
                {isEditing && (
                  <Button
                    onClick={handleSaveTemplate}
                    className="bg-cyan-600 hover:bg-cyan-700"
                    data-testid="button-save-template"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                )}
              </div>
            </div>

            {!isEditing ? (
              <Button
                onClick={() => setIsEditing(true)}
                className="w-full bg-purple-600 hover:bg-purple-700 mb-4"
                data-testid="button-edit-template"
              >
                Edit Template
              </Button>
            ) : null}

            <div className="space-y-4">
              {/* Template Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Template Name
                </label>
                <input
                  type="text"
                  value={selectedTemplate.name}
                  onChange={(e) => setSelectedTemplate({ ...selectedTemplate, name: e.target.value })}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-400 disabled:opacity-50"
                  data-testid="input-template-name"
                />
              </div>

              {/* Logo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Company Logo
                </label>
                <div className="flex items-center gap-4">
                  {selectedTemplate.logo && (
                    <img
                      src={selectedTemplate.logo}
                      alt="Logo preview"
                      className="w-24 h-24 object-contain bg-white rounded p-2"
                    />
                  )}
                  <label className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed rounded-lg transition ${
                    isEditing ? 'border-slate-600 hover:border-cyan-500 cursor-pointer' : 'border-slate-700 opacity-50'
                  }`}>
                    <Upload className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-400">
                      {selectedTemplate.logo ? 'Change Logo' : 'Upload Logo'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      disabled={!isEditing}
                      className="hidden"
                      data-testid="input-logo-upload"
                    />
                  </label>
                </div>
              </div>

              {/* Primary Color */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Primary Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={selectedTemplate.primaryColor}
                    onChange={(e) => setSelectedTemplate({ ...selectedTemplate, primaryColor: e.target.value })}
                    disabled={!isEditing}
                    className="w-16 h-10 rounded border border-slate-600 cursor-pointer disabled:opacity-50"
                    data-testid="input-primary-color"
                  />
                  <input
                    type="text"
                    value={selectedTemplate.primaryColor}
                    onChange={(e) => setSelectedTemplate({ ...selectedTemplate, primaryColor: e.target.value })}
                    disabled={!isEditing}
                    className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-400 disabled:opacity-50"
                    data-testid="input-color-hex"
                  />
                </div>
              </div>

              {/* Header Text */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Header Text
                </label>
                <input
                  type="text"
                  value={selectedTemplate.headerText}
                  onChange={(e) => setSelectedTemplate({ ...selectedTemplate, headerText: e.target.value })}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-400 disabled:opacity-50"
                  data-testid="input-header-text"
                />
              </div>

              {/* Footer Text */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Footer Text
                </label>
                <textarea
                  value={selectedTemplate.footerText}
                  onChange={(e) => setSelectedTemplate({ ...selectedTemplate, footerText: e.target.value })}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-400 disabled:opacity-50 resize-none h-20"
                  data-testid="textarea-footer-text"
                />
              </div>

              {/* Payment Terms */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Default Payment Terms
                </label>
                <select
                  value={selectedTemplate.paymentTerms}
                  onChange={(e) => setSelectedTemplate({ ...selectedTemplate, paymentTerms: e.target.value })}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-400 disabled:opacity-50"
                  data-testid="select-payment-terms"
                >
                  <option value="Due on Receipt">Due on Receipt</option>
                  <option value="Net 7">Net 7</option>
                  <option value="Net 15">Net 15</option>
                  <option value="Net 30">Net 30</option>
                  <option value="Net 60">Net 60</option>
                  <option value="Net 90">Net 90</option>
                </select>
              </div>

              {/* Display Options */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Display Options
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
                    <input
                      type="checkbox"
                      checked={selectedTemplate.showItemizedBreakdown}
                      onChange={(e) => setSelectedTemplate({ ...selectedTemplate, showItemizedBreakdown: e.target.checked })}
                      disabled={!isEditing}
                      className="w-5 h-5 rounded border-slate-600 text-cyan-500 focus:ring-cyan-500 disabled:opacity-50"
                      data-testid="checkbox-itemized"
                    />
                    <span className="text-sm">Show Itemized Line Items</span>
                  </label>
                  
                  <label className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
                    <input
                      type="checkbox"
                      checked={selectedTemplate.showTaxBreakdown}
                      onChange={(e) => setSelectedTemplate({ ...selectedTemplate, showTaxBreakdown: e.target.checked })}
                      disabled={!isEditing}
                      className="w-5 h-5 rounded border-slate-600 text-cyan-500 focus:ring-cyan-500 disabled:opacity-50"
                      data-testid="checkbox-tax"
                    />
                    <span className="text-sm">Show Tax Breakdown</span>
                  </label>
                  
                  <label className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
                    <input
                      type="checkbox"
                      checked={selectedTemplate.showNotes}
                      onChange={(e) => setSelectedTemplate({ ...selectedTemplate, showNotes: e.target.checked })}
                      disabled={!isEditing}
                      className="w-5 h-5 rounded border-slate-600 text-cyan-500 focus:ring-cyan-500 disabled:opacity-50"
                      data-testid="checkbox-notes"
                    />
                    <span className="text-sm">Show Notes Section</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
