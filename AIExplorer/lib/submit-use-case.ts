/* eslint-disable @typescript-eslint/no-explicit-any */

const API_URL = process.env.NEXT_PUBLIC_API_URL?.trim() ?? "";

const resolveUrl = (path: string): string => {
    if (!API_URL) {
        return path.startsWith("/") ? path : `/${path}`;
    }
    if (!path.startsWith("/")) {
        return `${API_URL.replace(/\/$/, "")}/${path}`;
    }
    return `${API_URL.replace(/\/$/, "")}${path}`;
};

const requestJson = async <T>(path: string, init?: RequestInit): Promise<T> => {
    const response = await fetch(resolveUrl(path), {
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
        ...init,
    });

    if (!response.ok) {
        const details = await response.text().catch(() => "");
        throw new Error(details || `Request failed with status ${response.status}`);
    }

    return response.json() as Promise<T>;
};

// ==================== CONSOLIDATED DATA FUNCTIONS ====================

/**
 * Get AI models organized by vendor hierarchy
 * @returns {Promise<Object>} Object with vendors containing arrays of models
 */
export const getAIModels = async (): Promise<any> => {
    try {
        return await requestJson('/api/aimodels');
    } catch (error) {
        console.error('Error fetching AI models:', error);
        throw error;
    }
};

/**
 * Get business structure organized by business unit → team → subteam hierarchy
 * @returns {Promise<Object>} Object with business_units containing nested team/subteam structure
 */
export const getBusinessStructure = async (): Promise<any> => {
    try {
        return await requestJson('/api/business-structure');
    } catch (error) {
        console.error('Error fetching business structure:', error);
        throw error;
    }
};

/**
 * Get roles organized by role names
 * @returns {Promise<Object>} Object with roles containing array of role names
 */
export const getRoles = async (): Promise<any> => {
    try {
        return await requestJson('/api/roles');
    } catch (error) {
        console.error('Error fetching roles:', error);
        throw error;
    }
};

/**
 * Get all simple dropdown data (AI themes, personas, roles)
 * @returns {Promise<Object>} Object containing ai_themes, personas, and roles arrays
 */
export const getDropdownData = async (): Promise<any> => {
    try {
        return await requestJson('/api/dropdown-data');
    } catch (error) {
        console.error('Error fetching dropdown data:', error);
        throw error;
    }
};

/**
 * Get all vendors (including those with no models)
 * @returns {Promise<Array>} Array of vendor objects
 */
export const getAllVendors = async (): Promise<any> => {
    try {
        return await requestJson('/api/vendors');
    } catch (error) {
        console.error('Error fetching all vendors:', error);
        throw error;
    }
};

// ==================== UTILITY FUNCTIONS ====================

/**
 * Get vendors from AI models data
 * @param {Object} aiModelsData - Data from getAIModels()
 * @returns {Array} Array of vendor names
 */
export const getVendorsFromData = (aiModelsData: any): string[] => {
    if (!aiModelsData?.vendors) return [];
    return Object.keys(aiModelsData.vendors);
};

/**
 * Get vendors with no models from AI models data
 * @param {Object} aiModelsData - Data from getAIModels()
 * @returns {Array} Array of vendor names that have no models
 */
export const getVendorsWithNoModelsFromData = (aiModelsData: any): string[] => {
    if (!aiModelsData?.vendors) return [];
    return Object.keys(aiModelsData.vendors).filter(vendor => {
        const models = aiModelsData.vendors[vendor];
        return !models || models.length === 0;
    });
};

/**
 * Get all vendors from all vendors data (including those with and without models)
 * @param {Array} allVendorsData - Data from getAllVendors()
 * @returns {Array} Array of all unique vendor names
 */
export const getAllVendorsFromAllVendorsData = (allVendorsData: any): string[] => {
    if (!Array.isArray(allVendorsData)) return [];
    const allVendors = new Set<string>();

    allVendorsData.forEach((vendor: any) => {
        if (vendor.VendorName) {
            allVendors.add(vendor.VendorName);
        }
    });

    return Array.from(allVendors);
};

/**
 * Get models for a specific vendor
 * @param {Object} aiModelsData - Data from getAIModels()
 * @param {string} vendorName - Name of the vendor
 * @returns {Array} Array of model names for the vendor
 */
export const getModelsForVendor = (aiModelsData: any, vendorName: string): string[] => {
    if (!aiModelsData?.vendors?.[vendorName]) return [];
    return aiModelsData.vendors[vendorName];
};

/**
 * Get business units from business structure data
 * @param {Object} businessData - Data from getBusinessStructure()
 * @returns {Array} Array of business unit names
 */
export const getBusinessUnitsFromData = (businessData: any): string[] => {
    if (!businessData?.business_units) return [];
    return Object.keys(businessData.business_units);
};

/**
 * Get teams for a specific business unit
 * @param {Object} businessData - Data from getBusinessStructure()
 * @param {string} businessUnitName - Name of the business unit
 * @returns {Array} Array of team names for the business unit
 */
export const getTeamsForBusinessUnit = (businessData: any, businessUnitName: string): string[] => {
    if (!businessData?.business_units?.[businessUnitName]) return [];
    return Object.keys(businessData.business_units[businessUnitName]);
};

/**
 * Get sub-teams for a specific team
 * @param {Object} businessData - Data from getBusinessStructure()
 * @param {string} businessUnitName - Name of the business unit
 * @param {string} teamName - Name of the team
 * @returns {Array} Array of sub-team names for the team
 */
export const getSubTeamsForTeam = (
    businessData: any,
    businessUnitName: string,
    teamName: string
): string[] => {
    if (!businessData?.business_units?.[businessUnitName]?.[teamName]) return [];
    return businessData.business_units[businessUnitName][teamName];
};

/**
 * Get roles from roles data
 * @param {Object} rolesData - Data from getRoles()
 * @returns {Array} Array of role names
 */
export const getRolesFromData = (rolesData: any): string[] => {
    if (!rolesData?.roles) return [];
    return rolesData.roles;
};

/**
 * Get AI Champions for a specific business unit
 * @param {string} businessUnit - Name of the business unit
 * @returns {Promise<Array>} Array of champion objects
 */
export const getChampionsForBusinessUnit = async (businessUnit: string): Promise<any> => {
    try {
        return await requestJson(`/api/business-units/stakeholder/${encodeURIComponent(businessUnit)}`);
    } catch (error) {
        console.error('Error fetching champions for business unit:', error);
        throw error;
    }
};

/**
 * Get all unique AI Champion names for stakeholder dropdown
 * @returns {Promise<Array>} Array of champion names
 */
export const getAllChampionNames = async (): Promise<any> => {
    try {
        const response = await requestJson<{ champions?: any[] }>('/api/champions');
        return response.champions || [];
    } catch (error) {
        console.error('Error fetching champion names:', error);
        throw error;
    }
};

/**
 * Get all data needed for submit use case screen in one API call
 * @returns {Promise<Object>} Object containing all submit use case data
 */
export const getSubmitUseCaseData = async (): Promise<any> => {
    try {
        return await requestJson('/api/submit-usecase-data');
    } catch (error) {
        console.error('Error fetching submit use case data:', error);
        throw error;
    }
};

/**
 * Create a new use case
 * @param {Object} useCaseData - The use case data
 * @returns {Promise<Object>} The created use case
 */
export const createUseCase = async (useCaseData: any): Promise<any> => {
    try {
        return await requestJson('/api/usecases', {
            method: 'POST',
            body: JSON.stringify(useCaseData),
        });
    } catch (error) {
        console.error('Error creating use case:', error);
        throw error;
    }
};

/**
 * Create a new stakeholder for a use case
 * @param {number} useCaseId - The ID of the use case
 * @param {Object} stakeholderData - The stakeholder data
 * @returns {Promise<Object>} The created stakeholder
 */
export const createStakeholder = async (useCaseId: number, stakeholderData: any): Promise<any> => {
    try {
        return await requestJson(`/api/usecases/${useCaseId}/stakeholders`, {
            method: 'POST',
            body: JSON.stringify(stakeholderData),
        });
    } catch (error) {
        console.error('Error creating stakeholder:', error);
        throw error;
    }
};

/**
 * Create a new plan (dates) for a use case
 * @param {number} useCaseId - The ID of the use case
 * @param {Object} planData - The plan data
 * @returns {Promise<Object>} The created plan
 */
export const createPlan = async (useCaseId: number, planData: any): Promise<any> => {
    try {
        return await requestJson(`/api/usecases/${useCaseId}/plan`, {
            method: 'POST',
            body: JSON.stringify(planData),
        });
    } catch (error) {
        console.error('Error creating plan:', error);
        throw error;
    }
};
