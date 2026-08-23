import React, { useState, useRef, useMemo, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Camera, Sparkles, X, Star, HelpCircle, ArrowUpRight, LayoutTemplate, Smartphone } from 'lucide-react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { Product } from '../types/product';
import RoomPlanner3D from './RoomPlanner3D';
// Importamos los modelos 3D como módulos Vite para forzar el fingerprint único en producción
// Línea Clásica
import glbModelUrl839BR from '../assets/modelos_3d/linea-clasica/A008395/A008395_v7_iluminado.glb?url';
import glbModelUrl839B from '../assets/modelos_3d/linea-clasica/A008395/A008395_v7_blanco.glb?url';
import glbModelUrl902BR from '../assets/modelos_3d/linea-clasica/A009022/A009022_v1_iluminado.glb?url';
import glbModelUrl902C from '../assets/modelos_3d/linea-clasica/A009022/A009022_v1_carvalho.glb?url';
import glbModelUrl828B from '../assets/modelos_3d/linea-clasica/A008285/A008285_v1_blanco.glb?url';
import glbModelUrl828BR from '../assets/modelos_3d/linea-clasica/A008285/A008285_v1_blanco_roble.glb?url';
import glbModelUrl32012 from '../assets/modelos_3d/linea-clasica/A032012/A032012_v1.glb?url';
import glbModelUrl70815 from '../assets/modelos_3d/linea-clasica/A070815/A070815_v1.glb?url';
import glbModelUrl221150 from '../assets/modelos_3d/linea-clasica/A221150/A221150_v1.glb?url';
import glbModelUrl710150 from '../assets/modelos_3d/linea-clasica/A710150/A710150_v1.glb?url';

// Línea Nordik
import glbModelUrl234094 from '../assets/modelos_3d/linea-nordik/A234094/A234094_v1.glb?url';
import glbModelUrl321021 from '../assets/modelos_3d/linea-nordik/A321021/A321021_v1.glb?url';
import glbModelUrl331330 from '../assets/modelos_3d/linea-nordik/A331330/A331330_v1.glb?url';
import glbModelUrl334026 from '../assets/modelos_3d/linea-nordik/A334026/A334026_v1.glb?url';
import glbModelUrl334093 from '../assets/modelos_3d/linea-nordik/A334093/A334093_v1.glb?url';
import glbModelUrl405330 from '../assets/modelos_3d/linea-nordik/A405330/A405330_v1.glb?url';
import glbModelUrl446330 from '../assets/modelos_3d/linea-nordik/A446330/A446330_v1.glb?url';
import glbModelUrl716330 from '../assets/modelos_3d/linea-nordik/A716330/A716330_v1.glb?url';
import glbModelUrl732330 from '../assets/modelos_3d/linea-nordik/A732330/A732330_v1.glb?url';
import glbModelUrl742332 from '../assets/modelos_3d/linea-nordik/A742332/A742332_v1.glb?url';
import glbModelUrl742334 from '../assets/modelos_3d/linea-nordik/A742334/A742334_v1.glb?url';
import glbModelUrl742336 from '../assets/modelos_3d/linea-nordik/A742336/A742336_v1.glb?url';

// Línea Kyoto
import glbModelUrl322250 from '../assets/modelos_3d/linea-kyoto/A322250/A322250_v1.glb?url';
import glbModelUrl326250 from '../assets/modelos_3d/linea-kyoto/A326250/A326250_v1.glb?url';
import glbModelUrl331250 from '../assets/modelos_3d/linea-kyoto/A331250/A331250_v1.glb?url';
import glbModelUrl334250 from '../assets/modelos_3d/linea-kyoto/A334250/A334250_v1.glb?url';
import glbModelUrl353250 from '../assets/modelos_3d/linea-kyoto/A353250/A353250_v1.glb?url';
import glbModelUrl446250 from '../assets/modelos_3d/linea-kyoto/A446250/A446250_v1.glb?url';
import glbModelUrl760250 from '../assets/modelos_3d/linea-kyoto/A760250/A760250_v1.glb?url';

// Línea Curvalba
import glbModelUrl334271 from '../assets/modelos_3d/linea-curvalba/A334271/A334271_v1.glb?url';
import glbModelUrl334272 from '../assets/modelos_3d/linea-curvalba/A334272/A334272_v1.glb?url';
import glbModelUrl353270 from '../assets/modelos_3d/linea-curvalba/A353270/A353270_v1.glb?url';
import glbModelUrl405270 from '../assets/modelos_3d/linea-curvalba/A405270/A405270_v1.glb?url';
import glbModelUrl446270 from '../assets/modelos_3d/linea-curvalba/A446270/A446270_v1.glb?url';
import glbModelUrl732270 from '../assets/modelos_3d/linea-curvalba/A732270/A732270_v1.glb?url';
import glbModelUrl742270 from '../assets/modelos_3d/linea-curvalba/A742270/A742270_v1.glb?url';
import glbModelUrl742272 from '../assets/modelos_3d/linea-curvalba/A742272/A742272_v1.glb?url';
import glbModelUrl742273 from '../assets/modelos_3d/linea-curvalba/A742273/A742273_v1.glb?url';

const getModelUrl = (sku?: string) => {
  // Clásica
  if (sku === '902-2-C') return glbModelUrl902C;
  if (sku === '902-2-BR') return glbModelUrl902BR;
  if (sku === '839-5-B') return glbModelUrl839B;
  if (sku === '839-5-BR') return glbModelUrl839BR;
  if (sku === '828-5-B') return glbModelUrl828B;
  if (sku === '828-5-BR') return glbModelUrl828BR;
  if (sku === '320-12') return glbModelUrl32012;
  if (sku === '708-15') return glbModelUrl70815;
  if (sku === '221150') return glbModelUrl221150;
  if (sku === '710150') return glbModelUrl710150;
  
  // Nordik
  if (sku === '234094') return glbModelUrl234094;
  if (sku === '321021') return glbModelUrl321021;
  if (sku === '331330') return glbModelUrl331330;
  if (sku === '334026') return glbModelUrl334026;
  if (sku === '334093') return glbModelUrl334093;
  if (sku === '405330') return glbModelUrl405330;
  if (sku === '446330') return glbModelUrl446330;
  if (sku === '716330') return glbModelUrl716330;
  if (sku === '732330') return glbModelUrl732330;
  if (sku === '742332') return glbModelUrl742332;
  if (sku === '742334') return glbModelUrl742334;
  if (sku === '742336') return glbModelUrl742336;
  
  // Kyoto
  if (sku === '322250') return glbModelUrl322250;
  if (sku === '326250') return glbModelUrl326250;
  if (sku === '331250') return glbModelUrl331250;
  if (sku === '334250') return glbModelUrl334250;
  if (sku === '353250') return glbModelUrl353250;
  if (sku === '446250') return glbModelUrl446250;
  if (sku === '760250') return glbModelUrl760250;
  
  // Curvalba
  if (sku === '334271') return glbModelUrl334271;
  if (sku === '334272') return glbModelUrl334272;
  if (sku === '353270') return glbModelUrl353270;
  if (sku === '405270') return glbModelUrl405270;
  if (sku === '446270') return glbModelUrl446270;
  if (sku === '732270') return glbModelUrl732270;
  if (sku === '742270') return glbModelUrl742270;
  if (sku === '742272') return glbModelUrl742272;
  if (sku === '742273') return glbModelUrl742273;
  
  return glbModelUrl839BR;
};

// Pre-cargamos todos los modelos GLB para asegurar transición instantánea sin pantallas en blanco
useGLTF.preload(glbModelUrl839BR);
useGLTF.preload(glbModelUrl839B);
useGLTF.preload(glbModelUrl902BR);
useGLTF.preload(glbModelUrl902C);
useGLTF.preload(glbModelUrl828B);
useGLTF.preload(glbModelUrl828BR);
useGLTF.preload(glbModelUrl32012);
useGLTF.preload(glbModelUrl70815);
useGLTF.preload(glbModelUrl221150);
useGLTF.preload(glbModelUrl710150);
useGLTF.preload(glbModelUrl234094);
useGLTF.preload(glbModelUrl321021);
useGLTF.preload(glbModelUrl331330);
useGLTF.preload(glbModelUrl334026);
useGLTF.preload(glbModelUrl334093);
useGLTF.preload(glbModelUrl405330);
useGLTF.preload(glbModelUrl446330);
useGLTF.preload(glbModelUrl716330);
useGLTF.preload(glbModelUrl732330);
useGLTF.preload(glbModelUrl742332);
useGLTF.preload(glbModelUrl742334);
useGLTF.preload(glbModelUrl742336);
useGLTF.preload(glbModelUrl322250);
useGLTF.preload(glbModelUrl326250);
useGLTF.preload(glbModelUrl331250);
useGLTF.preload(glbModelUrl334250);
useGLTF.preload(glbModelUrl353250);
useGLTF.preload(glbModelUrl446250);
useGLTF.preload(glbModelUrl760250);
useGLTF.preload(glbModelUrl334271);
useGLTF.preload(glbModelUrl334272);
useGLTF.preload(glbModelUrl353270);
useGLTF.preload(glbModelUrl405270);
useGLTF.preload(glbModelUrl446270);
useGLTF.preload(glbModelUrl732270);
useGLTF.preload(glbModelUrl742270);
useGLTF.preload(glbModelUrl742272);
useGLTF.preload(glbModelUrl742273);

interface ARLandingPageProps {
  onBackToPdp: () => void;
  initialSelectedProduct: Product | null;
}

// Función auxiliar para generar coordenadas UV por proyección de caja (Box Mapping)
// Mapea la posición 3D de cada vértice al plano UV correspondiente según su vector normal.
const generateBoxUVs = (geometry: THREE.BufferGeometry) => {
  const posAttr = geometry.getAttribute('position');
  const normAttr = geometry.getAttribute('normal');
  if (!posAttr || !normAttr) return;

  const count = posAttr.count;
  const uvs = new Float32Array(count * 2);

  for (let i = 0; i < count; i++) {
    const x = posAttr.getX(i);
    const y = posAttr.getY(i);
    const z = posAttr.getZ(i);

    const nx = Math.abs(normAttr.getX(i));
    const ny = Math.abs(normAttr.getY(i));
    const nz = Math.abs(normAttr.getZ(i));

    if (nx >= ny && nx >= nz) {
      // Caras laterales (normal X): veta vertical (eje Y)
      uvs[i * 2] = z * 2.0;
      uvs[i * 2 + 1] = y * 2.0;
    } else if (ny >= nx && ny >= nz) {
      // Caras superior/inferior (normal Y): veta horizontal (eje X)
      uvs[i * 2] = z * 2.0;
      uvs[i * 2 + 1] = x * 2.0;
    } else {
      // Caras frontal/posterior (normal Z): veta horizontal (eje X)
      uvs[i * 2] = y * 2.0;
      uvs[i * 2 + 1] = x * 2.0;
    }
  }

  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geometry.attributes.uv.needsUpdate = true;
};

// Componente ModelRenderer para el Visualizador 3D Inicial con pipeline PBR Premium
const ARModelRenderer = ({ product }: { product?: Product | null }) => {
  const isBlancoTotal = product?.sku === '839-5-B';
  const isCarvalhoTotal = product?.sku === '902-2-C';
  const glbUrl = getModelUrl(product?.sku);
  const { scene } = useGLTF(glbUrl);
  const { gl, camera, controls } = useThree();
  const centeredRef = useRef(false);

  // Clonar la escena para evitar contaminar el cache compartido de useGLTF
  const clonedScene = useMemo(() => {
    return scene.clone(true);
  }, [scene]);

  // 1. CARGA DE TEXTURAS PBR PREMIUM CON ANISOTROPÍA MÁXIMA (Con busteo de caché)
  const { woodTexture, normalTexture } = useMemo(() => {
    const textureLoader = new THREE.TextureLoader();
    
    // Carga de texturas reales (Mel Avellana Carvalho o Mel Malta Natural según el color del mueble)
    const colorSpec = product?.specs?.find((s: any) => s.label === 'Color')?.value || '';
    const lineSpec = product?.specs?.find((s: any) => s.label === 'Línea')?.value || '';
    
    const isNordik = 
      lineSpec.toLowerCase().includes('nordik') || 
      lineSpec.toLowerCase().includes('nordico') || 
      lineSpec.toLowerCase().includes('nórdico') || 
      colorSpec.toLowerCase().includes('miel') || 
      colorSpec.toLowerCase().includes('natural') || 
      colorSpec.toLowerCase().includes('nordik') || 
      colorSpec.toLowerCase().includes('nórdico') || 
      colorSpec.toLowerCase().includes('nordico');
      
    const woodPath = isNordik 
      ? '/images/Mel Malta (Natural).jpg?v=6' 
      : '/images/Mel Avellana (Carvalho).jpg?v=6';
      
    const wood = textureLoader.load(woodPath);
    const normal = textureLoader.load('/images/texture_normal.jpg?v=6');
    
    // Espacio de color sRGB moderno
    wood.colorSpace = THREE.SRGBColorSpace;
    wood.wrapS = THREE.RepeatWrapping;
    wood.wrapT = THREE.RepeatWrapping;
    
    // Rotación de textura a 0° ya que el mapeo de coordenadas UV proyectado orienta la fibra nativa correctamente
    wood.rotation = 0;
    wood.center.set(0.5, 0.5);
    
    normal.rotation = 0;
    normal.center.set(0.5, 0.5);
    
    // Filtro de anisotropía máxima para nitidez en perspectivas inclinadas
    const maxAnisotropy = gl.capabilities.getMaxAnisotropy();
    wood.anisotropy = maxAnisotropy;
    wood.magFilter = THREE.LinearFilter;
    wood.minFilter = THREE.LinearMipmapLinearFilter;
    
    normal.wrapS = THREE.RepeatWrapping;
    normal.wrapT = THREE.RepeatWrapping;
    normal.anisotropy = maxAnisotropy;
    
    return { woodTexture: wood, normalTexture: normal };
  }, [gl, product]);

  // Medimos la caja de entorno (Box3) del mueble para el cálculo de repetición físico automático
  const size = useMemo(() => {
    const box = new THREE.Box3().setFromObject(clonedScene);
    const s = new THREE.Vector3();
    box.getSize(s);
    return s;
  }, [clonedScene]);

  // Regla de Escala Física para veta longitudinal extendida
  useEffect(() => {
    if (size) {
      woodTexture.repeat.set(size.x / 1.6, size.y / 1.2);
      normalTexture.repeat.copy(woodTexture.repeat);
      woodTexture.needsUpdate = true;
      normalTexture.needsUpdate = true;
    }
  }, [size, woodTexture, normalTexture]);

  // Material PBR único para la melamina Carvalho
  const woodMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      map: woodTexture,
      normalMap: normalTexture,
      normalScale: new THREE.Vector2(0.4, 0.4),
      roughness: 0.58,
      metalness: 0.0,
      color: new THREE.Color(0xffffff)
    });
  }, [woodTexture, normalTexture]);

  // Material Physical PBR para frentes (Laca Blanca Satinada con clearcoat)
  const whiteFrontMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#F7F7F5"),
      roughness: 0.25,
      metalness: 0.0,
      clearcoat: 0.6,
      clearcoatRoughness: 0.15
    });
  }, []);

  // Centrado automático, normalización de escala y encuadre perfecto de cámara
  useEffect(() => {
    if (!clonedScene || !camera) return;
    
    // 1. Resetear transformaciones previas para medir la geometría pura
    clonedScene.position.set(0, 0, 0);
    clonedScene.scale.set(1, 1, 1);
    clonedScene.updateMatrixWorld(true);

    // 2. Medir caja envolvente real del objeto
    const rawBox = new THREE.Box3().setFromObject(clonedScene);
    const rawSize = new THREE.Vector3();
    rawBox.getSize(rawSize);
    const rawMaxDim = Math.max(rawSize.x, rawSize.y, rawSize.z);
    
    if (rawMaxDim === 0) return;

    // 3. Normalizar la escala para que cualquier mueble mida exactamente 1.6 unidades en el viewport 3D
    const TARGET_SIZE = 1.6;
    const scaleFactor = TARGET_SIZE / rawMaxDim;
    clonedScene.scale.setScalar(scaleFactor);
    clonedScene.updateMatrixWorld(true);
    
    // 4. Centrar el mueble en el origen (0, 0, 0)
    const normalizedBox = new THREE.Box3().setFromObject(clonedScene);
    const center = new THREE.Vector3();
    normalizedBox.getCenter(center);
    clonedScene.position.set(-center.x, -center.y, -center.z);
    clonedScene.updateMatrixWorld(true);
    
    // 5. Ajustar la cámara para encuadre ideal y nítido
    const fov = (camera as THREE.PerspectiveCamera).fov || 45;
    const fovRad = (fov * Math.PI) / 180;
    let cameraDistance = (TARGET_SIZE / 2) / Math.tan(fovRad / 2);
    
    const aspect = (camera as THREE.PerspectiveCamera).aspect || 1;
    if (aspect < 1) {
      cameraDistance /= aspect;
    }
    
    // Margen de padding suave (1.18) para que llene el visor con elegancia sin cortarse
    cameraDistance *= 1.18;
    
    camera.position.set(cameraDistance * 0.8, cameraDistance * 0.45, cameraDistance * 0.95);
    (camera as THREE.PerspectiveCamera).near = 0.01;
    (camera as THREE.PerspectiveCamera).far = 100;
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
    
    if (controls) {
      const ctrl = controls as any;
      ctrl.target.set(0, 0, 0);
      ctrl.minDistance = 0.4;
      ctrl.maxDistance = 8.0;
      ctrl.update();
    }
  }, [clonedScene, camera, controls, product?.sku]);

  // Mapeo Heurístico mediante traverse (solo para modelos antiguos sin texturas horneadas)
  useEffect(() => {
    const hasNativeMaterials = [
      // Clásica
      '828-5-B', '828-5-BR', '320-12', '708-15', '221150', '710150', '902-2-BR', '902-2-C',
      // Nordik
      '234094', '321021', '331330', '334026', '334093', '405330', '446330', '716330', '732330', '742332', '742334', '742336',
      // Kyoto
      '322250', '326250', '331250', '334250', '353250', '446250', '760250',
      // Curvalba
      '334271', '334272', '353270', '405270', '446270', '732270', '742270', '742272', '742273'
    ].includes(product?.sku || '');

    clonedScene.traverse((child: any) => {
      if (!child.isMesh) return;

      if (!hasNativeMaterials) {
        if (!child.geometry.attributes.uv) {
          generateBoxUVs(child.geometry);
        }

        const name = child.name.toLowerCase();
        if (isBlancoTotal) {
          child.material = whiteFrontMaterial;
        } else {
          const isWhitePart = 
            name.includes("puerta") || 
            (name.includes("frente") && !name.includes("faja")) ||
            (name.includes("fondo") && !name.includes("cajo") && !name.includes("cajon"));
          
          if (isWhitePart) {
            child.material = whiteFrontMaterial;
          }
        }
      }
      
      child.castShadow = false;
      child.receiveShadow = false;
      if (child.material) child.material.needsUpdate = true;
    });
  }, [clonedScene, woodMaterial, whiteFrontMaterial, isBlancoTotal, isCarvalhoTotal, product?.sku]);

  return <primitive object={clonedScene} />;
};

const isLocalhost = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || 
   window.location.hostname === '127.0.0.1' || 
   window.location.hostname.startsWith('192.168.'));

const ARLandingPage: React.FC<ARLandingPageProps> = ({ onBackToPdp, initialSelectedProduct }) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(initialSelectedProduct);
  const [showTutorial, setShowTutorial] = useState(false);
  const [activeTab, setActiveTab] = useState<'ar' | 'room'>('ar');
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [isAutoRotating, setIsAutoRotating] = useState(true); // Estado local para desactivar auto-giro al interactuar
  const modelViewerRef = useRef<any>(null);

  useEffect(() => {
    if (initialSelectedProduct) {
      setSelectedProduct(initialSelectedProduct);
    }
    setIsMobileDevice(/Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
  }, [initialSelectedProduct]);

  const triggerAR = () => {
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile) {
      setShowTutorial(true);
    } else {
      const mv = modelViewerRef.current;
      if (mv) mv.activateAR();
    }
  };

  const startARSession = () => {
    setShowTutorial(false);
    const mv = modelViewerRef.current;
    if (mv) {
      mv.activateAR();
    }
  };

  if (!selectedProduct) {
    return (
      <div className="min-h-screen bg-[#fcfbfa] flex flex-col items-center justify-center p-8">
        <p className="text-gray-500 font-light mb-4">No se ha seleccionado ningún mueble para AR.</p>
        <button onClick={onBackToPdp} className="px-6 py-3 bg-brand-support text-brand-bg rounded-xl font-bold uppercase tracking-wider">
          Volver al Producto
        </button>
      </div>
    );
  }

  const dimensions = selectedProduct.specs?.find(s => s.label.toLowerCase().includes('medida'))?.value || "120 x 40 x 75 cm";

  return (
    <div className="min-h-screen bg-[#fcfbfa] text-brand-primary flex flex-col items-center justify-center relative px-4 md:px-8 py-20">
      
      {/* Background decoration */}
      <div className="absolute top-0 left-0 right-0 h-[600px] bg-gradient-to-b from-[#f4f1eb]/50 to-transparent pointer-events-none -z-10" />

      {/* Volver button */}
      <motion.button
        onClick={onBackToPdp}
        className="absolute top-8 left-8 flex items-center text-brand-primary/60 hover:text-brand-primary transition-colors text-sm font-semibold group z-30"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <ChevronLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" />
        Volver al Producto
      </motion.button>

      {/* Tab Switcher - Only visible on localhost */}
      {isLocalhost && (
        <div className="flex bg-[#f4f1eb]/80 border border-gray-200/50 p-1.5 rounded-full mb-6 z-25 relative shadow-sm max-w-md w-full">
          <button
            onClick={() => setActiveTab('ar')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'ar'
                ? 'bg-brand-support text-brand-bg shadow-md'
                : 'text-gray-500 hover:text-brand-primary'
            }`}
          >
            <Smartphone size={14} />
            Cámara AR
          </button>
          <button
            onClick={() => setActiveTab('room')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'room'
                ? 'bg-brand-support text-brand-bg shadow-md'
                : 'text-gray-500 hover:text-brand-primary'
            }`}
          >
            <LayoutTemplate size={14} />
            Diseñar Habitación
          </button>
        </div>
      )}

      {(!isLocalhost || activeTab === 'ar') ? (
        <div className="w-full max-w-6xl z-10 flex flex-col lg:flex-row gap-12 mt-8 min-h-[70vh] items-stretch">
          
          {/* LEFT PANEL: PRODUCT INFO & QR */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 flex flex-col justify-between text-left bg-white/70 backdrop-blur-md p-8 md:p-10 rounded-[2.5rem] border border-white/80 shadow-xl"
          >
            <div>
              <span className="text-[11px] uppercase tracking-[0.25em] text-brand-support font-bold mb-3 block">Realidad Aumentada 3D</span>
              <h1 className="text-3xl md:text-4xl font-extralight text-brand-primary mb-6 font-serif leading-tight">
                Proyectá la <span className="font-semibold">{selectedProduct.title}</span> en tu casa
              </h1>
              
              <p className="text-gray-600 font-light text-sm md:text-base mb-8 leading-relaxed">
                Ubica la cómoda en tu habitación en tiempo real. Vas a poder ver cómo combina el acabado en roble y blanco con tus paredes, comprobar las medidas exactas y dar vueltas alrededor del mueble.
              </p>

              {/* Quick Specs */}
              <div className="space-y-3 border-y border-gray-100 py-6 mb-8 text-xs text-gray-500">
                <div className="flex justify-between">
                  <span className="font-medium uppercase tracking-wider">Dimensiones reales:</span>
                  <span className="font-bold text-gray-700">{dimensions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium uppercase tracking-wider">Línea:</span>
                  <span className="font-bold text-gray-700">{selectedProduct.linea || "Clásica"}</span>
                </div>
              </div>

              {/* Step Guides */}
              <h3 className="text-[10px] font-bold text-brand-primary/50 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                <HelpCircle size={14} />
                ¿Cómo probarlo?
              </h3>
              <ol className="space-y-4 text-xs text-gray-600 font-light">
                <li className="flex items-start">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-brand-support/10 text-brand-support text-[10px] font-bold mr-3 shrink-0">1</span>
                  <span><strong>En tu PC:</strong> Escaneá el código QR con tu celular.</span>
                </li>
                <li className="flex items-start">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-brand-support/10 text-brand-support text-[10px] font-bold mr-3 shrink-0">2</span>
                  <span><strong>En tu celu:</strong> Tocá el botón <strong>"Ver en tu habitación"</strong>.</span>
                </li>
              </ol>
            </div>

            {/* Action buttons and QR */}
            <div className="flex items-center gap-6 border-t border-gray-100 pt-8 mt-8">
              <div className="hidden sm:flex flex-col items-center bg-white p-3.5 rounded-2xl shadow-sm border border-gray-100/60 shrink-0">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(window.location.href)}`}
                  alt="Escaneá para AR"
                  className="w-24 h-24 object-contain"
                />
                <span className="text-[9px] text-gray-400 mt-2 uppercase tracking-widest font-bold">Escanear con celu</span>
              </div>

              {isMobileDevice && (
                <div className="flex-1 w-full">
                  <button
                    onClick={triggerAR}
                    className="flex items-center justify-center px-6 py-4 bg-brand-support hover:bg-brand-support-hover text-brand-bg rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-md hover:shadow-lg w-full gap-2.5"
                  >
                    <Camera size={16} />
                    Ver en tu habitación
                  </button>
                </div>
              )}
            </div>
          </motion.div>

          {/* RIGHT PANEL: INTERACTIVE 3D VIEWER (UPGRADED TO R3F PBR CANVAS) */}
          <div 
            className="flex-1 h-[50vh] lg:h-auto min-h-[450px] bg-[#fcfbfa] rounded-[2.5rem] overflow-hidden shadow-xl border border-gray-100 relative group flex flex-col items-stretch justify-center"
          >
            <div className="absolute top-6 left-6 z-10 bg-brand-primary/80 backdrop-blur-sm text-brand-bg px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 shadow-sm pointer-events-none">
              <Sparkles size={12} className="text-yellow-400 animate-pulse" />
              Visualizador 3D interactivo
            </div>

            {/* Canvas 3D de alta calidad fotorrealista PBR */}
            <div className="absolute inset-0 cursor-grab active:cursor-grabbing">
              <Canvas
                camera={{ position: [2.0, 1.2, 2.5], fov: 45, near: 0.01, far: 500 }}
                gl={{ 
                  alpha: true, 
                  antialias: true,
                  outputColorSpace: THREE.SRGBColorSpace,
                  toneMapping: THREE.ACESFilmicToneMapping,
                  toneMappingExposure: 1.15
                }}
              >
                <Suspense fallback={null}>
                  <ambientLight color="#ffffff" intensity={0.55} />
                  <hemisphereLight args={['#ffffff', '#b0b0b0', 1.2]} />
                  <directionalLight position={[4, 8, 5]} color="#ffffff" intensity={2.0} />
                  <OrbitControls 
                    makeDefault 
                    enableDamping 
                    dampingFactor={0.05}
                    target={[0, 0, 0]}
                    minDistance={0.05}
                    maxDistance={100.0}
                    autoRotate={isAutoRotating} // Auto-rotación sutil activada inicialmente
                    autoRotateSpeed={0.6} // Velocidad lenta y premium de presentación
                    onStart={() => setIsAutoRotating(false)} // Detención definitiva al primer click o arrastre manual
                  />

                  <ARModelRenderer product={selectedProduct} />
                  <Environment preset="city" />
                </Suspense>
              </Canvas>
            </div>

            {/* Hidden model-viewer to handle AR native camera sessions on mobile */}
            <div style={{ display: 'none' }}>
              {/* @ts-ignore */}
              <model-viewer
                ref={modelViewerRef}
                src={typeof window !== 'undefined' ? `${window.location.origin}${getModelUrl(selectedProduct?.sku)}` : ''}
                ar
                ar-modes="scene-viewer quick-look"
                ar-placement="floor"
                camera-controls
                exposure="1.2"
                environment-image="neutral"
                shadow-intensity="1.0"
                tone-mapping="neutral"
                tonemapping="neutral"
              >
                {/* @ts-ignore */}
                <button slot="ar-button" className="hidden" />
              </model-viewer>
            </div>
          </div>
        </div>
      ) : (
        <RoomPlanner3D product={selectedProduct} />
      )}

      {/* TUTORIAL MODAL OVERLAY */}
      <AnimatePresence>
        {showTutorial && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowTutorial(false)}
            />

            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-gray-100 z-50 text-left relative"
            >
              <button 
                onClick={() => setShowTutorial(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Cerrar modal"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-2.5 mb-4">
                <div className="p-2 bg-brand-support/10 text-brand-support rounded-xl">
                  <Camera size={20} />
                </div>
                <h2 className="text-lg font-bold text-brand-primary uppercase tracking-wider font-serif">Preparando Cámara AR</h2>
              </div>

              <p className="text-xs text-gray-500 font-light mb-6">
                Para lograr la mejor precisión en tu pantalla, seguí estos consejos sencillos:
              </p>

              <div className="space-y-4 text-xs text-gray-700 font-light mb-6">
                <div className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-brand-support/10 text-brand-support text-[10px] font-bold shrink-0">⏳</span>
                  <p><strong>Esperá unos segundos:</strong> Apenas apuntes la cámara, aguardá un momento sin moverte para que el mueble se cargue en pantalla (puede tardar un ratito en cargarse).</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-brand-support text-brand-bg text-[10px] font-bold shrink-0">1</span>
                  <p><strong>Buscá el piso:</strong> Apuntá tu cámara al suelo y mové despacio el celular en círculos para detectar el piso.</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-brand-support text-brand-bg text-[10px] font-bold shrink-0">2</span>
                  <p><strong>Acomodalo y escalalo:</strong> Deslizá con 1 dedo para arrastrarlo, usá 2 dedos en círculo para rotar el mueble, o <strong>pellizcá con 2 dedos (pinch) para agrandar o achicar su escala</strong>.</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-brand-support text-brand-bg text-[10px] font-bold shrink-0">3</span>
                  <p><strong>Sacá fotos:</strong> Presioná el botón de captura nativo de la cámara para guardar una foto de tu diseño.</p>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200/60 p-4 rounded-2xl text-[11px] text-amber-800 leading-relaxed mb-8">
                <h4 className="font-bold mb-1 flex items-center gap-1">
                  <Sparkles size={14} className="text-amber-600 shrink-0" />
                  Tip para pisos brillantes o cerámicos:
                </h4>
                <p>
                  Si tenés pisos muy pulidos o claros, la cámara puede tardar en detectar la altura y el mueble podría flotar. <strong>Apuntá primero hacia donde el piso toca la pared (el zócalo) o una alfombra</strong> para que la cámara fije la base de inmediato.
                </p>
              </div>

              <button
                onClick={startARSession}
                className="w-full py-4 bg-brand-support hover:bg-brand-support-hover text-brand-bg rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2"
              >
                Abrir Cámara AR
                <ArrowUpRight size={16} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ARLandingPage;