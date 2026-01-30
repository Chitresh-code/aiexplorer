"use client";

import { useMemo, useState } from "react";
import { PlusCircle } from "lucide-react";
import { useNavigate } from "@/lib/router";
import { setRouteState } from "@/lib/navigation-state";
import { GallerySearch } from "@/components/gallery/gallery-search";
import { GalleryFilters, type GalleryFilterConfig } from "@/components/gallery/gallery-filters";
import { GalleryResults } from "@/components/gallery/gallery-results";
import {
  useGalleryData,
  type GalleryFilterState,
} from "@/features/gallery/hooks/useGalleryData";

const GalleryPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"search" | "similar">("similar");
  const [searchUseCase, setSearchUseCase] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [similarSearchKey, setSimilarSearchKey] = useState(0);
  const [selectedDepartment, setSelectedDepartment] = useState<string[]>([]);
  const [selectedPersonas, setSelectedPersonas] = useState<string[]>([]);
  const [selectedAiThemes, setSelectedAiThemes] = useState<string[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<string[]>([]);
  const [selectedPhase, setSelectedPhase] = useState("");
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedAiModels, setSelectedAiModels] = useState<string[]>([]);

  const filterState: GalleryFilterState = {
    phase: selectedPhase,
    vendor: selectedVendor,
    personas: selectedPersonas,
    aiThemes: selectedAiThemes,
    businessUnits: selectedDepartment,
    teams: selectedTeams,
    subTeams: [],
    status: selectedStatuses,
    aiModels: selectedAiModels,
  };

  const { useCases, filtersData, isLoading, hasLoaded, isFiltersLoading } = useGalleryData({
    activeTab,
    searchText: activeTab === "similar" ? submittedSearch : searchUseCase,
    similarSearchKey,
    filters: filterState,
  });

  const departmentOptions = useMemo(() => {
    if (!filtersData) return [];
    return filtersData.businessUnits.map((unit) => ({
      label: unit.name,
      value: unit.name,
    }));
  }, [filtersData]);

  const personaOptions = useMemo(() => {
    if (!filtersData) return [];
    return filtersData.personas.map((persona) => ({
      label: persona,
      value: persona,
    }));
  }, [filtersData]);

  const themeOptions = useMemo(() => {
    if (!filtersData) return [];
    return filtersData.aiThemes.map((theme) => ({
      label: theme,
      value: theme,
    }));
  }, [filtersData]);

  const vendorOptions = useMemo(() => {
    if (!filtersData) return [];
    return filtersData.vendors.map((vendor) => ({
      label: vendor.name,
      value: vendor.name,
    }));
  }, [filtersData]);

  const statusOptions = useMemo(() => {
    if (!filtersData) return [];
    return filtersData.statuses.map((status) => ({
      label: status,
      value: status,
    }));
  }, [filtersData]);

  const aiModelOptions = useMemo(() => {
    if (!filtersData) return [];
    const selectedVendors = selectedVendor.length
      ? new Set(selectedVendor)
      : null;
    const models = filtersData.vendors
      .filter((vendor) =>
        selectedVendors ? selectedVendors.has(vendor.name) : true,
      )
      .flatMap((vendor) => vendor.models);
    const unique = Array.from(new Set(models)).sort();
    return unique.map((model) => ({ label: model, value: model }));
  }, [filtersData, selectedVendor]);

  const teamOptions = useMemo(() => {
    if (!filtersData) return [];
    const selectedUnits = selectedDepartment.length
      ? selectedDepartment
      : filtersData.businessUnits.map((unit) => unit.name);

    const teams = new Set<string>();
    selectedUnits.forEach((unitName) => {
      const unit = filtersData.businessUnits.find((entry) => entry.name === unitName);
      unit?.teams.forEach((team) => teams.add(team));
    });

    return Array.from(teams)
      .sort()
      .map((team) => ({ label: team, value: team }));
  }, [filtersData, selectedDepartment]);

  const phaseOptions = useMemo(
    () =>
      filtersData?.phases.map((phase) => ({
        label: phase,
        value: phase,
      })) ?? [],
    [filtersData],
  );

  const filterConfigs = useMemo<GalleryFilterConfig[]>(() => {
    const baseButtonClassName = "h-8 gap-2 border-dashed bg-white px-3";
    const icon = <PlusCircle className="h-4 w-4 text-muted-foreground" />;
    return [
      {
        id: "phase",
        options: phaseOptions,
        value: selectedPhase,
        onChange: setSelectedPhase,
        placeholder: "Phase",
        buttonClassName: baseButtonClassName,
        icon,
      },
      {
        id: "status",
        multiple: true,
        options: statusOptions,
        value: selectedStatuses,
        onChange: setSelectedStatuses,
        placeholder: "Status",
        buttonClassName: baseButtonClassName,
        icon,
      },
      {
        id: "vendor",
        multiple: true,
        options: vendorOptions,
        value: selectedVendor,
        onChange: setSelectedVendor,
        placeholder: "Vendor Names",
        buttonClassName: baseButtonClassName,
        icon,
      },
      {
        id: "ai-model",
        multiple: true,
        options: aiModelOptions,
        value: selectedAiModels,
        onChange: setSelectedAiModels,
        placeholder: "AI Models",
        buttonClassName: baseButtonClassName,
        icon,
      },
      {
        id: "personas",
        multiple: true,
        options: personaOptions,
        value: selectedPersonas,
        onChange: setSelectedPersonas,
        placeholder: "Target Personas",
        buttonClassName: baseButtonClassName,
        icon,
      },
      {
        id: "themes",
        multiple: true,
        options: themeOptions,
        value: selectedAiThemes,
        onChange: setSelectedAiThemes,
        placeholder: "AI Themes",
        buttonClassName: baseButtonClassName,
        icon,
      },
      {
        id: "business-unit",
        multiple: true,
        options: departmentOptions,
        value: selectedDepartment,
        onChange: setSelectedDepartment,
        placeholder: "Business Unit",
        buttonClassName: baseButtonClassName,
        icon,
      },
      {
        id: "team",
        multiple: true,
        options: teamOptions,
        value: selectedTeams,
        onChange: setSelectedTeams,
        placeholder: "Team Name",
        buttonClassName: baseButtonClassName,
        icon,
        showBadges: true,
      },
    ];
  }, [
    aiModelOptions,
    departmentOptions,
    personaOptions,
    phaseOptions,
    selectedAiModels,
    selectedAiThemes,
    selectedDepartment,
    selectedPersonas,
    selectedPhase,
    selectedStatuses,
    selectedTeams,
    selectedVendor,
    statusOptions,
    teamOptions,
    themeOptions,
    vendorOptions,
  ]);

  const handleReset = () => {
    setSearchUseCase("");
    setSubmittedSearch("");
    setSelectedDepartment([]);
    setSelectedPersonas([]);
    setSelectedAiThemes([]);
    setSelectedVendor([]);
    setSelectedPhase("");
    setSelectedTeams([]);
    setSelectedStatuses([]);
    setSelectedAiModels([]);
  };

  const handleExplore = (useCase: { id: number; title?: string }) => {
    const targetPath = `/gallery/${useCase.id}`;
    setRouteState(targetPath, {
      useCase,
      useCaseTitle: useCase.title ?? "",
      sourceScreen: "gallery",
    });
    navigate(targetPath, { state: { useCase } });
  };

  const showReset = Boolean(
    searchUseCase ||
      submittedSearch ||
      selectedDepartment.length ||
      selectedPhase ||
      selectedPersonas.length ||
      selectedAiThemes.length ||
      selectedVendor.length ||
      selectedTeams.length ||
      selectedStatuses.length ||
      selectedAiModels.length,
  );

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 w-full">
      <GallerySearch
        activeTab={activeTab}
        value={searchUseCase}
        onChange={setSearchUseCase}
        onTabChange={setActiveTab}
        onSearch={() => {
          const trimmed = searchUseCase.trim();
          setSubmittedSearch(trimmed);
          setSimilarSearchKey((prev) => prev + 1);
        }}
      />

      <GalleryFilters
        filters={filterConfigs}
        onReset={handleReset}
        showReset={showReset}
        isLoading={isFiltersLoading}
      />

      <GalleryResults
        isLoading={isLoading || !hasLoaded}
        useCases={useCases.items}
        onReset={handleReset}
        onExplore={handleExplore}
        onSubmitNew={() => navigate("/submit-use-case")}
        totalCount={useCases.total}
      />
    </div>
  );
};

export default GalleryPage;
