import os
import sys
import csv
from datetime import datetime
from typing import Dict, Any, Optional

# Add parent directory to path to import backend modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from dotenv import load_dotenv

from database import SessionLocal, engine, Base
from models import UseCases

# Load environment variables
load_dotenv()

CSV_FILE_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "UseCases.csv")

def parse_bool(value: str) -> Optional[bool]:
    if not value:
        return None
    return value.lower() == "true"

def parse_date(value: str) -> Optional[datetime]:
    if not value:
        return None
    try:
        # Format: 11/24/2025 7:18 AM
        return datetime.strptime(value, "%m/%d/%Y %I:%M %p")
    except ValueError:
        try:
            # Fallback for other formats if needed
            return datetime.strptime(value, "%Y-%m-%d %H:%M:%S")
        except ValueError:
            print(f"Warning: Could not parse date '{value}'")
            return None

def import_use_cases(csv_path: str, db: Session):
    print(f"Reading CSV file: {csv_path}")
    
    if not os.path.exists(csv_path):
        print(f"Error: File not found at {csv_path}")
        return

    count = 0
    updated_count = 0
    c = 1
    
    with open(csv_path, mode='r', encoding='utf-8-sig') as csvfile:
        reader = csv.DictReader(csvfile)
        total_rows = sum(1 for _ in reader)
        for row in reader:
            print(f"\nEntry {c} of {total_rows}")
            c += 1
            try:
                # Clean up keys (remove BOM if present, though utf-8-sig handles it)
                # and values
                data = {k: v.strip() if v else None for k, v in row.items()}
                
                use_case_title = data.get("UseCase") or data.get("Title")
                if not use_case_title:
                    print("Skipping row with missing UseCase/Title")
                    continue

                # Check if exists
                existing = db.query(UseCases).filter(UseCases.UseCase == use_case_title).first()
                
                if existing:
                    print(f"Updating existing Use Case: {use_case_title}")
                    use_case = existing
                    updated_count += 1
                else:
                    print(f"Creating new Use Case: {use_case_title}")
                    use_case = UseCases()
                    count += 1

                # Map fields
                use_case.BusinessUnit = data.get("BusinessUnit")
                use_case.UseCase = use_case_title
                use_case.Headlines = data.get("Headlines")
                use_case.Opportunity = data.get("Opportunity")
                use_case.Evidence = data.get("Evidence")
                use_case.BusinessValue = data.get("BusinessValue")
                use_case.TargetPersonas = data.get("TargetPersonas")
                use_case.Phase = data.get("Phase")
                use_case.Status = data.get("Status")
                use_case.VendorName = data.get("VendorName")
                use_case.ModelName = data.get("ModelName")
                use_case.AITheme = data.get("AITheme")
                use_case.PrimaryContact = data.get("PrimaryContact")
                use_case.InformationLink = data.get("InformationLink")
                use_case.TeamName = data.get("TeamName")
                use_case.SubTeamName = data.get("SubTeamName")
                use_case.ImageLink = data.get("ImageLink")
                use_case.CreatedBy = data.get("Created By") or data.get("CreatedBy")
                use_case.Title = data.get("Title") or use_case_title
                
                # Booleans
                use_case.DisplayStatus = parse_bool(data.get("DisplayStatus"))
                use_case.AIProductChecklist = parse_bool(data.get("AI Product Checklist"))
                use_case.ESEResourcesNeeded = parse_bool(data.get("ESE Resources Needed"))
                
                # Dates
                if data.get("Created"):
                    use_case.Created = parse_date(data.get("Created"))
                
                if not existing:
                    db.add(use_case)
                
            except Exception as e:
                print(f"Error processing row: {e}")
                continue
                
    db.commit()
    print(f"Import complete. Created: {count}, Updated: {updated_count}")

def main():
    print("Starting CSV Import...")
    db = SessionLocal()
    try:
        import_use_cases(CSV_FILE_PATH, db)
    except Exception as e:
        print(f"Import Failed: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    main()
