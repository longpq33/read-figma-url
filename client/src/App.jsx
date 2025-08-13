import React, { useState } from 'react';
import { Figma, Download, Code, Eye, CheckCircle, AlertCircle, Loader, FileCode, Copy, Check } from 'lucide-react';
import axios from 'axios';

function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [figmaUrl, setFigmaUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [figmaData, setFigmaData] = useState(null);
  const [generatedComponents, setGeneratedComponents] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedComponent, setCopiedComponent] = useState(null);

  const steps = [
    { id: 1, name: 'Nhập Figma URL', icon: Figma },
    { id: 2, name: 'Chọn Components', icon: Eye },
    { id: 3, name: 'Tạo Code', icon: Code },
    { id: 4, name: 'Tải xuống', icon: Download }
  ];

  const handleParseFigma = async () => {
    if (!figmaUrl.trim()) {
      setError('Vui lòng nhập Figma URL');
      return;
    }

    if (!figmaUrl.includes('figma.com/')) {
      setError('URL Figma không hợp lệ. URL phải có dạng: https://www.figma.com/...');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post('/api/figma/parse', { figmaUrl });
      
      if (response.data.success) {
        setSuccess(`Đã parse thành công file: ${response.data.fileName}`);
        setFigmaData(response.data);
        setTimeout(() => {
          setCurrentStep(2);
        }, 1000);
      } else {
        setError(response.data.error || 'Có lỗi xảy ra khi parse Figma file');
      }
    } catch (err) {
      console.error('Error parsing Figma:', err);
      setError(err.response?.data?.error || 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateComponents = async () => {
    if (!figmaData || !figmaData.components.length) {
      setError('Không có components để tạo');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      const response = await axios.post('/api/figma/generate', { 
        components: figmaData.components 
      });
      
      if (response.data.success) {
        setGeneratedComponents(response.data.generatedFiles);
        setSuccess(`Đã tạo thành công ${response.data.generatedFiles.length} React components!`);
        setTimeout(() => {
          setCurrentStep(4);
        }, 1000);
      } else {
        setError(response.data.error || 'Có lỗi xảy ra khi tạo components');
      }
    } catch (err) {
      console.error('Error generating components:', err);
      setError(err.response?.data?.error || 'Không thể kết nối đến server.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (componentCode, componentName) => {
    try {
      await navigator.clipboard.writeText(componentCode);
      setCopiedComponent(componentName);
      setTimeout(() => setCopiedComponent(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const resetApp = () => {
    setCurrentStep(1);
    setFigmaUrl('');
    setFigmaData(null);
    setGeneratedComponents([]);
    setError('');
    setSuccess('');
    setCopiedComponent(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="figma-gradient text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Figma className="h-8 w-8" />
              <h1 className="text-2xl font-bold">Read Figma</h1>
            </div>
            <p className="text-sm opacity-90">Tạo React Components từ Figma Design</p>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center space-x-8 mb-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            
            return (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 ${
                  isCompleted 
                    ? 'bg-green-500 border-green-500 text-white' 
                    : isActive 
                    ? 'bg-blue-500 border-blue-500 text-white' 
                    : 'bg-gray-200 border-gray-300 text-gray-500'
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="h-6 w-6" />
                  ) : (
                    <Icon className="h-6 w-6" />
                  )}
                </div>
                <span className={`ml-3 text-sm font-medium ${
                  isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {step.name}
                </span>
                {index < steps.length - 1 && (
                  <div className={`ml-8 w-16 h-0.5 ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {currentStep === 1 && (
            <div className="text-center">
              <div className="mb-8">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Figma className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Nhập Figma Design URL
                </h2>
                <p className="text-gray-600 text-lg">
                  Dán link Figma vào đây để bắt đầu tạo React components
                </p>
              </div>

              <div className="max-w-2xl mx-auto">
                <input
                  type="url"
                  value={figmaUrl}
                  onChange={(e) => setFigmaUrl(e.target.value)}
                  placeholder="https://www.figma.com/design/..."
                  className="input-field text-lg mb-6"
                  disabled={isLoading}
                />
                
                {error && (
                  <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg mb-4">
                    <AlertCircle className="h-5 w-5" />
                    <span>{error}</span>
                  </div>
                )}

                {success && (
                  <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-lg mb-4">
                    <CheckCircle className="h-5 w-5" />
                    <span>{success}</span>
                  </div>
                )}
                
                <button 
                  onClick={handleParseFigma}
                  disabled={isLoading || !figmaUrl.trim()}
                  className="btn-primary text-lg py-3 px-8 w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <Loader className="h-5 w-5 animate-spin" />
                      <span>Đang parse Figma...</span>
                    </div>
                  ) : (
                    'Parse Figma Design'
                  )}
                </button>
              </div>
            </div>
          )}

          {currentStep === 2 && figmaData && (
            <div className="text-center">
              <div className="mb-6">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Parse thành công!
                </h2>
                <p className="text-gray-600">
                  File: {figmaData.fileName} - {figmaData.components.length} components
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Components tìm thấy:
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {figmaData.components.map((component, index) => (
                    <div key={component.id} className="flex items-center justify-between bg-white p-3 rounded border">
                      <span className="font-medium">{component.name}</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        component.type === 'COMPONENT' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {component.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex space-x-4 justify-center">
                <button
                  onClick={resetApp}
                  className="btn-secondary"
                >
                  Quay lại
                </button>
                <button
                  onClick={() => setCurrentStep(3)}
                  className="btn-primary"
                >
                  Tiếp tục
                </button>
              </div>
            </div>
          )}

          {currentStep === 3 && figmaData && (
            <div className="text-center">
              <div className="mb-6">
                <Code className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Tạo React Components
                </h2>
                <p className="text-gray-600">
                  Chọn components để tạo React code
                </p>
              </div>

              {error && (
                <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg mb-4">
                  <AlertCircle className="h-5 w-5" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-lg mb-4">
                  <CheckCircle className="h-5 w-5" />
                  <span>{success}</span>
                </div>
              )}
              
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Components sẽ được tạo:
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                  {figmaData.components.map((component) => (
                    <div key={component.id} className="flex items-center space-x-3 bg-white p-3 rounded border">
                      <FileCode className="h-5 w-5 text-blue-500" />
                      <span className="font-medium">{component.name}</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        component.type === 'COMPONENT' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {component.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex space-x-4 justify-center">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="btn-secondary"
                >
                  Quay lại
                </button>
                <button
                  onClick={handleGenerateComponents}
                  disabled={isGenerating}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <div className="flex items-center space-x-2">
                      <Loader className="h-5 w-5 animate-spin" />
                      <span>Đang tạo components...</span>
                    </div>
                  ) : (
                    'Tạo React Components'
                  )}
                </button>
              </div>
            </div>
          )}

          {currentStep === 4 && generatedComponents.length > 0 && (
            <div className="text-center">
              <div className="mb-6">
                <Download className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Hoàn thành!
                </h2>
                <p className="text-gray-600">
                  Đã tạo {generatedComponents.length} React components
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Components đã tạo:
                </h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {generatedComponents.map((component, index) => (
                    <div key={index} className="bg-white p-4 rounded border">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <FileCode className="h-5 w-5 text-blue-500" />
                          <span className="font-medium">{component.name}</span>
                        </div>
                        <button
                          onClick={() => copyToClipboard(component.code, component.name)}
                          className="flex items-center space-x-2 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                        >
                          {copiedComponent === component.name ? (
                            <>
                              <Check className="h-4 w-4" />
                              <span>Đã copy!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                      <div className="bg-gray-900 text-green-400 p-3 rounded text-sm font-mono overflow-x-auto">
                        <pre className="whitespace-pre-wrap">{component.code}</pre>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <button
                onClick={resetApp}
                className="btn-primary"
              >
                Tạo mới
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            © 2024 Read Figma. Dự án mã nguồn mở để tạo React components từ Figma design.
        </p>
      </div>
      </footer>
    </div>
  );
}

export default App;
