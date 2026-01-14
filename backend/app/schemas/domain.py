from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

# ==================== USE CASES ====================

class UseCaseBase(BaseModel):
    BusinessUnit: Optional[str] = None
    UseCase: Optional[str] = None
    Headlines: Optional[str] = None
    Opportunity: Optional[str] = None
    Evidence: Optional[str] = None
    BusinessValue: Optional[str] = None
    TargetPersonas: Optional[str] = None
    Phase: Optional[str] = None
    Status: Optional[str] = None
    VendorName: Optional[str] = None
    ModelName: Optional[str] = None
    AITheme: Optional[str] = None
    PrimaryContact: Optional[str] = None
    InformationLink: Optional[str] = None
    TeamName: Optional[str] = None
    SubTeamName: Optional[str] = None
    DisplayStatus: Optional[bool] = None
    ImageLink: Optional[str] = None
    CreatedBy: Optional[str] = None
    Title: Optional[str] = None
    AIProductChecklist: Optional[bool] = None
    ESEResourcesNeeded: Optional[bool] = None


class UseCaseCreate(UseCaseBase):
    pass


class UseCaseUpdate(BaseModel):
    BusinessUnit: Optional[str] = None
    Status: Optional[str] = None
    Phase: Optional[str] = None
    Title: Optional[str] = None
    Opportunity: Optional[str] = None
    BusinessValue: Optional[str] = None
    PrimaryContact: Optional[str] = None
    DisplayStatus: Optional[bool] = None


class UseCaseResponse(UseCaseBase):
    ID: int
    Created: Optional[datetime] = None

    class Config:
        from_attributes = True


# ==================== METRICS ====================

class MetricBase(BaseModel):
    PrimarySuccessMetricName: Optional[str] = None
    BaselineValue: Optional[float] = None
    BaselineDate: Optional[datetime] = None
    TargetValue: Optional[float] = None
    TargetDate: Optional[datetime] = None
    MetricType: Optional[str] = None
    UnitOfMeasure: Optional[str] = None
    UseCasesID: int


class MetricCreate(MetricBase):
    pass


class MetricUpdate(BaseModel):
    PrimarySuccessMetricName: Optional[str] = None
    TargetValue: Optional[float] = None
    TargetDate: Optional[datetime] = None


class MetricResponse(MetricBase):
    Id: int

    class Config:
        from_attributes = True


# ==================== UPDATES ====================

class UpdateBase(BaseModel):
    SubmittedBy: Optional[str] = None
    SubmitterRole: Optional[str] = None
    UseCasePhase: Optional[str] = None
    UseCaseStatus: Optional[str] = None
    MeaningfulUpdate: Optional[str] = None
    UseCasesID: int


class UpdateCreate(UpdateBase):
    pass


class UpdateResponse(UpdateBase):
    Id: int

    class Config:
        from_attributes = True


# ==================== DECISIONS ====================

class DecisionBase(BaseModel):
    DecisionComments: Optional[str] = None
    Role: Optional[str] = None
    ReviewerType: Optional[str] = None
    Approver: Optional[str] = None
    Phase: Optional[str] = None
    Result: Optional[str] = None
    UseCasesID: int


class DecisionCreate(DecisionBase):
    pass


class DecisionResponse(DecisionBase):
    Id: int

    class Config:
        from_attributes = True


# ==================== STAKEHOLDER ====================

class StakeholderBase(BaseModel):
    Stakeholder: Optional[str] = None
    Role: Optional[str] = None
    ReviewerType: Optional[str] = None
    StakeholderFlag: Optional[bool] = None
    UseCasesID: int
    BusinessUnit: Optional[str] = None
    UseCaseTitle: Optional[str] = None


class StakeholderCreate(StakeholderBase):
    pass


class StakeholderResponse(StakeholderBase):
    Id: int
    Created: Optional[datetime] = None

    class Config:
        from_attributes = True


# ==================== AGENT LIBRARY ====================

class AgentLibraryBase(BaseModel):
    UseCasesID: int
    KnowledgeSource: Optional[str] = None
    Instructions: Optional[str] = None


class AgentLibraryCreate(AgentLibraryBase):
    pass


class AgentLibraryResponse(AgentLibraryBase):
    Id: int

    class Config:
        from_attributes = True


# ==================== LOOKUPS ====================

class StatusMappingResponse(BaseModel):
    Id: int
    StatusName: Optional[str] = None
    StatusColor: Optional[str] = None
    StatusDefinitions: Optional[str] = None

    class Config:
        from_attributes = True


class BusinessUnitResponse(BaseModel):
    Id: int
    BusinessUnitName: Optional[str] = None
    TeamName: Optional[str] = None
    SubTeamName: Optional[str] = None

    class Config:
        from_attributes = True


class RoleMappingResponse(BaseModel):
    Id: int
    RoleName: Optional[str] = None
    ReviewType: Optional[str] = None

    class Config:
        from_attributes = True


class PersonaMappingResponse(BaseModel):
    ID: int
    PersonaName: Optional[str] = None
    RoleDefinition: Optional[str] = None
    ExampleRoles: Optional[str] = None

    class Config:
        from_attributes = True


class AIThemeMappingResponse(BaseModel):
    ID: int
    ThemeName: Optional[str] = None
    ThemeDefinition: Optional[str] = None
    ThemeExample: Optional[str] = None

    class Config:
        from_attributes = True


class AIChampionResponse(BaseModel):
    Id: int
    BusinessUnit: Optional[str] = None
    UKrewer: Optional[str] = None
    Role: Optional[str] = None

    class Config:
        from_attributes = True


# ==================== PLAN ====================

class PlanBase(BaseModel):
    StartDate: Optional[datetime] = None
    EndDate: Optional[datetime] = None
    UseCasesID: int
    UseCasePhase: Optional[str] = None


class PlanCreate(PlanBase):
    pass


class PlanResponse(PlanBase):
    Id: int
    Created: Optional[datetime] = None

    class Config:
        from_attributes = True
