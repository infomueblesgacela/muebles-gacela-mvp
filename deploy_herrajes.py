import os
import shutil
import json
import unicodedata
import pandas as pd

def normalize_text(text):
    if not isinstance(text, str):
        return ""
    # Remove accents and normalize to lowercase
    nfkd_form = unicodedata.normalize('NFKD', text)
    text_ascii = nfkd_form.encode('ascii', 'ignore').decode('utf-8')
    return text_ascii.lower().strip()

def main():
    base_dir = r"C:\Users\usuario\Documents\Oncede\Clientes\Muebles Gacela\Web\Muebles gacela MVP"
    excel_path = os.path.join(base_dir, "Herrajes_y_Herramientas_Muebles_Gacela.xlsx")
    herrajes_src_dir = os.path.join(base_dir, "herrajes")
    modelos_3d_dir = os.path.join(base_dir, "modelos_3d")
    report_path = os.path.join(base_dir, "resumen_deployment.json")

    print("Starting digital asset deployment...")

    # Dictionary mapping normalized element name to its corresponding webp file(s)
    # Each value is a list of filenames from the source herrajes folder.
    MAPPING = {
        'bases cuadradas': ['base-plastica.webp'],
        'bases plasticas': ['base-plastica.webp'],
        'bases redonda para clavar': ['clavos-de-caucho.webp'],
        'bases redondas para clavar': ['clavos-de-caucho.webp'],
        'bisagras codo 0': ['bisagra.webp'],
        'bisagras codo 15': ['bisagra.webp'],
        'bisagras codo 9': ['bisagra.webp'],
        'carros inferiores': ['carro-interior.webp'],
        'cano 5/8 (86.2 cm)': ['cano.webp'],
        'canos 57.5 cm': ['cano.webp'],
        'clips': ['clip.webp'],
        'cola (envase)': ['cola.webp'],
        'corner': ['corner.webp'],
        'escuadras': ['escuadra.webp'],
        'escuadras metalicas': ['escuadra-metalica.webp'],
        'escuadras plasticas': ['escuadra_plastica.webp'],
        'ganchos l': [],  # Missing asset
        'guias metalicas': ['guias-metalicas.webp'],
        'guias metalicas 30 cm': ['guias-metalicas.webp'],
        'guias metalicas 35 cm': ['guias-metalicas.webp'],
        'guias metalicas 40 cm': ['guias-metalicas.webp'],
        'kit botineros': ['kit-botinero.webp'],
        'manijas athenas': ['manija-athenas.webp'],
        'manijas gama': ['manija.webp'],
        'manijas con tornillos': ['manija-con-tornillos-de-3-cm.webp'],
        'pernos minifix con caja': ['perno-minifix.webp', 'caja-minifix.webp'],
        'set de clavos': ['clavos.webp'],
        'soportes de canos': ['soporte-de-canos.webp'],
        'soportes plasticos de 5/8': ['soporte-de-canos.webp'],
        'tarugos 6x30': ['tarugo-madera.webp'],
        'tirador boton': ['tirador-boton-con-tornillo.webp'],
        'tiradores boton con tornillos': ['tirador-boton-con-tornillo.webp'],
        'tornillos 1.5 cm': ['tornillo-1-5.webp'],
        'tornillos 2 cm': ['tornillo-2.webp'],
        'tornillos 2.5 cm': ['tornillo-2.webp'],
        'tornillos 3.5x16': ['tornillo-3-5.webp'],
        'tornillos 3.5x20': ['tornillo-3-5.webp'],
        'tornillos 4 cm': ['tornillo-40.webp'],
        'tornillos 4x30': ['tornillo-40.webp'],
        'tornillos 4x40': ['tornillo-40.webp'],
        'tornillos phillips 5 cm': ['tornillo_allen.webp'],
        'tornillos de 3 cm': ['tornillo-3-5.webp'],
        'tornillos de 3.5x30': ['tornillo-3-5.webp'],
        'tornillos de 4x35': ['tornillo-40.webp'],
        'tornillos de 5 cm': ['tornillo_allen.webp'],
        'tornillos varianta': ['tornillo-varianta.webp'],
        'trabas': ['traba.webp']
    }

    # Verify input paths
    if not os.path.exists(excel_path):
        print(f"Error: Excel file not found at {excel_path}")
        return

    if not os.path.exists(herrajes_src_dir):
        print(f"Error: Source herrajes directory not found at {herrajes_src_dir}")
        return

    if not os.path.exists(modelos_3d_dir):
        print(f"Error: Target modelos_3d directory not found at {modelos_3d_dir}")
        return

    # Load Excel data
    df = pd.read_excel(excel_path, sheet_name='Detalle Plano')
    
    # Filter for Tipo == 'Herraje' (case-insensitive)
    df_herrajes = df[df['Tipo'].str.lower() == 'herraje'].copy()
    
    # Pre-calculate mapping keys to normalized values
    df_herrajes['Normalized_Element'] = df_herrajes['Elemento Normalizado'].apply(normalize_text)

    # Scan for product folders
    product_folders = []
    for line_folder in os.listdir(modelos_3d_dir):
        line_path = os.path.join(modelos_3d_dir, line_folder)
        if not os.path.isdir(line_path) or not line_folder.startswith('linea-'):
            continue
        for prod_folder in os.listdir(line_path):
            prod_path = os.path.join(line_path, prod_folder)
            if os.path.isdir(prod_path):
                product_folders.append({
                    'line': line_folder,
                    'product': prod_folder,
                    'path': prod_path
                })

    print(f"Found {len(product_folders)} product folders to process.")

    copied_files_report = []
    errors_report = []
    stats = {
        'total_products_scanned': len(product_folders),
        'total_products_updated': 0,
        'total_images_copied': 0,
        'total_errors_encountered': 0
    }

    # Available files in source herrajes folder
    available_src_files = set(os.listdir(herrajes_src_dir))

    for prod in product_folders:
        folder_name = prod['product']
        line_name = prod['line']
        prod_path = prod['path']

        # Match in Excel: Archivo == folder_name + ".PDF" (case-insensitive)
        pdf_name = f"{folder_name}.PDF".lower()
        prod_df = df_herrajes[df_herrajes['Archivo'].str.lower() == pdf_name]

        if prod_df.empty:
            # Check if there's any record at all for this product in Excel
            all_records = df[df['Archivo'].str.lower() == pdf_name]
            if all_records.empty:
                reason = f"Product '{folder_name}' has no records in the Excel database."
            else:
                reason = f"Product '{folder_name}' has records in Excel, but none are of type 'Herraje'."
            
            errors_report.append({
                'product': folder_name,
                'line': line_name,
                'item': 'N/A',
                'reason': reason
            })
            stats['total_errors_encountered'] += 1
            continue

        # Target directory: modelos_3d/linea-*/PRODUCT/herrajes
        target_herrajes_dir = os.path.join(prod_path, "herrajes")
        
        # Ensure target folder exists
        os.makedirs(target_herrajes_dir, exist_ok=True)

        copied_for_this_product = 0
        unique_herrajes_in_product = prod_df['Normalized_Element'].unique()

        for norm_element in unique_herrajes_in_product:
            original_names = prod_df[prod_df['Normalized_Element'] == norm_element]['Elemento Normalizado'].unique()
            orig_name = original_names[0] if len(original_names) > 0 else norm_element

            if norm_element not in MAPPING:
                reason = f"No image mapping defined for '{orig_name}' (normalized: '{norm_element}')"
                errors_report.append({
                    'product': folder_name,
                    'line': line_name,
                    'item': orig_name,
                    'reason': reason
                })
                stats['total_errors_encountered'] += 1
                continue

            mapped_images = MAPPING[norm_element]
            if not mapped_images:
                reason = f"Image mapping for '{orig_name}' is explicitly empty (missing asset)"
                errors_report.append({
                    'product': folder_name,
                    'line': line_name,
                    'item': orig_name,
                    'reason': reason
                })
                stats['total_errors_encountered'] += 1
                continue

            for img_name in mapped_images:
                if img_name not in available_src_files:
                    reason = f"Mapped image file '{img_name}' for '{orig_name}' does not exist in source folder."
                    errors_report.append({
                        'product': folder_name,
                        'line': line_name,
                        'item': orig_name,
                        'reason': reason
                    })
                    stats['total_errors_encountered'] += 1
                    continue

                # Perform the copy
                src_file_path = os.path.join(herrajes_src_dir, img_name)
                dest_file_path = os.path.join(target_herrajes_dir, img_name)

                try:
                    shutil.copy2(src_file_path, dest_file_path)
                    
                    # Convert paths to relative for clean reporting
                    rel_dest = os.path.relpath(dest_file_path, base_dir).replace('\\', '/')
                    
                    copied_files_report.append({
                        'product': folder_name,
                        'line': line_name,
                        'file_copied': img_name,
                        'destination': rel_dest
                    })
                    copied_for_this_product += 1
                    stats['total_images_copied'] += 1
                except Exception as e:
                    reason = f"Failed to copy '{img_name}': {str(e)}"
                    errors_report.append({
                        'product': folder_name,
                        'line': line_name,
                        'item': orig_name,
                        'reason': reason
                    })
                    stats['total_errors_encountered'] += 1

        if copied_for_this_product > 0:
            stats['total_products_updated'] += 1

    # Save report
    final_report = {
        'status': 'completed',
        'summary': stats,
        'copied_files': copied_files_report,
        'errors': errors_report
    }

    with open(report_path, 'w', encoding='utf-8') as f:
        json.dump(final_report, f, indent=2, ensure_ascii=False)

    print(f"\nDeployment complete!")
    print(f"Scanned products: {stats['total_products_scanned']}")
    print(f"Updated products (copied at least 1 image): {stats['total_products_updated']}")
    print(f"Total files copied: {stats['total_images_copied']}")
    print(f"Total errors/warnings logged: {stats['total_errors_encountered']}")
    print(f"Report saved to {report_path}")

if __name__ == "__main__":
    main()
