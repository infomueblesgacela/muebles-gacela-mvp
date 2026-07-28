import React, { useState, useRef, useMemo, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Camera, Sparkles, X, Star, HelpCircle, ArrowUpRight, LayoutTemplate, Smartphone } from 'lucide-react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { Product } from '../types/product';
import RoomPlanner3D from './RoomPlanner3D';

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
const ARModelRenderer = () => {
  const { scene } = useGLTF('/modelos_3d/linea-clasica/A008395/A008395_v6.glb?v=5');
  const { gl, camera, controls } = useThree();
  const centeredRef = useRef(false);

  // Clonar la escena para evitar contaminar el cache compartido de useGLTF
  const clonedScene = useMemo(() => {
    return scene.clone(true);
  }, [scene]);

  // 1. CARGA DE TEXTURAS PBR PREMIUM CON ANISOTROPÍA MÁXIMA (Con busteo de caché)
  const { woodTexture, normalTexture } = useMemo(() => {
    const textureLoader = new THREE.TextureLoader();
    
    // Carga de texturas reales (Mel Avellana Carvalho y su mapa de relieve normal) con ?v=5 para forzar refresco
    const wood = textureLoader.load('/images/Mel Avellana (Carvalho).jpg?v=5');
    const normal = textureLoader.load('/images/texture_normal.jpg?v=5');
    
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
  }, [gl]);

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

  // Centrado automático y escalado de la cámara para que el mueble llene el canvas
  useEffect(() => {
    if (!clonedScene || !camera || centeredRef.current) return;
    
    // Obtener caja y centro real
    const box = new THREE.Box3().setFromObject(clonedScene);
    const center = new THREE.Vector3();
    box.getCenter(center);
    const boxSize = new THREE.Vector3();
    box.getSize(boxSize);
    
    // Si la caja está vacía o el tamaño es 0, esperar a que cargue
    if (boxSize.x === 0) return;
    
    // Centrar el objeto en el origen local (0, 0, 0)
    clonedScene.position.set(-center.x, -center.y, -center.z);
    
    // Ajustar la cámara para encuadrar perfectamente según el tamaño del mueble
    const maxDim = Math.max(boxSize.x, boxSize.y, boxSize.z);
    const fov = (camera as THREE.PerspectiveCamera).fov || 45;
    const fovRad = fov * (Math.PI / 180);
    let cameraDistance = Math.abs(maxDim / 2 / Math.tan(fovRad / 2));
    
    // Si la pantalla es vertical (aspect < 1), el campo de visión horizontal es más estrecho.
    // Debemos alejar la cámara proporcionalmente para que el ancho del mueble no se corte en los costados.
    const aspect = (camera as THREE.PerspectiveCamera).aspect || 1;
    if (aspect < 1) {
      cameraDistance /= aspect;
    }
    
    // Margen de padding (1.35) para un encuadre perfecto y espaciado
    cameraDistance *= 1.35;
    
    camera.position.set(cameraDistance * 0.8, cameraDistance * 0.4, cameraDistance);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
    
    if (controls) {
      (controls as any).target.set(0, 0, 0);
      (controls as any).update();
      centeredRef.current = true;
    }
  }, [clonedScene, camera, controls]);

  // Mapeo Heurístico mediante traverse
  useEffect(() => {
    clonedScene.traverse((child: any) => {
      if (!child.isMesh) return;

      // Proyección UV procedural únicamente si carece de coordenadas UV nativas
      if (!child.geometry.attributes.uv) {
        generateBoxUVs(child.geometry);
      }

      const name = child.name.toLowerCase();
      console.log("Mesh detectado en AR:", child.name);
      
      // Los cajones/frentes laqueados tienen prioridad absoluta para mantenerse en blanco
      if (name.includes("frente") || name.includes("drawer") || name.includes("cajon")) {
        child.material = whiteFrontMaterial;
      } else {
        // Todas las demás partes de melamina (costados, laterales, tapas, bases, fondos, etc.) usan el woodMaterial unificado
        child.material = woodMaterial;
      }
      
      // Sombras duras desactivadas
      child.castShadow = false;
      child.receiveShadow = false;
      
      if (child.material) child.material.needsUpdate = true;
    });
  }, [clonedScene, woodMaterial, whiteFrontMaterial]);

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
                camera={{ position: [1.5, 0.8, 2.2], fov: 45, near: 0.01, far: 100 }}
                gl={{ 
                  alpha: true, 
                  antialias: true,
                  outputColorSpace: THREE.SRGBColorSpace,
                  toneMapping: THREE.ACESFilmicToneMapping,
                  toneMappingExposure: 1.15
                }}
              >
                <Suspense fallback={null}>
                  <ambientLight color="#ffffff" intensity={0.45} />
                  <hemisphereLight args={['#ffffff', '#b0b0b0', 1.2]} />
                  <directionalLight position={[3, 6, 4]} color="#ffffff" intensity={2.0} />
                  <OrbitControls 
                    makeDefault 
                    enableDamping 
                    dampingFactor={0.05}
                    target={[0, 0, 0]}
                    minDistance={0.5}
                    maxDistance={10.0}
                    autoRotate={isAutoRotating} // Auto-rotación sutil activada inicialmente
                    autoRotateSpeed={0.6} // Velocidad lenta y premium de presentación
                    onStart={() => setIsAutoRotating(false)} // Detención definitiva al primer click o arrastre manual
                  />

                  <ARModelRenderer />
                  <Environment preset="city" />
                </Suspense>
              </Canvas>
            </div>

            {/* Hidden model-viewer to handle AR native camera sessions on mobile */}
            <div style={{ display: 'none' }}>
              {/* @ts-ignore */}
              <model-viewer
                ref={modelViewerRef}
                src="https://muebles-gacela-nvp.vercel.app/modelos_3d/linea-clasica/A008395/A008395_v6.glb?v=5"
                ar
                ar-modes="scene-viewer quick-look"
                ar-placement="floor"
                camera-controls
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