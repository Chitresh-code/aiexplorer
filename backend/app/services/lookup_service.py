from sqlalchemy.orm import Session
from app.repositories.lookup_repository import LookupRepository

class LookupService:
    def __init__(self, db: Session):
        self.repository = LookupRepository(db)

    def get_status_mappings(self):
        return self.repository.get_status_mappings()

    def get_business_units(self):
        return self.repository.get_business_units()

    def get_ai_themes(self):
        return self.repository.get_ai_themes()

    def get_personas(self):
        return self.repository.get_personas()

    def get_vendors(self):
        return self.repository.get_vendors()

    def get_roles_hierarchy(self):
        roles = self.repository.get_roles()
        return {"roles": [role[0] for role in roles if role[0]]}

    def get_ai_models_hierarchy(self):
        vendors_data = {}
        vendor_models = self.repository.get_vendors()
        for vm in vendor_models:
            vendor_name = vm.VendorName
            model_name = vm.ProductName
            if vendor_name and model_name:
                if vendor_name not in vendors_data:
                    vendors_data[vendor_name] = []
                if model_name not in vendors_data[vendor_name]:
                    vendors_data[vendor_name].append(model_name)
        return {"vendors": vendors_data}

    def get_business_structure_hierarchy(self):
        business_structure = {}
        business_mappings = self.repository.get_business_units()
        for bm in business_mappings:
            bu_name = bm.BusinessUnitName
            team_name = bm.TeamName
            subteam_name = bm.SubTeamName
            if bu_name:
                if bu_name not in business_structure:
                    business_structure[bu_name] = {}
                if team_name:
                    if team_name not in business_structure[bu_name]:
                        business_structure[bu_name][team_name] = []
                    if subteam_name and subteam_name not in business_structure[bu_name][team_name]:
                        business_structure[bu_name][team_name].append(subteam_name)
        return {"business_units": business_structure}

    def get_dropdown_data(self):
        themes = self.repository.get_unique_themes()
        ai_themes = [{"value": theme[0], "label": theme[0]} for theme in themes if theme[0]]
        
        personas = self.repository.get_unique_personas()
        persona_list = [{"value": persona[0], "label": persona[0]} for persona in personas if persona[0]]
        
        roles = self.repository.get_unique_roles()
        role_list = [{"value": role[0], "label": role[0]} for role in roles if role[0]]
        
        return {
            "ai_themes": ai_themes,
            "personas": persona_list,
            "roles": role_list
        }

    def get_champions_for_business_unit(self, business_unit: str):
        return self.repository.get_champions_by_bu(business_unit)

    def get_all_champion_names(self):
        champions = self.repository.get_unique_champions()
        champion_names = [champion[0] for champion in champions if champion[0]]
        return {"champions": champion_names}
