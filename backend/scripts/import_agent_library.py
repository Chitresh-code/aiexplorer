import csv
import os
import sys
from pathlib import Path

# Add the backend directory to sys.path to allow importing from app
backend_dir = str(Path(__file__).resolve().parent.parent)
if backend_dir not in sys.path:
    sys.path.append(backend_dir)

from app.db.session import SessionLocal, engine
from app.db.base_class import Base
from app.models.domain import AgentLibrary
from datetime import datetime

class AgentLibraryImporter:
    def __init__(self, csv_file=None):
        if csv_file is None:
            self.csv_file = os.path.join(backend_dir, "data", "AgentLibrary.csv")
        else:
            self.csv_file = csv_file
        self.db = SessionLocal()

    def safe_int(self, value):
        try:
            return int(value) if value else None
        except:
            return None

    def import_agent_library(self):
        print("Starting AgentLibrary import...")

        if not os.path.exists(self.csv_file):
            print(f"❌ File not found: {self.csv_file}")
            return

        try:
            with open(self.csv_file, 'r', encoding='utf-8-sig') as file:
                rows = list(csv.DictReader(file))

            if not rows:
                print("❌ CSV file is empty")
                return

            print(f"✓ Loaded {len(rows)} rows from AgentLibrary.csv")

            count = 0
            for row in rows:
                try:
                    obj = AgentLibrary(
                        UseCasesID=self.safe_int(row.get('UseCasesID')),
                        KnowledgeSource=row.get('KnowledgeSource'),
                        Instructions=row.get('Instructions'),
                    )
                    self.db.add(obj)
                    count += 1
                except Exception as e:
                    print(f"⚠️  Error processing row: {e}")
                    continue

            self.db.commit()
            print(f"✅ Successfully imported {count} AgentLibrary records")

        except Exception as e:
            print(f"❌ Import failed: {e}")
            self.db.rollback()
        finally:
            self.db.close()

if __name__ == "__main__":
    importer = AgentLibraryImporter()
    importer.import_agent_library()
