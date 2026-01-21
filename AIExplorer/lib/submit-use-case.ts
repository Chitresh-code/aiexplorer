/* eslint-disable @typescript-eslint/no-explicit-any */

import axios from 'axios';

const getBaseUrl = () => {
    const envUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
    if (envUrl && envUrl.startsWith("http")) return envUrl;

    if (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")) {
        return "http://localhost:8000";
    }
    return "https://eai-aihub-backend-dev.happywave-248a4bd8.eastus2.azurecontainerapps.io";
};

const API_URL = getBaseUrl();
console.log('API_URL (submit-use-case) resolved to:', API_URL);

// Create axios instance
const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// ==================== CONSOLIDATED DATA FUNCTIONS ====================

/**
 * Get AI models organized by vendor hierarchy
 * @returns {Promise<Object>} Object with vendors containing arrays of models
 */
export const getAIModels = async (): Promise<any> => {
    try {
        const response = await apiClient.get('/api/aimodels');
        return response.data;
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
        const response = await apiClient.get('/api/business-structure');
        return response.data;
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
        const response = await apiClient.get('/api/roles');
        return response.data;
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
        const response = await apiClient.get('/api/dropdown-data');
        return response.data;
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
        const response = await apiClient.get('/api/vendors');
        return response.data;
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
        const response = await apiClient.get(`/api/business-units/stakeholder/${encodeURIComponent(businessUnit)}`);
        return response.data;
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
        const response = await apiClient.get('/api/champions');
        return response.data.champions || [];
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
        const response = await apiClient.get('/api/submit-usecase-data');
        return response.data;
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
        const response = await apiClient.post('/api/usecases', useCaseData);
        return response.data;
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
        const response = await apiClient.post(`/api/usecases/${useCaseId}/stakeholders`, stakeholderData);
        return response.data;
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
        const response = await apiClient.post(`/api/usecases/${useCaseId}/plan`, planData);
        return response.data;
    } catch (error) {
        console.error('Error creating plan:', error);
        throw error;
    }
};

export default apiClient;
