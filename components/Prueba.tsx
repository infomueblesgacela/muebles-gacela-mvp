import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, PerspectiveCamera, Environment, Html, useGLTF } from '@react-three/drei';
import { motion } from 'framer-motion';
import { Box, Ruler, MousePointer2 } from 'lucide-react';

const PieceModel: React.FC<{ url: string }> = ({ url }) => {
    const gltf = useGLTF(url);
    const scene = Array.isArray(gltf) ? gltf[0].scene : gltf.scene;
    return <primitive object={scene} />;
};

const Prueba: React.FC = () => {
    const modelUrl = "/Placard Nordik.glb";

    return (
        <div className="min-h-screen bg-brand-bg flex flex-col pt-24 pb-12 px-6">
            <div className="container mx-auto max-w-6xl flex-1 flex flex-col">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-4xl md:text-5xl font-serif text-brand-primary font-light mb-4">
                        Página de <span className="font-bold italic">Prueba 3D</span>
                    </h1>
                    <p className="text-gray-600 max-w-2xl">
                        Visualización directa del modelo 3D <span className="font-semibold text-brand-primary">Placard Nordik</span>. 
                        Arrastra para rotar y usa el scroll para hacer zoom.
                    </p>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex-1 bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden relative min-h-[600px]"
                >
                    {/* Header del Visualizador */}
                    <div className="absolute top-0 left-0 right-0 p-6 z-10 flex justify-between items-start pointer-events-none">
                        <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-3 pointer-events-auto">
                            <Box className="text-brand-support" size={20} />
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Modelo</p>
                                <p className="text-sm font-bold text-brand-primary uppercase">Placard Nordik</p>
                            </div>
                        </div>
                    </div>

                    {/* Canvas 3D */}
                    <div className="w-full h-full cursor-grab active:cursor-grabbing">
                        <Canvas shadows dpr={[1, 2]}>
                            <Suspense fallback={
                                <Html center>
                                    <div className="flex flex-col items-center justify-center space-y-4">
                                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-brand-support"></div>
                                        <p className="text-brand-primary text-xs font-bold uppercase tracking-widest">Cargando Modelo 20MB...</p>
                                    </div>
                                </Html>
                            }>
                                <PerspectiveCamera makeDefault position={[5, 5, 5]} fov={45} />
                                <OrbitControls
                                    makeDefault
                                    minDistance={2}
                                    maxDistance={20}
                                    enableDamping={true}
                                />

                                <Stage intensity={0.5} environment="city" adjustCamera={true}>
                                    <PieceModel url={modelUrl} />
                                </Stage>

                                <Environment preset="city" />
                                <ambientLight intensity={0.3} />
                                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
                            </Suspense>
                        </Canvas>
                    </div>

                    {/* Controles Overlay */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-none">
                        <div className="px-6 py-3 bg-brand-primary/90 backdrop-blur-md rounded-full shadow-xl border border-white/10 flex items-center space-x-4 transition-transform hover:scale-105 pointer-events-auto">
                            <MousePointer2 size={16} className="text-brand-support" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/80">
                                Interactúa con el modelo
                            </span>
                        </div>
                    </div>
                </motion.div>

                <div className="mt-8 flex justify-center">
                    <button 
                        onClick={() => window.history.back()}
                        className="text-xs font-bold uppercase tracking-widest text-brand-primary/40 hover:text-brand-support transition-colors"
                    >
                        Volver a la navegación anterior
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Prueba;
