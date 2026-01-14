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
from app.models.domain import (
    AIProductQuestions, AIThemeMapping, AIChampions, BusinessUnitMapping,
    Delivery, ImplementationTimespan, ReportingFrequency, RoleMapping,
    RICE, StatusMapping, Outcomes, PersonaMapping, VendorModelMapping,
    UnitOfMeasure, PhaseMapping, UseCases, AgentLibrary, AIProductChecklist,
    Decisions, Metric, MetricReported, New_Stakeholder, PhaseApprovalInformation,
    Plan, Prioritization, Stakeholder, Updates
)
from datetime import datetime

class SmartCSVMigration:
    def __init__(self, csv_folder=None):
        if csv_folder is None:
            self.csv_folder = os.path.join(backend_dir, "data")
        else:
            self.csv_folder = csv_folder
        self.db = SessionLocal()
        self.stats = {}
        self.skipped = {}
    
    def read_csv(self, filename):
        """Read CSV file safely - return empty if not found"""
        path = os.path.join(self.csv_folder, filename)
        if not os.path.exists(path):
            return None  # File doesn't exist
        
        try:
            with open(path, 'r', encoding='utf-8-sig') as file:
                rows = list(csv.DictReader(file))
            
            if not rows:
                return None  # File is empty
            
            print(f"✓ Loaded {len(rows)} rows from {filename}")
            return rows
        except Exception as e:
            print(f"⚠️  Error reading {filename}: {e}")
            return None
    
    def safe_int(self, value):
        try:
            return int(value) if value else None
        except:
            return None
    
    def safe_float(self, value):
        try:
            return float(value) if value else None
        except:
            return None
    
    def safe_bool(self, value):
        if not value:
            return None
        return str(value).lower() in ['true', '1', 'yes']
    
    # ==================== LOOKUP TABLES ====================
    
    def migrate_ai_product_questions(self):
        rows = self.read_csv("AIProductQuestions.csv")
        if rows is None:
            self.skipped['AIProductQuestions'] = "File not found or empty"
            return
        count = 0
        for row in rows:
            try:
                obj = AIProductQuestions(
                    ID=self.safe_int(row.get('ID')),
                    Question=row.get('Question'),
                    QuestionType=row.get('QuestionType'),
                    ResponseValue=row.get('ResponseValue'),
                    Created=datetime.now(),
                )
                self.db.add(obj)
                count += 1
            except:
                pass
        self.db.commit()
        self.stats['AIProductQuestions'] = count
    
    def migrate_ai_theme_mapping(self):
        rows = self.read_csv("AIThemeMapping.csv")
        if rows is None:
            self.skipped['AIThemeMapping'] = "File not found or empty"
            return
        count = 0
        for row in rows:
            try:
                obj = AIThemeMapping(
                    ID=self.safe_int(row.get('ID')),
                    ThemeName=row.get('ThemeName'),
                    ThemeDefinition=row.get('ThemeDefinition'),
                    ThemeExample=row.get('ThemeExample'),
                )
                self.db.add(obj)
                count += 1
            except:
                pass
        self.db.commit()
        self.stats['AIThemeMapping'] = count
    
    def migrate_ai_champions(self):
        rows = self.read_csv("AIChampions.csv")
        if rows is None:
            self.skipped['AIChampions'] = "File not found or empty"
            return

        # Clear existing data first
        self.db.query(AIChampions).delete()
        self.db.commit()

        count = 0
        for row in rows:
            try:
                obj = AIChampions(
                    BusinessUnit=row.get('BusinessUnit'),
                    UKrewer=row.get('U Krewer'),
                    Role=row.get('Role'),
                )
                self.db.add(obj)
                count += 1
            except Exception as e:
                print(f"Error adding AI Champion: {e}")
                pass
        self.db.commit()
        self.stats['AIChampions'] = count
        if count > 0:
            print(f"✓ Migrated {count} AI Champions")
    
    def migrate_business_unit_mapping(self):
        rows = self.read_csv("BusinessUnitMapping.csv")
        if rows is None:
            self.skipped['BusinessUnitMapping'] = "File not found or empty"
            return
        count = 0
        for row in rows:
            try:
                obj = BusinessUnitMapping(
                    BusinessUnitName=row.get('BusinessUnitName'),
                    TeamName=row.get('TeamName'),
                    SubTeamName=row.get('SubTeamName'),
                )
                self.db.add(obj)
                count += 1
            except:
                pass
        self.db.commit()
        self.stats['BusinessUnitMapping'] = count
        if count > 0:
            print(f"✓ Migrated {count} Business Unit Mappings")
    
    def migrate_delivery(self):
        rows = self.read_csv("Delivery.csv")
        if rows is None:
            self.skipped['Delivery'] = "File not found or empty"
            return
        count = 0
        for row in rows:
            try:
                obj = Delivery(Title=row.get('Title'))
                self.db.add(obj)
                count += 1
            except:
                pass
        self.db.commit()
        self.stats['Delivery'] = count
        if count > 0:
            print(f"✓ Migrated {count} Delivery records")
    
    def migrate_implementation_timespan(self):
        rows = self.read_csv("ImplementationTimespan.csv")
        if rows is None:
            self.skipped['ImplementationTimespan'] = "File not found or empty"
            return
        count = 0
        for row in rows:
            try:
                timespan = row.get('Timespan', '').strip()
                if timespan:
                    obj = ImplementationTimespan(Timespan=timespan)
                    self.db.add(obj)
                    count += 1
            except:
                pass
        self.db.commit()
        self.stats['ImplementationTimespan'] = count
        if count > 0:
            print(f"✓ Migrated {count} Implementation Timespans")
    
    def migrate_reporting_frequency(self):
        rows = self.read_csv("ReportingFrequency.csv")
        if rows is None:
            self.skipped['ReportingFrequency'] = "File not found or empty"
            return
        count = 0
        for row in rows:
            try:
                freq = row.get('Frequency', '').strip()
                if freq:
                    obj = ReportingFrequency(Frequency=freq)
                    self.db.add(obj)
                    count += 1
            except:
                pass
        self.db.commit()
        self.stats['ReportingFrequency'] = count
        if count > 0:
            print(f"✓ Migrated {count} Reporting Frequencies")
    
    def migrate_role_mapping(self):
        rows = self.read_csv("RoleMapping.csv")
        if rows is None:
            self.skipped['RoleMapping'] = "File not found or empty"
            return
        count = 0
        for row in rows:
            try:
                obj = RoleMapping(
                    RoleName=row.get('RoleName'),
                    ReviewType=row.get('ReviewType'),
                )
                self.db.add(obj)
                count += 1
            except:
                pass
        self.db.commit()
        self.stats['RoleMapping'] = count
        if count > 0:
            print(f"✓ Migrated {count} Role Mappings")
    
    def migrate_rice(self):
        rows = self.read_csv("RICE.csv")
        if rows is None:
            self.skipped['RICE'] = "File not found or empty"
            return
        count = 0
        for row in rows:
            try:
                obj = RICE(
                    CategoryDisplay=row.get('CategoryDisplay'),
                    CategoryHeader=row.get('CategoryHeader'),
                    CategoryValue=row.get('CategoryValue'),
                )
                self.db.add(obj)
                count += 1
            except:
                pass
        self.db.commit()
        self.stats['RICE'] = count
        if count > 0:
            print(f"✓ Migrated {count} RICE records")
    
    def migrate_status_mapping(self):
        rows = self.read_csv("StatusMapping.csv")
        if rows is None:
            self.skipped['StatusMapping'] = "File not found or empty"
            return
        count = 0
        for row in rows:
            try:
                obj = StatusMapping(
                    StatusName=row.get('StatusName'),
                    StatusColor=row.get('StatusColor'),
                    StatusDefinitions=row.get('StatusDefinitions'),
                )
                self.db.add(obj)
                count += 1
            except:
                pass
        self.db.commit()
        self.stats['StatusMapping'] = count
        if count > 0:
            print(f"✓ Migrated {count} Status Mappings")
    
    def migrate_outcomes(self):
        rows = self.read_csv("Outcomes.csv")
        if rows is None:
            self.skipped['Outcomes'] = "File not found or empty"
            return
        count = 0
        for row in rows:
            try:
                obj = Outcomes(
                    OutcomeCategory=row.get('OutcomeCategory'),
                    OutcomeDescription=row.get('OutcomeDescription'),
                )
                self.db.add(obj)
                count += 1
            except:
                pass
        self.db.commit()
        self.stats['Outcomes'] = count
        if count > 0:
            print(f"✓ Migrated {count} Outcomes")
    
    def migrate_persona_mapping(self):
        rows = self.read_csv("PersonaMapping.csv")
        if rows is None:
            self.skipped['PersonaMapping'] = "File not found or empty"
            return
        count = 0
        for row in rows:
            try:
                obj = PersonaMapping(
                    ID=self.safe_int(row.get('ID')),
                    PersonaName=row.get('PersonaName'),
                    RoleDefinition=row.get('RoleDefinition'),
                    ExampleRoles=row.get('ExampleRoles'),
                )
                self.db.add(obj)
                count += 1
            except:
                pass
        self.db.commit()
        self.stats['PersonaMapping'] = count
        if count > 0:
            print(f"✓ Migrated {count} Persona Mappings")
    
    def migrate_vendor_model_mapping(self):
        rows = self.read_csv("VendorModelMapping.csv")
        if rows is None:
            self.skipped['VendorModelMapping'] = "File not found or empty"
            return
        count = 0
        for row in rows:
            try:
                obj = VendorModelMapping(
                    VendorName=row.get('VendorName'),
                    ProductName=row.get('ProductName'),
                )
                self.db.add(obj)
                count += 1
            except:
                pass
        self.db.commit()
        self.stats['VendorModelMapping'] = count
        if count > 0:
            print(f"✓ Migrated {count} Vendor Model Mappings")
    
    def migrate_unit_of_measure(self):
        rows = self.read_csv("UnitOfMeasure.csv")
        if rows is None:
            self.skipped['UnitOfMeasure'] = "File not found or empty"
            return
        count = 0
        for row in rows:
            try:
                uom = row.get('UnitOfMeasure', '').strip()
                if uom:
                    obj = UnitOfMeasure(UnitOfMeasure=uom)
                    self.db.add(obj)
                    count += 1
            except:
                pass
        self.db.commit()
        self.stats['UnitOfMeasure'] = count
        if count > 0:
            print(f"✓ Migrated {count} Unit of Measure")
    
    def migrate_phase_mapping(self):
        rows = self.read_csv("PhaseMapping.csv")
        if rows is None:
            self.skipped['PhaseMapping'] = "File not found or empty"
            return
        count = 0
        for row in rows:
            try:
                obj = PhaseMapping(
                    Phase=row.get('Phase'),
                    PhaseStage=row.get('PhaseStage'),
                    Environment=row.get('Environment'),
                )
                self.db.add(obj)
                count += 1
            except:
                pass
        self.db.commit()
        self.stats['PhaseMapping'] = count
        if count > 0:
            print(f"✓ Migrated {count} Phase Mappings")
    
    # ==================== MAIN TABLES ====================
    
    def migrate_usecases(self):
        rows = self.read_csv("UseCases.csv")
        if rows is None:
            self.skipped['UseCases'] = "File not found or empty"
            return
        count = 0
        for row in rows:
            try:
                uc_id = self.safe_int(row.get('ID'))
                if not uc_id:
                    continue
                existing = self.db.query(UseCases).filter(UseCases.ID == uc_id).first()
                if existing:
                    continue
                obj = UseCases(
                    ID=uc_id,
                    BusinessUnit=row.get('BusinessUnit'),
                    UseCase=row.get('UseCase'),
                    Headlines=row.get('Headlines'),
                    Opportunity=row.get('Opportunity'),
                    Evidence=row.get('Evidence'),
                    BusinessValue=row.get('BusinessValue'),
                    TargetPersonas=row.get('TargetPersonas'),
                    Phase=row.get('Phase'),
                    Status=row.get('Status'),
                    VendorName=row.get('VendorName'),
                    ModelName=row.get('ModelName'),
                    AITheme=row.get('AITheme'),
                    PrimaryContact=row.get('PrimaryContact'),
                    InformationLink=row.get('InformationLink'),
                    TeamName=row.get('TeamName'),
                    SubTeamName=row.get('SubTeamName'),
                    DisplayStatus=self.safe_bool(row.get('DisplayStatus')),
                    ImageLink=row.get('ImageLink'),
                    Created=datetime.now(),
                    CreatedBy=row.get('CreatedBy'),
                    Title=row.get('Title'),
                    AIProductChecklist=self.safe_bool(row.get('AIProductChecklist')),
                    ESEResourcesNeeded=self.safe_bool(row.get('ESEResourcesNeeded')),
                )
                self.db.add(obj)
                count += 1
            except:
                pass
        self.db.commit()
        self.stats['UseCases'] = count
        if count > 0:
            print(f"✓ Migrated {count} Use Cases")
    
    def migrate_metric(self):
        rows = self.read_csv("Metric.csv")
        if rows is None:
            self.skipped['Metric'] = "File not found or empty"
            return
        count = 0
        for row in rows:
            try:
                obj = Metric(
                    PrimarySuccessMetricName=row.get('PrimarySuccessMetricName'),
                    BaselineValue=self.safe_float(row.get('BaselineValue')),
                    BaselineDate=row.get('BaselineDate'),
                    TargetValue=self.safe_float(row.get('TargetValue')),
                    TargetDate=row.get('TargetDate'),
                    MetricType=row.get('MetricType'),
                    UnitOfMeasure=row.get('UnitOfMeasure'),
                    UseCasesID=self.safe_int(row.get('UseCasesID')),
                )
                self.db.add(obj)
                count += 1
            except:
                pass
        self.db.commit()
        self.stats['Metric'] = count
        if count > 0:
            print(f"✓ Migrated {count} Metrics")
    
    def migrate_decisions(self):
        rows = self.read_csv("Decisions.csv")
        if rows is None:
            self.skipped['Decisions'] = "File not found or empty"
            return
        count = 0
        for row in rows:
            try:
                obj = Decisions(
                    DecisionComments=row.get('DecisionComments'),
                    Role=row.get('Role'),
                    ReviewerType=row.get('ReviewerType'),
                    Approver=row.get('Approver'),
                    Phase=row.get('Phase'),
                    Result=row.get('Result'),
                    UseCasesID=self.safe_int(row.get('UseCasesID')),
                )
                self.db.add(obj)
                count += 1
            except:
                pass
        self.db.commit()
        self.stats['Decisions'] = count
        if count > 0:
            print(f"✓ Migrated {count} Decisions")
    
    def migrate_updates(self):
        rows = self.read_csv("Updates.csv")
        if rows is None:
            self.skipped['Updates'] = "File not found or empty"
            return
        count = 0
        for row in rows:
            try:
                obj = Updates(
                    SubmittedBy=row.get('SubmittedBy'),
                    SubmitterRole=row.get('SubmitterRole'),
                    UseCasePhase=row.get('UseCasePhase'),
                    UseCaseStatus=row.get('UseCaseStatus'),
                    MeaningfulUpdate=row.get('MeaningfulUpdate'),
                    UseCasesID=self.safe_int(row.get('UseCasesID')),
                )
                self.db.add(obj)
                count += 1
            except:
                pass
        self.db.commit()
        self.stats['Updates'] = count
        if count > 0:
            print(f"✓ Migrated {count} Updates")
    
    def migrate_stakeholder(self):
        rows = self.read_csv("Stakeholder.csv")
        if rows is None:
            self.skipped['Stakeholder'] = "File not found or empty"
            return
        count = 0
        for row in rows:
            try:
                obj = Stakeholder(
                    Stakeholder=row.get('Stakeholder'),
                    Role=row.get('Role'),
                    ReviewerType=row.get('ReviewerType'),
                    StakeholderFlag=self.safe_bool(row.get('StakeholderFlag')),
                    UseCasesID=self.safe_int(row.get('UseCasesID')),
                    BusinessUnit=row.get('BusinessUnit'),
                    Created=datetime.now(),
                    UseCaseTitle=row.get('UseCaseTitle'),
                )
                self.db.add(obj)
                count += 1
            except:
                pass
        self.db.commit()
        self.stats['Stakeholder'] = count
        if count > 0:
            print(f"✓ Migrated {count} Stakeholders")
    
    def migrate_agent_library(self):
        rows = self.read_csv("AgentLibrary.csv")
        if rows is None:
            self.skipped['AgentLibrary'] = "File not found or empty"
            return
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
            except:
                pass
        self.db.commit()
        self.stats['AgentLibrary'] = count
        if count > 0:
            print(f"✓ Migrated {count} Agent Library records")
    
    def migrate_ai_product_checklist(self):
        rows = self.read_csv("AIProductChecklist.csv")
        if rows is None:
            self.skipped['AIProductChecklist'] = "File not found or empty"
            return
        count = 0
        for row in rows:
            try:
                obj = AIProductChecklist(
                    UseCasesID=self.safe_int(row.get('UseCasesID')),
                    QuestionID=self.safe_int(row.get('QuestionID')),
                    Response=row.get('Response'),
                    Created=datetime.now(),
                )
                self.db.add(obj)
                count += 1
            except:
                pass
        self.db.commit()
        self.stats['AIProductChecklist'] = count
        if count > 0:
            print(f"✓ Migrated {count} AI Product Checklist records")
    
    def migrate_metric_reported(self):
        rows = self.read_csv("MetricReported.csv")
        if rows is None:
            self.skipped['MetricReported'] = "File not found or empty"
            return
        count = 0
        for row in rows:
            try:
                obj = MetricReported(
                    ReportedValue=self.safe_float(row.get('ReportedValue')),
                    ReportedDate=row.get('ReportedDate'),
                    UseCasesID=self.safe_int(row.get('UseCasesID')),
                    MetricID=self.safe_int(row.get('MetricID')),
                    Created=datetime.now(),
                )
                self.db.add(obj)
                count += 1
            except:
                pass
        self.db.commit()
        self.stats['MetricReported'] = count
        if count > 0:
            print(f"✓ Migrated {count} Metric Reported records")
    
    def migrate_new_stakeholder(self):
        rows = self.read_csv("New_Stakeholder.csv")
        if rows is None:
            self.skipped['New_Stakeholder'] = "File not found or empty"
            return
        count = 0
        for row in rows:
            try:
                obj = New_Stakeholder(
                    Stakeholder=row.get('Stakeholder'),
                    Role=row.get('Role'),
                    ReviewerType=row.get('ReviewerType'),
                    StakeholderFlag=self.safe_bool(row.get('StakeholderFlag')),
                    UseCasesID=self.safe_int(row.get('UseCasesID')),
                    Created=datetime.now(),
                )
                self.db.add(obj)
                count += 1
            except:
                pass
        self.db.commit()
        self.stats['New_Stakeholder'] = count
        if count > 0:
            print(f"✓ Migrated {count} New Stakeholder records")
    
    def migrate_phase_approval_information(self):
        # SKIPPED - Table deleted from SharePoint
        self.skipped['PhaseApprovalInformation'] = "Deleted from SharePoint"
        return
    
    def migrate_plan(self):
        rows = self.read_csv("Plan.csv")
        if rows is None:
            self.skipped['Plan'] = "File not found or empty"
            return
        count = 0
        for row in rows:
            try:
                obj = Plan(
                    StartDate=row.get('StartDate'),
                    EndDate=row.get('EndDate'),
                    UseCasesID=self.safe_int(row.get('UseCasesID')),
                    UseCasePhase=row.get('UseCasePhase'),
                    Created=datetime.now(),
                )
                self.db.add(obj)
                count += 1
            except:
                pass
        self.db.commit()
        self.stats['Plan'] = count
        if count > 0:
            print(f"✓ Migrated {count} Plan records")
    
    def migrate_prioritization(self):
        rows = self.read_csv("Prioritization.csv")
        if rows is None:
            self.skipped['Prioritization'] = "File not found or empty"
            return
        count = 0
        for row in rows:
            try:
                obj = Prioritization(
                    Reach=self.safe_float(row.get('Reach')),
                    Impact=self.safe_float(row.get('Impact')),
                    Confidence=self.safe_float(row.get('Confidence')),
                    Effort=self.safe_float(row.get('Effort')),
                    RICEScore=self.safe_float(row.get('RICEScore')),
                    Priority=row.get('Priority'),
                    AIGalleryDisplay=self.safe_bool(row.get('AIGalleryDisplay')),
                    SLTReporting=self.safe_bool(row.get('SLTReporting')),
                    TotalUserBase=self.safe_int(row.get('TotalUserBase')),
                    Timespan=row.get('Timespan'),
                    ReportingFrequency=row.get('ReportingFrequency'),
                    UseCasesID=self.safe_int(row.get('UseCasesID')),
                )
                self.db.add(obj)
                count += 1
            except:
                pass
        self.db.commit()
        self.stats['Prioritization'] = count
        if count > 0:
            print(f"✓ Migrated {count} Prioritization records")
    
    def migrate_all(self):
        print("\n" + "="*80)
        print("🚀 SMART CSV MIGRATION - SKIPS DELETED TABLES")
        print("="*80 + "\n")
        
        try:
            print("Creating database tables...")
            Base.metadata.create_all(bind=engine)
            print("✓ All tables created\n")
            
            print("="*80)
            print("📋 MIGRATING LOOKUP TABLES")
            print("="*80 + "\n")
            self.migrate_ai_product_questions()
            self.migrate_ai_theme_mapping()
            self.migrate_ai_champions()
            self.migrate_business_unit_mapping()
            self.migrate_delivery()
            self.migrate_implementation_timespan()
            self.migrate_reporting_frequency()
            self.migrate_role_mapping()
            self.migrate_rice()
            self.migrate_status_mapping()
            self.migrate_outcomes()
            self.migrate_persona_mapping()
            self.migrate_vendor_model_mapping()
            self.migrate_unit_of_measure()
            self.migrate_phase_mapping()
            
            print("\n" + "="*80)
            print("📋 MIGRATING MAIN TABLES")
            print("="*80 + "\n")
            self.migrate_usecases()
            self.migrate_metric()
            self.migrate_decisions()
            self.migrate_updates()
            self.migrate_stakeholder()
            self.migrate_agent_library()
            self.migrate_ai_product_checklist()
            self.migrate_metric_reported()
            self.migrate_new_stakeholder()
            self.migrate_phase_approval_information()  # SKIPPED
            self.migrate_plan()
            self.migrate_prioritization()
            
            print("\n" + "="*80)
            print("✅ MIGRATION SUMMARY")
            print("="*80 + "\n")
            
            total = 0
            migrated_tables = []
            for table, count in sorted(self.stats.items()):
                if count > 0:
                    print(f"  ✓ {table:35} : {count:5} records")
                    migrated_tables.append(table)
                    total += count
            
            print(f"\n  {'TOTAL':35} : {total:5} records")
            
            if self.skipped:
                print(f"\n⏭️  Skipped tables ({len(self.skipped)}):")
                for table, reason in sorted(self.skipped.items()):
                    print(f"  ⏭️  {table:35} : {reason}")
            
            print("\n🎉 Migration completed!\n")
            
        except Exception as e:
            print(f"\n❌ MIGRATION FAILED: {e}")
            import traceback
            traceback.print_exc()
            self.db.rollback()
        finally:
            self.db.close()


if __name__ == "__main__":
    migrator = SmartCSVMigration()
    migrator.migrate_all()
