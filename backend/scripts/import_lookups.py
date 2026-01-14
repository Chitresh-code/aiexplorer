import csv
import os
import sys
from pathlib import Path

# Add the backend directory to sys.path to allow importing from app
backend_dir = str(Path(__file__).resolve().parent.parent)
if backend_dir not in sys.path:
    sys.path.append(backend_dir)

from app.db.session import SessionLocal
from app.models.domain import AIThemeMapping, PersonaMapping, VendorModelMapping, BusinessUnitMapping, RoleMapping
from datetime import datetime

def import_lookup_tables():
    db = SessionLocal()
    
    try:
        # Import AI Themes
        print("Importing AI Themes...")
        csv_path = os.path.join(backend_dir, 'data', 'AIThemeMapping.csv')
        with open(csv_path, 'r', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f)
            count = 0
            for row in reader:
                theme_name = row.get('Theme Name')
                if theme_name and not db.query(AIThemeMapping).filter(AIThemeMapping.ThemeName == theme_name).first():
                    theme = AIThemeMapping(
                        ThemeName=theme_name,
                        ThemeDefinition=row.get('Theme Definition'),
                        ThemeExample=row.get('Theme Example')
                    )
                    db.add(theme)
                    count += 1
            db.commit()
            print(f"✓ Imported {count} AI Themes")
        
        # Import Personas
        print("Importing Personas...")
        csv_path = os.path.join(backend_dir, 'data', 'PersonaMapping.csv')
        with open(csv_path, 'r', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f)
            count = 0
            for row in reader:
                persona_name = row.get('Persona Name')
                if persona_name and not db.query(PersonaMapping).filter(PersonaMapping.PersonaName == persona_name).first():
                    persona = PersonaMapping(
                        PersonaName=persona_name,
                        RoleDefinition=row.get('Role Definition'),
                        ExampleRoles=row.get('Example Roles')
                    )
                    db.add(persona)
                    count += 1
            db.commit()
            print(f"✓ Imported {count} Personas")
        
        # Import Vendor/Model Mapping
        print("Importing Vendor/Model Mappings...")
        csv_path = os.path.join(backend_dir, 'data', 'VendorModelMapping.csv')
        with open(csv_path, 'r', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f)
            count = 0
            for row in reader:
                vendor_name = row.get('Vendor Name')
                product_name = row.get('Product Name')
                if vendor_name and product_name and not db.query(VendorModelMapping).filter(
                    VendorModelMapping.VendorName == vendor_name,
                    VendorModelMapping.ProductName == product_name
                ).first():
                    vendor = VendorModelMapping(
                        VendorName=vendor_name,
                        ProductName=product_name
                    )
                    db.add(vendor)
                    count += 1
            db.commit()
            print(f"✓ Imported {count} Vendor/Model Mappings")
        
        # Import Business Unit Mapping
        print("Importing Business Unit Mappings...")
        csv_path = os.path.join(backend_dir, 'data', 'BusinessUnitMapping.csv')
        with open(csv_path, 'r', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f)
            count = 0
            for row in reader:
                bu_name = row.get('Business Unit Name')
                team_name = row.get('Team Name')
                sub_team_name = row.get('Sub Team Name')
                if bu_name and team_name and not db.query(BusinessUnitMapping).filter(
                    BusinessUnitMapping.BusinessUnitName == bu_name,
                    BusinessUnitMapping.TeamName == team_name,
                    BusinessUnitMapping.SubTeamName == sub_team_name
                ).first():
                    bu = BusinessUnitMapping(
                        BusinessUnitName=bu_name,
                        TeamName=team_name,
                        SubTeamName=sub_team_name
                    )
                    db.add(bu)
                    count += 1
            db.commit()
            print(f"✓ Imported {count} Business Unit Mappings")

        # Import Role Mapping
        print("Importing Role Mappings...")
        csv_path = os.path.join(backend_dir, 'data', 'RoleMapping.csv')
        with open(csv_path, 'r', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f)
            count = 0
            for row in reader:
                role_name = row.get('Role Name')
                if role_name and not db.query(RoleMapping).filter(RoleMapping.RoleName == role_name).first():
                    role = RoleMapping(
                        RoleName=role_name,
                        ReviewType=row.get('Review Type')
                    )
                    db.add(role)
                    count += 1
            db.commit()
            print(f"✓ Imported {count} Role Mappings")

        print("\n✅ All lookup tables imported successfully!")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    import_lookup_tables()
