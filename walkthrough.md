# Walkthrough: Restauración Geométrica del Bahiut GAMMEL (A009022)

Hemos completado la reconstrucción y optimización del Bahiut GAMMEL (`A009022`) en 3D para el catálogo, resolviendo el problema de las piezas y puertas faltantes y asegurando que las texturas y orientaciones de la veta cumplan con el 100% de las especificaciones del cliente.

## Cambios Realizados

### 1. Reensamblado Inmutable de la Geometría (28 nodos, 27 meshes)
*   **Origen**: Mapeamos de forma explícita el despiece de los 22 archivos GLB individuales de FreeCAD dentro de `public/modelos_3d/linea-clasica/A009022/3d/` para reconstruir la cómoda sin perder geometría.
*   **Piezas duplicadas/simétricas**: Se configuraron traslaciones para las piezas simétricas (como la puerta grande/chica izquierda y derecha, el estante móvil chico y los costados de cajón) directamente en la jerarquía del Scene Graph en lugar de hornearlas físicamente.
*   **Efecto**: Three.js ahora dibuja correctamente el 100% de las 4 puertas, divisiones internas y laterales. Al no alterar los búferes de acceso, no hay conflicto de inversión de winding order y culling.

### 2. Rotación Exclusiva en el Nodo Raíz (Root Node)
*   Alineamos el modelo agregando una rotación de `-90°` en el eje X y traslación global a nivel del contenedor raíz (`root`):
    *   **Rotación**: Quaternion `[-0.7071068, 0, 0, 0.7071068]`
    *   **Translación**: `[-0.7345, 0.0115, 0.435]` en metros.
*   Esto posiciona el bahiut perfectamente vertical y apoyado en la base `Y = 0` sin deformar ni rotar de forma individual sus piezas constitutivas.

### 3. Mapeo de Texturas y Orientación de Fibra (PBR)
*   **Fibra Vertical en Costados**: Ajustamos el box-mapping en coordenadas relativas para que la textura de melamina Carvalho (`Mel Avellana (Carvalho).jpg`) tenga veta vertical en los costados laterales de la estructura y veta de profundidad en la tapa superior.
*   **Frentes e Interiores**:
    *   **Laca Blanca**: Los frentes de cajón y las 4 puertas se pintan con laca blanca satinada (`#F7F7F5`) con rugosidad `0.25`.
    *   **Fondos Blancos**: De acuerdo con las indicaciones del cliente, los 4 paneles traseros (fondos central y laterales) se pintan de blanco laqueado liso para simular melamina blanca.

### 4. Compilación e Integración Local
*   Corrimos la compilación con `build_gammel_v4.py` que genera los archivos optimizados listos para producción:
    *   `assets/modelos_3d/linea-clasica/A009022/A009022_v1_iluminado.glb` (Blanco-Roble bicolor)
    *   `assets/modelos_3d/linea-clasica/A009022/A009022_v1_carvalho.glb` (Carvalho Total)
*   Compilamos el sitio web localmente con Vite (`vite build`) para asegurar que no existan errores de rutas ni hashes de archivos rotos.

---

## Verificación Realizada

1.  **Scene Graph Validado**: Comprobamos la jerarquía del modelo compilado ejecutando un script de validación. El resultado confirma la presencia de todos los nodos (28) y mallas (27).
2.  **Compilación en Producción**: Ejecutada con éxito sin advertencias ni errores.
3.  **Visualización en Localhost**: El visor 3D renderiza de forma óptima el mueble en [http://localhost:4000/clasica/902-2-BR](http://localhost:4000/clasica/902-2-BR).
