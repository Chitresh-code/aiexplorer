import sys
from pathlib import Path

# Add the backend directory to sys.path to allow importing from app
backend_dir = str(Path(__file__).resolve().parent.parent)
if backend_dir not in sys.path:
    sys.path.append(backend_dir)

from sqlalchemy.orm import Session
from app.db.session import SessionLocal, engine
from app.db.base_class import Base
from app.models.domain import UseCases, StatusMapping, BusinessUnitMapping, AIThemeMapping, PersonaMapping, VendorModelMapping

# Create tables if they don't exist
Base.metadata.create_all(bind=engine)

def seed_data():
    db = SessionLocal()
    
    # Check if data exists
    if db.query(UseCases).count() > 0:
        print("Data already exists. Skipping seed.")
        db.close()
        return

    print("Seeding data...")

    # Sample Use Cases
    use_cases = [
        {
            "ID": 1,
            "Title": "AchmanTest",
            "Phase": "Diagnose",
            "Status": "On Track",
            "BusinessUnit": "HR",
            "UseCase": "Automated Screening"
        },
        {
            "ID": 2,
            "Title": "AchmanTest1",
            "Phase": "Idea",
            "Status": "10/04/25 - 10/31/25", # Using date as status to match mock look if possible, or just 'On Track'
            "BusinessUnit": "Finance",
            "UseCase": "Invoice Processing"
        },
        {
            "ID": 3,
            "Title": "AchmanTest3",
            "Phase": "Idea",
            "Status": "On Track",
            "BusinessUnit": "IT",
            "UseCase": "Code Generation"
        },
        {
            "ID": 4,
            "Title": "AchmanTest4",
            "Phase": "Idea",
            "Status": "At Risk",
            "BusinessUnit": "Operations",
            "UseCase": "Schedule Optimization"
        },
        {
            "ID": 5,
            "Title": "AchmanTest5",
            "Phase": "Idea",
            "Status": "On Track",
            "BusinessUnit": "Marketing",
            "UseCase": "Content Creation"
        },
        {
            "ID": 6,
            "Title": "Test Uc123",
            "Phase": "Idea",
            "Status": "On Track",
            "BusinessUnit": "Sales",
            "UseCase": "Lead Scoring"
        },
        {
            "ID": 7,
            "Title": "Test UC Stakeholder Error",
            "Phase": "Idea",
            "Status": "Blocked",
            "BusinessUnit": "HR",
            "UseCase": "Resume Parsing"
        },
        {
            "ID": 8,
            "Title": "Test UC Stakeholder Error 2",
            "Phase": "Idea",
            "Status": "On Track",
            "BusinessUnit": "Legal",
            "UseCase": "Contract Review"
        },
        {
            "ID": 9,
            "Title": "Actest",
            "Phase": "Diagnose",
            "Status": "On Track",
            "BusinessUnit": "Finance",
            "UseCase": "Fraud Detection"
        },
        {
            "ID": 10,
            "Title": "test",
            "Phase": "Idea",
            "Status": "On Track",
            "BusinessUnit": "IT",
            "UseCase": "Log Analysis"
        }
    ]

    for uc_data in use_cases:
        uc = UseCases(**uc_data)
        db.add(uc)

    # Seed Status Mappings
    statuses = [
        {"StatusName": "On Track", "StatusColor": "Green"},
        {"StatusName": "At Risk", "StatusColor": "Amber"},
        {"StatusName": "Blocked", "StatusColor": "Red"},
        {"StatusName": "Completed", "StatusColor": "Blue"}
    ]
    
    for s in statuses:
        db.add(StatusMapping(**s))

    # Seed Business Units
    bus = [
        {"BusinessUnitName": "HR"},
        {"BusinessUnitName": "Finance"},
        {"BusinessUnitName": "IT"},
        {"BusinessUnitName": "Operations"},
        {"BusinessUnitName": "Marketing"},
        {"BusinessUnitName": "Sales"},
        {"BusinessUnitName": "Legal"}
    ]

    for b in bus:
        db.add(BusinessUnitMapping(**b))

    # Seed AI Themes
    themes = [
        {"ID": 1, "ThemeName": "Content Generation", "ThemeDefinition": "AI-powered content creation and writing", "ThemeExample": "Document drafting, email composition"},
        {"ID": 2, "ThemeName": "Data Analysis", "ThemeDefinition": "Automated data processing and insights", "ThemeExample": "Report generation, trend analysis"},
        {"ID": 3, "ThemeName": "Process Automation", "ThemeDefinition": "Automating repetitive tasks", "ThemeExample": "Workflow automation, task scheduling"},
        {"ID": 4, "ThemeName": "Customer Service", "ThemeDefinition": "AI-assisted customer support", "ThemeExample": "Chatbots, ticket routing"},
        {"ID": 5, "ThemeName": "Predictive Analytics", "ThemeDefinition": "Forecasting and prediction models", "ThemeExample": "Sales forecasting, risk assessment"}
    ]
    
    for t in themes:
        db.add(AIThemeMapping(**t))

    # Seed Personas
    personas = [
        {"ID": 1, "PersonaName": "HR Manager", "RoleDefinition": "Manages human resources", "ExampleRoles": "Recruitment, Employee Relations"},
        {"ID": 2, "PersonaName": "Finance Analyst", "RoleDefinition": "Financial analysis and reporting", "ExampleRoles": "Budgeting, Forecasting"},
        {"ID": 3, "PersonaName": "IT Administrator", "RoleDefinition": "Manages IT infrastructure", "ExampleRoles": "System Admin, Network Admin"},
        {"ID": 4, "PersonaName": "Sales Representative", "RoleDefinition": "Sells products and services", "ExampleRoles": "Account Manager, Sales Executive"},
        {"ID": 5, "PersonaName": "Operations Manager", "RoleDefinition": "Oversees operations", "ExampleRoles": "Process Manager, Operations Lead"}
    ]
    
    for p in personas:
        db.add(PersonaMapping(**p))

    # Seed Vendors
    vendors = [
        {"VendorName": "OpenAI", "ProductName": "GPT-4"},
        {"VendorName": "Microsoft", "ProductName": "Azure OpenAI"},
        {"VendorName": "Google", "ProductName": "Gemini"},
        {"VendorName": "Anthropic", "ProductName": "Claude"},
        {"VendorName": "Meta", "ProductName": "Llama"}
    ]
    
    for v in vendors:
        db.add(VendorModelMapping(**v))

    db.commit()
    print("Seeding complete!")
    db.close()

if __name__ == "__main__":
    seed_data()
