from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, Numeric, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base_class import Base
from datetime import datetime


# ==================== LOOKUP/MASTER TABLES ====================

class AIProductQuestions(Base):
    __tablename__ = "AIProductQuestions"
    ID = Column(Integer, primary_key=True)
    Question = Column(Text)
    QuestionType = Column(String(255))
    ResponseValue = Column(String(255))
    Created = Column(DateTime, default=datetime.now)


class AIThemeMapping(Base):
    __tablename__ = "AIThemeMapping"
    ID = Column(Integer, primary_key=True)
    ThemeName = Column(String(255))
    ThemeDefinition = Column(Text)
    ThemeExample = Column(String(255))


class AIChampions(Base):
    __tablename__ = "AIChampions"
    Id = Column(Integer, primary_key=True, autoincrement=True)
    BusinessUnit = Column(String(255))
    UKrewer = Column(String(255))
    Role = Column(String(255))


class BusinessUnitMapping(Base):
    __tablename__ = "BusinessUnitMapping"
    Id = Column(Integer, primary_key=True, autoincrement=True)
    BusinessUnitName = Column(String(255))
    TeamName = Column(String(255))
    SubTeamName = Column(String(255))


class Delivery(Base):
    __tablename__ = "Delivery"
    Id = Column(Integer, primary_key=True, autoincrement=True)
    Title = Column(String(255))


class ImplementationTimespan(Base):
    __tablename__ = "ImplementationTimespan"
    Timespan = Column(String(100), primary_key=True)


class ReportingFrequency(Base):
    __tablename__ = "ReportingFrequency"
    Frequency = Column(String(100), primary_key=True)


class RoleMapping(Base):
    __tablename__ = "RoleMapping"
    Id = Column(Integer, primary_key=True, autoincrement=True)
    RoleName = Column(String(255))
    ReviewType = Column(String(255))


class RICE(Base):
    __tablename__ = "RICE"
    Id = Column(Integer, primary_key=True, autoincrement=True)
    CategoryDisplay = Column(String(255))
    CategoryHeader = Column(String(255))
    CategoryValue = Column(String(255))


class StatusMapping(Base):
    __tablename__ = "StatusMapping"
    Id = Column(Integer, primary_key=True, autoincrement=True)
    StatusName = Column(String(100))
    StatusColor = Column(String(50))
    StatusDefinitions = Column(Text)


class Outcomes(Base):
    __tablename__ = "Outcomes"
    Id = Column(Integer, primary_key=True, autoincrement=True)
    OutcomeCategory = Column(String(255))
    OutcomeDescription = Column(Text)


class PersonaMapping(Base):
    __tablename__ = "PersonaMapping"
    ID = Column(Integer, primary_key=True)
    PersonaName = Column(String(255))
    RoleDefinition = Column(Text)
    ExampleRoles = Column(Text)


class VendorModelMapping(Base):
    __tablename__ = "VendorModelMapping"
    Id = Column(Integer, primary_key=True, autoincrement=True)
    VendorName = Column(String(255))
    ProductName = Column(String(255))


class UnitOfMeasure(Base):
    __tablename__ = "UnitOfMeasure"
    UnitOfMeasure = Column(String(255), primary_key=True)


class PhaseMapping(Base):
    __tablename__ = "PhaseMapping"
    Id = Column(Integer, primary_key=True, autoincrement=True)
    Phase = Column(String(100))
    PhaseStage = Column(String(100))
    Environment = Column(String(100))


# ==================== MAIN TABLES ====================

class UseCases(Base):
    __tablename__ = "UseCases"
    ID = Column(Integer, primary_key=True)
    BusinessUnit = Column(String(255))
    UseCase = Column(String(255))
    Headlines = Column(Text)
    Opportunity = Column(Text)
    Evidence = Column(Text)
    BusinessValue = Column(Text)
    TargetPersonas = Column(Text)
    Phase = Column(String(100))
    Status = Column(String(100))
    VendorName = Column(String(255))
    ModelName = Column(String(255))
    AITheme = Column(String(512))
    PrimaryContact = Column(String(255))
    InformationLink = Column(String(1024))
    TeamName = Column(String(255))
    SubTeamName = Column(String(255))
    DisplayStatus = Column(Boolean)
    ImageLink = Column(String(1024))
    Created = Column(DateTime, default=datetime.now)
    CreatedBy = Column(String(255))
    Title = Column(String(255))
    AIProductChecklist = Column(Boolean)
    ESEResourcesNeeded = Column(Boolean)


class Metric(Base):
    __tablename__ = "Metric"
    Id = Column(Integer, primary_key=True, autoincrement=True)
    PrimarySuccessMetricName = Column(String(255))
    BaselineValue = Column(Numeric(18, 4))
    BaselineDate = Column(DateTime)
    TargetValue = Column(Numeric(18, 4))
    TargetDate = Column(DateTime)
    MetricType = Column(String(255))
    UnitOfMeasure = Column(String(255), ForeignKey("UnitOfMeasure.UnitOfMeasure"))
    UseCasesID = Column(Integer, ForeignKey("UseCases.ID"))


class Decisions(Base):
    __tablename__ = "Decisions"
    Id = Column(Integer, primary_key=True, autoincrement=True)
    DecisionComments = Column(Text)
    Role = Column(String(255))
    ReviewerType = Column(String(255))
    Approver = Column(String(255))
    Phase = Column(String(100))
    Result = Column(String(50))
    UseCasesID = Column(Integer, ForeignKey("UseCases.ID"))


class Updates(Base):
    __tablename__ = "Updates"
    Id = Column(Integer, primary_key=True, autoincrement=True)
    SubmittedBy = Column(String(255))
    SubmitterRole = Column(String(255))
    UseCasePhase = Column(String(100))
    UseCaseStatus = Column(String(100))
    MeaningfulUpdate = Column(Text)
    UseCasesID = Column(Integer, ForeignKey("UseCases.ID"))


class Stakeholder(Base):
    __tablename__ = "Stakeholder"
    Id = Column(Integer, primary_key=True, autoincrement=True)
    Stakeholder = Column(String(255))
    Role = Column(String(255))
    ReviewerType = Column(String(255))
    StakeholderFlag = Column(Boolean)
    UseCasesID = Column(Integer, ForeignKey("UseCases.ID"))
    BusinessUnit = Column(String(255))
    Created = Column(DateTime, default=datetime.now)
    UseCaseTitle = Column(String(255))


class AgentLibrary(Base):
    __tablename__ = "AgentLibrary"
    Id = Column(Integer, primary_key=True, autoincrement=True)
    UseCasesID = Column(Integer, ForeignKey("UseCases.ID"))
    KnowledgeSource = Column(Text)
    Instructions = Column(Text)


class AIProductChecklist(Base):
    __tablename__ = "AIProductChecklist"
    Id = Column(Integer, primary_key=True, autoincrement=True)
    UseCasesID = Column(Integer, ForeignKey("UseCases.ID"))
    QuestionID = Column(Integer, ForeignKey("AIProductQuestions.ID"))
    Response = Column(Text)
    Created = Column(DateTime, default=datetime.now)


class MetricReported(Base):
    __tablename__ = "MetricReported"
    Id = Column(Integer, primary_key=True, autoincrement=True)
    ReportedValue = Column(Numeric(18, 4))
    ReportedDate = Column(DateTime)
    UseCasesID = Column(Integer, ForeignKey("UseCases.ID"))
    MetricID = Column(Integer, ForeignKey("Metric.Id"))
    Created = Column(DateTime, default=datetime.now)
    Modified = Column(DateTime)


class New_Stakeholder(Base):
    __tablename__ = "New_Stakeholder"
    Id = Column(Integer, primary_key=True, autoincrement=True)
    Stakeholder = Column(String(255))
    Role = Column(String(255))
    ReviewerType = Column(String(255))
    StakeholderFlag = Column(Boolean)
    UseCasesID = Column(Integer, ForeignKey("UseCases.ID"))
    Created = Column(DateTime, default=datetime.now)


class PhaseApprovalInformation(Base):
    __tablename__ = "PhaseApprovalInformation"
    Id = Column(Integer, primary_key=True, autoincrement=True)
    UseCaseTitle = Column(String(255))
    UseCaseID = Column(Integer, ForeignKey("UseCases.ID"))
    RequestedBy = Column(String(255))
    RequestedOn = Column(DateTime)
    DescriptionPurpose = Column(Text)


class Plan(Base):
    __tablename__ = "Plan"
    Id = Column(Integer, primary_key=True, autoincrement=True)
    StartDate = Column(DateTime)
    EndDate = Column(DateTime)
    UseCasesID = Column(Integer, ForeignKey("UseCases.ID"))
    UseCasePhase = Column(String(100))
    Created = Column(DateTime, default=datetime.now)


class Prioritization(Base):
    __tablename__ = "Prioritization"
    Id = Column(Integer, primary_key=True, autoincrement=True)
    Reach = Column(Numeric(18, 4))
    Impact = Column(Numeric(18, 4))
    Confidence = Column(Numeric(18, 4))
    Effort = Column(Numeric(18, 4))
    RICEScore = Column(Numeric(18, 12))
    Priority = Column(String(50))
    AIGalleryDisplay = Column(Boolean)
    SLTReporting = Column(Boolean)
    TotalUserBase = Column(Integer)
    Timespan = Column(String(100), ForeignKey("ImplementationTimespan.Timespan"))
    ReportingFrequency = Column(String(100), ForeignKey("ReportingFrequency.Frequency"))
    UseCasesID = Column(Integer, ForeignKey("UseCases.ID"))
