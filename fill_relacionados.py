import pandas as pd
import random

file_path = 'productos_auditados.xlsx'
df = pd.read_excel(file_path, sheet_name='productos_auditados')

# Ensure we have the 'Relacionados' column
if 'Relacionados' not in df.columns:
    df['Relacionados'] = ""
df['Relacionados'] = df['Relacionados'].fillna('').astype(str)

# For reproducibility, though random is fine
random.seed(42)

def get_related(row, df_group):
    # Filter out the current product
    others = df_group[df_group['SKU'] != row['SKU']]['SKU'].tolist()
    
    # Also optionally filter out exact same product with just different color
    # (Optional, but let's just use the base logic for now: any other SKU)
    
    # If there are more than 4, pick 4 random ones
    if len(others) > 4:
        selected = random.sample(others, 4)
    else:
        selected = others
        
    return ", ".join(str(x) for x in selected)

# Group by Linea and apply the logic
for linea, group in df.groupby('Linea'):
    for idx, row in group.iterrows():
        df.at[idx, 'Relacionados'] = get_related(row, group)

# Save back to the same sheet
with pd.ExcelWriter(file_path, engine='openpyxl', mode='a', if_sheet_exists='replace') as writer:
    df.to_excel(writer, sheet_name='productos_auditados', index=False)

print("Relacionados column successfully updated!")
