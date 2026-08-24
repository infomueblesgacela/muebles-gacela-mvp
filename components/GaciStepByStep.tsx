
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Bot, ChevronLeft, Timer, HardHat, Hammer, Hexagon, Droplet, Wrench, ArrowRight, Check, AlertTriangle, Crown, Sparkles, BookOpen } from 'lucide-react';
import ImageViewer from './ImageViewer';
import VideoViewer from './VideoViewer';
import PieceViewer3D from './PieceViewer3D';
import confetti from 'canvas-confetti';
import { sendEmail } from '../utils/email';

const LucideIcons: { [key: string]: React.ComponentType<any> } = {
  Hammer: Hammer,
  Wrench: Wrench,
  Hexagon: Hexagon,
  Droplet: Droplet,
  BookOpen: BookOpen,
};

interface GaciStepByStepProps {
  product: {
    title: string;
    assemblyTime: string;
    difficulty: string;
    assemblyTools: { name: string; icon: string; included: boolean }[];
    sku?: string;
    id?: string | number;
    manualPdf?: string;
    linea?: string;
    specs?: { label: string; value: string }[];
  };
  onBackToPdp: () => void;
  onBackToHome: () => void; // New prop for navigating to home
}

type GaciView = 'welcome' | 'tools' | 'step1' | 'step2' | 'step3' | 'step4'; // Add step4

// Helper function to dynamically map SKU to folder path and Linea folder name
const getFolderAndLine = (product: any) => {
  let lineFolder = 'linea-clasica';
  const specLinea = product.specs?.find((s: any) => s.label === 'Línea')?.value || product.linea;
  if (specLinea) {
    const normalized = specLinea
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-');
    lineFolder = normalized.startsWith('linea-') ? normalized : `linea-${normalized}`;
  } else if (product.manualPdf) {
    const parts = product.manualPdf.split('/');
    const linePart = parts.find((p: string) => p.startsWith('linea-'));
    if (linePart) {
      lineFolder = linePart.toLowerCase();
    }
  }

  let folderName = '';
  if (product.manualPdf) {
    const filename = product.manualPdf.split('/').pop() || '';
    const match = filename.match(/^(a\d{6})/i);
    if (match) {
      folderName = match[1].toUpperCase();
    }
  }

  if (!folderName) {
    const skuStr = String(product.sku || product.id || '');
    const digits = skuStr.replace(/\D/g, '');
    if (digits) {
      folderName = 'A' + digits.padStart(6, '0');
    } else {
      folderName = 'A008395';
    }
  }

  // Handle Comedores mapping
  if (['557', '557-1', '557-2', '429090', '429091', '427091'].includes(String(product.sku || product.id))) {
    lineFolder = 'linea-comedores';
  }

  return { lineFolder, folderName };
};

const matchHardwareFile = (herrName: string, filesList: string[]) => {
  if (!filesList || filesList.length === 0) return '';
  
  const normalize = (str: string) => {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // remove accents
      .replace(/[^a-z0-9]/g, ' ') // replace non-alphanumeric with spaces
      .trim();
  };

  const stopWords = new Set(['de', 'con', 'la', 'el', 'un', 'para', 'por', 'del', 'los', 'las', 'un', 'una', 'en', 'y']);
  const nameNorm = normalize(herrName);
  const nameWords = nameNorm.split(/\s+/).filter(w => w.length > 0 && !stopWords.has(w));

  let bestFile = '';
  let bestScore = 0;

  for (const file of filesList) {
    const fileNorm = normalize(file.replace(/\.[^/.]+$/, "")); // remove extension and normalize
    const fileWords = fileNorm.split(/\s+/).filter(w => w.length > 0 && !stopWords.has(w));

    let score = 0;
    for (const fw of fileWords) {
      const stemFw = fw.endsWith('s') && fw.length > 3 ? fw.slice(0, -1) : fw;
      
      const isMatch = nameWords.some(nw => {
        const stemNw = nw.endsWith('s') && nw.length > 3 ? nw.slice(0, -1) : nw;
        return stemFw === stemNw || nw.includes(fw) || fw.includes(nw);
      });

      if (isMatch) {
        score += 2;
      }
    }

    // Special dimensional equivalences, e.g., "4 cm" vs "40"
    const has4 = nameNorm.includes('4 cm') || nameNorm.includes('40 mm') || nameNorm.includes(' 4 ');
    const fileHas40 = fileNorm.includes('40') || fileNorm.includes(' 4 ');
    if (has4 && fileHas40 && fileNorm.includes('tornillo')) {
      score += 5;
    }

    const has2 = nameNorm.includes('2 cm') || nameNorm.includes('20 mm') || nameNorm.includes(' 2 ');
    const fileHas20 = fileNorm.includes('20') || fileNorm.includes(' 2 ') || fileNorm.includes('-2');
    if (has2 && fileHas20 && fileNorm.includes('tornillo')) {
      score += 5;
    }

    const has5 = nameNorm.includes('5 cm') || nameNorm.includes('50 mm') || nameNorm.includes(' 5 ');
    const fileHas50 = fileNorm.includes('50') || fileNorm.includes(' 5 ') || fileNorm.includes('-5');
    if (has5 && fileHas50 && fileNorm.includes('tornillo')) {
      score += 5;
    }

    // Penalize support mismatch for pipes (e.g. Caño shouldn't match soporte-de-canos.webp)
    if (fileNorm.includes('soporte') && !nameNorm.includes('soporte')) {
      score -= 8;
    }

    // Number mismatch penalty (e.g. tornillo 2 cm shouldn't match tornillo-2-5.webp)
    const numbersInFile = fileNorm.match(/\d+/g) || [];
    for (const num of numbersInFile) {
      const nameHasNum = nameWords.some(nw => {
        return nw === num || 
               (num === '40' && nw === '4') || 
               (num === '20' && nw === '2') || 
               (num === '50' && nw === '5') || 
               (num === '15' && nw === '1') || 
               (num === '25' && nw === '2') ||
               (num === '350' && nw === '35') ||
               (num === '35' && nw === '350');
      });
      if (!nameHasNum) {
        score -= 6;
      }
    }

    // Semantic checks
    if (nameNorm.includes('cola') && fileNorm.includes('cola')) score += 10;
    if (nameNorm.includes('tarugo') && fileNorm.includes('tarugo')) score += 10;
    if ((nameNorm.includes('minifix') || nameNorm.includes('mini fix') || nameNorm.includes('perno')) && (fileNorm.includes('minifix') || fileNorm.includes('mini fix') || fileNorm.includes('perno'))) score += 10;
    if (nameNorm.includes('escuadra') && fileNorm.includes('escuadra')) score += 10;
    if (nameNorm.includes('guia') && fileNorm.includes('guia')) score += 10;
    if (nameNorm.includes('base') && fileNorm.includes('base')) score += 10;
    if (nameNorm.includes('clavo') && fileNorm.includes('clavo')) score += 10;
    if (nameNorm.includes('varianta') && fileNorm.includes('varianta')) score += 10;
    if (nameNorm.includes('cano') && fileNorm.includes('cano')) score += 12;

    // Allen/Philips interchangeability boost
    if ((nameNorm.includes('allen') || nameNorm.includes('philips') || nameNorm.includes('7x50') || nameNorm.includes('7 x 50') || nameNorm.includes('50 mm') || nameNorm.includes('50mm')) && fileNorm.includes('allen')) {
      score += 8;
    }

    // Clavar/clavo boost
    if ((nameNorm.includes('clava') || nameNorm.includes('clavo')) && (fileNorm.includes('clava') || fileNorm.includes('clavo'))) {
      score += 10;
    }

    if (score > bestScore) {
      bestScore = score;
      bestFile = file;
    }
  }

  return bestScore > 1 ? bestFile : '';
};

const matchPieceFile = (pieceName: string, filesList: string[]) => {
  if (!filesList || filesList.length === 0) return '';

  const normalize = (str: string) => {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // remove accents
      .replace(/[^a-z0-9]/g, ' ') // replace punctuation/dashes/underscores with spaces
      .trim();
  };

  const nameNorm = normalize(pieceName);
  const nameWords = nameNorm.split(/\s+/).filter(w => w.length > 0);

  let bestFile = '';
  let bestScore = 0;

  for (const file of filesList) {
    const fileNorm = normalize(file.replace(/\.[^/.]+$/, "")); // remove extension and normalize
    const fileWords = fileNorm.split(/\s+/).filter(w => w.length > 0);

    let score = 0;
    for (const fw of fileWords) {
      const stemFw = fw.endsWith('s') && fw.length > 3 ? fw.slice(0, -1) : fw;

      const isMatch = nameWords.some(nw => {
        const stemNw = nw.endsWith('s') && nw.length > 3 ? nw.slice(0, -1) : nw;
        return stemFw === stemNw || nw.includes(fw) || fw.includes(nw);
      });

      if (isMatch) {
        score += 2;
      }
    }

    // Boost exact matches of key parts (left/right, front/back)
    const isLeft = nameNorm.includes('izquierdo') || nameNorm.includes('izq');
    const fileIsLeft = fileNorm.includes('izquierdo') || fileNorm.includes('izq') || fileNorm.includes(' c ');
    if (isLeft === fileIsLeft) {
      score += 3;
    } else {
      score -= 3; // mismatch penalty
    }

    const isRight = nameNorm.includes('derecho') || nameNorm.includes('der');
    const fileIsRight = fileNorm.includes('derecho') || fileNorm.includes('der') || fileNorm.includes(' d ');
    if (isRight === fileIsRight) {
      score += 3;
    } else {
      score -= 3;
    }

    const isFront = nameNorm.includes('delantero') || nameNorm.includes('frente');
    const fileIsFront = fileNorm.includes('delantero') || fileNorm.includes('frente') || fileNorm.includes(' s ');
    if (isFront === fileIsFront) {
      score += 3;
    }

    const isBack = nameNorm.includes('trasero') || nameNorm.includes('atras');
    const fileIsBack = fileNorm.includes('trasero') || fileNorm.includes('atras') || fileNorm.includes(' u ');
    if (isBack === fileIsBack) {
      score += 3;
    }

    // Letter matching
    const nameLetter = nameWords.find(w => w.length === 1);
    if (nameLetter) {
      if (fileWords.includes(nameLetter)) {
        score += 8;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestFile = file;
    }
  }

  return bestScore > 1 ? bestFile : '';
};

const GaciStepByStep: React.FC<GaciStepByStepProps> = ({ product, onBackToPdp, onBackToHome }) => {
  const [currentView, setCurrentView] = useState<GaciView>('welcome');
  const [userName, setUserName] = useState<string>(''); // Nuevo estado para el nombre del usuario

  const [currentAssemblyStepIndex, setCurrentAssemblyStepIndex] = useState<number>(0);
  const [guideData, setGuideData] = useState<any>(null);
  const [manifestData, setManifestData] = useState<any>(null);
  const [completedSteps, setCompletedSteps] = useState<boolean[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [checklistItems, setChecklistItems] = useState<any[]>([]);
  const [hardwareChecklistItems, setHardwareChecklistItems] = useState<any[]>([]);

  useEffect(() => {
    const loadGuide = async () => {
      const { lineFolder, folderName } = getFolderAndLine(product);
      setLoading(true);
      try {
        const resJson = await fetch(`/modelos_3d/${lineFolder}/${folderName}/data/${folderName}.json`);
        const resManifest = await fetch(`/modelos_3d/${lineFolder}/${folderName}/manifest.json`);
        
        if (resJson.ok && resManifest.ok) {
          const data = await resJson.json();
          const manifest = await resManifest.json();
          setGuideData(data);
          setManifestData(manifest);
          setCompletedSteps(new Array(data.pasos.length).fill(false));

          // Map pieces checklist
          const mappedPieces = data.piezas_despiece.articulos.map((art: any, idx: number) => {
            const letra = art.letra || 'S/L';
            const item = art.item || '';
            const combinedName = letra !== 'S/L' ? `${item} ${letra}` : item;
            
            const matchedModelFile = matchPieceFile(combinedName, manifest.files_3d);
            const modelUrlTarget = matchedModelFile ? `/modelos_3d/${lineFolder}/${folderName}/3d/${matchedModelFile}` : '';

            return {
              id: letra !== 'S/L' ? letra : `SL-${idx}`,
              label: letra !== 'S/L' ? `${item} (Letra ${letra})` : `${item} (Sin Letra)`,
              checked: false,
              dimensions: art.medidas || undefined,
              modelUrl: modelUrlTarget
            };
          });
          setChecklistItems(mappedPieces);

          // Map hardware checklist
          const mappedHardware = data.herrajes.map((herr: any, idx: number) => {
            const item = herr.item || '';
            const matchedImgFile = matchHardwareFile(item, manifest.files_herrajes);
            const finalImgPath = matchedImgFile ? `/modelos_3d/${lineFolder}/${folderName}/herrajes/${matchedImgFile}` : '';

            return {
              id: `herr-${idx}`,
              label: `${herr.item} (${herr.cantidad} u.)`,
              description: '',
              checked: false,
              imageUrl: finalImgPath
            };
          });
          setHardwareChecklistItems(mappedHardware);
        }
      } catch (error) {
        console.error("Error loading assembly guide JSON dynamically:", error);
      } finally {
        setLoading(false);
      }
    };
    loadGuide();
  }, [product]);

  const getPieceForName = (pieceName: string) => {
    return checklistItems.find((p: any) => {
      const words = pieceName.split(' ');
      const lastWord = words[words.length - 1]; // e.g. "D" or "E"
      if (lastWord.length === 1 && p.id === lastWord) {
        return true;
      }
      const pName = p.label.split(' (')[0].toLowerCase();
      const searchName = pieceName.toLowerCase();
      return pName.includes(searchName) || searchName.includes(pName);
    });
  };

  const getHardwareImageUrl = (herrName: string) => {
    if (!manifestData) return '';
    const { lineFolder, folderName } = getFolderAndLine(product);
    const matchedFile = matchHardwareFile(herrName, manifestData.files_herrajes);
    return matchedFile ? `/modelos_3d/${lineFolder}/${folderName}/herrajes/${matchedFile}` : '';
  };

  const getStepImageUrl = (stepIdx: number) => {
    if (!manifestData) return '';
    const { lineFolder, folderName } = getFolderAndLine(product);
    const stepNum = stepIdx + 1;
    const paddedNum = String(stepNum).padStart(2, '0');
    
    const matchedFile = manifestData.files_pasos.find((file: string) => {
      const lowerF = file.toLowerCase();
      return lowerF.includes(`paso_${paddedNum}`) ||
             lowerF.includes(`paso${paddedNum}`) ||
             lowerF.includes(`paso_${stepNum}`) ||
             (lowerF.includes('paso') && lowerF.includes(String(stepNum)));
    }) || `paso_${paddedNum}.webp`;

    return `/modelos_3d/${lineFolder}/${folderName}/pasos/${matchedFile}`;
  };

  const [step3ChecklistItems, setStep3ChecklistItems] = useState([
    { id: 'pernos_c_d', label: 'Atornillá 2 pernos mini fix en cada pieza (C y D).', checked: false, videoUrl: 'https://youtu.be/uq2onhSMbOY?si=bqcTseh57_1bV3ek&t=77' },
    { id: 'guias_c_d', label: 'Atornillá 2 guías en cada lateral usando los tornillos Varianta.', checked: false, videoUrl: 'https://www.w3schools.com/html/movie.mp4' },
    { id: 'cajas_c_d', label: 'Colocá a presión 2 cajas para mini fix en los agujeros grandes de cada pieza.', checked: false, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
  ]);

  const [feedbackFormData, setFeedbackFormData] = useState({ name: '', email: '', comments: '' });
  const [feedbackStatus, setFeedbackStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [viewerImageUrl, setViewerImageUrl] = useState<string | null>(null);
  const [isVideoViewerOpen, setIsVideoViewerOpen] = useState(false); // New state for video viewer
  const [viewerVideoUrl, setViewerVideoUrl] = useState<string | null>(null); // New state for video URL

  // Estado para el visor 3D
  const [is3DViewerOpen, setIs3DViewerOpen] = useState(false);
  const [selectedPiece3D, setSelectedPiece3D] = useState<{ name: string, dimensions: string, modelUrl?: string, finishes?: string[] } | null>(null);


  const allChecked = checklistItems.every(item => item.checked);
  const allHardwareChecked = hardwareChecklistItems.every(item => item.checked);
  const allStep3Checked = step3ChecklistItems.every(item => item.checked);

  const handleStartAssemblyClick = () => {
    if (userName.trim() !== '') {
      setCurrentView('tools');
    }
  };

  const handleToolsReadyClick = () => {
    setCurrentView('step1'); // Transiciona a la vista del paso 1
  };

  const handleNextStepClick = () => {
    if (currentView === 'step1' && allChecked) {
      setCurrentView('step2');
      console.log("¡Todo identificado! Vamos a los herrajes. Pasando al paso 2...");
    } else if (currentView === 'step2' && allHardwareChecked) {
      setCurrentView('step3'); // Transiciona a la vista del paso 3
      setCurrentAssemblyStepIndex(0); // Reset to first step
      console.log("¡Tengo todo! Empecemos a armar. Pasando al paso 3...");
    } else if (currentView === 'step3') {
      if (guideData) {
        if (currentAssemblyStepIndex < guideData.pasos.length - 1) {
          setCurrentAssemblyStepIndex(currentAssemblyStepIndex + 1);
          console.log(`Paso ${currentAssemblyStepIndex + 1} listo. Pasando al paso ${currentAssemblyStepIndex + 2}...`);
        } else {
          setCurrentView('step4'); // Finalizado!
          console.log("¡Armado finalizado! Pasando al paso 4...");
        }
      } else {
        if (allStep3Checked) {
          setCurrentView('step4'); // Transiciona a la vista del paso 4
          console.log("Laterales listos, ¡sigamos! Pasando al paso 4...");
        }
      }
    }
  };

  const handleCheckboxChange = (id: string) => {
    setChecklistItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const handleHardwareCheckboxChange = (id: string) => {
    setHardwareChecklistItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const handleStep3CheckboxChange = (id: string) => {
    setStep3ChecklistItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const handleFeedbackFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFeedbackFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackStatus('sending');
    try {
      await sendEmail({
        subject:    `Feedback Armado Guiado - ${product.title}`,
        from_name:  feedbackFormData.name,
        from_email: feedbackFormData.email,
        message:    `FEEDBACK DE ARMADO GUIADO\n\nProducto: ${product.title}\nNombre: ${feedbackFormData.name}\nEmail: ${feedbackFormData.email}\n\nObservaciones:\n${feedbackFormData.comments}`,
      }, false, true);
      setFeedbackStatus('success');
      setFeedbackFormData({ name: '', email: '', comments: '' });
      setTimeout(() => setFeedbackStatus('idle'), 4000);
    } catch (err) {
      console.error('[GaciStepByStep] Error al enviar feedback:', err);
      setFeedbackStatus('error');
      setTimeout(() => setFeedbackStatus('idle'), 4000);
    }
  };

  const openImageViewer = (url: string) => {
    setViewerImageUrl(url);
    setIsImageViewerOpen(true);
  };

  const closeImageViewer = () => {
    setIsImageViewerOpen(false);
    setViewerImageUrl(null);
  };

  const openVideoViewer = (url: string) => { // New function to open video viewer
    setViewerVideoUrl(url);
    setIsVideoViewerOpen(true);
  };

  const closeVideoViewer = () => { // New function to close video viewer
    setIsVideoViewerOpen(false);
    setViewerVideoUrl(null);
  };

  const openPieceViewer3D = (name: string, dims: string, modelUrl?: string, finishes?: string[]) => {
    setSelectedPiece3D({ name, dimensions: dims, modelUrl, finishes });
    setIs3DViewerOpen(true);
  };

  const closePieceViewer3D = () => {
    setIs3DViewerOpen(false);
    setSelectedPiece3D(null);
  };

  const handleGlobalBackClick = () => {
    if (currentView === 'step4') {
      setCurrentView('step3'); // De step4 a step3
      if (guideData) {
        setCurrentAssemblyStepIndex(guideData.pasos.length - 1);
      }
    } else if (currentView === 'step3') {
      if (guideData && currentAssemblyStepIndex > 0) {
        setCurrentAssemblyStepIndex(currentAssemblyStepIndex - 1);
      } else {
        setCurrentView('step2'); // De step3 a step2
      }
    } else if (currentView === 'step2') {
      setCurrentView('step1'); // De step1 a step2
    } else if (currentView === 'step1') {
      setCurrentView('tools'); // De step1 a tools
    } else if (currentView === 'tools') { // Si estamos en tools, volvemos a welcome para que pueda cambiar el nombre
      setCurrentView('welcome');
    } else {
      onBackToPdp(); // Por defecto, volver a la PDP
    }
  };

  // Lógica para determinar el estado y texto del botón "Siguiente"
  let isNextButtonDisabled = true;
  let nextButtonText = "Siguiente";
  let nextButtonIcon: React.ReactElement = <ArrowRight size={24} className="ml-2" />;

  if (currentView === 'step1') {
    isNextButtonDisabled = !allChecked;
    nextButtonText = allChecked ? "¡Todo identificado! Vamos a los herrajes" : "Identificá todas las piezas para continuar";
    nextButtonIcon = allChecked ? <Check size={24} className="mr-2" /> : <ArrowRight size={24} className="mr-2 opacity-40" />;
  } else if (currentView === 'step2') {
    isNextButtonDisabled = !allHardwareChecked;
    nextButtonText = allHardwareChecked ? "¡Tengo todo! Empecemos a armar" : "Verificá todos los herrajes para continuar";
    nextButtonIcon = allHardwareChecked ? <Check size={24} className="mr-2" /> : <ArrowRight size={24} className="mr-2 opacity-40" />;
  } else if (currentView === 'step3') {
    if (guideData) {
      isNextButtonDisabled = false;
      const isLastStep = currentAssemblyStepIndex === guideData.pasos.length - 1;
      nextButtonText = isLastStep ? "¡Mueble terminado! Ver resultado" : `Paso ${currentAssemblyStepIndex + 1} listo, ¡sigamos!`;
      nextButtonIcon = <Check size={24} className="mr-2" />;
    } else {
      isNextButtonDisabled = !allStep3Checked;
      nextButtonText = allStep3Checked ? "Laterales listos, ¡sigamos!" : "Completá los pasos para continuar";
      nextButtonIcon = allStep3Checked ? <Check size={24} className="mr-2" /> : <ArrowRight size={24} className="mr-2 opacity-40" />;
    }
  } else if (currentView === 'step4') {
    // En el paso 4, el botón "Siguiente" ya no es relevante en el flujo de armado.
    // Podríamos ocultarlo o cambiar su función, pero la petición solo aplica a los steps 1-3 para 'Siguiente'.
    // Para el step 4, los botones finales son "Dejanos tu reseña" y "Mirá todos nuestros productos".
    // Por lo tanto, el botón flotante general de "Siguiente" no debería mostrarse en step 4.
  }

  // Confetti effect for Step 4
  useEffect(() => {
    if (currentView === 'step4') {
      const duration = 5 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const randomInRange = (min: number, max: number) => {
        return Math.random() * (max - min) + min;
      };

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          colors: ['#D2B48C', '#5F6C5C', '#F8F5F1'] // Wood, Dark Green, Brand BG
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          colors: ['#D2B48C', '#5F6C5C', '#F8F5F1']
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [currentView]);

  // Scroll to top on view or step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView, currentAssemblyStepIndex]);



  return (
    <div className="bg-brand-bg min-h-screen flex flex-col items-center py-16 px-6 relative overflow-hidden">
      {/* Botón de Volver */}
      <motion.button
        onClick={handleGlobalBackClick}
        className="absolute top-8 left-8 flex items-center text-brand-primary hover:text-brand-primary transition-colors text-sm font-semibold group z-30"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <ChevronLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" />
        {currentView === 'step4' ? 'Volver al Paso 3' : currentView === 'step3' ? 'Volver al Paso 2' : currentView === 'step2' ? 'Volver al Paso 1' : currentView === 'step1' ? 'Volver a Herramientas' : currentView === 'tools' ? 'Volver a Bienvenida' : 'Volver al Producto'}
      </motion.button>

      <AnimatePresence mode="wait">
        {currentView === 'welcome' && (
          <motion.div
            key="welcome-view"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="max-w-3xl text-center z-10 flex flex-col justify-center min-h-[calc(100vh-8rem)]" // Centra verticalmente el contenido
          >
            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-extralight leading-tight text-brand-primary mb-8"
            >
              Hola, vamos a armar tu <span className="font-medium text-brand-primary">{product.title}</span> juntos. ¿Me puedes decir tu nombre?
            </h1>

            <div className="relative w-full">
              <motion.div
                key="name-input-section"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center"
              >
                <motion.input
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  type="text"
                  placeholder="Tu nombre"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="mb-8 w-full max-w-sm p-4 bg-white border border-gray-300 rounded-xl text-lg text-center focus:outline-none focus:ring-2 focus:ring-brand-dark-green/50 shadow-md"
                  aria-label="Introduce tu nombre"
                />

                <div className="flex flex-col sm:flex-row justify-center items-center gap-6 mb-12">
                  <div className="flex items-center text-lg text-gray-700 font-light">
                    <Timer size={20} className="mr-2 text-brand-primary opacity-70" />
                    Tiempo estimado: <span className="font-semibold ml-1">{guideData ? `${guideData.metadata.tiempo_min} minutos` : product.assemblyTime}</span>
                  </div>
                  <div className="flex items-center text-lg text-gray-700 font-light">
                    <HardHat size={20} className="mr-2 text-brand-primary opacity-70" />
                    Nivel: <span className="font-semibold ml-1">{guideData ? guideData.metadata.dificultad : product.difficulty}</span>
                  </div>
                </div>

                <motion.button
                  onClick={handleStartAssemblyClick}
                  disabled={userName.trim() === ''}
                  className={`inline-flex items-center justify-center px-10 py-4 rounded-md text-lg font-bold uppercase tracking-widest shadow-xl group transition-all duration-300 ${userName.trim() === ''
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-brand-support text-brand-bg hover:bg-brand-support-hover'
                    }`}
                >
                  <Play size={24} className="mr-3 group-hover:scale-110 transition-transform" />
                  Comenzar Armado
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        )}

        {currentView === 'tools' && (
          <motion.div
            key="tools-view"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="max-w-4xl w-full text-center z-10 flex flex-col justify-center items-center min-h-[calc(100vh-8rem)]"
          >
            <h1 className="text-3xl md:text-5xl font-extralight leading-tight text-brand-primary mb-10 font-serif">
              ¡Hola <span className="font-medium text-brand-primary">{userName}!</span> Soy Gaci. Vamos a armar tu <span className="font-medium text-brand-primary">{product.title}</span> juntos!
              Antes de empezar, asegúrate de tener estas herramientas a mano.
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16 w-full">
              {(guideData ? guideData.metadata.herramientas_necesarias.map((toolStr: string) => {
                let icon = 'BookOpen';
                let included = false;
                let imageUrl = '';
                const lower = toolStr.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                
                if (lower.includes('martillo')) icon = 'Hammer';
                else if (lower.includes('destornillador') || lower.includes('punta en cruz')) icon = 'Wrench';
                else if (lower.includes('allen')) {
                  icon = 'Hexagon';
                  included = true;
                }
                
                if (manifestData) {
                  const { lineFolder, folderName } = getFolderAndLine(product);
                  const matchedFile = manifestData.files_herramientas.find((file: string) => {
                    const fileLower = file.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                    return (fileLower.includes('martillo') && lower.includes('martillo')) ||
                           ((fileLower.includes('destornillador') || fileLower.includes('desarmador')) && (lower.includes('destornillador') || lower.includes('cruz') || lower.includes('phillips'))) ||
                           (fileLower.includes('allen') && lower.includes('allen')) ||
                           fileLower.includes(lower) || lower.includes(fileLower.replace(/\.[^/.]+$/, ""));
                  });
                  if (matchedFile) {
                    imageUrl = `/modelos_3d/${lineFolder}/${folderName}/herramientas/${matchedFile}`;
                  }
                }
                return { name: toolStr, icon, included, imageUrl };
              }) : product.assemblyTools.map((t: any) => {
                let imageUrl = '';
                if (manifestData) {
                  const { lineFolder, folderName } = getFolderAndLine(product);
                  const lower = t.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                  const matchedFile = manifestData.files_herramientas.find((file: string) => {
                    const fileLower = file.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                    return (fileLower.includes('martillo') && lower.includes('martillo')) ||
                           ((fileLower.includes('destornillador') || fileLower.includes('desarmador')) && (lower.includes('destornillador') || lower.includes('cruz') || lower.includes('phillips'))) ||
                           (fileLower.includes('allen') && lower.includes('allen')) ||
                           fileLower.includes(lower) || lower.includes(fileLower.replace(/\.[^/.]+$/, ""));
                  });
                  if (matchedFile) {
                    imageUrl = `/modelos_3d/${lineFolder}/${folderName}/herramientas/${matchedFile}`;
                  }
                }
                return { ...t, imageUrl };
              })).map((tool: any, index: number) => {
                const IconComponent = LucideIcons[tool.icon];
                return (
                  <motion.div
                    key={tool.name}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow-lg border border-gray-100 justify-between min-h-[240px]"
                  >
                    <div className="flex flex-col items-center">
                      {IconComponent && <IconComponent size={48} className="text-brand-primary mb-4 opacity-80" />}
                      <h3 className="text-lg font-semibold text-brand-primary mb-2 font-serif">{tool.name}</h3>
                      <p className={`text-sm ${tool.included ? 'text-green-600' : 'text-orange-600'} font-medium`}>
                        {tool.included ? '¡Tranquilo! Esta viene dentro de la caja.' : 'Herramienta adicional necesaria.'}
                      </p>
                    </div>
                    {tool.imageUrl && (
                      <button
                        onClick={() => openImageViewer(tool.imageUrl)}
                        className="mt-4 px-4 py-1.5 bg-brand-bg hover:bg-brand-support-hover text-brand-primary text-xs font-semibold uppercase tracking-wider rounded border border-brand-support/20 transition-all shadow-sm"
                      >
                        Ver imagen
                      </button>
                    )}
                  </motion.div>
                );
              })}
            </div>

            <motion.button
              onClick={handleToolsReadyClick}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="inline-flex items-center justify-center px-12 py-5 bg-brand-support text-white rounded-md text-xl font-bold uppercase tracking-widest hover:bg-brand-support transition-colors shadow-2xl mb-12"
              style={{ minWidth: '300px' }} // Asegura que el botón sea grande
            >
              Tengo las herramientas, ¡vamos!
            </motion.button>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1 }}
              className="text-gray-500 italic text-md md:text-lg max-w-2xl"
            >
              <span className="font-bold text-brand-primary">Consejo de Gaci:</span> Busca un lugar amplio y usa el mismo cartón de la caja para no rayar el piso ni el mueble.
            </motion.p>
          </motion.div>
        )}

        {currentView === 'step1' && (
          <motion.div
            key="step1-view"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="max-w-4xl w-full text-center z-10 flex flex-col justify-center items-center min-h-[calc(100vh-8rem)] pb-32 lg:pb-16" // Añadido padding bottom para el botón flotante móvil
          >
            {/* Imagen/Video de Unboxing */}
            {(() => {
              const { lineFolder, folderName } = getFolderAndLine(product);
              const unboxingFile = manifestData?.files_pasos?.find((file: string) => file.toLowerCase().includes('unboxing')) || `${folderName}-unboxing.webp`;
              const unboxingUrl = `/modelos_3d/${lineFolder}/${folderName}/pasos/${unboxingFile}`;
              return (
                <motion.img
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  src={unboxingUrl}
                  alt="Proceso de unboxing"
                  className="w-full max-w-xl h-auto object-cover rounded-lg shadow-lg mb-12 border-4 border-white cursor-pointer hover:scale-[1.01] transition-transform"
                  onClick={() => openImageViewer(unboxingUrl)}
                />
              );
            })()}

            <h1 className="text-3xl md:text-5xl font-extralight leading-tight text-brand-primary mb-8 font-serif">
              Paso 1: Unboxing y Reconocimiento
            </h1>
            <p className="text-lg md:text-xl text-gray-700 font-light mb-6 max-w-2xl">
              Al abrir la caja, verás un film protector contra la humedad. Quítalo con mucho cuidado para no rayar la melamina.
            </p>
            <p className="text-lg md:text-xl text-gray-700 font-light mb-10 max-w-2xl">
              Cada pieza tiene un identificador impreso (A, B, C...). Separá las maderas y búscalos.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-16 w-full max-w-3xl">
              {checklistItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="p-4 bg-white rounded-lg shadow-sm flex flex-col items-start space-y-1 hover:bg-brand-bg transition-colors"
                  aria-checked={item.checked}
                  role="checkbox"
                  tabIndex={0}
                >
                  <div className="flex items-center space-x-3 w-full">
                    <input
                      type="checkbox"
                      id={`item-${item.id}`}
                      checked={item.checked}
                      onChange={() => handleCheckboxChange(item.id)}
                      className="h-6 w-6 text-brand-primary rounded focus:ring-brand-dark-green border-gray-300"
                      aria-label={item.label}
                    />
                    <div className="flex-1 text-left">
                      <label
                        htmlFor={`item-${item.id}`}
                        className="text-base font-medium text-brand-primary cursor-pointer hover:text-brand-primary transition-colors"
                      >
                        {item.label}
                      </label>
                      {(item.dimensions || (item as any).modelUrl) && (
                        <button
                          onClick={(e) => { e.stopPropagation(); openPieceViewer3D(item.label, item.dimensions || '10x10x1.5', (item as any).modelUrl); }}
                          className="ml-2 px-2 py-0.5 bg-brand-bg text-brand-primary text-[10px] font-bold uppercase tracking-wider rounded border border-brand-support/20 hover:bg-brand-support-hover hover:text-brand-primary transition-all shadow-sm"
                        >
                          Ver 3D
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-4 pl-9 pt-1">
                    {item.imageUrl && (
                      <button
                        onClick={(e) => { e.stopPropagation(); openImageViewer(item.imageUrl!); }}
                        className="text-brand-primary underline text-xs font-medium cursor-pointer hover:text-brand-primary transition-colors"
                        aria-label={`Ver imágen de ${item.label}`}
                        role="button"
                      >
                        Ver imágen
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            <button
              onClick={() => setChecklistItems(prev => prev.map(item => ({ ...item, checked: true })))}
              className="px-6 py-2.5 bg-brand-bg hover:bg-brand-support-hover text-brand-primary text-xs font-bold uppercase tracking-widest rounded border border-brand-support/30 transition-all shadow-md hover:scale-[1.02] active:scale-[0.98] mb-8"
            >
              Marcar todos
            </button>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 + (checklistItems.length * 0.05) }}
              className="text-gray-500 italic text-md md:text-lg max-w-2xl mt-4 mb-20 lg:mb-12" // Ajustado mb para desktop
            >
              <span className="font-bold text-brand-primary">Consejo de Gaci:</span> ¡Organizar las piezas ahora te ahorrará tiempo más tarde!
            </motion.p>
          </motion.div>
        )}

        {currentView === 'step2' && (
          <motion.div
            key="step2-view"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="max-w-4xl w-full text-center z-10 flex flex-col justify-center items-center min-h-[calc(100vh-8rem)] pb-32 lg:pb-16"
          >
            <h1 className="text-3xl md:text-5xl font-extralight leading-tight text-brand-primary mb-8 font-serif">
              Paso 2: ¡No perdamos ni un tornillo!
            </h1>
            <p className="text-lg md:text-xl text-gray-700 font-light mb-10 max-w-2xl">
              Abrí las bolsitas de herrajes y separalos. Es muy importante que verifiques que tenés las cantidades exactas antes de empezar.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-16 w-full max-w-3xl">
              {hardwareChecklistItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="p-4 bg-white rounded-lg shadow-sm flex flex-col items-start space-y-1 hover:bg-brand-bg transition-colors"
                  aria-checked={item.checked}
                  role="checkbox"
                  tabIndex={0}
                >
                  <div className="flex items-center space-x-3 w-full">
                    <input
                      type="checkbox"
                      id={`hardware-item-${item.id}`}
                      checked={item.checked}
                      onChange={() => handleHardwareCheckboxChange(item.id)}
                      className="h-6 w-6 text-brand-primary rounded focus:ring-brand-dark-green border-gray-300"
                      aria-label={item.label}
                    />
                    <label htmlFor={`hardware-item-${item.id}`} className="text-base font-medium text-brand-primary flex-1 text-left cursor-pointer">
                      {item.label}
                    </label>
                    {item.imageUrl && (
                      <button
                        onClick={(e) => { e.stopPropagation(); openImageViewer(item.imageUrl); }}
                        className="px-2 py-0.5 bg-brand-bg hover:bg-brand-support-hover text-brand-primary text-[10px] font-bold uppercase tracking-wider rounded border border-brand-support/20 transition-all shadow-sm ml-auto"
                        aria-label={`Ver imagen de ${item.label}`}
                      >
                        Ver imagen
                      </button>
                    )}
                  </div>
                  {item.description && (
                    <p className="text-sm text-gray-500 text-left pl-9">
                      <span className="font-medium">Para qué sirve:</span> {item.description}
                    </p>
                  )}
                  {/* Eliminado: el botón "Ver video" */}
                </motion.div>
              ))}
            </div>

            <button
              onClick={() => setHardwareChecklistItems(prev => prev.map(item => ({ ...item, checked: true })))}
              className="px-6 py-2.5 bg-brand-bg hover:bg-brand-support-hover text-brand-primary text-xs font-bold uppercase tracking-widest rounded border border-brand-support/30 transition-all shadow-md hover:scale-[1.02] active:scale-[0.98] mb-8"
            >
              Marcar todos
            </button>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 + (hardwareChecklistItems.length * 0.05) }}
              className="text-gray-500 italic text-md md:text-lg max-w-2xl mt-4 mb-20 lg:mb-12"
            >
              <span className="font-bold text-brand-primary">Consejo de Gaci:</span> ¡Clasificar los herrajes te evitará dolores de cabeza y búsquedas interminables durante el armado!
            </motion.p>
          </motion.div>
        )}

        {currentView === 'step3' && (
          <motion.div
            key="step3-view"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="max-w-4xl w-full text-center z-10 flex flex-col justify-center items-center min-h-[calc(100vh-8rem)] pb-32 lg:pb-16"
          >
            {guideData ? (
              // Vista dinámica de los pasos de armado para la Cómoda Alba y otros
              (() => {
                const { lineFolder, folderName } = getFolderAndLine(product);
                const stepImageUrl = getStepImageUrl(currentAssemblyStepIndex);
                const currentStep = guideData.pasos[currentAssemblyStepIndex];
                
                // Check if pro tip is a placeholder and should be filtered out
                const rawConsejo = currentStep.consejo_pro || '';
                const hasCleanConsejoPro = rawConsejo.trim() !== '' && 
                  !rawConsejo.toLowerCase().includes('identico al modelo') && 
                  !rawConsejo.toLowerCase().includes('omitido por brevedad');
                
                // Dynamic checks for Gacibot warning inserts
                const usesGuides = currentStep.herrajes_usados?.some((herr: string) => {
                  const lower = herr.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                  return lower.includes('guia');
                }) || currentStep.instruccion_amigable?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes('guia');
                
                const hasGuiaDerecha = manifestData?.files_pasos?.some((f: string) => f.includes('guia-derecha'));
                const hasGuiaIzquierda = manifestData?.files_pasos?.some((f: string) => f.includes('guia-izquierda'));
                
                const usesMinifix = currentStep.herrajes_usados?.some((herr: string) => {
                  const lower = herr.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                  return lower.includes('minifix') || lower.includes('perno') || lower.includes('caja');
                }) || currentStep.instruccion_amigable?.toLowerCase().includes('minifix') || currentStep.instruccion_amigable?.toLowerCase().includes('perno');
                
                const hasMinifixImage = manifestData?.files_pasos?.some((f: string) => f.includes('instructivo-caja-minifix'));
                
                // Show hinge video ONLY when regulating/adjusting hinges in the step
                const textLower = (currentStep.instruccion_amigable || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                const isHingeRegulationStep = textLower.includes('bisagra') && 
                  (textLower.includes('regular') || textLower.includes('regulacion') || textLower.includes('ajust') || textLower.includes('alinear'));

                const usesCarrosOrTrabas = currentStep.herrajes_usados?.some((herr: string) => {
                  const lower = herr.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                  return lower.includes('carro') || lower.includes('traba') || lower.includes('clip') || lower.includes('patin');
                }) || currentStep.instruccion_amigable?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes('carro') ||
                   currentStep.instruccion_amigable?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes('traba');

                const usesKitBotinero = currentStep.herrajes_usados?.some((herr: string) => {
                  const lower = herr.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                  return lower.includes('botinero') || lower.includes('costado plastico');
                }) || currentStep.instruccion_amigable?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes('botinero') ||
                   currentStep.instruccion_amigable?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes('costados plasticos');

                return (
                  <div className="w-full max-w-2xl flex flex-col items-center">
                    <span className="text-[11px] uppercase tracking-[0.25em] text-brand-support font-bold mb-2">
                      Proceso de armado • Paso {currentAssemblyStepIndex + 1} de {guideData.pasos.length}
                    </span>
                    
                    {/* Imagen del paso */}
                    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-white shadow-lg mb-8 border border-gray-100 flex items-center justify-center cursor-pointer group"
                      onClick={() => openImageViewer(stepImageUrl)}
                    >
                      <img
                        src={stepImageUrl}
                        alt={`Paso ${currentAssemblyStepIndex + 1}`}
                        className="max-h-full max-w-full object-contain p-2"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-sm uppercase tracking-wider">
                        Click para agrandar
                      </div>
                    </div>

                    <h2 className="text-2xl md:text-3xl font-extralight text-brand-primary mb-4 leading-tight">
                      {currentStep.piezas.join(' y ')}
                    </h2>

                    <p className="text-lg text-gray-700 font-light leading-relaxed text-left mb-6 bg-white p-6 rounded-xl border border-gray-100 shadow-sm w-full whitespace-pre-line">
                      {currentStep.instruccion_amigable}
                    </p>

                    {/* Piezas y herrajes involucrados */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full text-left mb-8">
                      {/* Piezas */}
                      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                        <h4 className="text-xs font-bold text-brand-primary/50 uppercase tracking-wider mb-2">Piezas del paso:</h4>
                        <ul className="space-y-2">
                          {currentStep.piezas.map((pieceName: string) => {
                            const piece = getPieceForName(pieceName);
                            return (
                              <li key={pieceName} className="flex justify-between items-center text-sm">
                                <span className="font-medium text-brand-primary">{pieceName}</span>
                                {piece && (
                                  <button
                                    onClick={() => openPieceViewer3D(piece.label.split(' (')[0], piece.dimensions || '10x10x1.5', piece.modelUrl)}
                                    className="px-2 py-0.5 bg-brand-bg hover:bg-brand-support-hover text-brand-primary text-[10px] font-bold uppercase tracking-wider rounded border border-brand-support/20 transition-all shadow-sm"
                                  >
                                    Ver 3D
                                  </button>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      </div>

                      {/* Herrajes */}
                      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                        <h4 className="text-xs font-bold text-brand-primary/50 uppercase tracking-wider mb-2">Herrajes necesarios:</h4>
                        <ul className="space-y-2">
                          {currentStep.herrajes_usados.map((herrName: string) => {
                            const imgUrl = getHardwareImageUrl(herrName);
                            return (
                              <li key={herrName} className="flex justify-between items-center text-sm gap-2">
                                <span className="font-medium text-gray-700">{herrName}</span>
                                {imgUrl && (
                                  <button
                                    onClick={() => openImageViewer(imgUrl)}
                                    className="px-2 py-0.5 bg-brand-bg hover:bg-brand-support-hover text-brand-primary text-[10px] font-bold uppercase tracking-wider rounded border border-brand-support/20 transition-all shadow-sm flex-shrink-0"
                                  >
                                    Ver imagen
                                  </button>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    </div>

                    {/* Consejo Pro */}
                    {hasCleanConsejoPro && (
                      <div className="p-5 bg-yellow-100 rounded-xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 w-full text-left mb-8">
                        <div className="flex items-start space-x-3">
                          <AlertTriangle size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-yellow-800 font-medium">
                            <span className="font-bold">Consejo de Gaci:</span> {currentStep.consejo_pro}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Consejo Gacibot para Guías Metálicas */}
                    {usesGuides && hasGuiaDerecha && (
                      <div className="p-5 bg-blue-50 border border-blue-100 rounded-xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 w-full text-left mb-8">
                        <div className="flex items-start space-x-3">
                          <Bot size={24} className="text-brand-primary flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm text-brand-primary font-bold">Consejo de Gaci: Referencia de Guías Metálicas</p>
                            <p className="text-xs text-gray-600 mt-1">
                              Prestá mucha atención a la orientación de la guía. La rueda debe quedar hacia la parte delantera del lateral en el mueble (es decir, hacia el frente), y hacia atrás en el cajón. Observá los detalles de guía derecha e izquierda:
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0 self-center md:self-auto">
                          <img
                            src={`/modelos_3d/${lineFolder}/${folderName}/pasos/guia-derecha.webp`}
                            alt="Guía Derecha"
                            className="h-16 w-auto object-contain rounded border border-blue-200 shadow-sm cursor-pointer hover:scale-105 transition-transform"
                            onClick={() => openImageViewer(`/modelos_3d/${lineFolder}/${folderName}/pasos/guia-derecha.webp`)}
                          />
                          {hasGuiaIzquierda && (
                            <img
                              src={`/modelos_3d/${lineFolder}/${folderName}/pasos/guia-izquierda.webp`}
                              alt="Guía Izquierda"
                              className="h-16 w-auto object-contain rounded border border-blue-200 shadow-sm cursor-pointer hover:scale-105 transition-transform"
                              onClick={() => openImageViewer(`/modelos_3d/${lineFolder}/${folderName}/pasos/guia-izquierda.webp`)}
                            />
                          )}
                        </div>
                      </div>
                    )}

                    {/* Consejo Gacibot para Minifix (se muestra siempre que se use perno o caja de minifix en el paso) */}
                    {usesMinifix && hasMinifixImage && (
                      <div className="p-5 bg-yellow-50 border border-yellow-100 rounded-xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 w-full text-left mb-8">
                        <div className="flex items-start space-x-3">
                          <Bot size={24} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm text-yellow-800 font-bold">Consejo de Gaci: Cajas y Pernos Minifix</p>
                            <p className="text-xs text-yellow-700 mt-1">
                              Asegúrate de que la flecha grabada en la caja redonda del minifix esté apuntando directamente hacia el orificio del borde donde entrará el perno metálico. Una vez acoplado, gíralo 180° en sentido horario para asegurar la unión.
                            </p>
                          </div>
                        </div>
                        <div className="flex-shrink-0 self-center md:self-auto">
                          <img
                            src={`/modelos_3d/${lineFolder}/${folderName}/pasos/instructivo-caja-minifix.webp`}
                            alt="Instructivo Minifix"
                            className="h-16 w-auto object-contain rounded border border-yellow-200 shadow-sm cursor-pointer hover:scale-105 transition-transform"
                            onClick={() => openImageViewer(`/modelos_3d/${lineFolder}/${folderName}/pasos/instructivo-caja-minifix.webp`)}
                          />
                        </div>
                      </div>
                    )}

                    {/* Consejo Gacibot para Regulación de Bisagras (se muestra ÚNICAMENTE en el paso de regulación/alineación) */}
                    {isHingeRegulationStep && (
                      <div className="p-5 bg-green-50 border border-green-100 rounded-xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 w-full text-left mb-8">
                        <div className="flex items-start space-x-3">
                          <Bot size={24} className="text-green-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm text-green-800 font-bold">Consejo de Gaci: Regulación de Bisagras</p>
                            <p className="text-xs text-green-700 mt-1">
                              ¿Las puertas quedaron desalineadas? No te preocupes, las bisagras son completamente regulables. Podés ajustar la altura, profundidad y alineación lateral. Mirá este breve tutorial en video para dejarlas perfectas:
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => openVideoViewer('https://youtu.be/IJCL66a2TW4')}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold uppercase tracking-wider rounded transition-all shadow-md flex-shrink-0 self-center md:self-auto font-sans"
                        >
                          Ver Video Tutorial
                        </button>
                      </div>
                    )}

                    {/* Consejo Gacibot para Carros y Trabas (Puertas Corredizas) */}
                    {usesCarrosOrTrabas && (
                      <div className="p-5 bg-indigo-50 border border-indigo-100 rounded-xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 w-full text-left mb-8">
                        <div className="flex items-start space-x-3">
                          <Bot size={24} className="text-indigo-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm text-indigo-800 font-bold">Consejo de Gaci: Carros, Trabas y Colocación de Puertas</p>
                            <p className="text-xs text-indigo-700 mt-1">
                              Asegúrate de colocar correctamente los carros inferiores y los clips superiores para que las puertas deslicen con suavidad. Mirá este breve tutorial en video para ver el paso a paso detallado sobre cómo encastrar y trabar las puertas:
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => openVideoViewer('https://youtu.be/0hdyFzzH04s?si=dLDVM0Wb1d1kbCnI&t=319')}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase tracking-wider rounded transition-all shadow-md flex-shrink-0 self-center md:self-auto font-sans"
                        >
                          Ver Video Tutorial
                        </button>
                      </div>
                    )}

                    {/* Consejo Gacibot para Kit Botinero (Zapateros Rebatibles) */}
                    {usesKitBotinero && (
                      <div className="p-5 bg-teal-50 border border-teal-100 rounded-xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 w-full text-left mb-8">
                        <div className="flex items-start space-x-3">
                          <Bot size={24} className="text-teal-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm text-teal-800 font-bold">Consejo de Gaci: Montaje del Kit Botinero</p>
                            <p className="text-xs text-teal-700 mt-1">
                              El armado de los cajones rebatibles (zapateros) requiere una alineación precisa de los costados plásticos del kit botinero. Mirá este video tutorial para ver cómo ensamblarlos al frente y regular el pivote correctamente:
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => openVideoViewer('https://youtu.be/bQ6RWeMEVBo?si=dt7r4A3axf3h2dzR&t=197')}
                          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold uppercase tracking-wider rounded transition-all shadow-md flex-shrink-0 self-center md:self-auto font-sans"
                        >
                          Ver Video Tutorial
                        </button>
                      </div>
                    )}
                  </div>
                );
              })()
            ) : (
              <>
                <h1 className="text-3xl md:text-5xl font-extralight leading-tight text-brand-primary mb-8 font-serif">
                  Paso 3: Preparando los laterales
                </h1>
                <p className="text-lg md:text-xl text-gray-700 font-light mb-10 max-w-2xl">
                  Buscá los costados C (Izquierdo) y D (Derecho). Vamos a colocarles los herrajes básicos.
                </p>

                <div className="grid grid-cols-1 gap-4 md:gap-6 mb-12 w-full max-w-2xl">
                  {step3ChecklistItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="p-4 bg-white rounded-lg shadow-sm flex flex-col items-start space-y-1 hover:bg-brand-bg transition-colors"
                      aria-checked={item.checked}
                      role="checkbox"
                      tabIndex={0}
                    >
                      <div className="flex items-center space-x-3 w-full">
                        <input
                          type="checkbox"
                          id={`step3-item-${item.id}`}
                          checked={item.checked}
                          onChange={() => handleStep3CheckboxChange(item.id)}
                          className="h-6 w-6 text-brand-primary rounded focus:ring-brand-dark-green border-gray-300"
                          aria-label={item.label}
                        />
                        <label htmlFor={`step3-item-${item.id}`} className="text-base font-medium text-brand-primary flex-1 text-left cursor-pointer">
                          {item.label}
                        </label>
                      </div>
                      {item.videoUrl && (
                        <button
                          onClick={(e) => { e.stopPropagation(); openVideoViewer(item.videoUrl!); }}
                          className="text-brand-primary underline text-sm font-medium cursor-pointer text-left pl-9 pt-1 block hover:text-brand-primary transition-colors"
                          aria-label={`Ver video de ${item.label}`}
                          role="button"
                        >
                          Ver video
                        </button>
                      )}
                    </motion.div>
                  ))}
                </div>

                {/* Consejo de Oro de Gaci */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 + (step3ChecklistItems.length * 0.05) }}
                  className="mt-8 p-6 bg-yellow-100 rounded-xl shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4 max-w-2xl w-full text-left"
                >
                  <div className="flex items-start space-x-4">
                    <AlertTriangle size={24} className="text-yellow-600 flex-shrink-0 mt-1" />
                    <p className="text-base text-yellow-800 font-medium">
                      <span className="font-bold">¡Ojo acá!</span> La flecha de la caja mini fix debe estar alineada hacia el orificio del borde para que el perno entre bien.
                    </p>
                  </div>
                  {(() => {
                    const { lineFolder, folderName } = getFolderAndLine(product);
                    const minifixImg = `/modelos_3d/${lineFolder}/${folderName}/pasos/instructivo-caja-minifix.webp`;
                    return (
                      <div className="flex-shrink-0 self-center md:self-auto">
                        <img
                          src={minifixImg}
                          alt="Instrucción de caja minifix"
                          className="h-20 w-auto object-contain rounded border border-yellow-300 shadow-sm cursor-pointer hover:scale-105 transition-transform"
                          onClick={() => openImageViewer(minifixImg)}
                        />
                      </div>
                    );
                  })()}
                </motion.div>

                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1 + (step3ChecklistItems.length * 0.05) }}
                  className="text-gray-500 italic text-md md:text-lg max-w-2xl mt-8 mb-20 lg:mb-12"
                >
                  <span className="font-bold text-brand-primary">Consejo de Gaci:</span> La precisión en este paso asegura la estabilidad y alineación perfecta de tu mueble.
                </motion.p>
              </>
            )}
          </motion.div>
        )}

        {currentView === 'step4' && (
          <motion.div
            key="step4-view"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="max-w-4xl w-full text-center z-10 flex flex-col justify-center items-center min-h-[calc(100vh-8rem)] pb-32 lg:pb-16"
          >
            {/* Triumph Block */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-2xl md:text-3xl font-light text-brand-primary mb-12 text-center"
            >
              ¡Felicitaciones{userName ? `, ${userName}` : ''}! Tu <span className="font-semibold">{product.title}</span> ya está listo para disfrutar en tu hogar.
            </motion.h1>

            {/* Cuidados y Consejos */}
            {(() => {
              const usesHinges = guideData?.herrajes?.some((herr: any) => {
                return herr.item.toLowerCase().includes('bisagra');
              }) || guideData?.pasos?.some((step: any) => {
                return step.instruccion_amigable.toLowerCase().includes('bisagra') ||
                       step.herrajes_usados.some((h: string) => h.toLowerCase().includes('bisagra'));
              });

              return (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="mb-16 w-full max-w-2xl text-left bg-white p-8 rounded-xl shadow-lg border border-gray-100"
                >
                  <h2 className="text-xl md:text-2xl font-light tracking-[0.2em] uppercase text-brand-primary mb-6 flex items-center font-serif">
                    <Sparkles size={20} className="text-brand-primary mr-3" />
                    Mirá los cuidados y consejos de fábrica
                  </h2>
                  <ul className="space-y-4 text-gray-700 text-base md:text-lg font-light">
                    <li>
                      <strong className="font-semibold text-brand-primary">Ajuste Pro:</strong> Dentro de 15 días, dale un último apretón a los tornillos de fijación (Allen o Phillips). Con el uso, la madera se asienta y esto le dará rigidez eterna.
                    </li>
                    <li>
                      <strong className="font-semibold text-brand-primary">Limpieza:</strong> Usá solo un paño apenas humedecido. Evitá productos abrasivos.
                    </li>
                    <li>
                      <strong className="font-semibold text-brand-primary">Borrá los códigos:</strong> Borrá el código impreso en el canto con un poco de algodón y alcohol para un acabado perfecto.
                    </li>
                    {usesHinges && (
                      <li>
                        <strong className="font-semibold text-brand-primary">Regulación de Puertas:</strong> Si notás que las puertas quedaron caídas o no cierran del todo alineadas, recordá regular las bisagras. Podés mirar el video instructivo aquí:{' '}
                        <button
                          onClick={() => openVideoViewer('https://youtu.be/IJCL66a2TW4')}
                          className="text-brand-support underline font-semibold hover:text-brand-support-hover transition-colors inline"
                        >
                          Ver video de regulación de bisagras
                        </button>
                      </li>
                    )}
                  </ul>
                </motion.div>
              );
            })()}

            {/* Feedback Form (GACI LISTEN) */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="w-full max-w-2xl text-left bg-white p-8 rounded-xl shadow-lg border border-gray-100 mb-16"
            >
              <h2 className="text-xl md:text-2xl font-light tracking-[0.2em] uppercase text-brand-primary mb-6 font-serif">
                ¿Gaci te ayudó?
              </h2>
              <p className="text-gray-700 text-base md:text-lg font-light mb-6">
                Contanos tu experiencia y ayudanos a mejorar.
              </p>
              <form onSubmit={handleSubmitFeedback} className="space-y-4">
                <input
                  type="text"
                  name="name"
                  placeholder="Nombre y Apellido"
                  value={feedbackFormData.name}
                  onChange={handleFeedbackFormChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-dark-green/50 bg-brand-bg text-brand-primary"
                  required
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={feedbackFormData.email}
                  onChange={handleFeedbackFormChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-dark-green/50 bg-brand-bg text-brand-primary"
                  required
                />
                <textarea
                  name="comments"
                  placeholder="Observaciones (¿Hubo algún paso donde te trabaste?)"
                  rows={4}
                  value={feedbackFormData.comments}
                  onChange={handleFeedbackFormChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-dark-green/50 bg-brand-bg text-brand-primary resize-y"
                  required
                ></textarea>
                <button
                  type="submit"
                  disabled={feedbackStatus === 'sending'}
                  className={`w-full px-6 py-3 rounded-md text-white font-bold uppercase tracking-wider transition-all duration-300 ${feedbackStatus === 'sending'
                    ? 'bg-gray-400 cursor-not-allowed'
                    : feedbackStatus === 'success'
                      ? 'bg-green-600'
                      : feedbackStatus === 'error'
                        ? 'bg-red-600'
                        : 'bg-brand-support hover:bg-brand-support-hover'
                    }`}
                >
                  {feedbackStatus === 'sending' 
                    ? 'Enviando...' 
                    : feedbackStatus === 'success' 
                      ? '¡Gracias por ayudarnos a mejorar!' 
                      : feedbackStatus === 'error'
                        ? 'Error al enviar, reintentar'
                        : 'Enviar mis comentarios'}
                </button>
              </form>
            </motion.div>

            {/* Closure and Conversion Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="flex flex-col gap-6 w-full max-w-sm mt-8"
            >
              <button
                onClick={onBackToHome} // Navigate to home
                className="flex items-center justify-center px-8 py-4 border-2 border-brand-support text-brand-primary rounded-md text-lg font-bold uppercase tracking-widest hover:bg-brand-support-hover hover:text-brand-primary transition-colors shadow-lg"
              >
                Mirá todos nuestros productos
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botón flotante de Siguiente (para mobile y desktop) */}
      <AnimatePresence>
        {(currentView === 'step1' || currentView === 'step2' || currentView === 'step3') && (
          // Botón para desktop (flujo normal)
          <motion.button
            key="next-step-button-desktop"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: currentView === 'step1' ? (0.5 + (checklistItems.length * 0.05)) : currentView === 'step2' ? (0.5 + (hardwareChecklistItems.length * 0.05)) : (0.5 + (step3ChecklistItems.length * 0.05)) }}
            onClick={handleNextStepClick}
            disabled={isNextButtonDisabled}
            className={`hidden lg:flex items-center justify-center px-10 py-4 rounded-md shadow-xl text-lg font-bold uppercase tracking-widest transition-all duration-300 max-w-md w-full ${isNextButtonDisabled
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-brand-support text-brand-bg hover:bg-brand-support-hover'
              }`}
            aria-label={isNextButtonDisabled ? 'Completa el checklist para continuar' : 'Siguiente paso'}
          >
            {nextButtonIcon}
            <span>{nextButtonText}</span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {(currentView === 'step1' || currentView === 'step2' || currentView === 'step3') && (
          // Botón para mobile (fijo en la parte inferior)
          <motion.button
            key="next-step-button-mobile"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ type: 'spring', damping: 15, stiffness: 100, delay: currentView === 'step1' ? (0.5 + (checklistItems.length * 0.05)) : currentView === 'step2' ? (0.5 + (hardwareChecklistItems.length * 0.05)) : (0.5 + (step3ChecklistItems.length * 0.05)) }}
            onClick={handleNextStepClick}
            disabled={isNextButtonDisabled}
            className={`lg:hidden fixed bottom-0 left-0 right-0 w-full px-8 py-5 rounded-none shadow-2xl flex items-center justify-center space-x-3 text-lg font-bold uppercase tracking-widest transition-all duration-300 z-40 ${isNextButtonDisabled
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-brand-support text-brand-bg hover:bg-brand-support-hover'
              }`}
            aria-label={isNextButtonDisabled ? 'Completa el checklist para continuar' : 'Siguiente paso'}
          >
            {nextButtonIcon}
            <span>{nextButtonText}</span>
          </motion.button>
        )}
      </AnimatePresence>



      {/* ImageViewer Modal */}
      <ImageViewer imageUrl={viewerImageUrl} onClose={closeImageViewer} />

      {/* VideoViewer Modal */}
      <VideoViewer videoUrl={viewerVideoUrl} onClose={closeVideoViewer} />

      {/* PieceViewer3D Modal */}
      <PieceViewer3D
        isOpen={is3DViewerOpen}
        onClose={closePieceViewer3D}
        pieceName={selectedPiece3D?.name || ''}
        dimensions={selectedPiece3D?.dimensions || '10x10x1.5'}
        modelUrl={selectedPiece3D?.modelUrl}
        finishes={selectedPiece3D?.finishes}
      />

      {/* Elementos decorativos de fondo */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.15 }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.8 }}
          className="absolute -top-1/4 -left-1/4 w-3/4 h-3/4 bg-brand-support/10 rounded-md blur-3xl"
        />
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.1 }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 1 }}
          className="absolute -bottom-1/4 -right-1/4 w-2/3 h-2/3 bg-brand-support/10 rounded-md blur-3xl"
        />
      </div>
    </div>
  );
};

export default GaciStepByStep;