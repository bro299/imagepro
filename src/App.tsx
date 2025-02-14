import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { 
  Image, 
  FileText, 
  Upload, 
  Download, 
  Sparkles, 
  Menu, 
  X,
  ChevronRight,
  Github,
  Instagram,
  MessageCircle,
  Wand2,
  ImageOff,
  Shuffle,
  Mail,
  Phone,
  MapPin,
  Heart,
  Twitter,
  Linkedin,
  Facebook
} from 'lucide-react';

interface ProcessingResult {
  url?: string;
  error?: string;
}

const FeatureCard = ({ icon: Icon, title, description }: { icon: any, title: string, description: string }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
    >
      <div className="flex items-center space-x-4">
        <div className="p-3 bg-blue-500 bg-opacity-20 rounded-lg">
          <Icon className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
          <p className="text-gray-400 text-sm">{description}</p>
        </div>
      </div>
    </motion.div>
  );
};

type Tool = 'bgremove' | 'airemini' | 'faceswap';

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState<Tool>('bgremove');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedTargetFile, setSelectedTargetFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [targetPreviewUrl, setTargetPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [uploadedTargetImageUrl, setUploadedTargetImageUrl] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, isTarget: boolean = false) => {
    const file = event.target.files?.[0];
    if (file) {
      if (isTarget) {
        setSelectedTargetFile(file);
        setTargetPreviewUrl(URL.createObjectURL(file));
      } else {
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
      }
      setResult(null);
    }
  };

  const handleDrop = (event: React.DragEvent, isTarget: boolean = false) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      if (isTarget) {
        setSelectedTargetFile(file);
        setTargetPreviewUrl(URL.createObjectURL(file));
      } else {
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
      }
      setResult(null);
    }
  };

  const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('https://fastrestapis.fasturl.cloud/downup/uploader-v2', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
    if (!data.result) {
      throw new Error('Upload failed');
    }
    return data.result;
  };

  const handleFaceSwap = async () => {
    if (!selectedFile || !selectedTargetFile) return;
    setIsProcessing(true);

    try {
      const originalUrl = await uploadImage(selectedFile);
      const targetUrl = await uploadImage(selectedTargetFile);

      const swapResponse = await fetch(
        `https://fastrestapis.fasturl.cloud/aiimage/faceswap?originalFace=${encodeURIComponent(originalUrl)}&targetFace=${encodeURIComponent(targetUrl)}`
      );

      const blob = await swapResponse.blob();
      const resultUrl = URL.createObjectURL(blob);
      setResult({ url: resultUrl });
    } catch (error) {
      setResult({ error: 'Face swap failed. Please try again.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUploadForRemini = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);

    try {
      const imageUrl = await uploadImage(selectedFile);
      setUploadedImageUrl(imageUrl);
      processWithAiRemini(imageUrl);
    } catch (error) {
      setResult({ error: 'Upload failed. Please try again.' });
      setIsProcessing(false);
    }
  };

  const processWithAiRemini = async (imageUrl: string) => {
    try {
      const response = await fetch(`https://api.ryzendesu.vip/api/ai/remini?url=${encodeURIComponent(imageUrl)}`);
      const blob = await response.blob();
      const resultUrl = URL.createObjectURL(blob);
      setResult({ url: resultUrl });
    } catch (error) {
      setResult({ error: 'AI Remini processing failed. Please try again.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveBackground = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('https://api.zpi.my.id/v1/utility/bg-remover/image', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      if (data.status === 200) {
        setResult({ url: data.data.bg_removed });
      } else {
        throw new Error(data.message || 'Failed to remove background');
      }
    } catch (error) {
      setResult({ error: 'Background removal failed. Please try again.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProcess = () => {
    switch (selectedTool) {
      case 'bgremove':
        handleRemoveBackground();
        break;
      case 'airemini':
        handleUploadForRemini();
        break;
      case 'faceswap':
        handleFaceSwap();
        break;
    }
  };

  const handleDownload = async () => {
    if (!result?.url) return;

    try {
      const response = await fetch(result.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `processed-image-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download image. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Enhanced Mobile Menu */}
      <div className="lg:hidden">
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="fixed top-4 right-4 z-50 p-2 bg-gray-800 rounded-lg"
        >
          {isMenuOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
        </button>

        <motion.div
          initial={false}
          animate={isMenuOpen ? { x: 0 } : { x: '100%' }}
          className="fixed inset-y-0 right-0 w-64 bg-gradient-to-b from-gray-900 to-gray-800 z-40 shadow-lg"
        >
          <motion.nav 
            className="flex flex-col space-y-4 p-6 mt-16"
            initial="closed"
            animate="open"
            variants={{
              closed: { opacity: 0 },
              open: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
          >
            {['Features', 'Tools', 'Contact'].map((item, index) => (
              <motion.a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-gray-300 hover:text-white transition-colors flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-800"
                variants={{
                  closed: { x: 20, opacity: 0 },
                  open: { x: 0, opacity: 1 }
                }}
                onClick={() => setIsMenuOpen(false)}
              >
                {index === 0 && <Sparkles className="w-5 h-5" />}
                {index === 1 && <Wand2 className="w-5 h-5" />}
                {index === 2 && <MessageCircle className="w-5 h-5" />}
                <span>{item}</span>
              </motion.a>
            ))}
          </motion.nav>

          <motion.div
            className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-gray-900 to-transparent"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex justify-center space-x-4">
              <a href="https://github.com/dandidandil" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <Github className="w-6 h-6" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="w-6 h-6" />
              </a>
              <a href="https://www.instagram.com/dandidandil" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="w-6 h-6" />
              </a>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Desktop Navigation */}
      <nav className="hidden lg:flex justify-between items-center px-8 py-6">
        <div className="text-2xl font-bold text-white">ImagePro</div>
        <div className="flex space-x-8">
          <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
          <a href="#tools" className="text-gray-300 hover:text-white transition-colors">Tools</a>
          <a href="#contact" className="text-gray-300 hover:text-white transition-colors">Contact</a>
        </div>
      </nav>

      {/* Landing Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 animate-gradient"></div>
        </div>
        
        <div className="relative z-10 max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
              Transform Your Images
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8">
              Professional image processing tools at your fingertips
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <motion.a
                href="#tools"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Get Started
                <ChevronRight className="inline-block ml-2 w-5 h-5" />
              </motion.a>
              <motion.a
                href="#features"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors"
              >
                Learn More
              </motion.a>
            </div>
          </motion.div>

          {/* Feature Cards */}
          <div className="mt-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
            <FeatureCard
              icon={ImageOff}
              title="Background Removal"
              description="Remove backgrounds from images with just one click using advanced AI"
            />
            <FeatureCard
              icon={Wand2}
              title="AI Enhancement"
              description="Enhance and restore images using cutting-edge AI technology"
            />
            <FeatureCard
              icon={Shuffle}
              title="Face Swap"
              description="Swap faces between two images with advanced AI technology"
            />
          </div>
        </div>
      </section>

      {/* Tool Selection */}
      <div id="tools" className="container mx-auto px-4 py-8">
        <div className="flex justify-center space-x-4 mb-8">
          <button
            onClick={() => setSelectedTool('bgremove')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              selectedTool === 'bgremove'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <ImageOff className="w-5 h-5 inline-block mr-2" />
            Remove Background
          </button>
          <button
            onClick={() => setSelectedTool('airemini')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              selectedTool === 'airemini'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Wand2 className="w-5 h-5 inline-block mr-2" />
            AI Remini
          </button>
          <button
            onClick={() => setSelectedTool('faceswap')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              selectedTool === 'faceswap'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Shuffle className="w-5 h-5 inline-block mr-2" />
            Face Swap
          </button>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="bg-gray-800 p-8 rounded-xl shadow-xl">
            {selectedTool === 'faceswap' ? (
              <div className="space-y-4">
                <div 
                  className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center transition-all duration-300 hover:border-blue-500"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, false)}
                >
                  <input
                    type="file"
                    onChange={(e) => handleFileChange(e, false)}
                    className="hidden"
                    id="originalFileInput"
                    accept="image/*"
                  />
                  <label
                    htmlFor="originalFileInput"
                    className="cursor-pointer"
                  >
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Original Preview"
                        className="max-h-48 mx-auto object-contain rounded-lg"
                      />
                    ) : (
                      <div className="flex flex-col items-center">
                        <Upload className="w-12 h-12 text-gray-400 mb-4" />
                        <p className="text-gray-400">Upload original face image</p>
                      </div>
                    )}
                  </label>
                </div>

                <div 
                  className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center transition-all duration-300 hover:border-blue-500"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, true)}
                >
                  <input
                    type="file"
                    onChange={(e) => handleFileChange(e, true)}
                    className="hidden"
                    id="targetFileInput"
                    accept="image/*"
                  />
                  <label
                    htmlFor="targetFileInput"
                    className="cursor-pointer"
                  >
                    {targetPreviewUrl ? (
                      <img
                        src={targetPreviewUrl}
                        alt="Target Preview"
                        className="max-h-48 mx-auto object-contain rounded-lg"
                      />
                    ) : (
                      <div className="flex flex-col items-center">
                        <Upload className="w-12 h-12 text-gray-400 mb-4" />
                        <p className="text-gray-400">Upload target face image</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            ) : (
              <div 
                className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center transition-all duration-300 hover:border-blue-500"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e)}
              >
                <input
                  type="file"
                  onChange={(e) => handleFileChange(e)}
                  className="hidden"
                  id="fileInput"
                  accept="image/*"
                />
                <label
                  htmlFor="fileInput"
                  className="cursor-pointer"
                >
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="max-h-64 mx-auto object-contain rounded-lg"
                    />
                  ) : (
                    <div className="flex flex-col items-center">
                      <Upload className="w-12 h-12 text-gray-400 mb-4" />
                      <p className="text-gray-400">Drag and drop or click to upload</p>
                    </div>
                  )}
                </label>
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleProcess}
              disabled={
                isProcessing || 
                (selectedTool === 'faceswap' ? (!selectedFile || !selectedTargetFile) : !selectedFile)
              }
              className={`w-full mt-6 py-3 rounded-lg font-medium flex items-center justify-center ${
                (selectedTool === 'faceswap' ? (selectedFile && selectedTargetFile) : selectedFile) && !isProcessing
                  ? 'bg-blue-500 hover:bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isProcessing ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  <span>Processing...</span>
                </div>
              ) : (
                <>
                  {selectedTool === 'bgremove' && (
                    <>
                      <ImageOff className="w-5 h-5 mr-2" />
                      Remove Background
                    </>
                  )}
                  {selectedTool === 'airemini' && (
                    <>
                      <Wand2 className="w-5 h-5 mr-2" />
                      Enhance with AI
                    </>
                  )}
                  {selectedTool === 'faceswap' && (
                    <>
                      <Shuffle className="w-5 h-5 mr-2" />
                      Swap Faces
                    </>
                  )}
                </>
              )}
            </motion.button>
          </div>

          {/* Result Section */}
          <div className="bg-gray-800 p-8 rounded-xl shadow-xl">
            <div className="border-2 border-gray-600 rounded-lg p-8 text-center min-h-[300px] flex items-center justify-center">
              {isProcessing ? (
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin-reverse" />
                    </div>
                  </div>
                  <p className="text-gray-400">Processing your image...</p>
                </div>
              ) : result?.url ? (
                <div className="w-full">
                  <img
                    src={result.url}
                    alt="Result"
                    className="max-h-64 mx-auto object-contain rounded-lg mb-4"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleDownload}
                    className="px-6 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
                  >
                    <Download className="w-5 h-5 inline-block mr-2" />
                    Download Result
                  </motion.button>
                </div>
              ) : result?.error ? (
                <div className="text-red-400">{result.error}</div>
              ) : (
                <div className="text-gray-400">
                  Processed image will appear here
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Footer */}
      <footer className="bg-gradient-to-b from-gray-900 to-gray-800 mt-20">
        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:py-16 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-white">ImagePro</h3>
              <p className="text-gray-400 text-sm">
                Transform your images with professional tools powered by cutting-edge AI technology.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Github className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="https://www.instagram.com/dandidandil" className="text-gray-400 hover:text-white transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#features" className="text-gray-400 hover:text-white transition-colors">Features</a>
                </li>
                <li>
                  <a href="#tools" className="text-gray-400 hover:text-white transition-colors">Tools</a>
                </li>
                <li>
                  <a href="#pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</a>
                </li>
                <li>
                  <a href="#blog" className="text-gray-400 hover:text-white transition-colors">Blog</a>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Contact Us</h4>
              <ul className="space-y-3">
                <li className="flex items-center space-x-3 text-gray-400">
                  <Mail className="w-5 h-5" />
                  <span>support@imagepro.com</span>
                </li>
                <li className="flex items-center space-x-3 text-gray-400">
                  <Phone className="w-5 h-5" />
                  <span>(+62) 8123-4567-1000</span>
                </li>
                <li className="flex items-center space-x-3 text-gray-400">
                  <MapPin className="w-5 h-5" />
                  <span>Jl Purworejo, Jawa Tengah</span>
                </li>
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Newsletter</h4>
              <p className="text-gray-400 mb-4">Stay updated with our latest features and releases.</p>
              <form className="space-y-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                />
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white transition-colors"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-800">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">
                © 2025 ImagePro. All rights reserved.
              </p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy Policy</a>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Terms of Service</a>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Cookie Policy</a>
              </div>
            </div>
            <div className="mt-4 text-center text-gray-400 text-sm">
              <p>Made with <Heart className="w-4 h-4 inline text-red-500" /> by Dandidandil</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;