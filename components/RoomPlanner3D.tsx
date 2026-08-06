import React, { useState, Suspense, useMemo, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { Move, RotateCw, Palette, Layers, RefreshCw, Upload, Image, Plus, Minus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '../types/product';
// Importamos los modelos 3D como módulos Vite para forzar el fingerprint único en producción
import glbModelUrl839BR from '../assets/modelos_3d/linea-clasica/A008395/A008395_v7_iluminado.glb?url';
import glbModelUrl839B from '../assets/modelos_3d/linea-clasica/A008395/A008395_v7_blanco.glb?url';

import glbModelUrl902BR from '../assets/modelos_3d/linea-clasica/A009022/A009022_v1_iluminado.glb?url';
import glbModelUrl902C from '../assets/modelos_3d/linea-clasica/A009022/A009022_v1_carvalho.glb?url';

const getModelUrl = (sku?: string) => {
  if (sku === '902-2-C') return glbModelUrl902C;
  if (sku === '902-2-BR') return glbModelUrl902BR;
  if (sku === '839-5-B') return glbModelUrl839B;
  return glbModelUrl839BR;
};

// Pre-cargamos todos los modelos GLB para asegurar transición instantánea sin pantallas en blanco
useGLTF.preload(glbModelUrl839BR);
useGLTF.preload(glbModelUrl839B);
useGLTF.preload(glbModelUrl902BR);
useGLTF.preload(glbModelUrl902C);

interface RoomPlanner3DProps {
  product: Product;
}

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

// Cargador de Modelo 3D con Texturas PBR e Interacciones en Vivo
const ModelRenderer = ({ 
  drawerColor, 
  position, 
  scale, 
  rotation, 
  setSelected,
  product
}: any) => {
  const isBlancoTotal = product?.sku === '839-5-B';
  const isCarvalhoTotal = product?.sku === '902-2-C';
  const glbUrl = getModelUrl(product?.sku);
  const { scene } = useGLTF(glbUrl);
  const groupRef = useRef<THREE.Group>(null);
  
  // Clonar la escena para evitar contaminar el cache compartido de useGLTF
  const clonedScene = useMemo(() => {
    return scene.clone(true);
  }, [scene]);

  // Extraemos capacidades de renderizado (anisotropía)
  const { gl } = useThree();

  // =========================================================================
  // 1. CARGA DE LA MELAMINA CON ANISOTROPÍA Y CÁLCULO DE REPETICIÓN AUTO
  // =========================================================================
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

  // =========================================================================
  // MODIFICACIÓN DE LA REGLA DE ESCALA FÍSICA (Tiling a lo largo de la veta)
  // =========================================================================
  React.useEffect(() => {
    if (size) {
      // Estiramos la veta horizontalmente en X y reducimos la repetición en Y para alargar las líneas de la madera
      woodTexture.repeat.set(size.x / 1.6, size.y / 1.2);
      normalTexture.repeat.copy(woodTexture.repeat);
      woodTexture.needsUpdate = true;
      normalTexture.needsUpdate = true;
    }
  }, [size, woodTexture, normalTexture]);

  // =========================================================================
  // 3. DEFINICIÓN DE MATERIALES PBR PREMIUM
  // =========================================================================
  
  // Material Carvalho PBR único para la melamina Carvalho
  const woodMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      map: woodTexture,
      normalMap: normalTexture,
      normalScale: new THREE.Vector2(0.4, 0.4),
      roughness: 0.58, // Terminado satinado/mate de melamina
      metalness: 0.0,
      color: new THREE.Color(0xffffff)
    });
  }, [woodTexture, normalTexture]);

  // Frentes de Cajón (Laca Blanca Satinada con clearcoat físico)
  const whiteFrontMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#F7F7F5"), // Blanco cálido roto
      roughness: 0.25,
      metalness: 0.0,
      clearcoat: 0.6, // Barniz exterior satinado
      clearcoatRoughness: 0.15
    });
  }, []);

  // =========================================================================
  // 4. ASIGNACIÓN INTELIGENTE POR TRAVERSE (Mapeo Heurístico)
  // =========================================================================
  React.useEffect(() => {
    clonedScene.traverse((child: any) => {
      if (!child.isMesh) return;
      
      // Proyección UV procedural por si el modelo carece de mapa de coordenadas
      if (!child.geometry.attributes.uv) {
        generateBoxUVs(child.geometry);
      }

      const name = child.name.toLowerCase();
      
      if (isBlancoTotal) {
        child.material = whiteFrontMaterial;
      } else if (isCarvalhoTotal) {
        // Para el modelo Carvalho Total (902-2-C), conservamos la textura nativa horneada
      } else {
        // En Blanco-Roble (839-5-BR y 902-2-BR): puertas, frentes de cajón y fondos de mueble usan blanco
        const isWhitePart = 
          name.includes("puerta") || 
          (name.includes("frente") && !name.includes("faja")) ||
          name.includes("fondosxxmueb") || 
          name.includes("fondo_mueble");
        
        if (isWhitePart) {
          child.material = whiteFrontMaterial;
        }
      }
      
      // Sombras duras desactivadas para evitar manchas negras en el fondo del living
      child.castShadow = false;
      child.receiveShadow = false;
      
      if (child.material) child.material.needsUpdate = true;
    });
  }, [clonedScene, drawerColor, woodMaterial, whiteFrontMaterial, isBlancoTotal, isCarvalhoTotal]);

  const onPointerDown = (e: any) => {
    e.stopPropagation();
    setSelected(true);
  };

  const rotationRad = (rotation * Math.PI) / 180;

  return (
    <group 
      ref={groupRef}
      position={[position.x, position.y, 0]}
      rotation={[0.1, rotationRad, 0]}
      scale={[scale, scale, scale]} 
      onPointerDown={onPointerDown}
    >
      <primitive object={clonedScene} />
      
      {/* El piso geométrico gris y atrapa-sombras invisible han sido removidos por completo */}
    </group>
  );
};

// Componente Principal del Planificador de Habitaciones 3D
const RoomPlanner3D: React.FC<RoomPlanner3DProps> = ({ product }) => {
  const [activeTemplate, setActiveTemplate] = useState<'nordica' | 'industrial' | 'terracota'>('nordica');
  const [uploadedBg, setUploadedBg] = useState<string | null>(null);
  const [bgAspectRatio, setBgAspectRatio] = useState<number>(1.5);
  const [drawerColor, setDrawerColor] = useState<'blanco' | 'madera'>('blanco');
  const [currentStep, setCurrentStep] = useState(1); // Control del paso activo del Wizard
  
  // Transform states
  const [posX, setPosX] = useState(0.0);
  const [posY, setPosY] = useState(-0.65);
  const [scale, setScale] = useState(1.0);
  const [rot, setRot] = useState(0);

  // Selection state
  const [selected, setSelected] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const isDraggingRef = useRef(false);
  const lastPosRef = useRef({ x: 0, y: 0 });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUploadedBg(url);
      setCurrentStep(2); // Avanza automáticamente al Paso 2 cuando se sube la foto
      
      const img = new window.Image();
      img.onload = () => {
        const ratio = img.naturalWidth / img.naturalHeight;
        setBgAspectRatio(ratio);
      };
      img.src = url;
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleTemplateChange = (temp: 'nordica' | 'industrial' | 'terracota') => {
    setActiveTemplate(temp);
    setUploadedBg(null);
    setBgAspectRatio(1.5);
    setSelected(false);
  };

  const handleReset = () => {
    setPosX(0.0);
    setPosY(-0.65);
    setScale(1.0);
    setRot(0);
    setUploadedBg(null);
    setBgAspectRatio(1.5);
    setActiveTemplate('nordica');
    setSelected(false);
    setCurrentStep(1); // Regresa al Paso 1 al reiniciar
  };

  const startDrag = (clientX: number, clientY: number) => {
    if (selected) {
      isDraggingRef.current = true;
      lastPosRef.current = { x: clientX, y: clientY };
    }
  };

  const updateDrag = (clientX: number, clientY: number) => {
    if (isDraggingRef.current) {
      const dx = clientX - lastPosRef.current.x;
      const dy = clientY - lastPosRef.current.y;
      
      setPosX(prev => Math.max(-2.5, Math.min(2.5, prev + dx * 0.008)));
      setPosY(prev => Math.max(-2.0, Math.min(2.0, prev - dy * 0.008)));
      
      lastPosRef.current = { x: clientX, y: clientY };
    }
  };

  const stopDrag = () => {
    isDraggingRef.current = false;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    startDrag(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    updateDrag(e.clientX, e.clientY);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      startDrag(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      updateDrag(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const currentBg = useMemo(() => {
    if (uploadedBg) return uploadedBg;
    if (activeTemplate === 'industrial') return '/images/room_industrial.png';
    if (activeTemplate === 'terracota') return '/images/room_terracotta.png';
    return '/images/room_nordic.png';
  }, [uploadedBg, activeTemplate]);

  return (
    <div className="flex flex-col lg:flex-row gap-8 w-full max-w-6xl items-stretch mt-8 z-10">
      
      {/* LEFT SIDE: CONTROLS (REFACtORIZADO A WIZARD DE 2 PASOS) */}
      <div className="w-full lg:w-[32%] shrink-0 flex flex-col justify-between text-left bg-white/70 backdrop-blur-md p-6 md:p-8 rounded-[2.5rem] border border-white/80 shadow-xl min-h-[500px]">
        <div className="space-y-6 flex-1 flex flex-col justify-between">
          <div className="space-y-6">
            {/* Header del planificador */}
            <div>
              <span className="text-[11px] uppercase tracking-[0.25em] text-brand-support font-bold mb-2 block">Estilo IKEA Kreativ</span>
              <h2 className="text-2xl font-extralight text-brand-primary font-serif leading-tight">
                Diseñá en tu <span className="font-semibold">Habitación</span>
              </h2>
            </div>

            {/* Barra de progreso minimalista para el Wizard de 2 Pasos */}
            <div className="flex items-center justify-between border-y border-gray-100 py-4 w-full">
              {[
                { step: 1, label: 'Habitación' },
                { step: 2, label: 'Ajuste del Mueble' }
              ].map((item, idx) => (
                <React.Fragment key={item.step}>
                  <div className="flex items-center gap-1.5">
                    <div 
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300 ${
                        currentStep === item.step
                          ? 'bg-brand-support text-brand-bg shadow-sm scale-110'
                          : currentStep > item.step
                          ? 'bg-brand-primary text-brand-bg'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {item.step}
                    </div>
                    <span 
                      className={`text-[9px] uppercase tracking-wider font-bold ${
                        currentStep === item.step ? 'text-brand-primary font-extrabold' : 'text-gray-400 font-medium'
                      }`}
                    >
                      {item.label}
                    </span>
                  </div>
                  {idx < 1 && (
                    <div 
                      className={`flex-1 h-[1.5px] mx-4 transition-all duration-300 ${
                        currentStep > item.step ? 'bg-brand-primary' : 'bg-gray-200'
                      }`} 
                    />
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* CONTENIDO DEL PASO ACTIVO */}
            
            {/* PASO 1: SUBIR FONDO DE LA HABITACIÓN */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-xs uppercase tracking-wider font-bold text-brand-primary/60 flex items-center gap-2">
                    <Image size={14} />
                    Paso 1: Subí la foto de tu habitación
                  </h3>
                  <p className="text-[11px] text-gray-400 font-light leading-relaxed">
                    Saca una foto o selecciona una de tu galería para proyectar el mueble a escala real.
                  </p>
                </div>
                
                <div className="pt-2">
                  <button
                    onClick={triggerFileUpload}
                    className={`w-full flex items-center justify-center gap-3 p-6 rounded-2xl border text-center transition-all ${
                      uploadedBg
                        ? 'border-brand-support bg-brand-support/5 ring-1 ring-brand-support text-brand-support'
                        : 'border-dashed border-gray-300 bg-white hover:border-gray-400 text-gray-600 shadow-sm'
                    }`}
                  >
                    <Upload size={18} />
                    <div className="text-left">
                      <div className="text-[11px] font-bold uppercase tracking-wider">
                        {uploadedBg ? 'Foto Cargada con Éxito' : 'Subir Mi Foto'}
                      </div>
                      <div className="text-[9px] text-gray-400 font-light mt-0.5">
                        Procesamiento local 100% privado
                      </div>
                    </div>
                  </button>
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              </div>
            )}

            {/* PASO 2: AJUSTAR EL MUEBLE EN TU ESPACIO */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-xs uppercase tracking-wider font-bold text-brand-primary/60 flex items-center gap-2">
                    <Move size={14} />
                    Paso 2: Ajustar en tu Espacio
                  </h3>
                  <p className="text-[11px] text-gray-400 font-light leading-relaxed">
                    Usa los sliders para centrar y dimensionar el mueble con precisión sobre tu foto.
                  </p>
                </div>
                
                <div className="space-y-3.5 bg-gray-50/50 p-4 md:p-5 rounded-2xl border border-gray-100 mt-2">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-bold uppercase text-gray-500">
                      <span>Horizontal (X)</span>
                      <span className="font-mono text-gray-700">{posX.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="-2.5"
                      max="2.5"
                      step="0.01"
                      value={posX}
                      onChange={(e) => setPosX(parseFloat(e.target.value))}
                      className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-support"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-bold uppercase text-gray-500">
                      <span>Vertical (Y)</span>
                      <span className="font-mono text-gray-700">{posY.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="-2.0"
                      max="2.0"
                      step="0.01"
                      value={posY}
                      onChange={(e) => setPosY(parseFloat(e.target.value))}
                      className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-support"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-bold uppercase text-gray-500">
                      <span>Tamaño (Escala)</span>
                      <span className="font-mono text-gray-700">{(scale * 100).toFixed(0)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.3"
                      max="2.0"
                      step="0.01"
                      value={scale}
                      onChange={(e) => setScale(parseFloat(e.target.value))}
                      className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-support"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-bold uppercase text-gray-500">
                      <span>Giro (Rotación)</span>
                      <span className="font-mono text-gray-700">{rot}°</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      step="1"
                      value={rot}
                      onChange={(e) => setRot(parseInt(e.target.value))}
                      className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-support"
                    />
                  </div>
                </div>

                <button
                  onClick={handleReset}
                  className="flex items-center justify-center px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-[10px] font-bold uppercase tracking-wider text-gray-500 w-full gap-2 transition-colors border border-gray-200/50"
                >
                  <RefreshCw size={12} />
                  Reiniciar Simulador
                </button>
              </div>
            )}
          </div>

          {/* BOTONES DE NAVEGACIÓN INFERIORES DEL WIZARD */}
          <div className="flex items-center gap-3 pt-6 border-t border-gray-100 mt-6 bg-white/40">
            {currentStep > 1 && (
              <button
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="flex items-center justify-center gap-1.5 px-5 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 text-[10px] font-bold uppercase tracking-wider text-gray-600 transition-colors"
              >
                <ChevronLeft size={14} />
                Atrás
              </button>
            )}
            
            {currentStep < 2 ? (
              <button
                onClick={() => setCurrentStep(prev => prev + 1)}
                disabled={currentStep === 1 && !uploadedBg}
                className={`flex-1 flex items-center justify-center gap-1.5 px-5 py-3 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${
                  currentStep === 1 && !uploadedBg
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200/30'
                    : 'bg-brand-support hover:bg-brand-support-hover text-brand-bg shadow-sm'
                }`}
              >
                Siguiente
                <ChevronRight size={14} />
              </button>
            ) : (
              <div className="flex-1 text-[10px] font-bold text-brand-support uppercase tracking-widest text-right flex items-center justify-end gap-1">
                <span>¡Simulación lista!</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: PHOTO CONFIGURATOR CANVAS */}
      <div className="flex-1 flex flex-col justify-center items-center relative">
        {currentStep === 1 && !uploadedBg ? (
          <div 
            onClick={triggerFileUpload}
            className="w-full aspect-[1.4] max-h-[72vh] bg-gray-50 hover:bg-gray-100/50 rounded-[2.5rem] border-2 border-dashed border-gray-200 transition-all cursor-pointer flex flex-col items-center justify-center p-8 text-center space-y-4 shadow-sm"
          >
            <div className="w-16 h-16 rounded-full bg-brand-support/10 text-brand-support flex items-center justify-center">
              <Image size={32} />
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-brand-primary uppercase tracking-wider">
                El simulador se activará acá
              </h3>
              <p className="text-xs text-gray-400 font-light max-w-xs mx-auto leading-relaxed">
                cuando subas la foto de tu espacio.
              </p>
            </div>
          </div>
        ) : (
          <div 
            ref={containerRef}
            className="w-full rounded-[2.5rem] overflow-hidden shadow-xl border border-gray-100 relative cursor-grab active:cursor-grabbing"
            style={{ 
              backgroundImage: `url(${currentBg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundColor: '#eaeae8',
              aspectRatio: bgAspectRatio.toString(),
              maxHeight: '72vh'
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={stopDrag}
            onMouseLeave={stopDrag}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={stopDrag}
          >


            <Suspense fallback={
              <div className="absolute inset-0 bg-black/30 backdrop-blur-sm flex flex-col items-center justify-center text-white text-xs gap-3">
                <div className="w-8 h-8 border-4 border-brand-support border-t-transparent rounded-full animate-spin" />
                Cargando habitación...
              </div>
            }>
              <div style={{ width: '100%', height: '100%' }}>
                <Canvas 
                  // Gestión de color y mapeo de tonos fílmico sin el sistema de sombras duras
                  gl={{ 
                    alpha: true, 
                    antialias: true,
                    outputColorSpace: THREE.SRGBColorSpace,
                    toneMapping: THREE.ACESFilmicToneMapping,
                    toneMappingExposure: 1.15
                  }}
                  camera={{ position: [0, 0, 3.8], fov: 38 }}
                  onPointerMissed={() => setSelected(false)}
                >
                  <Suspense fallback={null}>
                    {/* Iluminación de estudio física y suave */}
                    <ambientLight color="#ffffff" intensity={0.45} />
                    <hemisphereLight args={['#ffffff', '#b0b0b0', 1.2]} />
                    
                    {/* Luz de sol direccional sin generación de sombras proyectadas (castShadow removido) */}
                    <directionalLight 
                      position={[3, 6, 4]} 
                      color="#ffffff"
                      intensity={2.0} 
                    />

                    {/* Renderizador del mueble */}
                    <ModelRenderer 
                      drawerColor={drawerColor} 
                      position={{ x: posX, y: posY }} 
                      scale={scale} 
                      rotation={rot} 
                      selected={selected}
                      setSelected={setSelected}
                      product={product}
                    />
                  </Suspense>
                </Canvas>
              </div>
            </Suspense>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomPlanner3D;
