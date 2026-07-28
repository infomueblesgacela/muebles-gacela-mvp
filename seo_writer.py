import pandas as pd
import re

file_path = 'productos_auditados.xlsx'
df = pd.read_excel(file_path, sheet_name='productos_auditados')

templates = {
    'Bahiut': {
        'short': "Optimiza el guardado en tu {ambiente} con este bahiut de diseño {linea}. Funcionalidad, estilo y capacidad en un solo mueble.",
        'long': "Transformá tu {ambiente} con el {nombre}. Este bahiut de la Línea {linea} está diseñado para ofrecer la máxima capacidad de almacenamiento sin sacrificar estética. Sus líneas limpias y su acabado en {color} lo convierten en la pieza central perfecta para hogares modernos que buscan organizar su vajilla, mantelería o decoración con elegancia y practicidad. Fabricado con materiales de primera calidad, garantiza durabilidad y resistencia al uso diario. Ideal para maximizar el espacio y darle un salto de calidad a tu decoración interior."
    },
    'Escritorio': {
        'short': "Trabajá o estudiá con comodidad. Este escritorio de la Línea {linea} aporta ergonomía y diseño minimalista a tu {ambiente}.",
        'long': "El {nombre} es el aliado perfecto para crear un espacio de trabajo productivo y estético. Perteneciente a nuestra exclusiva Línea {linea}, este escritorio destaca por su superficie de trabajo optimizada y su robustez. Su diseño inteligente permite organizar tus herramientas tecnológicas mientras su terminación en {color} se adapta a cualquier estilo de decoración, desde el nórdico hasta el industrial. Ideal para home office o habitaciones juveniles, combina la ergonomía necesaria para largas horas de uso con un diseño visualmente ligero."
    },
    'Cama': {
        'short': "Descansá mejor y organizá tu dormitorio con esta cama funcional de la Línea {linea}, diseñada para maximizar tu espacio.",
        'long': "Redefiní el confort en tu {ambiente} con la {nombre}. Diseñada bajo los estándares de la Línea {linea}, esta cama no es solo un lugar de descanso, sino una solución inteligente de almacenamiento. Su estructura firme y detalles en {color} aportan calidez y modernidad. Pensada para optimizar los metros cuadrados de tu habitación, te permite mantener el orden con estilo. Un mueble esencial que combina diseño contemporáneo y máxima practicidad para transformar tus noches y tus días."
    },
    'Cómoda': {
        'short': "Mantené todo en orden con esta amplia cómoda de diseño {linea}. La combinación perfecta de cajones espaciosos y estilo para tu {ambiente}.",
        'long': "La {nombre} es la respuesta definitiva a tus necesidades de organización. Inspirada en la estética de la Línea {linea}, esta cómoda aporta una solución de guardado eficiente con un diseño sumamente elegante. Su acabado en {color} ilumina tu {ambiente}, mientras que sus amplios cajones con guías de deslizamiento suave te permiten organizar ropa y accesorios de forma práctica. Es un mueble robusto, pensado para perdurar y elevar el perfil decorativo de cualquier dormitorio."
    },
    'Mesa': {
        'short': "Compartí los mejores momentos en tu {ambiente} con esta mesa de diseño {linea}. Firmeza, calidez y estilo para tu hogar.",
        'long': "La {nombre} de la Línea {linea} está pensada para ser el corazón de tus reuniones. Su superficie amplia y resistente, terminada en {color}, aporta una estética contemporánea y cálida a tu {ambiente}. Diseñada para soportar el ritmo de la vida cotidiana sin perder su encanto visual, esta mesa es ideal tanto para cenas familiares como para reuniones con amigos. Una pieza de mobiliario que equilibra a la perfección el diseño de vanguardia con la funcionalidad que tu casa necesita."
    },
    'Placard': {
        'short': "Organizá tu guardarropa con este placard de alta capacidad. Diseño moderno de la Línea {linea} para renovar tu {ambiente}.",
        'long': "El {nombre} transformará la forma en que organizás tu ropa. Perteneciente a nuestra Línea {linea}, este placard fue concebido para aprovechar cada centímetro de tu {ambiente}. Su cuidada distribución interior y su sofisticado acabado exterior en {color} ofrecen una solución de almacenamiento premium. Sus puertas y cajones están diseñados para un uso diario intensivo, garantizando durabilidad y un deslizamiento suave. Elegí diseño inteligente y mantené tu dormitorio impecable y con mucho estilo."
    },
    'Botinero': {
        'short': "Tus zapatos siempre ordenados con este botinero compacto y estético de la Línea {linea}. Ideal para la entrada o tu {ambiente}.",
        'long': "Simplificá tu rutina diaria con el {nombre}. Este botinero de la Línea {linea} te permite mantener todo tu calzado perfectamente organizado sin ocupar espacio extra en tu {ambiente}. Su diseño compacto y moderno, con detalles en {color}, lo convierte en un complemento decorativo ideal para recibir a tus visitas con orden y elegancia. Gracias a su inteligente distribución interna, maximiza el almacenamiento, protegiendo tus zapatos y aportando un aire de sofisticación a tu hogar."
    },
    'Barra': {
        'short': "Renová tu {ambiente} con esta moderna barra desayunador de la Línea {linea}. Funcionalidad y estilo para tus desayunos diarios.",
        'long': "La {nombre} es la adición perfecta para cocinas o comedores de concepto abierto. Como parte de la Línea {linea}, esta barra desayunador ofrece una superficie extra para comer, trabajar o socializar. Su estructura firme y su hermoso acabado en {color} se integran fluidamente en decoraciones modernas y minimalistas. Pensada para optimizar el espacio de tu {ambiente}, te permite crear una zona de comidas rápida y estilizada, elevando el valor funcional y visual de tu hogar."
    },
    'Alacena': {
        'short': "Optimizá el almacenamiento de tu cocina con esta alacena de la Línea {linea}. Diseño práctico y moderno en acabado {color}.",
        'long': "Mantené tu cocina impecable y organizada con la {nombre}. Diseñada para la Línea {linea}, esta alacena maximiza el espacio aéreo ofreciendo compartimentos amplios para tu vajilla y mercadería. Su terminación en {color} le da un aspecto limpio y luminoso a tu {ambiente}. Fabricada con materiales resistentes a la humedad y el uso diario, es la pieza clave para una cocina funcional y estéticamente atractiva, facilitando tu rutina culinaria con un diseño de excelencia."
    },
    'Bajomesada': {
        'short': "Completá tu cocina con este bajomesada de la Línea {linea}. Resistencia, diseño moderno y máxima capacidad de guardado.",
        'long': "El {nombre} es el soporte ideal para tu cocina. Con el diseño característico de la Línea {linea}, este bajomesada combina una estructura de alta resistencia con un estilo contemporáneo incomparable. Sus compartimentos y cajones están estratégicamente diseñados para organizar ollas, sartenes y utensilios de manera eficiente. Su acabado en {color} renueva visualmente tu {ambiente}, convirtiéndolo en un espacio donde da gusto cocinar. Calidad garantizada para el corazón de tu hogar."
    },
    'Rack': {
        'short': "El soporte ideal para tu TV y entretenimiento. Un rack moderno de la Línea {linea} para destacar en tu {ambiente}.",
        'long': "Armá tu propio cine en casa con el {nombre}. Este mueble rack de la Línea {linea} está pensado para ser el centro de atención de tu {ambiente}. Con espacio optimizado para consolas, decodificadores y decoración, su diseño limpio y acabado en {color} oculta el desorden y resalta tu pantalla. Su estructura sólida soporta el peso sin problemas, mientras que sus detalles de diseño aportan un toque vanguardista y ordenado a tu sala de estar o espacio de entretenimiento."
    },
    'Centro': {
        'short': "Completá tu centro de entretenimiento con este mueble de diseño {linea}. Elegancia y organización para tu {ambiente}.",
        'long': "El {nombre} es la pieza definitiva para tu sala de estar. Como exponente de la Línea {linea}, este centro de entretenimiento ofrece el equilibrio perfecto entre exhibición y almacenamiento. Sus compartimentos te permiten organizar cables, dispositivos electrónicos y objetos decorativos con total facilidad. Su revestimiento en {color} aporta calidez y textura a tu {ambiente}, transformando tus momentos de ocio frente a la televisión en una experiencia de puro diseño y confort."
    },
    'Biblioteca': {
        'short': "Exhibí tus libros y decoración con esta biblioteca moderna de la Línea {linea}. Un mueble versátil para tu {ambiente}.",
        'long': "La {nombre} es mucho más que un mueble de guardado: es un exhibidor de tu personalidad. Parte de nuestra exquisita Línea {linea}, esta biblioteca destaca por su solidez y sus líneas geométricas modernas. Su acabado en {color} crea un contraste ideal para resaltar tus libros favoritos, plantas y objetos de colección en tu {ambiente}. Ya sea en la oficina, el living o el dormitorio, este mueble optimiza el espacio vertical, aportando un aire intelectual y sofisticado a tu decoración interior."
    },
    'Respaldo': {
        'short': "Dale un marco de elegancia a tu cama con este respaldo de diseño {linea}. Confort visual y estilo para tu {ambiente}.",
        'long': "Transformá tu cama en una suite de diseño con el {nombre}. Este respaldo de la Línea {linea} es el detalle final que tu {ambiente} necesita para lucir completo y armonioso. Su diseño depurado y su tono en {color} aportan una sensación de amplitud y calidez inigualables. Construido con materiales de primera, no solo protege tus paredes, sino que enmarca tu zona de descanso con una estética moderna, elevando instantáneamente el nivel decorativo de todo tu dormitorio."
    },
    'Organizador': {
        'short': "Mantené el caos a raya con este organizador de la Línea {linea}. Práctico, estético y perfecto para optimizar tu {ambiente}.",
        'long': "El {nombre} es la solución versátil que estabas buscando para tu hogar. De diseño minimalista y perteneciente a la Línea {linea}, este mueble organizador se adapta a cualquier rincón de tu casa. Su funcionalidad es ideal para guardar desde juguetes y libros hasta artículos de oficina. El elegante acabado en {color} se fusiona naturalmente con tu {ambiente}, demostrando que el orden y el buen gusto pueden ir de la mano en una pieza de mobiliario de alta calidad."
    },
    'Repisa': {
        'short': "Decorá y organizá tus paredes con esta repisa moderna de la Línea {linea}. El detalle ideal para cualquier {ambiente}.",
        'long': "Aprovechá al máximo el espacio vertical de tu {ambiente} con la {nombre}. Esta repisa de la Línea {linea} es el estante perfecto para exhibir marcos, libros y pequeños objetos decorativos. Su diseño flotante o anclado, en un delicado acabado {color}, aporta ligereza visual y un toque de diseño nórdico/contemporáneo a tus paredes. Fabricada para resistir el peso necesario y sumar estilo, es un pequeño detalle que marca una gran diferencia en la personalidad de tus ambientes."
    },
    'Set': {
        'short': "Renová tu {ambiente} por completo con este set de diseño {linea}. Muebles combinados en perfecta armonía y funcionalidad.",
        'long': "El {nombre} es la manera más inteligente y estética de amueblar tu {ambiente}. Este conjunto de la Línea {linea} fue curado por nuestros expertos en diseño de interiores para ofrecerte una solución integral con acabados en {color}. Al elegir un set, te asegurás una coherencia visual absoluta, optimizando tus espacios con muebles que nacieron para estar juntos. Disfrutá de la sinergia entre funcionalidad y vanguardia, y transformá tu hogar con piezas de altísima calidad y estilo unificado."
    },
    'Torre': {
        'short': "Aprovechá el espacio aéreo con esta torre de guardado de la Línea {linea}. Diseño vertical y máxima capacidad para tu {ambiente}.",
        'long': "La {nombre} es la respuesta perfecta para ambientes donde cada centímetro cuenta. Perteneciente a nuestra Línea {linea}, esta torre maximiza el almacenamiento vertical con un diseño sumamente elegante. Sus repisas y puertas en acabado {color} te permiten organizar de manera eficiente sin recargar visualmente el {ambiente}. Ideal para baños, cocinas o esquinas del living, es un mueble compacto pero sorprendentemente espacioso que aporta modernidad y orden absoluto a tu hogar."
    }
}

fallback_template = {
    'short': "Descubrí el equilibrio perfecto entre diseño y funcionalidad con este mueble de la Línea {linea} para tu {ambiente}.",
    'long': "Renová tus espacios con el {nombre}. Este mueble de la Línea {linea} fue desarrollado con los más altos estándares de calidad, pensado para adaptarse a las exigencias de un hogar moderno. Su terminación en {color} aporta calidez y estilo, convirtiéndolo en una pieza que se integra a la perfección en tu {ambiente}. Disfrutá de un mobiliario diseñado para perdurar, optimizar tus metros cuadrados y elevar la estética general de tu casa, combinando innovación y durabilidad."
}

def generate_descriptions(row):
    nombre = str(row.get('Nombre_Comercial', '')).strip()
    linea = str(row.get('Linea', 'Exclusiva')).strip()
    ambiente = str(row.get('Ambiente', 'hogar')).strip()
    color_val = str(row.get('Color', '')).strip()
    
    if not color_val or color_val.lower() == 'nan':
        color_text = "nuestros exclusivos tonos"
    else:
        color_text = f"color {color_val}"
        
    if not ambiente or ambiente.lower() == 'nan':
        ambiente = "hogar"
    if not linea or linea.lower() == 'nan':
        linea = "Gacela"
        
    tipo = re.sub(r'[^a-zA-Z\s]', '', nombre).split()[0].capitalize() if nombre else 'Mueble'
    if tipo == 'Cmoda': tipo = 'Cómoda'
    
    tpl = templates.get(tipo, fallback_template)
    
    # Only replace if currently empty or nan
    desc_corta = str(row.get('Descripcion_Corta', '')).strip()
    desc_larga = str(row.get('Descripcion_Larga', '')).strip()
    
    # We will OVERWRITE them to ensure SEO optimization
    new_corta = tpl['short'].format(nombre=nombre, linea=linea, ambiente=ambiente.lower(), color=color_text)
    new_larga = tpl['long'].format(nombre=nombre, linea=linea, ambiente=ambiente.lower(), color=color_text)
    
    return new_corta, new_larga

# Apply descriptions
df[['Descripcion_Corta', 'Descripcion_Larga']] = df.apply(generate_descriptions, axis=1, result_type='expand')

# Save
with pd.ExcelWriter(file_path, engine='openpyxl', mode='a', if_sheet_exists='replace') as writer:
    df.to_excel(writer, sheet_name='productos_auditados', index=False)

print("Descriptions successfully generated and saved!")
